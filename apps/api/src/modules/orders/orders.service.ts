import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  OrderStatus,
  PaginatedResponse,
  ProductStatus,
  Unit,
  canTransition,
} from '@farm/types';
import { CreateOrderDto } from './dto/create-order.dto';

const FREE_SHIPPING_THRESHOLD = 300000;
const SHIPPING_FEE = 30000;
const FREE_SHIP_PROVINCES = ['TP.Hồ Chí Minh', 'TP.HCM', 'Hồ Chí Minh'];
const MAX_LIMIT = 100;
const WEIGHT_TOLERANCE = 0.1;

const STATUS_HISTORY_INCLUDE = {
  changedBy: { select: { id: true, name: true, email: true } },
} as const;

const ORDER_DETAIL_INCLUDE = {
  items: true,
  user: { select: { name: true, email: true } },
  statusHistory: {
    orderBy: { createdAt: 'desc' as const },
    include: STATUS_HISTORY_INCLUDE,
  },
};

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<any>> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number(params.limit) || 20));
    const { status, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};
    if (status) where.status = status as OrderStatus;
    if (search) {
      where.OR = [
        { recipientName: { contains: search, mode: 'insensitive' } },
        { recipientPhone: { contains: search } },
        { orderCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
          user: { select: { name: true, email: true } },
          statusHistory: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: STATUS_HISTORY_INCLUDE,
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: ORDER_DETAIL_INCLUDE,
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  async trackOrder(orderCode: string, phone: string) {
    if (!phone) {
      throw new BadRequestException('Vui lòng nhập số điện thoại');
    }

    const order = await this.prisma.order.findFirst({
      where: { orderCode, recipientPhone: phone },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  async validateOrder(
    items: { productId: string; quantity: number }[],
    shippingProvince?: string,
    couponCode?: string,
  ) {
    if (!items?.length) {
      throw new BadRequestException('Đơn hàng phải có ít nhất một sản phẩm');
    }

    let subtotalBeforeDiscount = 0;
    const validatedItems: Array<{
      productId: string;
      name: string;
      originalUnitPrice: number;
      unitPrice: number;
      quantity: number;
      unit: Unit;
      subtotal: number;
      stock: number;
    }> = [];

    for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        throw new BadRequestException('Số lượng sản phẩm phải là số nguyên >= 1');
      }

      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`Không tìm thấy sản phẩm ${item.productId}`);
      }

      if (product.status !== ProductStatus.ACTIVE) {
        throw new BadRequestException(`Sản phẩm "${product.name}" đã ngừng bán`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Sản phẩm "${product.name}" chỉ còn ${product.stock} ${product.unit}`,
        );
      }

      const itemSubtotal = Math.round(product.price * item.quantity);
      subtotalBeforeDiscount += itemSubtotal;

      validatedItems.push({
        productId: product.id,
        name: product.name,
        originalUnitPrice: product.price,
        unitPrice: product.price,
        quantity: item.quantity,
        unit: product.unit as Unit,
        subtotal: itemSubtotal,
        stock: product.stock,
      });
    }

    let discountAmount = 0;
    let appliedCouponCode: string | null = null;
    let discountMeta: {
      percentOff: number;
      productId: string;
      productName: string;
    } | null = null;

    const normalizedCoupon = couponCode?.trim().toUpperCase();
    if (normalizedCoupon) {
      const discount = await this.prisma.discountCode.findUnique({
        where: { code: normalizedCoupon },
        include: { product: { select: { id: true, name: true } } },
      });

      if (!discount || !discount.active) {
        throw new BadRequestException('Mã giảm giá không hợp lệ hoặc đã tắt');
      }

      if (discount.expiresAt && discount.expiresAt.getTime() < Date.now()) {
        throw new BadRequestException('Mã giảm giá đã hết hạn');
      }

      if (
        discount.maxUses !== null &&
        discount.usedCount >= discount.maxUses
      ) {
        throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
      }

      const targetItem = validatedItems.find(
        (item) => item.productId === discount.productId,
      );
      if (!targetItem) {
        throw new BadRequestException(
          `Mã giảm giá chỉ áp dụng cho sản phẩm "${discount.product.name}"`,
        );
      }

      const discountedUnitPrice = Math.round(
        (targetItem.originalUnitPrice * (100 - discount.percentOff)) / 100,
      );
      const discountedSubtotal = Math.round(
        discountedUnitPrice * targetItem.quantity,
      );
      discountAmount = targetItem.subtotal - discountedSubtotal;

      targetItem.unitPrice = discountedUnitPrice;
      targetItem.subtotal = discountedSubtotal;
      appliedCouponCode = discount.code;
      discountMeta = {
        percentOff: discount.percentOff,
        productId: discount.productId,
        productName: discount.product.name,
      };
    }

    const subtotal = subtotalBeforeDiscount - discountAmount;
    const shippingFee = this.calcShippingFee(subtotal, shippingProvince);
    const total = subtotal + shippingFee;

    return {
      valid: true,
      items: validatedItems,
      subtotalBeforeDiscount,
      discountAmount,
      couponCode: appliedCouponCode,
      discount: discountMeta,
      subtotal,
      shippingFee,
      total,
    };
  }

  async create(dto: CreateOrderDto) {
    if (dto.idempotencyKey) {
      const existing = await this.prisma.order.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
        include: ORDER_DETAIL_INCLUDE,
      });
      if (existing) {
        return existing;
      }
    }

    const validation = await this.validateOrder(
      dto.items,
      dto.shippingProvince,
      dto.couponCode,
    );

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          for (const item of dto.items) {
            const result = await tx.product.updateMany({
              where: { id: item.productId, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
            });

            if (result.count === 0) {
              throw new ConflictException(
                'Sản phẩm đã hết hàng hoặc không đủ số lượng',
              );
            }
          }

          if (validation.couponCode) {
            const discount = await tx.discountCode.findUnique({
              where: { code: validation.couponCode },
            });
            if (!discount || !discount.active) {
              throw new BadRequestException(
                'Mã giảm giá không hợp lệ hoặc đã tắt',
              );
            }
            if (discount.expiresAt && discount.expiresAt.getTime() < Date.now()) {
              throw new BadRequestException('Mã giảm giá đã hết hạn');
            }
            if (
              discount.maxUses !== null &&
              discount.usedCount >= discount.maxUses
            ) {
              throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
            }

            const usageUpdate = await tx.discountCode.updateMany({
              where: {
                code: validation.couponCode,
                active: true,
                ...(discount.maxUses !== null
                  ? { usedCount: { lt: discount.maxUses } }
                  : {}),
              },
              data: { usedCount: { increment: 1 } },
            });
            if (usageUpdate.count === 0) {
              throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
            }
          }

          const orderCode = await this.generateOrderCode(tx);

          const order = await tx.order.create({
            data: {
              orderCode,
              idempotencyKey: dto.idempotencyKey,
              recipientName: dto.recipientName,
              recipientPhone: dto.recipientPhone,
              shippingAddressDetail: dto.shippingAddressDetail,
              shippingProvince: dto.shippingProvince,
              shippingNote: dto.shippingNote,
              deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
              deliveryTimeSlot: dto.deliveryTimeSlot,
              paymentMethod: dto.paymentMethod || 'COD',
              paymentStatus: 'UNPAID',
              shippingFee: validation.shippingFee,
              couponCode: validation.couponCode,
              discountAmount: validation.discountAmount,
              totalAmount: validation.total,
              items: {
                create: validation.items.map((item) => ({
                  productId: item.productId,
                  productName: item.name,
                  unitPrice: item.unitPrice,
                  orderedQuantity: item.quantity,
                  quantity: item.quantity,
                  unit: item.unit,
                  subtotal: item.subtotal,
                })),
              },
            },
          });

          await this.appendStatusHistory(tx, {
            orderId: order.id,
            fromStatus: null,
            toStatus: OrderStatus.PENDING,
            changedById: null,
            note: validation.couponCode
              ? `Đặt hàng (mã ${validation.couponCode}, giảm ${validation.discountAmount.toLocaleString('vi-VN')}đ)`
              : 'Đặt hàng',
          });

          return tx.order.findUniqueOrThrow({
            where: { id: order.id },
            include: ORDER_DETAIL_INCLUDE,
          });
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          continue;
        }
        throw error;
      }
    }

    throw new ConflictException('Không thể tạo mã đơn hàng, vui lòng thử lại');
  }

  async adjustItems(
    id: string,
    adjustments: { itemId: string; quantity: number }[],
    changedById?: string,
  ) {
    if (!adjustments?.length) {
      throw new BadRequestException('Cần ít nhất một dòng để điều chỉnh');
    }

    const order = await this.findOne(id);
    const current = order.status as OrderStatus;

    if (
      current !== OrderStatus.PENDING &&
      current !== OrderStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        'Chỉ điều chỉnh cân khi đơn đang chờ xác nhận hoặc đã xác nhận',
      );
    }

    const itemById = new Map(order.items.map((item) => [item.id, item]));
    const noteParts: string[] = [];

    for (const adj of adjustments) {
      const item = itemById.get(adj.itemId);
      if (!item) {
        throw new BadRequestException(`Không tìm thấy dòng hàng ${adj.itemId}`);
      }

      if (item.unit !== Unit.KG) {
        throw new BadRequestException(
          `Chỉ điều chỉnh cân cho sản phẩm tính theo kg ("${item.productName}")`,
        );
      }

      if (!Number.isFinite(adj.quantity) || adj.quantity <= 0) {
        throw new BadRequestException(
          `Số cân thực tế của "${item.productName}" phải > 0`,
        );
      }

      const ordered =
        item.orderedQuantity > 0 ? item.orderedQuantity : item.quantity;
      const minQty = ordered * (1 - WEIGHT_TOLERANCE);
      const maxQty = ordered * (1 + WEIGHT_TOLERANCE);

      if (adj.quantity < minQty || adj.quantity > maxQty) {
        throw new BadRequestException(
          `"${item.productName}": cân thực tế phải trong khoảng ±10% so với ${ordered} kg (cho phép ${minQty.toFixed(2)}-${maxQty.toFixed(2)} kg)`,
        );
      }

      noteParts.push(
        `${item.productName}: ${ordered} kg -> ${adj.quantity} kg`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      for (const adj of adjustments) {
        const item = itemById.get(adj.itemId)!;
        const subtotal = Math.round(item.unitPrice * adj.quantity);
        await tx.orderItem.update({
          where: { id: adj.itemId },
          data: {
            quantity: adj.quantity,
            subtotal,
            orderedQuantity:
              item.orderedQuantity > 0 ? item.orderedQuantity : item.quantity,
          },
        });
      }

      const refreshed = await tx.orderItem.findMany({ where: { orderId: id } });
      const subtotal = refreshed.reduce((sum, item) => sum + item.subtotal, 0);
      const shippingFee = this.calcShippingFee(
        subtotal,
        order.shippingProvince,
      );
      const totalAmount = subtotal + shippingFee;

      await this.appendStatusHistory(tx, {
        orderId: id,
        fromStatus: current,
        toStatus: current,
        changedById: changedById ?? null,
        note: `Điều chỉnh cân: ${noteParts.join('; ')}`,
      });

      return tx.order.update({
        where: { id },
        data: { shippingFee, totalAmount },
        include: ORDER_DETAIL_INCLUDE,
      });
    });
  }

  async updateStatus(
    id: string,
    newStatus: OrderStatus,
    changedById?: string,
  ) {
    if (newStatus === OrderStatus.CANCELLED) {
      return this.cancel(id, changedById);
    }

    const order = await this.findOne(id);

    if (!canTransition(order.status as OrderStatus, newStatus)) {
      throw new BadRequestException(
        `Không thể chuyển từ ${order.status} sang ${newStatus}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await this.appendStatusHistory(tx, {
        orderId: id,
        fromStatus: order.status as OrderStatus,
        toStatus: newStatus,
        changedById: changedById ?? null,
      });

      return tx.order.update({
        where: { id },
        data: { status: newStatus },
        include: ORDER_DETAIL_INCLUDE,
      });
    });
  }

  async cancel(id: string, changedById?: string) {
    const order = await this.findOne(id);
    const current = order.status as OrderStatus;

    if (
      current !== OrderStatus.PENDING &&
      current !== OrderStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        'Chỉ có thể hủy đơn đang chờ xác nhận hoặc đã xác nhận',
      );
    }

    if (!canTransition(current, OrderStatus.CANCELLED)) {
      throw new BadRequestException(
        `Không thể chuyển từ ${current} sang ${OrderStatus.CANCELLED}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        const restoreQty = Math.round(
          item.orderedQuantity > 0 ? item.orderedQuantity : item.quantity,
        );
        if (restoreQty > 0) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: restoreQty } },
          });
        }
      }

      await this.appendStatusHistory(tx, {
        orderId: id,
        fromStatus: current,
        toStatus: OrderStatus.CANCELLED,
        changedById: changedById ?? null,
        note: 'Hủy đơn và hoàn kho',
      });

      return tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
        include: ORDER_DETAIL_INCLUDE,
      });
    });
  }

  private calcShippingFee(subtotal: number, shippingProvince?: string) {
    const isFreeShip =
      !!shippingProvince &&
      FREE_SHIP_PROVINCES.includes(shippingProvince) &&
      subtotal >= FREE_SHIPPING_THRESHOLD;
    return isFreeShip ? 0 : SHIPPING_FEE;
  }

  private async appendStatusHistory(
    tx: Prisma.TransactionClient,
    data: {
      orderId: string;
      fromStatus: OrderStatus | null;
      toStatus: OrderStatus;
      changedById: string | null;
      note?: string;
    },
  ) {
    await tx.orderStatusHistory.create({
      data: {
        orderId: data.orderId,
        fromStatus: data.fromStatus,
        toStatus: data.toStatus,
        changedById: data.changedById,
        note: data.note,
      },
    });
  }

  private async generateOrderCode(
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

    const lastOrder = await tx.order.findFirst({
      where: {
        orderCode: { startsWith: `VN-${dateStr}` },
      },
      orderBy: { orderCode: 'desc' },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderCode.slice(-4), 10);
      sequence = Number.isFinite(lastSequence) ? lastSequence + 1 : 1;
    }

    return `VN-${dateStr}-${sequence.toString().padStart(4, '0')}`;
  }
}

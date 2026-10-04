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
  canTransition,
} from '@farm/types';
import { CreateOrderDto } from './dto/create-order.dto';

const FREE_SHIPPING_THRESHOLD = 300000;
const SHIPPING_FEE = 30000;
const FREE_SHIP_PROVINCES = ['TP.Hồ Chí Minh', 'TP.HCM', 'Hồ Chí Minh'];
const MAX_LIMIT = 100;

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
  ) {
    if (!items?.length) {
      throw new BadRequestException('Đơn hàng phải có ít nhất một sản phẩm');
    }

    let subtotal = 0;
    const validatedItems: Array<{
      productId: string;
      name: string;
      unitPrice: number;
      quantity: number;
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

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      validatedItems.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        stock: product.stock,
      });
    }

    const isFreeShip =
      !!shippingProvince &&
      FREE_SHIP_PROVINCES.includes(shippingProvince) &&
      subtotal >= FREE_SHIPPING_THRESHOLD;
    const shippingFee = isFreeShip ? 0 : SHIPPING_FEE;
    const total = subtotal + shippingFee;

    return {
      valid: true,
      items: validatedItems,
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

    const validation = await this.validateOrder(dto.items, dto.shippingProvince);

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
              totalAmount: validation.total,
              items: {
                create: validation.items.map((item) => ({
                  productId: item.productId,
                  productName: item.name,
                  unitPrice: item.unitPrice,
                  quantity: item.quantity,
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
            note: 'Đặt hàng',
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
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
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

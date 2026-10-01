import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateOrderDto,
  OrderStatus,
  UpdateOrderStatusDto,
  PaginatedResponse,
  canTransition,
} from '@farm/types';

const FREE_SHIPPING_THRESHOLD = 300000;
const SHIPPING_FEE = 30000;
const FREE_SHIP_PROVINCES = ['TP.Hồ Chí Minh', 'TP.HCM', 'Hồ Chí Minh'];

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<any>> {
    const { page, limit, status, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
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
        include: { items: true, user: { select: { name: true, email: true } } },
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
      include: { items: true, user: { select: { name: true, email: true } } },
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  async trackOrder(orderCode: string, phone: string) {
    const order = await this.prisma.order.findFirst({
      where: { orderCode, recipientPhone: phone },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  /**
   * Validate stock + tính tổng tiền (server-side)
   * Không tin giá từ client
   */
  async validateOrder(
    items: { productId: string; quantity: number }[],
    shippingProvince?: string,
  ) {
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
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`Không tìm thấy sản phẩm ${item.productId}`);
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

    // Free ship chỉ khi TP.HCM và đơn >= 300k
    const isFreeShip =
      shippingProvince &&
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

  /**
   * Tạo đơn hàng với idempotency key + trừ kho nguyên tử
   */
  async create(dto: CreateOrderDto) {
    // Kiểm tra idempotency key
    if (dto.idempotencyKey) {
      const existing = await this.prisma.order.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existing) {
        return existing;
      }
    }

    // Validate stock + tính tổng tiền
    const validation = await this.validateOrder(dto.items, dto.shippingProvince);

    // Tạo order code: VN-YYYYMMDD-XXXX
    const orderCode = await this.generateOrderCode();

    // Transaction: trừ kho + tạo order
    return this.prisma.$transaction(async (tx) => {
      // Trừ kho nguyên tử
      for (const item of dto.items) {
        const result = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (result.count === 0) {
          throw new ConflictException('Sản phẩm đã hết hàng hoặc không đủ số lượng');
        }
      }

      // Tạo order
      return tx.order.create({
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
        include: { items: true },
      });
    });
  }

  async updateStatus(
    id: string,
    newStatus: UpdateOrderStatusDto['status'],
    changedBy?: string,
    note?: string,
  ) {
    const order = await this.findOne(id);

    if (!canTransition(order.status as OrderStatus, newStatus)) {
      throw new BadRequestException(
        `Không thể chuyển từ ${order.status} sang ${newStatus}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: { status: newStatus },
        include: { items: true },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          toStatus: newStatus,
          changedBy: changedBy || null,
          note: note || null,
        },
      });

      return updated;
    });
  }

  async cancel(id: string, changedBy?: string, note?: string) {
    const order = await this.findOne(id);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Chỉ có thể hủy đơn hàng đang chờ xác nhận');
    }

    // Restore stock in transaction
    return this.prisma.$transaction(async (tx) => {
      // Restore stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // Update order status
      const updated = await tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
        include: { items: true },
      });

      // Ghi lịch sử hủy
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          toStatus: OrderStatus.CANCELLED,
          changedBy: changedBy || null,
          note: note || null,
        },
      });

      return updated;
    });
  }

  async getHistory(id: string) {
    const order = await this.findOne(id);
    return this.prisma.orderStatusHistory.findMany({
      where: { orderId: order.id },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Tạo order code unique: VN-YYYYMMDD-XXXX
   */
  private async generateOrderCode(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

    // Tìm orderCode cuối cùng trong ngày
    const lastOrder = await this.prisma.order.findFirst({
      where: {
        orderCode: { startsWith: `VN-${dateStr}` },
      },
      orderBy: { orderCode: 'desc' },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderCode.slice(-4), 10);
      sequence = lastSequence + 1;
    }

    return `VN-${dateStr}-${sequence.toString().padStart(4, '0')}`;
  }
}

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

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse> {
    const { page, limit, status, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { recipientName: { contains: search, mode: 'insensitive' } },
        { recipientPhone: { contains: search } },
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
      where: { id: orderCode, recipientPhone: phone },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  async create(dto: CreateOrderDto) {
    // Validate stock and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of dto.items) {
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

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: item.quantity,
        subtotal,
      });
    }

    // Create order and decrement stock in transaction
    return this.prisma.$transaction(async (tx) => {
      // Decrement stock
      for (const item of dto.items) {
        const result = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (result.count === 0) {
          throw new ConflictException('Sản phẩm đã hết hàng hoặc không đủ số lượng');
        }
      }

      // Create order
      return tx.order.create({
        data: {
          recipientName: dto.recipientName,
          recipientPhone: dto.recipientPhone,
          shippingAddressDetail: dto.shippingAddressDetail,
          shippingProvince: dto.shippingProvince,
          shippingNote: dto.shippingNote,
          deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
          deliveryTimeSlot: dto.deliveryTimeSlot,
          paymentMethod: dto.paymentMethod || 'COD',
          totalAmount,
          items: { create: orderItems },
        },
        include: { items: true },
      });
    });
  }

  async updateStatus(id: string, newStatus: UpdateOrderStatusDto['status']) {
    const order = await this.findOne(id);

    if (!canTransition(order.status as OrderStatus, newStatus)) {
      throw new BadRequestException(
        `Không thể chuyển từ ${order.status} sang ${newStatus}`,
      );
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: newStatus },
      include: { items: true },
    });
  }

  async cancel(id: string) {
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
      return tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
        include: { items: true },
      });
    });
  }
}

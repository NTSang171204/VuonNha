import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiscountCodeDto, UpdateDiscountCodeDto } from './dto/discount.dto';

const INCLUDE_PRODUCT = {
  product: { select: { id: true, name: true, price: true, unit: true, status: true } },
} as const;

@Injectable()
export class DiscountsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.discountCode.findMany({
      include: INCLUDE_PRODUCT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const discount = await this.prisma.discountCode.findUnique({
      where: { id },
      include: INCLUDE_PRODUCT,
    });
    if (!discount) throw new NotFoundException('Không tìm thấy mã giảm giá');
    return discount;
  }

  async create(dto: CreateDiscountCodeDto) {
    const code = dto.code.trim().toUpperCase();
    await this.ensureProduct(dto.productId);

    try {
      return await this.prisma.discountCode.create({
        data: {
          code,
          percentOff: dto.percentOff,
          productId: dto.productId,
          active: dto.active ?? true,
          expiresAt: this.parseExpiresAt(dto.expiresAt),
          maxUses: dto.maxUses ?? null,
        },
        include: INCLUDE_PRODUCT,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Mã giảm giá đã tồn tại');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateDiscountCodeDto) {
    await this.findOne(id);
    if (dto.productId) await this.ensureProduct(dto.productId);

    try {
      return await this.prisma.discountCode.update({
        where: { id },
        data: {
          ...(dto.code !== undefined
            ? { code: dto.code.trim().toUpperCase() }
            : {}),
          ...(dto.percentOff !== undefined ? { percentOff: dto.percentOff } : {}),
          ...(dto.productId !== undefined ? { productId: dto.productId } : {}),
          ...(dto.active !== undefined ? { active: dto.active } : {}),
          ...(dto.expiresAt !== undefined
            ? { expiresAt: this.parseExpiresAt(dto.expiresAt) }
            : {}),
          ...(dto.maxUses !== undefined ? { maxUses: dto.maxUses } : {}),
        },
        include: INCLUDE_PRODUCT,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Mã giảm giá đã tồn tại');
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.discountCode.delete({ where: { id } });
    return { success: true };
  }

  private async ensureProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new BadRequestException('Sản phẩm áp dụng mã không tồn tại');
    }
  }

  private parseExpiresAt(value?: string | null) {
    if (value === null || value === undefined || value === '') return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Ngày hết hạn không hợp lệ');
    }
    return date;
  }
}

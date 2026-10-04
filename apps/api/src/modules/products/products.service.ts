import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductStatus,
  PaginatedResponse,
  PriceRange,
} from '@farm/types';

const MAX_LIMIT = 100;

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    page: number;
    limit: number;
    categoryId?: string;
    search?: string;
    status?: string;
    priceRange?: PriceRange;
    inStock?: boolean;
    sort?: string;
  }): Promise<PaginatedResponse<any>> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number(params.limit) || 8));
    const { categoryId, search, status, priceRange, inStock, sort } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};
    if (categoryId) where.categoryId = categoryId;
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (status) where.status = status as ProductStatus;
    if (inStock) where.stock = { gt: 0 };

    if (priceRange) {
      switch (priceRange) {
        case PriceRange.UNDER_50K:
          where.price = { lt: 50000 };
          break;
        case PriceRange.RANGE_50K_100K:
          where.price = { gte: 50000, lte: 100000 };
          break;
        case PriceRange.OVER_100K:
          where.price = { gt: 100000 };
          break;
      }
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    else if (sort === 'price-desc') orderBy = { price: 'desc' };
    else if (sort === 'harvest' || sort === 'featured') {
      orderBy = { createdAt: 'desc' };
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.product.count({ where }),
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
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    return product;
  }

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.INACTIVE },
    });
  }
}

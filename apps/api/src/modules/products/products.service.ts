import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductStatus, PaginatedResponse, PriceRange } from '@farm/types';

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
  }): Promise<PaginatedResponse<any>> {
    const { page, limit, categoryId, search, status, priceRange, inStock } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (status) where.status = status;
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

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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

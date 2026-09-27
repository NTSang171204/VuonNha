import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });
  }

  create(name: string) {
    return this.prisma.category.create({ data: { name } });
  }

  update(id: string, name: string) {
    return this.prisma.category.update({ where: { id }, data: { name } });
  }

  remove(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }
}

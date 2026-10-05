import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@farm/types';
import { CreateDiscountCodeDto, UpdateDiscountCodeDto } from './dto/discount.dto';

@Controller('discounts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class DiscountsController {
  constructor(private discountsService: DiscountsService) {}

  @Get()
  findAll() {
    return this.discountsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.discountsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDiscountCodeDto) {
    return this.discountsService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDiscountCodeDto) {
    return this.discountsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.discountsService.remove(id);
  }
}

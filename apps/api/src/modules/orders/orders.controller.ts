import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { Role, OrderStatus } from '@farm/types';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  ValidateOrderDto,
} from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.ordersService.findAll({ page, limit, status, search });
  }

  @Get('track/:orderCode')
  trackOrder(
    @Param('orderCode') orderCode: string,
    @Query('phone') phone: string,
  ) {
    return this.ordersService.trackOrder(orderCode, phone);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post('validate')
  validateOrder(@Body() body: ValidateOrderDto) {
    return this.ordersService.validateOrder(body.items, body.shippingProvince);
  }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.ordersService.updateStatus(
      id,
      dto.status as OrderStatus,
      userId,
    );
  }

  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  cancel(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.ordersService.cancel(id, userId);
  }
}

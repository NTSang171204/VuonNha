import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateOrderItemDto {
  @IsString()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class AdjustOrderItemDto {
  @IsString()
  itemId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  quantity!: number;
}

export class AdjustOrderItemsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AdjustOrderItemDto)
  items!: AdjustOrderItemDto[];
}

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @IsString()
  @MinLength(2)
  recipientName!: string;

  @IsString()
  @MinLength(10)
  recipientPhone!: string;

  @IsString()
  @MinLength(5)
  shippingAddressDetail!: string;

  @IsString()
  @MinLength(1)
  shippingProvince!: string;

  @IsOptional()
  @IsString()
  shippingNote?: string;

  @IsOptional()
  @IsString()
  deliveryDate?: string;

  @IsOptional()
  @IsString()
  deliveryTimeSlot?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}

export class ValidateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsOptional()
  @IsString()
  shippingProvince?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;
}

export class UpdateOrderStatusDto {
  @IsString()
  status!: string;
}

export class CancelTrackedOrderDto {
  @IsString()
  @MinLength(10)
  phone!: string;
}



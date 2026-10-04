import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
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
}

export class UpdateOrderStatusDto {
  @IsString()
  status!: string;
}

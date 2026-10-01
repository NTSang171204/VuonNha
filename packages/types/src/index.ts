// Shared enums (as const objects for Node.js strip-only compatibility)

export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  DELIVERING: 'DELIVERING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const ProductStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const Role = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const Unit = {
  KG: 'KG',
  BUNDLE: 'BUNDLE',
  BOX: 'BOX',
  FRUIT: 'FRUIT',
} as const;
export type Unit = (typeof Unit)[keyof typeof Unit];

export const PriceRange = {
  UNDER_50K: 'UNDER_50K',
  RANGE_50K_100K: 'RANGE_50K_100K',
  OVER_100K: 'OVER_100K',
} as const;
export type PriceRange = (typeof PriceRange)[keyof typeof PriceRange];

// Order state machine transitions
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.DELIVERING],
  [OrderStatus.DELIVERING]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

export { getNextActions, transitionOrder } from './order-state-machine';

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// DTOs
export interface CreateOrderDto {
  idempotencyKey?: string;
  recipientName: string;
  recipientPhone: string;
  shippingAddressDetail: string;
  shippingProvince: string;
  shippingNote?: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  paymentMethod?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

export interface CreateProductDto {
  categoryId: string;
  name: string;
  imageUrl?: string;
  description?: string;
  price: number;
  unit: Unit;
  stock: number;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  status?: ProductStatus;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

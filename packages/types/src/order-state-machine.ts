// Order state machine — self-contained, no circular dependency

export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  DELIVERING: 'DELIVERING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

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

/**
 * Trả về các trạng thái kế tiếp hợp lệ từ trạng thái hiện tại.
 * Dùng để hiển thị nút bấm trong UI.
 */
export function getNextActions(from: OrderStatus): OrderStatus[] {
  return ORDER_TRANSITIONS[from] ?? [];
}

/**
 * Pure function: trả về order mới với status đã đổi.
 * Throw error nếu chuyển trạng thái không hợp lệ.
 */
export function transitionOrder<T extends { status: OrderStatus; updatedAt: Date }>(
  order: T,
  to: OrderStatus,
): T {
  if (!canTransition(order.status, to)) {
    throw new Error(`Cannot transition from ${order.status} to ${to}`);
  }
  return { ...order, status: to, updatedAt: new Date() };
}

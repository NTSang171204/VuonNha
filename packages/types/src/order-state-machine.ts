import { OrderStatus, ORDER_TRANSITIONS, canTransition } from './index';

export { OrderStatus, ORDER_TRANSITIONS, canTransition };

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

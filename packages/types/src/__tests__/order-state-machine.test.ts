import { describe, it, expect } from 'vitest';
import { OrderStatus, canTransition } from '../index';
import { getNextActions, transitionOrder } from '../order-state-machine';

describe('canTransition', () => {
  it('PENDING → CONFIRMED', () => {
    expect(canTransition(OrderStatus.PENDING, OrderStatus.CONFIRMED)).toBe(true);
  });

  it('PENDING → CANCELLED', () => {
    expect(canTransition(OrderStatus.PENDING, OrderStatus.CANCELLED)).toBe(true);
  });

  it('CONFIRMED → DELIVERING', () => {
    expect(canTransition(OrderStatus.CONFIRMED, OrderStatus.DELIVERING)).toBe(true);
  });

  it('DELIVERING → COMPLETED', () => {
    expect(canTransition(OrderStatus.DELIVERING, OrderStatus.COMPLETED)).toBe(true);
  });

  it('PENDING → DELIVERING (invalid)', () => {
    expect(canTransition(OrderStatus.PENDING, OrderStatus.DELIVERING)).toBe(false);
  });

  it('PENDING → COMPLETED (invalid)', () => {
    expect(canTransition(OrderStatus.PENDING, OrderStatus.COMPLETED)).toBe(false);
  });

  it('CONFIRMED → CANCELLED (invalid)', () => {
    expect(canTransition(OrderStatus.CONFIRMED, OrderStatus.CANCELLED)).toBe(false);
  });

  it('COMPLETED → PENDING (invalid)', () => {
    expect(canTransition(OrderStatus.COMPLETED, OrderStatus.PENDING)).toBe(false);
  });

  it('CANCELLED → PENDING (invalid)', () => {
    expect(canTransition(OrderStatus.CANCELLED, OrderStatus.PENDING)).toBe(false);
  });
});

describe('getNextActions', () => {
  it('PENDING → [CONFIRMED, CANCELLED]', () => {
    expect(getNextActions(OrderStatus.PENDING)).toEqual([
      OrderStatus.CONFIRMED,
      OrderStatus.CANCELLED,
    ]);
  });

  it('CONFIRMED → [DELIVERING]', () => {
    expect(getNextActions(OrderStatus.CONFIRMED)).toEqual([OrderStatus.DELIVERING]);
  });

  it('DELIVERING → [COMPLETED]', () => {
    expect(getNextActions(OrderStatus.DELIVERING)).toEqual([OrderStatus.COMPLETED]);
  });

  it('COMPLETED → []', () => {
    expect(getNextActions(OrderStatus.COMPLETED)).toEqual([]);
  });

  it('CANCELLED → []', () => {
    expect(getNextActions(OrderStatus.CANCELLED)).toEqual([]);
  });
});

describe('transitionOrder', () => {
  const baseOrder = {
    id: 'order-1',
    status: OrderStatus.PENDING,
    updatedAt: new Date('2026-01-01'),
  };

  it('PENDING → CONFIRMED', () => {
    const result = transitionOrder(baseOrder, OrderStatus.CONFIRMED);
    expect(result.status).toBe(OrderStatus.CONFIRMED);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('PENDING → DELIVERING throws', () => {
    expect(() => transitionOrder(baseOrder, OrderStatus.DELIVERING)).toThrow(
      'Cannot transition from PENDING to DELIVERING',
    );
  });

  it('COMPLETED → PENDING throws', () => {
    const completed = { ...baseOrder, status: OrderStatus.COMPLETED };
    expect(() => transitionOrder(completed, OrderStatus.PENDING)).toThrow(
      'Cannot transition from COMPLETED to PENDING',
    );
  });
});

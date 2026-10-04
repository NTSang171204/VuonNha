import type { TagProps } from 'antd';

export const statusLabels: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  DELIVERING: 'Đang giao',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
};

export const statusTagColor: Record<string, TagProps['color']> = {
  PENDING: 'gold',
  CONFIRMED: 'blue',
  DELIVERING: 'purple',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

export const UNIT_LABELS: Record<string, string> = {
  KG: 'kg',
  BUNDLE: 'bó',
  BOX: 'hộp',
  FRUIT: 'trái',
};

export const statusLabels: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  DELIVERING: 'Đang giao',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
};

export const statusBadgeClass: Record<string, string> = {
  PENDING:
    'bg-status-pending-bg text-status-pending-text border border-status-pending-border',
  CONFIRMED:
    'bg-status-processing-bg text-status-processing-text border border-status-processing-border',
  DELIVERING:
    'bg-status-delivering-bg text-status-delivering-text border border-status-delivering-border',
  COMPLETED:
    'bg-status-completed-bg text-status-completed-text border border-status-completed-border',
  CANCELLED:
    'bg-status-cancelled-bg text-status-cancelled-text border border-status-cancelled-border',
};

export const UNIT_LABELS: Record<string, string> = {
  KG: 'kg',
  BUNDLE: 'bó',
  BOX: 'hộp',
  FRUIT: 'trái',
};

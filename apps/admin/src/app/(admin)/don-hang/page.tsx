'use client';

import { useEffect, useState } from 'react';
import {
  Table, Button, Space, Modal, Descriptions, message, Select, Input,
} from 'antd';
import api from '@/lib/api';
import { OrderStatus } from '@farm/types';
import { statusBadgeClass, statusLabels } from '@/lib/status';

interface StatusHistoryItem {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  createdAt: string;
  changedBy?: { id: string; name: string; email: string } | null;
}

interface Order {
  id: string;
  orderCode: string;
  recipientName: string;
  recipientPhone: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  paymentMethod?: string;
  items: { productName: string; quantity: number; subtotal: number }[];
  statusHistory?: StatusHistoryItem[];
}

function formatStatusChange(from: string | null, to: string) {
  const toLabel = statusLabels[to] || to;
  if (!from) return toLabel;
  return `${statusLabels[from] || from} -> ${toLabel}`;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [counts, setCounts] = useState<Record<string, number>>({
    ALL: 0,
    PENDING: 0,
    CONFIRMED: 0,
    DELIVERING: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      const { data } = await api.get(`/orders?${params}`);
      setOrders(data.items || []);
    } catch {
      message.error('Không thể tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const statuses = [
        'PENDING',
        'CONFIRMED',
        'DELIVERING',
        'COMPLETED',
        'CANCELLED',
      ] as const;
      const [all, ...rest] = await Promise.all([
        api.get('/orders?limit=1'),
        ...statuses.map((s) => api.get(`/orders?status=${s}&limit=1`)),
      ]);
      const next: Record<string, number> = { ALL: all.data?.total || 0 };
      statuses.forEach((s, i) => {
        next[s] = rest[i].data?.total || 0;
      });
      setCounts(next);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  useEffect(() => {
    fetchCounts();
  }, []);

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    setModalOpen(true);
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/orders/${order.id}`);
      setSelectedOrder(data);
    } catch {
      message.error('Không thể tải chi tiết đơn hàng');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      if (newStatus === OrderStatus.CANCELLED) {
        await api.put(`/orders/${orderId}/cancel`);
        message.success('Hủy đơn thành công');
      } else {
        await api.put(`/orders/${orderId}/status`, { status: newStatus });
        message.success('Cập nhật trạng thái thành công');
      }
      fetchOrders();
      fetchCounts();
      setModalOpen(false);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const getNextActions = (status: OrderStatus) => {
    if (status === OrderStatus.PENDING) {
      return [OrderStatus.CONFIRMED, OrderStatus.CANCELLED];
    }
    if (status === OrderStatus.CONFIRMED) {
      return [OrderStatus.DELIVERING, OrderStatus.CANCELLED];
    }
    if (status === OrderStatus.DELIVERING) {
      return [OrderStatus.COMPLETED];
    }
    return [];
  };

  const countCards = [
    { key: undefined, label: 'Tất cả', count: counts.ALL, color: 'text-ink' },
    { key: 'PENDING', label: 'Chờ xác nhận', count: counts.PENDING, color: 'text-status-pending-text' },
    { key: 'CONFIRMED', label: 'Đã xác nhận', count: counts.CONFIRMED, color: 'text-status-processing-text' },
    { key: 'DELIVERING', label: 'Đang giao', count: counts.DELIVERING, color: 'text-status-delivering-text' },
    { key: 'COMPLETED', label: 'Hoàn tất', count: counts.COMPLETED, color: 'text-status-completed-text' },
    { key: 'CANCELLED', label: 'Đã hủy', count: counts.CANCELLED, color: 'text-status-cancelled-text' },
  ];

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (code: string) => (
        <span className="font-semibold text-ink">{code}</span>
      ),
    },
    {
      title: 'Người nhận',
      key: 'recipient',
      render: (_: unknown, row: Order) => (
        <div>
          <div className="font-medium">{row.recipientName}</div>
          <div className="text-xs text-ink-secondary">{row.recipientPhone}</div>
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number, row: Order) => (
        <div>
          <div className="font-tnum font-semibold">
            {amount.toLocaleString('vi-VN')}đ
          </div>
          <div className="text-xs text-ink-secondary">
            {row.items?.length || 0} sản phẩm
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span
          className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${statusBadgeClass[status] || ''}`}
        >
          {statusLabels[status] || status}
        </span>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: Order) => (
        <Button size="small" onClick={() => handleViewOrder(record)}>
          Xem
        </Button>
      ),
    },
  ];

  const historyColumns = [
    {
      title: 'Mã đơn',
      key: 'orderCode',
      render: () => selectedOrder?.orderCode || '-',
    },
    {
      title: 'Trạng thái',
      key: 'statusChange',
      render: (_: unknown, record: StatusHistoryItem) =>
        formatStatusChange(record.fromStatus, record.toStatus),
    },
    {
      title: 'Người đổi',
      key: 'changedBy',
      render: (_: unknown, record: StatusHistoryItem) =>
        record.changedBy?.name || 'Khách / Hệ thống',
    },
    {
      title: 'Thời điểm',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-line bg-surface-card p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-ink">Quản lý đơn hàng</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Theo dõi tiến độ xử lý đơn hàng nông sản tươi Vườn Nhà
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {countCards.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => setStatusFilter(card.key)}
            className={`rounded-lg border p-3 text-left shadow-sm transition-colors ${
              statusFilter === card.key
                ? 'border-primary bg-surface-low'
                : 'border-line bg-surface-card hover:bg-surface-low'
            }`}
          >
            <div className="text-xs text-ink-secondary">{card.label}</div>
            <div className={`mt-1 text-xl font-semibold ${card.color}`}>
              {card.count}
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-line bg-surface-card p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          <Input.Search
            allowClear
            placeholder="Tìm mã đơn, tên, SĐT..."
            style={{ width: 260 }}
            onSearch={setSearch}
          />
          <Select
            allowClear
            placeholder="Lọc trạng thái"
            style={{ width: 180 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={Object.entries(statusLabels).map(([value, label]) => ({
              value,
              label,
            }))}
          />
        </div>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={orders}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title="Chi tiết đơn hàng"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Mã đơn">
                {selectedOrder.orderCode}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <span
                  className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${statusBadgeClass[selectedOrder.status] || ''}`}
                >
                  {statusLabels[selectedOrder.status]}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Người nhận">
                {selectedOrder.recipientName}
              </Descriptions.Item>
              <Descriptions.Item label="Điện thoại">
                {selectedOrder.recipientPhone}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền" span={2}>
                {selectedOrder.totalAmount.toLocaleString('vi-VN')}đ
              </Descriptions.Item>
            </Descriptions>

            <h3 className="mb-2 mt-4 font-semibold">Sản phẩm</h3>
            <div className="mb-4 space-y-2">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>
                    {item.productName} x{item.quantity}
                  </span>
                  <span>{item.subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
              ))}
            </div>

            {getNextActions(selectedOrder.status as OrderStatus).length > 0 && (
              <>
                <h3 className="mb-2 font-semibold">Cập nhật trạng thái</h3>
                <Space className="mb-4">
                  {getNextActions(selectedOrder.status as OrderStatus).map(
                    (status) => (
                      <Button
                        key={status}
                        type={
                          status === OrderStatus.CANCELLED ? 'default' : 'primary'
                        }
                        danger={status === OrderStatus.CANCELLED}
                        onClick={() =>
                          handleUpdateStatus(selectedOrder.id, status)
                        }
                      >
                        {statusLabels[status]}
                      </Button>
                    ),
                  )}
                </Space>
              </>
            )}

            <h3 className="mb-2 mt-2 font-semibold">Lịch sử trạng thái</h3>
            <Table
              size="small"
              rowKey="id"
              loading={detailLoading}
              pagination={false}
              columns={historyColumns}
              dataSource={selectedOrder.statusHistory || []}
              locale={{ emptyText: 'Chưa có lịch sử trạng thái' }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

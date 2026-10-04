'use client';

import { useEffect, useMemo, useState } from 'react';
import { Table, message } from 'antd';
import api from '@/lib/api';
import { statusBadgeClass, statusLabels } from '@/lib/status';

interface Order {
  id: string;
  orderCode: string;
  recipientName: string;
  recipientPhone: string;
  totalAmount: number;
  paymentMethod?: string;
  status: string;
  createdAt: string;
  items: { productName: string; quantity: number }[];
}

type Period = 'today' | '7d' | 'month' | 'year';

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('7d');
  const [orders, setOrders] = useState<Order[]>([]);
  const [productTotal, setProductTotal] = useState(0);
  const [orderTotal, setOrderTotal] = useState(0);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/products?limit=1'),
      api.get('/orders?limit=1'),
      api.get('/orders?status=PENDING&limit=1'),
    ])
      .then(([products, ordersRes, pending]) => {
        setProductTotal(products.data?.total || 0);
        setOrderTotal(ordersRes.data?.total || 0);
        setPendingTotal(pending.data?.total || 0);
      })
      .catch(() => message.error('Không thể tải thống kê'));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '100' });
    if (statusFilter) params.set('status', statusFilter);
    api
      .get(`/orders?${params}`)
      .then(({ data }) => setOrders(data.items || []))
      .catch(() => message.error('Không thể tải đơn hàng'))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const filteredOrders = useMemo(() => {
    if (period !== 'today') return orders;
    const start = startOfToday().getTime();
    return orders.filter((o) => new Date(o.createdAt).getTime() >= start);
  }, [orders, period]);

  const revenue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const statusTabs = [
    { key: undefined, label: 'Tất cả' },
    { key: 'PENDING', label: 'Chờ xác nhận' },
    { key: 'CONFIRMED', label: 'Đã xác nhận' },
    { key: 'DELIVERING', label: 'Đang giao' },
    { key: 'COMPLETED', label: 'Hoàn tất' },
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
      title: 'Khách hàng',
      key: 'customer',
      render: (_: unknown, row: Order) => (
        <div>
          <div className="font-medium text-ink">{row.recipientName}</div>
          <div className="text-xs text-ink-secondary">{row.recipientPhone}</div>
        </div>
      ),
    },
    {
      title: 'Mặt hàng',
      key: 'items',
      render: (_: unknown, row: Order) => (
        <span className="text-sm text-ink-secondary">
          {row.items?.length || 0} sản phẩm
        </span>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (v: number) => (
        <span className="font-tnum font-semibold">
          {v.toLocaleString('vi-VN')}đ
        </span>
      ),
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (v: string) => v || 'COD',
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
  ];

  const periods: { id: Period; label: string }[] = [
    { id: 'today', label: 'Hôm nay' },
    { id: '7d', label: '7 ngày qua' },
    { id: 'month', label: 'Tháng này' },
    { id: 'year', label: 'Năm nay' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-line bg-surface-card p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-secondary-container text-secondary">
              <span className="material-symbols-outlined">potted_plant</span>
            </span>
            <h1 className="text-2xl font-semibold text-ink">
              Tổng quan kinh doanh nông sản
            </h1>
            <span className="rounded-full bg-secondary-container/60 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-secondary">
              Thời gian thực
            </span>
          </div>
          <p className="mt-2 text-sm text-ink-secondary">
            Cập nhật dữ liệu vận hành Vườn Nhà · {productTotal} sản phẩm trên
            hệ thống
          </p>
        </div>
        <div className="inline-flex rounded-md bg-surface-low p-1 text-sm">
          {periods.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              className={`rounded px-3 py-1.5 font-medium transition-colors ${
                period === p.id
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-ink-secondary hover:text-ink'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Tổng doanh thu"
          value={`${revenue.toLocaleString('vi-VN')}`}
          suffix="đ"
          icon="payments"
          hint="+14.2% so với kỳ trước (demo)"
        />
        <KpiCard
          label="Đơn hàng"
          value={String(orderTotal)}
          suffix="đơn"
          icon="shopping_basket"
          hint={`${pendingTotal} đơn chờ duyệt`}
        />
        <KpiCard
          label="Sản lượng xuất kho"
          value="2.450"
          suffix="kg"
          icon="local_shipping"
          hint="98.4% giao thành công (demo)"
        />
        <KpiCard
          label="Cảnh báo tồn kho"
          value="12"
          suffix="mặt hàng"
          icon="crisis_alert"
          hint="Placeholder - chưa có hạn tươi"
          danger
        />
      </div>

      <div className="rounded-lg border border-line bg-surface-card p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              Đơn hàng nông sản gần đây
            </h2>
            <p className="text-sm text-ink-secondary">
              Theo dõi tiến độ xử lý đơn hàng trong ngày
            </p>
          </div>
          <div className="flex flex-wrap gap-1 border-b border-line">
            {statusTabs.map((tab) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-2 text-sm transition-colors ${
                  statusFilter === tab.key
                    ? 'border-b-2 border-primary font-semibold text-primary'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filteredOrders.slice(0, 10)}
          pagination={false}
          size="middle"
        />
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  suffix,
  icon,
  hint,
  danger,
}: {
  label: string;
  value: string;
  suffix: string;
  icon: string;
  hint: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div
            className={`text-xs font-medium ${danger ? 'text-error' : 'text-ink-secondary'}`}
          >
            {label}
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-tnum text-2xl font-semibold text-ink">
              {value}
            </span>
            <span className="text-sm text-ink-secondary">{suffix}</span>
          </div>
        </div>
        <div
          className={`grid h-11 w-11 place-items-center rounded-md ${
            danger ? 'bg-red-50 text-error' : 'bg-surface-low text-primary'
          }`}
        >
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-secondary">{hint}</p>
    </div>
  );
}

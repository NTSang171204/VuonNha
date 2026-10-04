'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Table,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Segmented,
  Tabs,
  Tag,
  Typography,
  Space,
} from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  CarOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import api from '@/lib/api';
import { statusLabels, statusTagColor } from '@/lib/status';

const { Title, Text } = Typography;

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
  const [statusFilter, setStatusFilter] = useState<string>('all');
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
    if (statusFilter !== 'all') params.set('status', statusFilter);
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

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (code: string) => <Text strong>{code}</Text>,
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_: unknown, row: Order) => (
        <div>
          <div>{row.recipientName}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {row.recipientPhone}
          </Text>
        </div>
      ),
    },
    {
      title: 'Mặt hàng',
      key: 'items',
      render: (_: unknown, row: Order) => (
        <Text type="secondary">{row.items?.length || 0} sản phẩm</Text>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (v: number) => (
        <Text strong>{v.toLocaleString('vi-VN')}đ</Text>
      ),
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (v: string) => <Tag>{v || 'COD'}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusTagColor[status]}>
          {statusLabels[status] || status}
        </Tag>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Space align="center" wrap>
              <Title level={3} style={{ margin: 0 }}>
                Tổng quan kinh doanh nông sản
              </Title>
              <Tag color="success">Thời gian thực</Tag>
            </Space>
            <Text type="secondary">
              Cập nhật dữ liệu vận hành Vườn Nhà · {productTotal} sản phẩm trên
              hệ thống
            </Text>
          </div>
          <Segmented
            value={period}
            onChange={(v) => setPeriod(v as Period)}
            options={[
              { label: 'Hôm nay', value: 'today' },
              { label: '7 ngày qua', value: '7d' },
              { label: 'Tháng này', value: 'month' },
              { label: 'Năm nay', value: 'year' },
            ]}
          />
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={revenue}
              suffix="đ"
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1B5E20' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              +14.2% so với kỳ trước (demo)
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic
              title="Đơn hàng"
              value={orderTotal}
              suffix="đơn"
              prefix={<ShoppingCartOutlined />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {pendingTotal} đơn chờ duyệt
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic
              title="Sản lượng xuất kho"
              value={2450}
              suffix="kg"
              prefix={<CarOutlined />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              98.4% giao thành công (demo)
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic
              title="Cảnh báo tồn kho"
              value={12}
              suffix="mặt hàng"
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Placeholder - chưa có hạn tươi
            </Text>
          </Card>
        </Col>
      </Row>

      <Card
        title="Đơn hàng nông sản gần đây"
        extra={
          <Text type="secondary" style={{ fontSize: 13 }}>
            Theo dõi tiến độ xử lý đơn hàng
          </Text>
        }
      >
        <Tabs
          activeKey={statusFilter}
          onChange={setStatusFilter}
          items={[
            { key: 'all', label: 'Tất cả' },
            { key: 'PENDING', label: 'Chờ xác nhận' },
            { key: 'CONFIRMED', label: 'Đã xác nhận' },
            { key: 'DELIVERING', label: 'Đang giao' },
            { key: 'COMPLETED', label: 'Hoàn tất' },
          ]}
        />
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filteredOrders.slice(0, 10)}
          pagination={false}
          size="middle"
        />
      </Card>
    </Space>
  );
}

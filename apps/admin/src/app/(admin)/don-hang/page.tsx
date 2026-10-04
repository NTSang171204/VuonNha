'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Descriptions,
  message,
  Select,
  Input,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Typography,
  List,
} from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import { OrderStatus } from '@farm/types';
import { statusLabels, statusTagColor } from '@/lib/status';

const { Title, Text } = Typography;

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
    { key: undefined, label: 'Tất cả', count: counts.ALL, color: undefined },
    {
      key: 'PENDING',
      label: 'Chờ xác nhận',
      count: counts.PENDING,
      color: '#d97706',
    },
    {
      key: 'CONFIRMED',
      label: 'Đã xác nhận',
      count: counts.CONFIRMED,
      color: '#1d4ed8',
    },
    {
      key: 'DELIVERING',
      label: 'Đang giao',
      count: counts.DELIVERING,
      color: '#7e22ce',
    },
    {
      key: 'COMPLETED',
      label: 'Hoàn tất',
      count: counts.COMPLETED,
      color: '#047857',
    },
    {
      key: 'CANCELLED',
      label: 'Đã hủy',
      count: counts.CANCELLED,
      color: '#b91c1c',
    },
  ];

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (code: string) => <Text strong>{code}</Text>,
    },
    {
      title: 'Người nhận',
      key: 'recipient',
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
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number, row: Order) => (
        <div>
          <Text strong>{amount.toLocaleString('vi-VN')}đ</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {row.items?.length || 0} sản phẩm
            </Text>
          </div>
        </div>
      ),
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
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewOrder(record)}
        >
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
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <Title level={3} style={{ margin: 0 }}>
          Quản lý đơn hàng
        </Title>
        <Text type="secondary">
          Theo dõi tiến độ xử lý đơn hàng nông sản tươi Vườn Nhà
        </Text>
      </Card>

      <Row gutter={[12, 12]}>
        {countCards.map((card) => (
          <Col key={card.label} xs={12} sm={8} xl={4}>
            <Card
              size="small"
              hoverable
              onClick={() => setStatusFilter(card.key)}
              style={{
                borderColor:
                  statusFilter === card.key ? '#1B5E20' : undefined,
                background:
                  statusFilter === card.key ? '#edf6e7' : undefined,
                cursor: 'pointer',
              }}
            >
              <Statistic
                title={card.label}
                value={card.count}
                valueStyle={card.color ? { color: card.color } : undefined}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <Input.Search
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm mã đơn, tên, SĐT..."
            style={{ width: 280 }}
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
        </Space>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={orders}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>

      <Modal
        title="Chi tiết đơn hàng"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Mã đơn">
                {selectedOrder.orderCode}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={statusTagColor[selectedOrder.status]}>
                  {statusLabels[selectedOrder.status]}
                </Tag>
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

            <Card size="small" title="Sản phẩm" type="inner">
              <List
                size="small"
                dataSource={selectedOrder.items}
                renderItem={(item) => (
                  <List.Item
                    extra={`${item.subtotal.toLocaleString('vi-VN')}đ`}
                  >
                    {item.productName} x{item.quantity}
                  </List.Item>
                )}
              />
            </Card>

            {getNextActions(selectedOrder.status as OrderStatus).length > 0 && (
              <Card size="small" title="Cập nhật trạng thái" type="inner">
                <Space wrap>
                  {getNextActions(selectedOrder.status as OrderStatus).map(
                    (status) => (
                      <Button
                        key={status}
                        type={
                          status === OrderStatus.CANCELLED
                            ? 'default'
                            : 'primary'
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
              </Card>
            )}

            <Card size="small" title="Lịch sử trạng thái" type="inner">
              <Table
                size="small"
                rowKey="id"
                loading={detailLoading}
                pagination={false}
                columns={historyColumns}
                dataSource={selectedOrder.statusHistory || []}
                locale={{ emptyText: 'Chưa có lịch sử trạng thái' }}
              />
            </Card>
          </Space>
        )}
      </Modal>
    </Space>
  );
}

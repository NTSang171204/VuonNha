'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Layout, Menu, Table, Button, Space, Tag, Modal, Descriptions,
  message, Card, Select, Timeline,
} from 'antd';
import {
  EyeOutlined, LogoutOutlined, ShoppingOutlined, InboxOutlined,
  CheckCircleOutlined, CloseCircleOutlined, TruckOutlined,
} from '@ant-design/icons';
import api from '@/lib/api';
import { OrderStatus, canTransition } from '@farm/types';

const { Header, Sider, Content } = Layout;
const { Option } = Select;

interface Order {
  id: string;
  recipientName: string;
  recipientPhone: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: { productName: string; quantity: number; subtotal: number }[];
}

const statusColors: Record<string, string> = {
  PENDING: 'gold',
  CONFIRMED: 'blue',
  DELIVERING: 'purple',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  DELIVERING: 'Đang giao',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/orders?${params}`);
      setOrders(data.items || []);
    } catch {
      message.error('Không thể tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [router, statusFilter]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      message.success('Cập nhật trạng thái thành công');
      fetchOrders();
      setModalOpen(false);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const handleCancel = async (orderId: string) => {
    try {
      await api.put(`/orders/${orderId}/cancel`);
      message.success('Hủy đơn thành công');
      fetchOrders();
      setModalOpen(false);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Hủy thất bại');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/login');
  };

  const getNextActions = (status: OrderStatus) => {
    const nextStatuses: OrderStatus[] = [];
    if (status === OrderStatus.PENDING) {
      nextStatuses.push(OrderStatus.CONFIRMED, OrderStatus.CANCELLED);
    } else if (status === OrderStatus.CONFIRMED) {
      nextStatuses.push(OrderStatus.DELIVERING);
    } else if (status === OrderStatus.DELIVERING) {
      nextStatuses.push(OrderStatus.COMPLETED);
    }
    return nextStatuses;
  };

  const columns = [
    { title: 'Mã đơn', dataIndex: 'id', key: 'id', render: (id: string) => id.slice(0, 8) },
    { title: 'Người nhận', dataIndex: 'recipientName', key: 'recipientName' },
    { title: 'Điện thoại', dataIndex: 'recipientPhone', key: 'recipientPhone' },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `${amount.toLocaleString('vi-VN')}đ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
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
      render: (_: any, record: Order) => (
        <Button icon={<EyeOutlined />} size="small" onClick={() => handleViewOrder(record)}>
          Xem
        </Button>
      ),
    },
  ];

  const menuItems = [
    { key: 'dashboard', icon: <ShoppingOutlined />, label: 'Tổng quan', href: '/dashboard' },
    { key: 'products', icon: <InboxOutlined />, label: 'Sản phẩm', href: '/san-pham' },
    { key: 'orders', icon: <ShoppingOutlined />, label: 'Đơn hàng', href: '/don-hang' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={200}>
        <div className="flex h-16 items-center justify-center text-lg font-bold text-white">
          Admin Panel
        </div>
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          onClick={({ key }) => {
            const item = menuItems.find((m) => m.key === key);
            if (item) router.push(item.href);
          }}
        />
      </Sider>
      <Layout>
        <Header className="flex items-center justify-end bg-white px-6">
          <LogoutOutlined className="cursor-pointer text-lg" onClick={handleLogout} />
        </Header>
        <Content className="p-6">
          <Card title="Quản lý đơn hàng">
            <div className="mb-4">
              <Select
                placeholder="Lọc theo trạng thái"
                allowClear
                style={{ width: 200 }}
                value={statusFilter}
                onChange={setStatusFilter}
              >
                <Option value="PENDING">Chờ xác nhận</Option>
                <Option value="CONFIRMED">Đã xác nhận</Option>
                <Option value="DELIVERING">Đang giao</Option>
                <Option value="COMPLETED">Hoàn tất</Option>
                <Option value="CANCELLED">Đã hủy</Option>
              </Select>
            </div>
            <Table
              columns={columns}
              dataSource={orders}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Content>
      </Layout>

      <Modal
        title="Chi tiết đơn hàng"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedOrder && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Mã đơn">{selectedOrder.id}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={statusColors[selectedOrder.status]}>
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

            <h3 className="mb-2 mt-4 font-semibold">Sản phẩm</h3>
            <div className="mb-4 space-y-2">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.productName} x{item.quantity}</span>
                  <span>{item.subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
              ))}
            </div>

            {getNextActions(selectedOrder.status as OrderStatus).length > 0 && (
              <>
                <h3 className="mb-2 font-semibold">Cập nhật trạng thái</h3>
                <Space>
                  {getNextActions(selectedOrder.status as OrderStatus).map((status) => (
                    <Button
                      key={status}
                      type={status === OrderStatus.CANCELLED ? 'default' : 'primary'}
                      danger={status === OrderStatus.CANCELLED}
                      onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                    >
                      {statusLabels[status]}
                    </Button>
                  ))}
                </Space>
              </>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
}

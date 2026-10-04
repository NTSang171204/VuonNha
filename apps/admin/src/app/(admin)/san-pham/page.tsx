'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Avatar,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  StopOutlined,
} from '@ant-design/icons';
import api from '@/lib/api';
import { UNIT_LABELS } from '@/lib/status';

const { Title, Text } = Typography;

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  stock: number;
  status: string;
  categoryId?: string;
  category?: { id: string; name: string };
  imageUrl?: string;
  description?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [form] = Form.useForm();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (search) params.set('search', search);
      if (categoryId) params.set('categoryId', categoryId);
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.items || []);
    } catch {
      message.error('Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api
      .get('/categories')
      .then(({ data }) => setCategories(data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, categoryId, statusFilter]);

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status === 'ACTIVE').length;
    const low = products.filter((p) => p.stock > 0 && p.stock < 10).length;
    const out = products.filter(
      (p) => p.stock === 0 || p.status === 'INACTIVE',
    ).length;
    return { total, active, low, out };
  }, [products]);

  const handleSubmit = async (values: any) => {
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, values);
        message.success('Cập nhật thành công');
      } else {
        await api.post('/products', values);
        message.success('Thêm thành công');
      }
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
      fetchProducts();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      message.success('Đã ngừng bán sản phẩm');
      fetchProducts();
    } catch {
      message.error('Xóa thất bại');
    }
  };

  const columns = [
    {
      title: 'Thông tin nông sản',
      key: 'info',
      render: (_: unknown, row: Product) => (
        <Space>
          <Avatar
            shape="square"
            size={48}
            src={row.imageUrl}
            style={{ background: '#edf6e7', color: '#1B5E20' }}
          >
            {row.name.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{row.name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              SKU: {row.id}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: ['category', 'name'],
      key: 'category',
    },
    {
      title: 'Đơn giá',
      key: 'price',
      render: (_: unknown, row: Product) => (
        <Text strong>
          {row.price.toLocaleString('vi-VN')}đ /{' '}
          {UNIT_LABELS[row.unit] || row.unit}
        </Text>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => (
        <Text type={stock === 0 ? 'danger' : stock < 10 ? 'warning' : undefined}>
          {stock}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'default'}>
          {status === 'ACTIVE' ? 'Đang bán' : 'Ngừng bán'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, row: Product) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(row);
              form.setFieldsValue(row);
              setModalOpen(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Ngừng bán sản phẩm?"
            onConfirm={() => handleDelete(row.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Space align="center">
              <Title level={3} style={{ margin: 0 }}>
                Quản lý sản phẩm
              </Title>
              <Tag color="success">Kho trực tuyến</Tag>
            </Space>
            <Text type="secondary">
              Quản lý danh mục nông sản, tồn kho và giá bán Vườn Nhà
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null);
              form.resetFields();
              setModalOpen(true);
            }}
          >
            Thêm sản phẩm
          </Button>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={stats.total}
              suffix="SKU"
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Đang kinh doanh"
              value={stats.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#047857' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Sắp hết hàng"
              value={stats.low}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#d97706' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Hết hàng / tạm dừng"
              value={stats.out}
              prefix={<StopOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <Input.Search
            allowClear
            placeholder="Tìm tên sản phẩm..."
            style={{ width: 240 }}
            onSearch={setSearch}
          />
          <Select
            allowClear
            placeholder="Danh mục"
            style={{ width: 180 }}
            value={categoryId}
            onChange={setCategoryId}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
          <Select
            allowClear
            placeholder="Trạng thái"
            style={{ width: 160 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'ACTIVE', label: 'Đang bán' },
              { value: 'INACTIVE', label: 'Ngừng bán' },
            ]}
          />
        </Space>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={products}
          pagination={{ pageSize: 8, showSizeChanger: true }}
        />
      </Card>

      <Modal
        title={editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="categoryId"
            label="Danh mục"
            rules={[{ required: true }]}
          >
            <Select
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Form.Item>
          <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="unit" label="Đơn vị" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'KG', label: 'kg' },
                { value: 'BUNDLE', label: 'bó' },
                { value: 'BOX', label: 'hộp' },
                { value: 'FRUIT', label: 'trái' },
              ]}
            />
          </Form.Item>
          <Form.Item name="stock" label="Tồn kho" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="imageUrl" label="URL hình ảnh">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          {editing && (
            <Form.Item name="status" label="Trạng thái">
              <Select
                options={[
                  { value: 'ACTIVE', label: 'Đang bán' },
                  { value: 'INACTIVE', label: 'Ngừng bán' },
                ]}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Space>
  );
}

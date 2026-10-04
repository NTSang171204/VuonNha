'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Tag,
} from 'antd';
import api from '@/lib/api';
import { UNIT_LABELS } from '@/lib/status';

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
    api.get('/categories').then(({ data }) => setCategories(data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, categoryId, statusFilter]);

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status === 'ACTIVE').length;
    const low = products.filter((p) => p.stock > 0 && p.stock < 10).length;
    const out = products.filter((p) => p.stock === 0 || p.status === 'INACTIVE').length;
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
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded border border-line bg-surface-low">
            {row.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.imageUrl} alt={row.name} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-sm font-semibold text-ink-muted">
                {row.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="font-medium text-ink">{row.name}</div>
            <div className="font-tnum text-xs text-ink-muted">SKU: {row.id}</div>
          </div>
        </div>
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
        <span className="font-tnum font-semibold">
          {row.price.toLocaleString('vi-VN')}đ / {UNIT_LABELS[row.unit] || row.unit}
        </span>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => (
        <span className={`font-tnum ${stock === 0 ? 'text-error' : stock < 10 ? 'text-amber-600' : ''}`}>
          {stock}
        </span>
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
            onClick={() => {
              setEditing(row);
              form.setFieldsValue(row);
              setModalOpen(true);
            }}
          >
            Chỉnh sửa
          </Button>
          <Popconfirm title="Ngừng bán sản phẩm?" onConfirm={() => handleDelete(row.id)}>
            <Button size="small" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-lg border border-line bg-surface-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-ink">Quản lý sản phẩm</h1>
            <span className="rounded-full bg-status-completed-bg px-2 py-0.5 text-[11px] font-semibold text-status-completed-text">
              Kho trực tuyến
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-secondary">
            Quản lý danh mục nông sản, tồn kho và giá bán Vườn Nhà
          </p>
        </div>
        <Button
          type="primary"
          onClick={() => {
            setEditing(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          + Thêm sản phẩm
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Tổng sản phẩm" value={`${stats.total} SKU`} />
        <Stat label="Đang kinh doanh" value={String(stats.active)} />
        <Stat label="Sắp hết hàng" value={String(stats.low)} warn />
        <Stat label="Hết hàng / tạm dừng" value={String(stats.out)} danger />
      </div>

      <div className="rounded-lg border border-line bg-surface-card p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
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
        </div>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={products}
          pagination={{ pageSize: 8, showSizeChanger: true }}
        />
      </div>

      <Modal
        title={editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]}>
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
    </div>
  );
}

function Stat({
  label,
  value,
  warn,
  danger,
}: {
  label: string;
  value: string;
  warn?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface-card p-4 shadow-sm">
      <div className="text-xs text-ink-secondary">{label}</div>
      <div
        className={`mt-1 text-xl font-semibold ${
          danger ? 'text-error' : warn ? 'text-amber-600' : 'text-ink'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

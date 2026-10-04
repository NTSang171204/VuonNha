'use client';

import { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, message, Popconfirm, Space,
} from 'antd';
import api from '@/lib/api';

interface Category {
  id: string;
  name: string;
  _count?: { products: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data || []);
    } catch {
      message.error('Không thể tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (values: { name: string }) => {
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, values);
        message.success('Cập nhật danh mục thành công');
      } else {
        await api.post('/categories', values);
        message.success('Thêm danh mục thành công');
      }
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
      fetchCategories();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/categories/${id}`);
      message.success('Đã xóa danh mục');
      fetchCategories();
    } catch (error: any) {
      message.error(
        error.response?.data?.message ||
          'Không thể xóa danh mục (có thể đang có sản phẩm)',
      );
    }
  };

  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <span className="font-medium text-ink">{name}</span>
      ),
    },
    {
      title: 'Mã',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => (
        <span className="font-tnum text-xs text-ink-muted">{id}</span>
      ),
    },
    {
      title: 'Số sản phẩm',
      key: 'count',
      render: (_: unknown, row: Category) => row._count?.products ?? 0,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, row: Category) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setEditing(row);
              form.setFieldsValue({ name: row.name });
              setModalOpen(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa danh mục này?"
            onConfirm={() => handleDelete(row.id)}
          >
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
      <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Danh mục</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Quản lý nhóm nông sản trên cửa hàng Vườn Nhà
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
          + Thêm danh mục
        </Button>
      </div>

      <div className="rounded-lg border border-line bg-surface-card p-4 shadow-sm">
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={categories}
          pagination={false}
        />
      </div>

      <Modal
        title={editing ? 'Sửa danh mục' : 'Thêm danh mục'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
          >
            <Input placeholder="Ví dụ: Rau củ" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

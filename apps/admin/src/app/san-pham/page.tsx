'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Layout, Menu, Table, Button, Space, Tag, Modal, Form, Input,
  InputNumber, Select, message, Popconfirm, Card,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, LogoutOutlined,
  ShoppingOutlined, InboxOutlined,
} from '@ant-design/icons';
import api from '@/lib/api';

const { Header, Sider, Content } = Layout;
const { Option } = Select;

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  stock: number;
  status: string;
  category?: { name: string };
  imageUrl?: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products?limit=100');
      setProducts(data.items || []);
    } catch {
      message.error('Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchProducts();
    fetchCategories();
  }, [router]);

  const handleSubmit = async (values: any) => {
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, values);
        message.success('Cập nhật thành công');
      } else {
        await api.post('/products', values);
        message.success('Thêm thành công');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingProduct(null);
      fetchProducts();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      message.success('Xóa thành công');
      fetchProducts();
    } catch {
      message.error('Xóa thất bại');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/login');
  };

  const columns = [
    { title: 'Tên sản ph�ẩm', dataIndex: 'name', key: 'name' },
    { title: 'Danh mục', dataIndex: ['category', 'name'], key: 'category' },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number, record: Product) =>
        `${price.toLocaleString('vi-VN')}đ / ${record.unit}`,
    },
    { title: 'Tồn kho', dataIndex: 'stock', key: 'stock' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
          {status === 'ACTIVE' ? 'Đang bán' : 'Ngừng bán'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: Product) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small" />
          <Popconfirm
            title="Xóa sản phẩm?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
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
          <Card
            title="Quản lý sản phẩm"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingProduct(null);
                  form.resetFields();
                  setModalOpen(true);
                }}
              >
                Thêm sản phẩm
              </Button>
            }
          >
            <Table
              columns={columns}
              dataSource={products}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Content>
      </Layout>

      <Modal
        title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
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
            <Select>
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="unit" label="Đơn vị" rules={[{ required: true }]}>
            <Input placeholder="kg, bó, khay..." />
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
        </Form>
      </Modal>
    </Layout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  DatePicker,
  message,
  Popconfirm,
  Space,
  Card,
  Typography,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '@/lib/api';

const { Title, Text } = Typography;

interface ProductOption {
  id: string;
  name: string;
  price: number;
}

interface DiscountCode {
  id: string;
  code: string;
  percentOff: number;
  productId: string;
  active: boolean;
  expiresAt: string | null;
  maxUses: number | null;
  usedCount: number;
  product?: ProductOption;
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DiscountCode | null>(null);
  const [form] = Form.useForm();

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/discounts');
      setDiscounts(data || []);
    } catch {
      message.error('Không thể tải mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
    api
      .get('/products?limit=100&status=ACTIVE')
      .then(({ data }) => setProducts(data.items || []))
      .catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ active: true, percentOff: 10 });
    setModalOpen(true);
  };

  const openEdit = (row: DiscountCode) => {
    setEditing(row);
    form.setFieldsValue({
      code: row.code,
      percentOff: row.percentOff,
      productId: row.productId,
      active: row.active,
      maxUses: row.maxUses,
      expiresAt: row.expiresAt ? dayjs(row.expiresAt) : null,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values: {
    code: string;
    percentOff: number;
    productId: string;
    active: boolean;
    maxUses?: number | null;
    expiresAt?: dayjs.Dayjs | null;
  }) => {
    const payload = {
      code: values.code.trim().toUpperCase(),
      percentOff: values.percentOff,
      productId: values.productId,
      active: values.active,
      maxUses: values.maxUses ?? null,
      expiresAt: values.expiresAt ? values.expiresAt.toISOString() : null,
    };

    try {
      if (editing) {
        await api.put(`/discounts/${editing.id}`, payload);
        message.success('Cập nhật mã giảm giá thành công');
      } else {
        await api.post('/discounts', payload);
        message.success('Tạo mã giảm giá thành công');
      }
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
      fetchDiscounts();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/discounts/${id}`);
      message.success('Đã xóa mã giảm giá');
      fetchDiscounts();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể xóa mã');
    }
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Text strong>{code}</Text>,
    },
    {
      title: 'Giảm',
      dataIndex: 'percentOff',
      key: 'percentOff',
      render: (n: number) => <Tag color="green">{n}%</Tag>,
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_: unknown, row: DiscountCode) =>
        row.product?.name || row.productId,
    },
    {
      title: 'Đã dùng',
      key: 'usage',
      render: (_: unknown, row: DiscountCode) =>
        row.maxUses == null
          ? `${row.usedCount} / ∞`
          : `${row.usedCount} / ${row.maxUses}`,
    },
    {
      title: 'Hết hạn',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (value: string | null) =>
        value ? new Date(value).toLocaleString('vi-VN') : 'Không',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) =>
        active ? <Tag color="blue">Bật</Tag> : <Tag>Tắt</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, row: DiscountCode) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(row)}
          />
          <Popconfirm
            title="Xóa mã giảm giá này?"
            onConfirm={() => handleDelete(row.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Mã giảm giá
            </Title>
            <Text type="secondary">
              Tạo mã giảm % gắn với một sản phẩm cụ thể
            </Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Thêm mã
          </Button>
        </div>
      </Card>

      <Card>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={discounts}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Chưa có mã giảm giá' }}
        />
      </Card>

      <Modal
        title={editing ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Lưu"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="code"
            label="Mã"
            rules={[{ required: true, message: 'Nhập mã' }]}
          >
            <Input
              prefix={<PercentageOutlined />}
              placeholder="VD: RAU10"
              style={{ textTransform: 'uppercase' }}
            />
          </Form.Item>
          <Form.Item
            name="percentOff"
            label="Phần trăm giảm"
            rules={[{ required: true, message: 'Nhập %' }]}
          >
            <InputNumber min={1} max={100} addonAfter="%" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="productId"
            label="Sản phẩm áp dụng"
            rules={[{ required: true, message: 'Chọn sản phẩm' }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Chọn sản phẩm"
              options={products.map((p) => ({
                value: p.id,
                label: `${p.name} (${p.price.toLocaleString('vi-VN')}đ)`,
              }))}
            />
          </Form.Item>
          <Form.Item name="maxUses" label="Số lượt tối đa (để trống = không giới hạn)">
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Không giới hạn" />
          </Form.Item>
          <Form.Item name="expiresAt" label="Hết hạn (để trống = không hết hạn)">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="active" label="Đang bật" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', values);
      localStorage.setItem('admin_token', data.accessToken);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      message.success('Đăng nhập thành công');
      router.push('/dashboard');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md rounded-lg border border-line bg-surface-card p-8 shadow-panel">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-lg bg-primary text-lg font-bold text-white">
            VN
          </div>
          <h1 className="text-2xl font-semibold text-ink">Vườn Nhà</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Cổng Vận Hành - Đăng nhập quản trị
          </p>
        </div>
        <Form onFinish={onFinish} layout="vertical" requiredMark={false}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Vui lòng nhập email' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="admin@farm.com"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
              size="large"
            />
          </Form.Item>
          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Menu, Card, Row, Col, Statistic, message } from 'antd';
import {
  ShoppingOutlined,
  PackageOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import api from '@/lib/api';

const { Header, Sider, Content } = Layout;

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ products: 0, orders: 0, pending: 0 });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch stats
    Promise.all([
      api.get('/products?limit=1'),
      api.get('/orders?limit=1'),
      api.get('/orders?status=PENDING&limit=1'),
    ]).then(([products, orders, pending]) => {
      setStats({
        products: products.data?.total || 0,
        orders: orders.data?.total || 0,
        pending: pending.data?.total || 0,
      });
    }).catch(() => {
      message.error('Không thể tải dữ liệu');
    });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/login');
  };

  const menuItems = [
    { key: 'dashboard', icon: <ShoppingOutlined />, label: 'Tổng quan', href: '/dashboard' },
    { key: 'products', icon: <PackageOutlined />, label: 'Sản phẩm', href: '/san-pham' },
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
          <LogoutOutlined
            className="cursor-pointer text-lg"
            onClick={handleLogout}
            title="Đăng xuất"
          />
        </Header>
        <Content className="p-6">
          <h1 className="mb-6 text-2xl font-bold">Tổng quan</h1>
          <Row gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic title="Sản phẩm" value={stats.products} prefix={<PackageOutlined />} />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title="Tổng đơn hàng" value={stats.orders} prefix={<ShoppingOutlined />} />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Chờ xử lý"
                  value={stats.pending}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
}

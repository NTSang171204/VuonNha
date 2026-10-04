'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Layout,
  Menu,
  Input,
  Button,
  Dropdown,
  Avatar,
  Badge,
  Breadcrumb,
  Space,
  Tag,
  Spin,
  message,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  InboxOutlined,
  ShoppingOutlined,
  TeamOutlined,
  AppstoreOutlined,
  SettingOutlined,
  PlusOutlined,
  BellOutlined,
  SearchOutlined,
  LogoutOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import api, {
  AdminUser,
  clearAdminSession,
  getStoredAdminUser,
} from '@/lib/api';

const { Header, Sider, Content } = Layout;

const NAV = [
  { key: '/dashboard', label: 'Tổng quan', icon: <DashboardOutlined /> },
  { key: '/san-pham', label: 'Quản lý sản phẩm', icon: <InboxOutlined /> },
  { key: '/don-hang', label: 'Quản lý đơn hàng', icon: <ShoppingOutlined /> },
  {
    key: '/khach-hang',
    label: (
      <span className="flex items-center justify-between gap-2">
        Khách hàng
        <Tag style={{ marginInlineEnd: 0, fontSize: 10, lineHeight: '16px' }}>
          Soon
        </Tag>
      </span>
    ),
    icon: <TeamOutlined />,
  },
  { key: '/danh-muc', label: 'Danh mục', icon: <AppstoreOutlined /> },
  {
    key: '/cai-dat',
    label: (
      <span className="flex items-center justify-between gap-2">
        Cài đặt
        <Tag style={{ marginInlineEnd: 0, fontSize: 10, lineHeight: '16px' }}>
          Soon
        </Tag>
      </span>
    ),
    icon: <SettingOutlined />,
  },
];

const BREADCRUMB_LABEL: Record<string, string> = {
  '/dashboard': 'Tổng quan',
  '/san-pham': 'Quản lý sản phẩm',
  '/don-hang': 'Quản lý đơn hàng',
  '/khach-hang': 'Khách hàng',
  '/danh-muc': 'Danh mục',
  '/cai-dat': 'Cài đặt',
};

interface Props {
  children: React.ReactNode;
}

export function AdminShell({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/login');
      return;
    }

    setUser(getStoredAdminUser());
    setReady(true);

    api
      .get('/auth/me')
      .then(({ data }) => {
        setUser(data);
        localStorage.setItem('admin_user', JSON.stringify(data));
      })
      .catch(() => {
        /* interceptor handles 401 */
      });
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* still clear local session */
    }
    clearAdminSession();
    message.success('Đã đăng xuất');
    router.push('/login');
  };

  const selectedKey = useMemo(() => {
    const match = NAV.find((item) => pathname.startsWith(item.key));
    return match?.key || '/dashboard';
  }, [pathname]);

  const breadcrumbLabel = BREADCRUMB_LABEL[selectedKey] || 'Tổng quan';

  const userMenu: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: user?.email || 'Tài khoản',
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Đăng xuất',
      onClick: () => {
        void handleLogout();
      },
    },
  ];

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F6F4]">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={240}
        theme="light"
        style={{
          borderRight: '1px solid #E8ECE8',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 50,
          overflow: 'auto',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: collapsed ? '0 16px' : '0 20px',
            borderBottom: '1px solid #E8ECE8',
          }}
        >
          <Avatar
            shape="square"
            size={32}
            style={{ background: '#1B5E20', fontWeight: 700, flexShrink: 0 }}
          >
            VN
          </Avatar>
          {!collapsed && (
            <div>
              <div style={{ fontWeight: 600, color: '#1B5E20', lineHeight: 1.2 }}>
                Vườn Nhà
              </div>
              <div style={{ fontSize: 12, color: '#4B5563' }}>Cổng Vận Hành</div>
            </div>
          )}
        </div>

        <div style={{ padding: collapsed ? '12px 8px 4px' : '12px 16px 4px' }}>
          {!collapsed && (
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: '#9CA3AF',
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              Hệ thống
            </div>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={NAV}
          onClick={({ key }) => router.push(key)}
          style={{ borderInlineEnd: 0 }}
        />

        {!collapsed && (
          <div style={{ padding: 12, marginTop: 'auto' }}>
            <div
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                padding: 10,
                borderRadius: 6,
                background: '#edf6e7',
              }}
            >
              <SafetyCertificateOutlined style={{ color: '#006e1c' }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#006e1c' }}>
                  VietGAP Verified
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>
                  Chuỗi cung ứng sạch
                </div>
              </div>
            </div>
          </div>
        )}
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'all 0.2s' }}>
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            height: 64,
            padding: '0 24px',
            background: 'rgba(255,255,255,0.96)',
            borderBottom: '1px solid #E8ECE8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Space size="large" wrap>
            <Breadcrumb
              items={[
                { title: 'Trang chủ' },
                { title: breadcrumbLabel },
              ]}
            />
            <Input
              allowClear
              prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
              placeholder="Tìm kiếm (Mã ĐH, Nông sản...)"
              style={{ width: 280 }}
            />
          </Space>

          <Space size="middle">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push('/don-hang')}
            >
              Tạo đơn mới
            </Button>
            <Badge dot>
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 18 }} />}
                aria-label="Thông báo"
              />
            </Badge>
            <Dropdown menu={{ items: userMenu }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }} size={10}>
                <Avatar style={{ background: '#1B5E20' }}>
                  {(user?.name || 'A').charAt(0).toUpperCase()}
                </Avatar>
                <div className="hidden lg:block" style={{ lineHeight: 1.2 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {user?.name || 'Admin'}
                  </div>
                  <div style={{ fontSize: 12, color: '#4B5563' }}>
                    Quản trị viên vận hành
                  </div>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ padding: 24, background: '#F4F6F4', minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

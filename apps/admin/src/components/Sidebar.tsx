'use client';

import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';

const { Sider } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
  { key: '/san-pham', icon: <ShoppingOutlined />, label: 'Sản phẩm' },
  { key: '/don-hang', icon: <FileTextOutlined />, label: 'Đơn hàng' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
  };

  return (
    <Sider theme="dark" width={220}>
      <div className="flex h-16 items-center justify-center">
        <span className="text-lg font-bold text-white">Admin Panel</span>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[pathname]}
        items={menuItems}
        onClick={({ key }) => router.push(key)}
      />
      <div className="absolute bottom-4 w-full px-2">
        <Menu
          theme="dark"
          mode="inline"
          items={[{ key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất' }]}
          onClick={handleLogout}
        />
      </div>
    </Sider>
  );
}

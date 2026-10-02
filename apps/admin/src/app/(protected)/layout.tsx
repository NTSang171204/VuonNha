'use client';

import { Layout } from 'antd';
import Sidebar from '@/components/Sidebar';

const { Content } = Layout;

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout className="min-h-screen">
      <Sidebar />
      <Layout>
        <Content className="m-6 rounded-lg bg-white p-6 shadow">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

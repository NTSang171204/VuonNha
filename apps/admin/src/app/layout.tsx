import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vườn Nhà - Cổng Vận Hành',
  description: 'Hệ thống quản trị nông sản Vườn Nhà',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AntdRegistry>
          <ConfigProvider
            locale={viVN}
            theme={{
              token: {
                colorPrimary: '#1B5E20',
                colorSuccess: '#047857',
                colorWarning: '#d97706',
                colorError: '#b91c1c',
                borderRadius: 6,
                fontFamily: '"Be Vietnam Pro", system-ui, sans-serif',
                colorBgLayout: '#F4F6F4',
              },
              components: {
                Layout: {
                  headerBg: '#ffffff',
                  siderBg: '#ffffff',
                  bodyBg: '#F4F6F4',
                },
                Menu: {
                  itemSelectedBg: '#edf6e7',
                  itemSelectedColor: '#1B5E20',
                },
                Button: {
                  primaryShadow: 'none',
                },
                Card: {
                  borderRadiusLG: 8,
                },
              },
            }}
          >
            {children}
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import { StorefrontShell } from '@/components/layout/StorefrontShell';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Vườn Nhà - Nông sản sạch',
  description: 'Nông sản sạch từ nông trại đối tác, thu hoạch trong tuần',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <div className="flex min-h-screen flex-col">
          <StorefrontShell>{children}</StorefrontShell>
          <Footer />
        </div>
      </body>
    </html>
  );
}

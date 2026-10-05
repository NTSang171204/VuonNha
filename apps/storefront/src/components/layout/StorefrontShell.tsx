'use client';

import { useState } from 'react';
import { Header } from './Header';
import { CartDrawer } from '@/components/cart/CartDrawer';

interface Props {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { label: 'Tất cả sản phẩm', href: '/' },
  { label: 'Rau củ', href: '/?categoryId=rau-cu' },
  { label: 'Trái cây', href: '/?categoryId=trai-cay' },
  { label: 'Đặc sản vùng miền', href: '/?categoryId=dac-san-vung-mien' },
  { label: 'Tra cứu đơn', href: '/tracking' },
];

export function StorefrontShell({ children }: Props) {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <Header navItems={NAV_ITEMS} onOpenCart={() => setCartOpen(true)} />
      {children}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

'use client';

import { TrackingPage } from '@/components/tracking/TrackingPage';

export default function Tracking() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Tra cứu đơn hàng</h1>
      <TrackingPage />
    </div>
  );
}

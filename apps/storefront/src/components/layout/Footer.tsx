import { Leaf } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center gap-2 text-green-600">
          <Leaf className="h-6 w-6" />
          <span className="text-lg font-bold">Nông Sản Tươi</span>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          © 2024 Nông Sản Tươi. Trực tiếp từ nông trại đến bàn ăn của bạn.
        </p>
      </div>
    </footer>
  );
}

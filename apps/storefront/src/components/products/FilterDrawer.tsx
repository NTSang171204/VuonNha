'use client';

import { X } from 'lucide-react';
import { FilterSidebar } from './FilterSidebar';
import { PriceRange } from '@farm/types';

interface Category {
  id: string;
  name: string;
  count: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (id: string) => void;
  selectedPrice: PriceRange | 'any';
  onPriceChange: (value: PriceRange | 'any') => void;
  inStock: boolean;
  onInStockChange: (checked: boolean) => void;
  sort: string;
  onSortChange: (value: string) => void;
  onClear: () => void;
  total: number;
}

export function FilterDrawer({
  open,
  onClose,
  categories,
  selectedCategory,
  onCategoryChange,
  selectedPrice,
  onPriceChange,
  inStock,
  onInStockChange,
  sort,
  onSortChange,
  onClear,
  total,
}: Props) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[70] bg-ink/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Bộ lọc"
        className="fixed bottom-0 left-0 top-0 z-[80] flex w-[min(340px,86%)] flex-col bg-white"
      >
        <div className="flex h-[72px] items-center justify-between border-b border-line px-4">
          <h2 className="text-lg font-semibold">Lọc và sắp xếp</h2>
          <button
            aria-label="Đóng bộ lọc"
            onClick={onClose}
            className="-mr-2.5 grid h-11 w-11 place-items-center border-0 bg-transparent"
          >
            <X className="h-[22px] w-[22px]" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <FilterSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
            selectedPrice={selectedPrice}
            onPriceChange={onPriceChange}
            inStock={inStock}
            onInStockChange={onInStockChange}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-line p-4">
          <button
            onClick={onClear}
            className="h-12 border border-ink bg-white font-medium"
          >
            Xóa bộ lọc
          </button>
          <button
            onClick={onClose}
            className="h-12 border-0 bg-primary font-medium text-white"
          >
            Xem {total} sản phẩm
          </button>
        </div>
      </div>
    </>
  );
}

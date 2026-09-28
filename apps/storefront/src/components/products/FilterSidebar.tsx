'use client';

import { CategoryFilter } from './CategoryFilter';
import { PriceFilter } from './PriceFilter';
import { InStockToggle } from './InStockToggle';
import { PriceRange } from '@farm/types';

interface Category {
  id: string;
  name: string;
  count: number;
}

interface Props {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (id: string) => void;
  selectedPrice: PriceRange | 'any';
  onPriceChange: (value: PriceRange | 'any') => void;
  inStock: boolean;
  onInStockChange: (checked: boolean) => void;
}

export function FilterSidebar({
  categories,
  selectedCategory,
  onCategoryChange,
  selectedPrice,
  onPriceChange,
  inStock,
  onInStockChange,
}: Props) {
  return (
    <aside className="flex flex-col gap-6">
      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onChange={onCategoryChange}
      />
      <PriceFilter selected={selectedPrice} onChange={onPriceChange} />
      <InStockToggle checked={inStock} onChange={onInStockChange} />
    </aside>
  );
}

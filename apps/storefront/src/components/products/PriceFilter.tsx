'use client';

import { PriceRange } from '@farm/types';

const PRICE_OPTIONS: { id: PriceRange | 'any'; label: string }[] = [
  { id: 'any', label: 'Tất cả mức giá' },
  { id: PriceRange.UNDER_50K, label: 'Dưới 50.000₫' },
  { id: PriceRange.RANGE_50K_100K, label: '50.000₫ – 100.000₫' },
  { id: PriceRange.OVER_100K, label: 'Trên 100.000₫' },
];

interface Props {
  selected: PriceRange | 'any';
  onChange: (value: PriceRange | 'any') => void;
}

export function PriceFilter({ selected, onChange }: Props) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="mb-3 w-full border-b border-line pb-3 text-[15px] font-semibold">
        Khoảng giá
      </legend>
      <div className="flex flex-col gap-1">
        {PRICE_OPTIONS.map((opt) => (
          <label
            key={opt.id}
            className="flex min-h-9 cursor-pointer items-center gap-2.5 text-[15px]"
          >
            <input
              type="radio"
              name="price"
              checked={selected === opt.id}
              onChange={() => onChange(opt.id)}
              className="h-[18px] w-[18px] accent-primary"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

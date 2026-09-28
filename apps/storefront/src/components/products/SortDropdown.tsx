'use client';

const SORT_OPTIONS = [
  { id: 'featured', label: 'Nổi bật' },
  { id: 'price-asc', label: 'Giá: thấp đến cao' },
  { id: 'price-desc', label: 'Giá: cao đến thấp' },
  { id: 'harvest', label: 'Mới thu hoạch' },
];

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SortDropdown({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2.5">
      <label htmlFor="sort" className="whitespace-nowrap text-sm text-muted">
        Sắp xếp theo
      </label>
      <select
        id="sort"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 border border-line bg-white px-3 text-[15px]"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

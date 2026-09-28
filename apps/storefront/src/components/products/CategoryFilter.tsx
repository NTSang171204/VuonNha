'use client';

interface Category {
  id: string;
  name: string;
  count: number;
}

interface Props {
  categories: Category[];
  selected: string;
  onChange: (id: string) => void;
}

export function CategoryFilter({ categories, selected, onChange }: Props) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="mb-3 w-full border-b border-line pb-3 text-[15px] font-semibold">
        Danh mục
      </legend>
      <div className="flex flex-col gap-1">
        {categories.map((cat) => (
          <label
            key={cat.id}
            className="flex min-h-9 cursor-pointer items-center gap-2.5 text-[15px]"
          >
            <input
              type="radio"
              name="category"
              checked={selected === cat.id}
              onChange={() => onChange(cat.id)}
              className="h-[18px] w-[18px] accent-primary"
            />
            <span className="flex-1">{cat.name}</span>
            <span className="text-[13px] text-muted">{cat.count}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

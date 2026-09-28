'use client';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function InStockToggle({ checked, onChange }: Props) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="mb-3 w-full border-b border-line pb-3 text-[15px] font-semibold">
        Tình trạng
      </legend>
      <label className="flex min-h-9 cursor-pointer items-center gap-2.5 text-[15px]">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-[18px] w-[18px] accent-primary"
        />
        <span>Chỉ hiện sản phẩm còn hàng</span>
      </label>
    </fieldset>
  );
}

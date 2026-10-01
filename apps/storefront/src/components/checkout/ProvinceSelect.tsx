import { FormSelect } from './FormField';

const PROVINCES = [
  { value: '', label: 'Chọn tỉnh/thành phố' },
  { value: 'TP.Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
  { value: 'Hà Nội', label: 'Hà Nội' },
  { value: 'Đà Nẵng', label: 'Đà Nẵng' },
  { value: 'Hải Phòng', label: 'Hải Phòng' },
  { value: 'Cần Thơ', label: 'Cần Thơ' },
  { value: 'Đồng Nai', label: 'Đồng Nai' },
  { value: 'Bình Dương', label: 'Bình Dương' },
  { value: 'Khánh Hòa', label: 'Khánh Hòa' },
];

interface Props {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function ProvinceSelect({ value, onChange, error }: Props) {
  return (
    <FormSelect
      label="Tỉnh/Thành phố"
      required
      options={PROVINCES}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
    />
  );
}

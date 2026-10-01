const TIME_SLOTS = [
  { value: 'morning', label: 'Sáng', time: '8:00 – 11:00' },
  { value: 'afternoon', label: 'Chiều', time: '14:00 – 17:00' },
  { value: 'evening', label: 'Tối', time: '18:00 – 20:30' },
];

interface Props {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function TimeSlotPicker({ value, onChange, error }: Props) {
  return (
    <div>
      <span className="mb-3 block text-sm font-medium text-ink">
        Khung giờ giao <span className="text-red-500">*</span>
      </span>
      <div className="grid grid-cols-3 gap-3">
        {TIME_SLOTS.map((slot) => (
          <button
            key={slot.value}
            type="button"
            onClick={() => onChange(slot.value)}
            className={`flex flex-col items-center rounded-xl border-2 px-3 py-4 transition-colors ${
              value === slot.value
                ? 'border-primary bg-primary/5'
                : 'border-line bg-white hover:border-primary/50'
            }`}
          >
            <span className="text-sm font-semibold text-ink">{slot.label}</span>
            <span className="mt-1 text-[13px] text-muted">{slot.time}</span>
          </button>
        ))}
      </div>
      {error && <p className="mt-1.5 text-[13px] text-red-500">{error}</p>}
    </div>
  );
}

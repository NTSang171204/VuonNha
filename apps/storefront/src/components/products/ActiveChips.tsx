'use client';

import { X } from 'lucide-react';

interface Chip {
  label: string;
  onClear: () => void;
}

export function ActiveChips({ chips }: { chips: Chip[] }) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.label}
          onClick={chip.onClear}
          aria-label={`Bỏ lọc ${chip.label}`}
          className="flex h-8 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-[13px]"
        >
          {chip.label}
          <X className="h-3 w-3" />
        </button>
      ))}
    </div>
  );
}

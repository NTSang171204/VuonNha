'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Phân trang"
      className="mt-14 flex items-center justify-center gap-1"
    >
      <button
        aria-label="Trang trước"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="grid h-11 w-11 place-items-center border-0 bg-transparent disabled:opacity-30"
      >
        <ChevronLeft className="h-[18px] w-[18px]" />
      </button>
      {pages.map((n) => (
        <button
          key={n}
          onClick={() => onPageChange(n)}
          aria-current={n === page ? 'page' : undefined}
          aria-label={`Trang ${n}`}
          className={`h-11 w-11 border-0 bg-transparent text-[15px] ${
            n === page
              ? 'font-semibold underline underline-offset-6'
              : 'font-normal'
          }`}
        >
          {n}
        </button>
      ))}
      <button
        aria-label="Trang sau"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="grid h-11 w-11 place-items-center border-0 bg-transparent disabled:opacity-30"
      >
        <ChevronRight className="h-[18px] w-[18px]" />
      </button>
    </nav>
  );
}

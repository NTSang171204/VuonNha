'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface Props {
  onSubmit: (query: string) => void;
}

export function SearchBar({ onSubmit }: Props) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex h-[52px] max-w-[720px] items-center gap-2 border border-line bg-white pl-4 pr-2"
    >
      <label htmlFor="search-input" className="sr-only">
        Tìm sản phẩm
      </label>
      <input
        id="search-input"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm rau, trái cây, đặc sản…"
        className="h-full min-w-0 flex-1 border-0 bg-transparent text-base outline-none"
      />
      <button
        type="submit"
        aria-label="Tìm"
        className="grid h-11 w-11 place-items-center border-0 bg-transparent"
      >
        <Search className="h-5 w-5" />
      </button>
    </form>
  );
}

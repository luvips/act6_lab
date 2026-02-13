'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition, useEffect, useCallback, useRef } from 'react';

interface SearchFilterProps {
  placeholder?: string;
  currentQuery?: string;
  debounceMs?: number;
  minLength?: number;
}

export default function SearchFilter({
  placeholder = 'Buscar...',
  currentQuery = '',
  debounceMs = 300,
  minLength = 0
}: SearchFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(currentQuery);
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  const performSearch = useCallback((term: string) => {
    const trimmedTerm = term.trim();

    if (trimmedTerm && trimmedTerm.length < minLength) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (trimmedTerm) {
      params.set('query', trimmedTerm);
      params.set('page', '1');
    } else {
      params.delete('query');
      params.delete('page');
    }

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }, [searchParams, router, minLength]);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(value);
    }, debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [value, debounceMs, performSearch]);

  const handleClear = () => {
    setValue('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <div className="flex-1 relative">
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full px-4 py-2 pl-10 pr-10 border-2 border-[#6B00BF] text-sm text-[#6B00BF] font-bold placeholder-[#6B00BF] focus:outline-none focus:border-[#6B00BF] focus:ring-2 focus:ring-[#6B00BF]"
      />

      <svg
        className="absolute left-3 top-2.5 w-5 h-5 text-[#6B00BF]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-2.5 text-[#6B00BF] hover:text-[#8B00DF] focus:outline-none"
          aria-label="Limpiar búsqueda"
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {isPending && (
        <div className="absolute right-10 top-3 text-[#6B00BF]" role="status" aria-label="Cargando">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </div>
  );
}

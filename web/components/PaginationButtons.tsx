'use client';

import { useSearchParams } from 'next/navigation';

interface PaginationButtonsProps {
  page: number;
  totalPages: number;
  currentQuery?: string;
}

export default function PaginationButtons({ page, totalPages, currentQuery }: PaginationButtonsProps) {
  const searchParams = useSearchParams();

  const buildUrl = (pageNum: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (currentQuery) {
      params.set('query', currentQuery);
    }

    params.set('page', pageNum.toString());
    return `?${params.toString()}`;
  };

  return (
    <div className="flex gap-2 mt-6 justify-center items-center">
      {page > 1 && (
        <a href={buildUrl(page - 1)} className="px-3 py-1 border border-[#6B00BF] text-[#6B00BF] text-sm rounded hover:bg-[#6B00BF] hover:text-white">
          ← Atrás
        </a>
      )}
      <span className="px-3 py-1 text-sm text-gray-700">
        {page} / {totalPages}
      </span>
      {page < totalPages && (
        <a href={buildUrl(page + 1)} className="px-3 py-1 border border-[#6B00BF] text-[#6B00BF] text-sm rounded hover:bg-[#6B00BF] hover:text-white">
          Siguiente →
        </a>
      )}
    </div>
  );
}

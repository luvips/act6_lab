import { getRankingProducts } from '@/actions';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import SearchFilter from '@/components/SearchFilter';
import { SearchSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export default async function RankingPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const resolvedSearchParams = await searchParams;
  const validated = SearchSchema.safeParse(resolvedSearchParams);
  const filters = validated.success ? validated.data : {};
  const parsedPage = Number.parseInt(filters.page ?? '1', 10);
  const page = Number.isNaN(parsedPage) ? 1 : parsedPage;

  const query = filters.query || '';

  const result = await getRankingProducts({
    query: query || undefined,
    page,
    limit: 7
  });

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Ranking de Productos</h1>
      <p className="text-sm text-gray-600 mb-6">
        Productos ordenados por unidades vendidas
      </p>

      <KPICard kpis={[
        { label: 'Unidades Totales', value: result.kpis.totalUnidades },
        { label: 'Producto Top', value: result.kpis.topProducto?.nombre || 'N/A' }
      ]} />

      <div className="flex gap-2 mb-4">
        <SearchFilter placeholder="Buscar producto..." currentQuery={query} />
      </div>

      <DataTable title="" columns={['Lugar', 'Producto', 'Unidades Vendidas']} data={result.data} />
      <PaginationButtons page={result.pagination.currentPage} totalPages={result.pagination.totalPages} currentQuery={query} />
    </div>
  );
}

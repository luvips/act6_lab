import { getSalesByCategory } from '@/actions';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import SearchFilter from '@/components/SearchFilter';
import { SearchSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage({
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

  const result = await getSalesByCategory({
    query: query || undefined,
    page,
    limit: 7
  });

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Ventas por Categoría</h1>
      <p className="text-sm text-gray-600 mb-6">
        Ingresos por categoría de productos
      </p>

      <KPICard kpis={[
        { label: 'Ingresos Totales', value: `$${result.kpis.totalVentas.toLocaleString()}` },
        {
          label: 'Categoría Top',
          value: result.kpis.topCategoria?.nombre || 'N/A',
          subtitle: result.kpis.topCategoria ? `${result.kpis.topCategoria.porcentaje}% del total` : undefined
        }
      ]} />

      <div className="flex gap-2 mb-4">
        <SearchFilter placeholder="Buscar categoría..." currentQuery={query} />
      </div>

      <DataTable title="" columns={['Categoria', 'Productos Distintos', 'Dinero Total']} data={result.data} />
      <PaginationButtons page={result.pagination.currentPage} totalPages={result.pagination.totalPages} currentQuery={query} />
    </div>
  );
}

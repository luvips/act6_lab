import { getUserActivity } from '@/actions';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import SearchFilter from '@/components/SearchFilter';
import { SearchSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export default async function UserActivityPage({
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

  const result = await getUserActivity({
    query: query || undefined,
    page,
    limit: 7
  });

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Actividad de Usuarios</h1>
      <p className="text-sm text-gray-600 mb-6">
        Última actividad de cada cliente
      </p>

      <KPICard kpis={[
        { label: 'Clientes Activos', value: result.kpis.totalClientes },
        { label: 'Gasto Promedio', value: `$${result.kpis.promedioGasto.toFixed(0)}` },
        { label: 'Última Compra', value: result.kpis.ultimaCompraFecha }
      ]} />

      <div className="flex gap-2 mb-4">
        <SearchFilter placeholder="Buscar cliente..." currentQuery={query} />
      </div>

      <DataTable title="" columns={['Cliente', 'Ultima Vez Visto', 'Gasto Historico']} data={result.data} />
      <PaginationButtons page={result.pagination.currentPage} totalPages={result.pagination.totalPages} currentQuery={query} />
    </div>
  );
}

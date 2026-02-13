import { getInventoryStatus } from '@/actions';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import SearchFilter from '@/components/SearchFilter';
import StatusFilter from '@/components/StatusFilter';
import { InventoryStatusSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export default async function InventoryPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const resolvedSearchParams = await searchParams;
  const validated = InventoryStatusSchema.safeParse(resolvedSearchParams);
  const filters = validated.success ? validated.data : {};
  const parsedPage = Number.parseInt(filters.page ?? '1', 10);
  const page = Number.isNaN(parsedPage) ? 1 : parsedPage;
  const query = filters.query || '';
  const status = filters.status;

  const result = await getInventoryStatus({
    query: query || undefined,
    status,
    page,
    limit: 7
  });

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Estado del Inventario</h1>
      <p className="text-sm text-gray-600 mb-6">
        Monitoreo de stock disponible
      </p>

      <KPICard kpis={[
        { label: 'Agotados', value: result.kpis.agotados },
        { label: 'Comprar Pronto', value: result.kpis.comprarPronto },
        { label: 'Total Productos', value: result.kpis.totalProductos }
      ]} />

      <div className="flex gap-2 mb-4">
        <SearchFilter placeholder="Buscar producto..." currentQuery={query} />
        <StatusFilter options={['Agotado', 'Comprar pronto', 'Suficiente']} />
      </div>

      <DataTable title="" columns={['Producto', 'Piezas en Bodega', 'Aviso Estatus']} data={result.data} />
      <PaginationButtons page={result.pagination.currentPage} totalPages={result.pagination.totalPages} currentQuery={query} />
    </div>
  );
}

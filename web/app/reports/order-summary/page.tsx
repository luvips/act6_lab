import { getOrderSummary } from '@/actions';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import StatusFilter from '@/components/StatusFilter';
import { OrderStatusSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export default async function OrderSummaryPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const resolvedSearchParams = await searchParams;
  const validated = OrderStatusSchema.safeParse(resolvedSearchParams);
  const filters = validated.success ? validated.data : {};
  const parsedPage = Number.parseInt(filters.page ?? '1', 10);
  const page = Number.isNaN(parsedPage) ? 1 : parsedPage;
  const status = filters.status;

  const result = await getOrderSummary({
    status,
    page,
    limit: 7
  });

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Resumen de Pedidos</h1>
      <p className="text-sm text-gray-600 mb-6">
        Distribución de pedidos por estado
      </p>

      <KPICard kpis={[
        { label: 'Total Pedidos', value: result.kpis.totalPedidos },
        {
          label: 'Estado Principal',
          value: result.kpis.estadoTop?.nombre || 'N/A',
          subtitle: result.kpis.estadoTop ? `${result.kpis.estadoTop.porcentaje}%` : undefined
        },
        { label: 'Entregados', value: result.kpis.entregados }
      ]} />

      <div className="flex gap-2 mb-4">
        <StatusFilter options={['entregado', 'pendiente', 'pagado', 'enviado', 'cancelado']} />
      </div>

      <DataTable title="" columns={['Estado', 'Total Pedidos', 'Porcentaje']} data={result.data} />
      <PaginationButtons page={result.pagination.currentPage} totalPages={result.pagination.totalPages} />
    </div>
  );
}

import { getDailySales } from '@/actions';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';

export const dynamic = 'force-dynamic';

export default async function DailySalesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1');

  const result = await getDailySales({
    page,
    limit: 7
  });

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Ventas Diarias</h1>
      <p className="text-sm text-gray-600 mb-6">
        Seguimiento diario de ingresos y transacciones
      </p>

      <KPICard kpis={[
        { label: 'Promedio Diario', value: `$${result.kpis.promedioDiario.toFixed(0)}` },
        { label: 'Total Acumulado', value: `$${result.kpis.totalVentas.toFixed(0)}` },
        {
          label: 'Mejor Día',
          value: result.kpis.mejorDia?.fecha || 'N/A',
          subtitle: result.kpis.mejorDia ? `$${result.kpis.mejorDia.monto.toFixed(2)}` : undefined
        }
      ]} />

      <DataTable title="" columns={['Fecha', 'Numero de Ventas', 'Dinero del Dia']} data={result.data} />
      <PaginationButtons page={result.pagination.currentPage} totalPages={result.pagination.totalPages} />
    </div>
  );
}

import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import { getPaginationParams, getPaginationOffsetLimit } from '@/lib/pagination';

export const dynamic = 'force-dynamic';

export default async function OrderSummaryPage({ searchParams }: { searchParams: Record<string, string> }) {
  const limit = 7;
  const pagination = getPaginationParams(searchParams);
  const { offset } = getPaginationOffsetLimit(pagination.page, limit);
  
  const totalRes = await query('SELECT COUNT(*) as count FROM view_order_summary');
  const total = parseInt(totalRes.rows[0].count, 10);
  
  const res = await query(
    'SELECT * FROM view_order_summary ORDER BY total_pedidos DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  
  const data = res.rows.map((row: any) => ({
    'Estado': row.estado,
    'Total Pedidos': row.total_pedidos,
    'Porcentaje': `${Number(row.porcentaje).toFixed(2)}%`
  }));

  const allRes = await query('SELECT * FROM view_order_summary ORDER BY total_pedidos DESC');
  const totalPedidos = allRes.rows.reduce((sum: number, row: any) => sum + Number(row.total_pedidos), 0);
  const estadoTop = allRes.rows[0];
  const entregados = allRes.rows.find((row: any) => row.estado === 'entregado');
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Resumen de Pedidos</h1>
      <p className="text-sm text-gray-600 mb-6">
        Distribución de pedidos por estado
      </p>
      
      <KPICard kpis={[
        { label: 'Total Pedidos', value: totalPedidos },
        { label: 'Estado Principal', value: estadoTop?.estado, subtitle: `${Number(estadoTop?.porcentaje).toFixed(1)}%` },
        { label: 'Entregados', value: entregados?.total_pedidos || 0 }
      ]} />

      <DataTable title="" columns={['Estado', 'Total Pedidos', 'Porcentaje']} data={data} />
      <PaginationButtons page={pagination.page} totalPages={totalPages} limit={limit} />
    </div>
  );
}

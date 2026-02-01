import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';

export const dynamic = 'force-dynamic';

export default async function OrderSummaryPage() {
  const res = await query('SELECT * FROM view_order_summary ORDER BY total_pedidos DESC');
  
  const data = res.rows.map((row: any) => ({
    'Estado': row.estado,
    'Total Pedidos': row.total_pedidos,
    'Porcentaje': `${Number(row.porcentaje).toFixed(2)}%`
  }));

  const totalPedidos = res.rows.reduce((sum: number, row: any) => sum + Number(row.total_pedidos), 0);
  const estadoTop = res.rows[0];
  const entregados = res.rows.find((row: any) => row.estado === 'entregado');

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
    </div>
  );
}

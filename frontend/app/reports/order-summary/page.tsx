import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';

export const dynamic = 'force-dynamic';

export default async function OrderSummaryPage() {
  const res = await query('SELECT * FROM view_order_summary ORDER BY total_pedidos DESC');
  
  const data = res.rows.map((row: any) => ({
    'Estado': row.estado,
    'Total Pedidos': row.total_pedidos,
    'Porcentaje': `${Number(row.porcentaje).toFixed(2)}%`
  }));

  return <DataTable title="Resumen de Pedidos" columns={['Estado', 'Total Pedidos', 'Porcentaje']} data={data} />;
}

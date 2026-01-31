import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';

export const dynamic = 'force-dynamic';

export default async function DailySalesPage() {
  const res = await query('SELECT * FROM view_daily_sales ORDER BY fecha DESC');
  
  const data = res.rows.map((row: any) => ({
    'Fecha': new Date(row.fecha).toLocaleDateString('es-MX'),
    'Numero de Ventas': row.numero_de_ventas,
    'Dinero del Dia': `$${Number(row.dinero_del_dia).toFixed(2)}`
  }));

  return <DataTable title="Ventas Diarias" columns={['Fecha', 'Numero de Ventas', 'Dinero del Dia']} data={data} />;
}

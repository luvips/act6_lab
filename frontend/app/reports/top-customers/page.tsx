import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';

export const dynamic = 'force-dynamic';

export default async function TopCustomersPage() {
  const res = await query('SELECT * FROM view_top_customers ORDER BY total_gastado DESC');
  
  const data = res.rows.map((row: any) => ({
    'Cliente': row.cliente,
    'Correo': row.correo,
    'Total Gastado': `$${Number(row.total_gastado).toFixed(2)}`
  }));

  return <DataTable title="Mejores Clientes" columns={['Cliente', 'Correo', 'Total Gastado']} data={data} />;
}

import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const res = await query('SELECT * FROM view_sales_by_category ORDER BY dinero_total DESC');
  
  const data = res.rows.map((row: any) => ({
    'Categoria': row.categoria,
    'Productos Distintos': row.productos_distintos,
    'Dinero Total': `$${Number(row.dinero_total).toFixed(2)}`
  }));

  return <DataTable title="Ventas por Categoria" columns={['Categoria', 'Productos Distintos', 'Dinero Total']} data={data} />;
}

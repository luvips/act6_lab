import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const res = await query('SELECT * FROM view_sales_by_category ORDER BY dinero_total DESC');
  
  const data = res.rows.map((row: any) => ({
    'Categoria': row.categoria,
    'Productos Distintos': row.productos_distintos,
    'Dinero Total': `$${Number(row.dinero_total).toFixed(2)}`
  }));

  const totalVentas = res.rows.reduce((sum: number, row: any) => sum + Number(row.dinero_total), 0);
  const topCategoria = res.rows[0];
  const porcentajeTop = ((Number(topCategoria?.dinero_total) / totalVentas) * 100).toFixed(1);

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Ventas por Categoría</h1>
      <p className="text-sm text-gray-600 mb-6">
        Ingresos por categoría de productos
      </p>
      
      <KPICard kpis={[
        { label: 'Ingresos Totales', value: `$${totalVentas.toLocaleString()}` },
        { label: 'Categoría Top', value: topCategoria?.categoria, subtitle: `${porcentajeTop}% del total` }
      ]} />

      <DataTable title="" columns={['Categoria', 'Productos Distintos', 'Dinero Total']} data={data} />
    </div>
  );
}

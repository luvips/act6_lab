import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import { getPaginationParams, getPaginationOffsetLimit } from '@/lib/pagination';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage({ 
  searchParams 
}: { 
  searchParams: Promise<Record<string, string>> 
}) {
  const limit = 7;
  const resolvedSearchParams = await searchParams;
  const pagination = getPaginationParams(resolvedSearchParams);
  const { offset } = getPaginationOffsetLimit(pagination.page, limit);
  
  const totalRes = await query('SELECT COUNT(*) as count FROM view_sales_by_category');
  const total = parseInt(totalRes.rows[0].count, 10);
  
  const res = await query(
    'SELECT * FROM view_sales_by_category ORDER BY dinero_total DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  
  const data = res.rows.map((row: any) => ({
    'Categoria': row.categoria,
    'Productos Distintos': row.productos_distintos,
    'Dinero Total': `$${Number(row.dinero_total).toFixed(2)}`
  }));

  const allRes = await query('SELECT * FROM view_sales_by_category ORDER BY dinero_total DESC');
  const totalVentas = allRes.rows.reduce((sum: number, row: any) => sum + Number(row.dinero_total), 0);
  const topCategoria = allRes.rows[0];
  const porcentajeTop = ((Number(topCategoria?.dinero_total) / totalVentas) * 100).toFixed(1);
  const totalPages = Math.ceil(total / limit);

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
      <PaginationButtons page={pagination.page} totalPages={totalPages} limit={limit} />
    </div>
  );
}

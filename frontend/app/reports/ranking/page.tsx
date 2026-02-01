import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import { getPaginationParams, getPaginationOffsetLimit } from '@/lib/pagination';

export const dynamic = 'force-dynamic';

export default async function RankingPage({ searchParams }: { searchParams: Record<string, string> }) {
  const limit = 7;
  const pagination = getPaginationParams(searchParams);
  const { offset } = getPaginationOffsetLimit(pagination.page, limit);
  
  const totalRes = await query('SELECT COUNT(*) as count FROM view_ranking_products');
  const total = parseInt(totalRes.rows[0].count, 10);
  
  const res = await query(
    'SELECT * FROM view_ranking_products ORDER BY lugar_ranking ASC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  
  const data = res.rows.map((row: any) => ({
    'Lugar': row.lugar_ranking,
    'Producto': row.producto,
    'Unidades Vendidas': row.unidades_vendidas
  }));

  const allRes = await query('SELECT * FROM view_ranking_products ORDER BY lugar_ranking ASC');
  const totalUnidades = allRes.rows.reduce((sum: number, row: any) => sum + Number(row.unidades_vendidas), 0);
  const topProducto = allRes.rows[0];
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Ranking de Productos</h1>
      <p className="text-sm text-gray-600 mb-6">
        Productos más vendidos ordenados por unidades vendidas
      </p>
      
      <KPICard kpis={[
        { label: 'Total Unidades', value: totalUnidades.toLocaleString() },
        { label: 'Producto #1', value: topProducto?.producto, subtitle: `${topProducto?.unidades_vendidas} unidades` }
      ]} />

      <DataTable title="" columns={['Lugar', 'Producto', 'Unidades Vendidas']} data={data} />
      <PaginationButtons page={pagination.page} totalPages={totalPages} limit={limit} />
    </div>
  );
}

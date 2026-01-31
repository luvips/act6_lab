import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';

export const dynamic = 'force-dynamic';

export default async function RankingPage() {
  const res = await query('SELECT * FROM view_ranking_products ORDER BY lugar_ranking ASC');
  
  const data = res.rows.map((row: any) => ({
    'Lugar': row.lugar_ranking,
    'Producto': row.producto,
    'Unidades Vendidas': row.unidades_vendidas
  }));

  return <DataTable title="Ranking de Productos" columns={['Lugar', 'Producto', 'Unidades Vendidas']} data={data} />;
}

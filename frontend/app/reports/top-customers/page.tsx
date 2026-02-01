import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import { getPaginationParams, getPaginationOffsetLimit } from '@/lib/pagination';

export const dynamic = 'force-dynamic';

export default async function TopCustomersPage({ 
  searchParams 
}: { 
  searchParams: Promise<Record<string, string>> 
}) {
  const limit = 7;
  const resolvedSearchParams = await searchParams;
  const pagination = getPaginationParams(resolvedSearchParams);
  const { offset } = getPaginationOffsetLimit(pagination.page, limit);
  
  const totalRes = await query('SELECT COUNT(*) as count FROM view_top_customers');
  const total = parseInt(totalRes.rows[0].count, 10);
  
  const res = await query(
    'SELECT * FROM view_top_customers ORDER BY total_gastado DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  
  const data = res.rows.map((row: any) => ({
    'Cliente': row.cliente,
    'Correo': row.correo,
    'Total Gastado': `$${Number(row.total_gastado).toFixed(2)}`
  }));

  const allRes = await query('SELECT * FROM view_top_customers ORDER BY total_gastado DESC');
  const totalClientes = allRes.rows.length;
  const totalGastado = allRes.rows.reduce((sum: number, row: any) => sum + Number(row.total_gastado), 0);
  const promedioGasto = allRes.rows.length > 0 ? totalGastado / allRes.rows.length : 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Mejores Clientes</h1>
      <p className="text-sm text-gray-600 mb-6">
        Clientes que han gastado más de $500
      </p>
      
      <KPICard kpis={[
        { label: 'Clientes VIP', value: totalClientes },
        { label: 'Gasto Promedio', value: `$${promedioGasto.toFixed(0)}` },
        { label: 'Total Gastado', value: `$${totalGastado.toFixed(0)}` }
      ]} />

      <DataTable title="" columns={['Cliente', 'Correo', 'Total Gastado']} data={data} />
      <PaginationButtons page={pagination.page} totalPages={totalPages} limit={limit} />
    </div>
  );
}

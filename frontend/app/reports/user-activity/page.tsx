import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import SearchFilter from '@/components/SearchFilter';
import { getPaginationParams, getPaginationOffsetLimit } from '@/lib/pagination';
import { SearchSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export default async function UserActivityPage({ 
  searchParams 
}: { 
  searchParams: Promise<Record<string, string>> 
}) {
  const limit = 7;
  const resolvedSearchParams = await searchParams;
  
  const validated = SearchSchema.safeParse(resolvedSearchParams);
  const filters = validated.success ? validated.data : {};
  
  const pagination = getPaginationParams(resolvedSearchParams);
  const { offset } = getPaginationOffsetLimit(pagination.page, limit);
  
  const whereClause = filters.query ? `WHERE cliente ILIKE $1` : '';
  const params: any[] = filters.query ? [`%${filters.query}%`] : [];
  const paramIndex = params.length + 1;
  
  const totalRes = await query(
    `SELECT COUNT(*) as count FROM view_user_activity ${whereClause}`,
    params
  );
  const total = parseInt(totalRes.rows[0].count, 10);
  
  const res = await query(
    `SELECT * FROM view_user_activity ${whereClause} ORDER BY ultima_vez_visto DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );
  
  const data = res.rows.map((row: any) => ({
    'Cliente': row.cliente,
    'Ultima Vez Visto': new Date(row.ultima_vez_visto).toLocaleDateString('es-MX'),
    'Gasto Historico': `$${Number(row.gasto_historico).toFixed(2)}`
  }));

  const allRes = await query(
    `SELECT * FROM view_user_activity ${whereClause} ORDER BY ultima_vez_visto DESC`,
    params
  );
  const totalClientes = allRes.rows.length;
  const promedioGasto = allRes.rows.length > 0 ? allRes.rows.reduce((sum: number, row: any) => sum + Number(row.gasto_historico), 0) / allRes.rows.length : 0;
  const clienteMasReciente = allRes.rows[0];
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Actividad de Usuarios</h1>
      <p className="text-sm text-gray-600 mb-6">
        Última actividad de cada cliente
      </p>
      
      <KPICard kpis={[
        { label: 'Clientes Activos', value: totalClientes },
        { label: 'Gasto Promedio', value: `$${promedioGasto.toFixed(0)}` },
        { label: 'Última Compra', value: new Date(clienteMasReciente?.ultima_vez_visto).toLocaleDateString('es-MX') }
      ]} />

      <div className="flex gap-2 mb-4">
        <SearchFilter placeholder="Buscar cliente..." />
      </div>

      <DataTable title="" columns={['Cliente', 'Ultima Vez Visto', 'Gasto Historico']} data={data} />
      <PaginationButtons page={pagination.page} totalPages={totalPages} limit={limit} />
    </div>
  );
}

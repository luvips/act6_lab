import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import { getPaginationParams, getPaginationOffsetLimit } from '@/lib/pagination';

export const dynamic = 'force-dynamic';

export default async function DailySalesPage({ 
  searchParams 
}: { 
  searchParams: Promise<Record<string, string>> 
}) {
  const limit = 7;
  const resolvedSearchParams = await searchParams;
  const pagination = getPaginationParams(resolvedSearchParams);
  const { offset } = getPaginationOffsetLimit(pagination.page, limit);
  
  const totalRes = await query('SELECT COUNT(*) as count FROM view_daily_sales');
  const total = parseInt(totalRes.rows[0].count, 10);
  
  const res = await query(
    'SELECT * FROM view_daily_sales ORDER BY fecha DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  
  const data = res.rows.map((row: any) => ({
    'Fecha': new Date(row.fecha).toLocaleDateString('es-MX'),
    'Numero de Ventas': row.numero_de_ventas,
    'Dinero del Dia': `$${Number(row.dinero_del_dia).toFixed(2)}`
  }));

  const allRes = await query('SELECT * FROM view_daily_sales');
  const totalVentas = allRes.rows.reduce((sum: number, row: any) => sum + Number(row.dinero_del_dia), 0);
  const promedioDiario = totalVentas / allRes.rows.length;
  const mejorDia = allRes.rows.reduce((max: any, row: any) => 
    Number(row.dinero_del_dia) > Number(max.dinero_del_dia) ? row : max, allRes.rows[0]
  );
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Ventas Diarias</h1>
      <p className="text-sm text-gray-600 mb-6">
        Seguimiento diario de ingresos y transacciones
      </p>
      
      <KPICard kpis={[
        { label: 'Promedio Diario', value: `$${promedioDiario.toFixed(0)}` },
        { label: 'Total Acumulado', value: `$${totalVentas.toFixed(0)}` },
        { label: 'Mejor Día', value: new Date(mejorDia.fecha).toLocaleDateString('es-MX'), subtitle: `$${Number(mejorDia.dinero_del_dia).toFixed(2)}` }
      ]} />

      <DataTable title="" columns={['Fecha', 'Numero de Ventas', 'Dinero del Dia']} data={data} />
      <PaginationButtons page={pagination.page} totalPages={totalPages} limit={limit} />
    </div>
  );
}

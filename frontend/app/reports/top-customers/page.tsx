import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';

export const dynamic = 'force-dynamic';

export default async function TopCustomersPage() {
  const res = await query('SELECT * FROM view_top_customers ORDER BY total_gastado DESC');
  
  const data = res.rows.map((row: any) => ({
    'Cliente': row.cliente,
    'Correo': row.correo,
    'Total Gastado': `$${Number(row.total_gastado).toFixed(2)}`
  }));

  const totalClientes = res.rows.length;
  const totalGastado = res.rows.reduce((sum: number, row: any) => sum + Number(row.total_gastado), 0);
  const promedioGasto = totalGastado / totalClientes;

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
    </div>
  );
}

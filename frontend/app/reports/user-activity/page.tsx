import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';

export const dynamic = 'force-dynamic';

export default async function UserActivityPage() {
  const res = await query('SELECT * FROM view_user_activity ORDER BY ultima_vez_visto DESC');
  
  const data = res.rows.map((row: any) => ({
    'Cliente': row.cliente,
    'Ultima Vez Visto': new Date(row.ultima_vez_visto).toLocaleDateString('es-MX'),
    'Gasto Historico': `$${Number(row.gasto_historico).toFixed(2)}`
  }));

  const totalClientes = res.rows.length;
  const promedioGasto = res.rows.reduce((sum: number, row: any) => sum + Number(row.gasto_historico), 0) / totalClientes;
  const clienteMasReciente = res.rows[0];

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

      <DataTable title="" columns={['Cliente', 'Ultima Vez Visto', 'Gasto Historico']} data={data} />
    </div>
  );
}

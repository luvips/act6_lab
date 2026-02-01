import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';

export const dynamic = 'force-dynamic';

export default async function DailySalesPage() {
  const res = await query('SELECT * FROM view_daily_sales ORDER BY fecha DESC');
  
  const data = res.rows.map((row: any) => ({
    'Fecha': new Date(row.fecha).toLocaleDateString('es-MX'),
    'Numero de Ventas': row.numero_de_ventas,
    'Dinero del Dia': `$${Number(row.dinero_del_dia).toFixed(2)}`
  }));

  const totalVentas = res.rows.reduce((sum: number, row: any) => sum + Number(row.dinero_del_dia), 0);
  const promedioDiario = totalVentas / res.rows.length;
  const mejorDia = res.rows.reduce((max: any, row: any) => 
    Number(row.dinero_del_dia) > Number(max.dinero_del_dia) ? row : max, res.rows[0]
  );

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
    </div>
  );
}

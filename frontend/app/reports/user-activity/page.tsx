import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';

export const dynamic = 'force-dynamic';

export default async function UserActivityPage() {
  const res = await query('SELECT * FROM view_user_activity ORDER BY ultima_vez_visto DESC');
  
  const data = res.rows.map((row: any) => ({
    'Cliente': row.cliente,
    'Ultima Vez Visto': new Date(row.ultima_vez_visto).toLocaleDateString('es-MX'),
    'Gasto Historico': `$${Number(row.gasto_historico).toFixed(2)}`
  }));

  return <DataTable title="Actividad de Usuarios" columns={['Cliente', 'Ultima Vez Visto', 'Gasto Historico']} data={data} />;
}

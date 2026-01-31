import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const res = await query('SELECT * FROM view_inventory_status ORDER BY piezas_en_bodega ASC');
  
  const data = res.rows.map((row: any) => ({
    'Producto': row.producto,
    'Piezas en Bodega': row.piezas_en_bodega,
    'Aviso Estatus': row.aviso_estatus,
    'Total Conteo': row.total_conteo
  }));

  return <DataTable title="Estado del Inventario" columns={['Producto', 'Piezas en Bodega', 'Aviso Estatus', 'Total Conteo']} data={data} />;
}

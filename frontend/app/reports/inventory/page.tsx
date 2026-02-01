import { query } from '@/lib/db';
import DataTable from '@/components/DataTable';
import KPICard from '@/components/KPICard';
import PaginationButtons from '@/components/PaginationButtons';
import { getPaginationParams, getPaginationOffsetLimit } from '@/lib/pagination';

export const dynamic = 'force-dynamic';

export default async function InventoryPage({ searchParams }: { searchParams: Record<string, string> }) {
  const limit = 7;
  const pagination = getPaginationParams(searchParams);
  const { offset } = getPaginationOffsetLimit(pagination.page, limit);
  
  const totalRes = await query('SELECT COUNT(*) as count FROM view_inventory_status');
  const total = parseInt(totalRes.rows[0].count, 10);
  
  const res = await query(
    'SELECT * FROM view_inventory_status ORDER BY piezas_en_bodega ASC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  
  const data = res.rows.map((row: any) => ({
    'Producto': row.producto,
    'Piezas en Bodega': row.piezas_en_bodega,
    'Aviso Estatus': row.aviso_estatus
  }));

  const allRes = await query('SELECT * FROM view_inventory_status');
  const agotados = allRes.rows.filter((row: any) => row.aviso_estatus === 'Agotado').length;
  const comprarPronto = allRes.rows.filter((row: any) => row.aviso_estatus === 'Comprar pronto').length;
  const totalProductos = allRes.rows.length;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-[#6B00BF]">Estado del Inventario</h1>
      <p className="text-sm text-gray-600 mb-6">
        Monitoreo de stock disponible
      </p>
      
      <KPICard kpis={[
        { label: 'Agotados', value: agotados },
        { label: 'Comprar Pronto', value: comprarPronto },
        { label: 'Total Productos', value: totalProductos }
      ]} />

      <DataTable title="" columns={['Producto', 'Piezas en Bodega', 'Aviso Estatus']} data={data} />
      <PaginationButtons page={pagination.page} totalPages={totalPages} limit={limit} />
    </div>
  );
}

'use server';

import { query } from '@/lib/db';
import {
  DEFAULT_PAGE_LIMIT,
  calculatePagination,
  getTotalCount,
  calculateTotalPages,
  type PaginationResult
} from './utils';

export interface InventoryStatusRow {
  producto_id: number;
  producto: string;
  piezas_en_bodega: number;
  aviso_estatus: 'Agotado' | 'Comprar pronto' | 'Suficiente';
}

export interface InventoryStatusFilters {
  query?: string;
  status?: 'Agotado' | 'Comprar pronto' | 'Suficiente';
  page?: number;
  limit?: number;
}

export interface InventoryStatusResult {
  data: {
    'Producto': string;
    'Piezas en Bodega': number;
    'Aviso Estatus': string;
  }[];
  kpis: {
    agotados: number;
    comprarPronto: number;
    totalProductos: number;
  };
  pagination: PaginationResult;
}

function buildInventoryWhereClause(filters: InventoryStatusFilters): { clause: string; params: any[] } {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.status) {
    conditions.push(`aviso_estatus = $${paramIndex}`);
    params.push(filters.status);
    paramIndex++;
  }

  if (filters.query) {
    conditions.push(`unaccent(producto) ILIKE unaccent($${paramIndex})`);
    params.push(`%${filters.query}%`);
    paramIndex++;
  }

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params
  };
}

export async function getInventoryStatus(
  filters: InventoryStatusFilters = {}
): Promise<InventoryStatusResult> {
  const { page, limit, offset } = calculatePagination(filters.page, filters.limit || DEFAULT_PAGE_LIMIT);
  const { clause: whereClause, params } = buildInventoryWhereClause(filters);
  const paramIndex = params.length + 1;

  const total = await getTotalCount('view_inventory_status', whereClause, params);

  const res = await query(
    `SELECT * FROM view_inventory_status ${whereClause} ORDER BY piezas_en_bodega ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  const data = res.rows.map((row: InventoryStatusRow) => ({
    'Producto': row.producto,
    'Piezas en Bodega': row.piezas_en_bodega,
    'Aviso Estatus': row.aviso_estatus
  }));

  const allRes = await query(
    `SELECT * FROM view_inventory_status ${whereClause}`,
    params
  );

  const agotados = allRes.rows.filter(
    (row: InventoryStatusRow) => row.aviso_estatus === 'Agotado'
  ).length;

  const comprarPronto = allRes.rows.filter(
    (row: InventoryStatusRow) => row.aviso_estatus === 'Comprar pronto'
  ).length;

  const totalProductos = allRes.rows.length;

  return {
    data,
    kpis: { agotados, comprarPronto, totalProductos },
    pagination: {
      total,
      totalPages: calculateTotalPages(total, limit),
      currentPage: page
    }
  };
}

'use server';

import { query } from '@/lib/db';
import {
  DEFAULT_PAGE_LIMIT,
  calculatePagination,
  getTotalCount,
  calculateTotalPages,
  type PaginationResult
} from './utils';

const ESTADO_ENTREGADO = 'entregado';

export interface OrderSummaryRow {
  estado: string;
  total_pedidos: number;
  porcentaje: number;
}

export interface OrderSummaryFilters {
  status?: string;
  page?: number;
  limit?: number;
}

export interface OrderSummaryResult {
  data: {
    'Estado': string;
    'Total Pedidos': number;
    'Porcentaje': string;
  }[];
  kpis: {
    totalPedidos: number;
    estadoTop: {
      nombre: string;
      porcentaje: string;
    } | null;
    entregados: number;
  };
  pagination: PaginationResult;
}

export async function getOrderSummary(
  filters: OrderSummaryFilters = {}
): Promise<OrderSummaryResult> {
  const { page, limit, offset } = calculatePagination(filters.page, filters.limit || DEFAULT_PAGE_LIMIT);
  const whereClause = filters.status ? `WHERE estado = $1` : '';
  const params: any[] = filters.status ? [filters.status] : [];
  const paramIndex = params.length + 1;

  const total = await getTotalCount('view_order_summary', whereClause, params);

  const res = await query(
    `SELECT * FROM view_order_summary ${whereClause} ORDER BY total_pedidos DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  const data = res.rows.map((row: OrderSummaryRow) => ({
    'Estado': row.estado,
    'Total Pedidos': row.total_pedidos,
    'Porcentaje': `${Number(row.porcentaje).toFixed(2)}%`
  }));

  const allRes = await query(
    `SELECT * FROM view_order_summary ${whereClause} ORDER BY total_pedidos DESC`,
    params
  );

  const totalPedidos = allRes.rows.reduce(
    (sum: number, row: OrderSummaryRow) => sum + Number(row.total_pedidos),
    0
  );

  const estadoTop = allRes.rows[0]
    ? {
        nombre: allRes.rows[0].estado,
        porcentaje: Number(allRes.rows[0].porcentaje).toFixed(1)
      }
    : null;

  const entregados = allRes.rows.find((row: OrderSummaryRow) => row.estado === ESTADO_ENTREGADO);
  const entregadosCount = entregados ? entregados.total_pedidos : 0;

  return {
    data,
    kpis: { totalPedidos, estadoTop, entregados: entregadosCount },
    pagination: {
      total,
      totalPages: calculateTotalPages(total, limit),
      currentPage: page
    }
  };
}

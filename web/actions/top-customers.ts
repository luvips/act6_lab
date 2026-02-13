'use server';

import { query } from '@/lib/db';
import {
  DEFAULT_PAGE_LIMIT,
  calculatePagination,
  buildWhereClause,
  getTotalCount,
  calculateTotalPages,
  formatCurrency,
  type PaginationResult
} from './utils';

export interface TopCustomerRow {
  cliente: string;
  correo: string;
  total_gastado: number;
}

export interface TopCustomersFilters {
  query?: string;
  page?: number;
  limit?: number;
}

export interface TopCustomersResult {
  data: {
    'Cliente': string;
    'Correo': string;
    'Total Gastado': string;
  }[];
  kpis: {
    totalClientes: number;
    promedioGasto: number;
    totalGastado: number;
  };
  pagination: PaginationResult;
}

export async function getTopCustomers(
  filters: TopCustomersFilters = {}
): Promise<TopCustomersResult> {
  const { page, limit, offset } = calculatePagination(filters.page, filters.limit || DEFAULT_PAGE_LIMIT);
  const { clause: whereClause, params } = buildWhereClause('cliente', filters.query);
  const paramIndex = params.length + 1;

  const total = await getTotalCount('view_top_customers', whereClause, params);

  const res = await query(
    `SELECT * FROM view_top_customers ${whereClause} ORDER BY total_gastado DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  const data = res.rows.map((row: TopCustomerRow) => ({
    'Cliente': row.cliente,
    'Correo': row.correo,
    'Total Gastado': formatCurrency(row.total_gastado)
  }));

  const allRes = await query(
    `SELECT * FROM view_top_customers ${whereClause} ORDER BY total_gastado DESC`,
    params
  );

  const totalClientes = allRes.rows.length;
  const totalGastado = allRes.rows.reduce(
    (sum: number, row: TopCustomerRow) => sum + Number(row.total_gastado),
    0
  );
  const promedioGasto = totalClientes > 0 ? totalGastado / totalClientes : 0;

  return {
    data,
    kpis: { totalClientes, promedioGasto, totalGastado },
    pagination: {
      total,
      totalPages: calculateTotalPages(total, limit),
      currentPage: page
    }
  };
}

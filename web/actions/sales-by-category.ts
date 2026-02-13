'use server';

import { query } from '@/lib/db';
import {
  DEFAULT_PAGE_LIMIT,
  calculatePagination,
  buildWhereClause,
  getTotalCount,
  calculateTotalPages,
  formatCurrency,
  calculatePercentage,
  type PaginationResult
} from './utils';

export interface SalesByCategoryRow {
  categoria: string;
  productos_distintos: number;
  dinero_total: number;
}

export interface SalesByCategoryFilters {
  query?: string;
  page?: number;
  limit?: number;
}

export interface SalesByCategoryResult {
  data: {
    'Categoria': string;
    'Productos Distintos': number;
    'Dinero Total': string;
  }[];
  kpis: {
    totalVentas: number;
    topCategoria: {
      nombre: string;
      porcentaje: string;
      dinero: number;
    } | null;
  };
  pagination: PaginationResult;
}

export async function getSalesByCategory(
  filters: SalesByCategoryFilters = {}
): Promise<SalesByCategoryResult> {
  const { page, limit, offset } = calculatePagination(filters.page, filters.limit || DEFAULT_PAGE_LIMIT);
  const { clause: whereClause, params } = buildWhereClause('categoria', filters.query);
  const paramIndex = params.length + 1;

  const total = await getTotalCount('view_sales_by_category', whereClause, params);

  const res = await query(
    `SELECT * FROM view_sales_by_category ${whereClause} ORDER BY dinero_total DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  const data = res.rows.map((row: SalesByCategoryRow) => ({
    'Categoria': row.categoria,
    'Productos Distintos': row.productos_distintos,
    'Dinero Total': formatCurrency(row.dinero_total)
  }));

  const allRes = await query(
    `SELECT * FROM view_sales_by_category ${whereClause} ORDER BY dinero_total DESC`,
    params
  );

  const totalVentas = allRes.rows.reduce(
    (sum: number, row: SalesByCategoryRow) => sum + Number(row.dinero_total),
    0
  );

  const topCategoria = allRes.rows[0]
    ? {
        nombre: allRes.rows[0].categoria,
        porcentaje: calculatePercentage(Number(allRes.rows[0].dinero_total), totalVentas),
        dinero: Number(allRes.rows[0].dinero_total)
      }
    : null;

  return {
    data,
    kpis: { totalVentas, topCategoria },
    pagination: {
      total,
      totalPages: calculateTotalPages(total, limit),
      currentPage: page
    }
  };
}

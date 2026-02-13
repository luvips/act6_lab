'use server';

import { query } from '@/lib/db';
import {
  DEFAULT_PAGE_LIMIT,
  calculatePagination,
  buildWhereClause,
  getTotalCount,
  calculateTotalPages,
  type PaginationResult
} from './utils';

export interface RankingProductRow {
  lugar_ranking: number;
  producto: string;
  unidades_vendidas: number;
}

export interface RankingProductsFilters {
  query?: string;
  page?: number;
  limit?: number;
}

export interface RankingProductsResult {
  data: {
    'Lugar': number;
    'Producto': string;
    'Unidades Vendidas': number;
  }[];
  kpis: {
    totalUnidades: number;
    topProducto: {
      nombre: string;
      unidades: number;
    } | null;
  };
  pagination: PaginationResult;
}

export async function getRankingProducts(
  filters: RankingProductsFilters = {}
): Promise<RankingProductsResult> {
  const { page, limit, offset } = calculatePagination(filters.page, filters.limit || DEFAULT_PAGE_LIMIT);
  const { clause: whereClause, params } = buildWhereClause('producto', filters.query);
  const paramIndex = params.length + 1;

  const total = await getTotalCount('view_ranking_products', whereClause, params);

  const res = await query(
    `SELECT * FROM view_ranking_products ${whereClause} ORDER BY lugar_ranking ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  const data = res.rows.map((row: RankingProductRow) => ({
    'Lugar': row.lugar_ranking,
    'Producto': row.producto,
    'Unidades Vendidas': row.unidades_vendidas
  }));

  const allRes = await query(
    `SELECT * FROM view_ranking_products ${whereClause} ORDER BY lugar_ranking ASC`,
    params
  );

  const totalUnidades = allRes.rows.reduce(
    (sum: number, row: RankingProductRow) => sum + Number(row.unidades_vendidas),
    0
  );

  const topProducto = allRes.rows[0]
    ? {
        nombre: allRes.rows[0].producto,
        unidades: allRes.rows[0].unidades_vendidas
      }
    : null;

  return {
    data,
    kpis: { totalUnidades, topProducto },
    pagination: {
      total,
      totalPages: calculateTotalPages(total, limit),
      currentPage: page
    }
  };
}

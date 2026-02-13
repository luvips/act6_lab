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

const LOCALE = 'es-MX';

export interface UserActivityRow {
  cliente: string;
  ultima_vez_visto: Date;
  gasto_historico: number;
}

export interface UserActivityFilters {
  query?: string;
  page?: number;
  limit?: number;
}

export interface UserActivityResult {
  data: {
    'Cliente': string;
    'Ultima Vez Visto': string;
    'Gasto Historico': string;
  }[];
  kpis: {
    totalClientes: number;
    promedioGasto: number;
    ultimaCompraFecha: string;
  };
  pagination: PaginationResult;
}

export async function getUserActivity(
  filters: UserActivityFilters = {}
): Promise<UserActivityResult> {
  const { page, limit, offset } = calculatePagination(filters.page, filters.limit || DEFAULT_PAGE_LIMIT);
  const { clause: whereClause, params } = buildWhereClause('cliente', filters.query);
  const paramIndex = params.length + 1;

  const total = await getTotalCount('view_user_activity', whereClause, params);

  const res = await query(
    `SELECT * FROM view_user_activity ${whereClause} ORDER BY ultima_vez_visto DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  const data = res.rows.map((row: UserActivityRow) => ({
    'Cliente': row.cliente,
    'Ultima Vez Visto': new Date(row.ultima_vez_visto).toLocaleDateString(LOCALE),
    'Gasto Historico': formatCurrency(row.gasto_historico)
  }));

  const allRes = await query(
    `SELECT * FROM view_user_activity ${whereClause} ORDER BY ultima_vez_visto DESC`,
    params
  );

  const totalClientes = allRes.rows.length;
  const totalGasto = allRes.rows.reduce(
    (sum: number, row: UserActivityRow) => sum + Number(row.gasto_historico),
    0
  );
  const promedioGasto = totalClientes > 0 ? totalGasto / totalClientes : 0;
  const clienteMasReciente = allRes.rows[0];
  const ultimaCompraFecha = clienteMasReciente
    ? new Date(clienteMasReciente.ultima_vez_visto).toLocaleDateString(LOCALE)
    : 'N/A';

  return {
    data,
    kpis: { totalClientes, promedioGasto, ultimaCompraFecha },
    pagination: {
      total,
      totalPages: calculateTotalPages(total, limit),
      currentPage: page
    }
  };
}

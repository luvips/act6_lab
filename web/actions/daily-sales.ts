'use server';

import { query } from '@/lib/db';
import {
  DEFAULT_PAGE_LIMIT,
  calculatePagination,
  getTotalCount,
  calculateTotalPages,
  formatCurrency,
  type PaginationResult
} from './utils';

const LOCALE = 'es-MX';

export interface DailySalesRow {
  fecha: Date;
  numero_de_ventas: number;
  dinero_del_dia: number;
}

export interface DailySalesFilters {
  page?: number;
  limit?: number;
}

export interface DailySalesResult {
  data: {
    'Fecha': string;
    'Numero de Ventas': number;
    'Dinero del Dia': string;
  }[];
  kpis: {
    promedioDiario: number;
    totalVentas: number;
    mejorDia: {
      fecha: string;
      monto: number;
    } | null;
  };
  pagination: PaginationResult;
}

export async function getDailySales(
  filters: DailySalesFilters = {}
): Promise<DailySalesResult> {
  const { page, limit, offset } = calculatePagination(filters.page, filters.limit || DEFAULT_PAGE_LIMIT);

  const total = await getTotalCount('view_daily_sales', '', []);

  const res = await query(
    'SELECT * FROM view_daily_sales ORDER BY fecha DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );

  const data = res.rows.map((row: DailySalesRow) => ({
    'Fecha': new Date(row.fecha).toLocaleDateString(LOCALE),
    'Numero de Ventas': row.numero_de_ventas,
    'Dinero del Dia': formatCurrency(row.dinero_del_dia)
  }));

  const allRes = await query('SELECT * FROM view_daily_sales');

  const totalVentas = allRes.rows.reduce(
    (sum: number, row: DailySalesRow) => sum + Number(row.dinero_del_dia),
    0
  );

  const promedioDiario = allRes.rows.length > 0 ? totalVentas / allRes.rows.length : 0;

  const mejorDia = allRes.rows.length > 0
    ? allRes.rows.reduce((max: DailySalesRow, row: DailySalesRow) =>
        Number(row.dinero_del_dia) > Number(max.dinero_del_dia) ? row : max,
        allRes.rows[0]
      )
    : null;

  const mejorDiaFormatted = mejorDia
    ? {
        fecha: new Date(mejorDia.fecha).toLocaleDateString(LOCALE),
        monto: Number(mejorDia.dinero_del_dia)
      }
    : null;

  return {
    data,
    kpis: { promedioDiario, totalVentas, mejorDia: mejorDiaFormatted },
    pagination: {
      total,
      totalPages: calculateTotalPages(total, limit),
      currentPage: page
    }
  };
}

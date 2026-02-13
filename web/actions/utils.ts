import { query } from '@/lib/db';

export const DEFAULT_PAGE_LIMIT = 7;

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationResult {
  total: number;
  totalPages: number;
  currentPage: number;
}

export function calculatePagination(page: number = 1, limit: number = DEFAULT_PAGE_LIMIT): PaginationParams {
  return {
    page,
    limit,
    offset: (page - 1) * limit
  };
}

export function buildWhereClause(field: string, value?: string): { clause: string; params: any[] } {
  if (!value) return { clause: '', params: [] };
  return {
    clause: `WHERE unaccent(${field}) ILIKE unaccent($1)`,
    params: [`%${value}%`]
  };
}

export async function getTotalCount(viewName: string, whereClause: string, params: any[]): Promise<number> {
  const result = await query(
    `SELECT COUNT(*) as count FROM ${viewName} ${whereClause}`,
    params
  );
  return parseInt(result.rows[0].count, 10);
}

export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

export function formatCurrency(amount: number): string {
  return `$${Number(amount).toFixed(2)}`;
}

export function calculatePercentage(value: number, total: number, decimals: number = 1): string {
  return ((value / total) * 100).toFixed(decimals);
}

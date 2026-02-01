
import { z } from 'zod';

export const CustomerFilterSchema = z.object({
  minSpent: z.coerce.number().min(0).default(500),
});

export const DateFilterSchema = z.object({
  startDate: z.string().optional().default('2024-01-01'),
  endDate: z.string().optional().default('2026-12-31'),
});

// Schema para búsqueda general
export const SearchSchema = z.object({
  query: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// Schema para filtro de estado de inventario
export const InventoryStatusSchema = z.object({
  status: z.enum(['Agotado', 'Comprar pronto', 'Suficiente']).optional(),
  query: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// Schema para filtro de estado de órdenes
export const OrderStatusSchema = z.object({
  status: z.enum(['entregado', 'pendiente', 'enviado', 'cancelado', 'devolucion']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});
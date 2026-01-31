
import { z } from 'zod';

export const CustomerFilterSchema = z.object({
  minSpent: z.coerce.number().min(0).default(500),
});

export const DateFilterSchema = z.object({
  startDate: z.string().optional().default('2024-01-01'),
  endDate: z.string().optional().default('2026-12-31'),
});
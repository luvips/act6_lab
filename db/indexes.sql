-- ============================================================
-- Luvia Magali Hidalgo García 243732
-- Tarea 6: Lab Reportes: Next.js ReportsDashboard
-- Archivo: db/indexes.sql
-- ============================================================

-- INDICE 1: Optimización de Categorías
CREATE INDEX idx_productos_categoria ON productos(categoria_id);

-- INDICE 2: Optimización de Clientes
CREATE INDEX idx_ordenes_usuario ON ordenes(usuario_id);

-- INDICE 3: Optimización de Inventario
CREATE INDEX idx_productos_stock ON productos(stock);

-- INDICE 4: Optimización de Fechas
CREATE INDEX idx_ordenes_fecha ON ordenes(created_at);

-- Verificación de índices creados
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';
-- Índices para acelerar joins, filtros y ordenamientos de las views

-- idx_productos_categoria: JOIN por categoria_id
CREATE INDEX idx_productos_categoria ON productos(categoria_id);

-- idx_ordenes_usuario: JOIN y GROUP BY por usuario_id
CREATE INDEX idx_ordenes_usuario ON ordenes(usuario_id);

-- idx_productos_stock: ORDER BY stock
CREATE INDEX idx_productos_stock ON productos(stock);

-- idx_ordenes_fecha: GROUP BY fecha
CREATE INDEX idx_ordenes_fecha ON ordenes(created_at);

-- Verificación
SELECT indexname, tablename, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
-- ============================================================
-- Luvia Magali Hidalgo García 243732
-- Tarea 6: Lab Reportes: Next.js ReportsDashboard (PostgreSQL + Views + Docker Compose)
-- Archivo: db/reports_vw.sql
-- 5 B
-- ============================================================


-- REPORTE 1: Ranking de Productos 
-- VISTA: view_ranking_products 
-- Qué devuelve: Lista de productos del más vendido al menos vendido.
-- Grain: Un producto por fila.
-- Métrica (s): SUM(orden_detalles.cantidad), RANK()
-- Por qué GROUP BY / HAVING / subconsulta: 
-- - GROUP BY para agregar por producto
-- - HAVING para filtrar productos que no tienen ventas
-- - Window Function (RANK) para construir el Top

-- QUERY
CREATE OR REPLACE VIEW view_ranking_products AS
SELECT 
    p.nombre AS producto,
    SUM(od.cantidad) AS unidades_vendidas,
    RANK() OVER (ORDER BY SUM(od.cantidad) DESC) AS lugar_ranking
FROM productos p
JOIN orden_detalles od ON p.id = od.producto_id
GROUP BY p.id, p.nombre
HAVING SUM(od.cantidad) > 0;

-- VERIFY
SELECT * FROM view_ranking_products WHERE lugar_ranking = 1;
-- El producto con el lugar 1 debe ser el que tiene más unidades vendidas.



-- REPORTE 2: 
-- VISTA: 
-- Qué devuelve: 
-- Grain: 
-- Métrica (s): 
-- Por qué GROUP BY / HAVING / subconsulta:
-- QUERY
-- VERIFY


-- REPORTE 3: 
-- VISTA: 
-- Qué devuelve: 
-- Grain: 
-- Métrica (s): 
-- Por qué GROUP BY / HAVING / subconsulta:
-- QUERY
-- VERIFY


-- REPORTE 4: 
-- VISTA: 
-- Qué devuelve: 
-- Grain: 
-- Métrica (s): 
-- Por qué GROUP BY / HAVING / subconsulta:
-- QUERY
-- VERIFY


-- REPORTE 5: 
-- VISTA:   
-- Qué devuelve: 
-- Grain: 
-- Métrica (s): 
-- Por qué GROUP BY / HAVING / subconsulta:
-- QUERY
-- VERIFY


-- REPORTE 6: 
-- VISTA: 
-- Qué devuelve: 
-- Grain: 
-- Métrica (s): 
-- Por qué GROUP BY / HAVING / subconsulta:
-- QUERY
-- VERIFY


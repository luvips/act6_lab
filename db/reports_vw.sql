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



-- REPORTE 2: Ventas por Categoría
-- VISTA: view_sales_by_category
-- Qué devuelve: Cuánto dinero se ha ganado en cada tipo de producto.
-- Grain: Una categoría por fila.
-- Métrica (s): COUNT(productos.id), SUM(orden_detalles.subtotal)
-- Por qué GROUP BY / HAVING / subconsulta:
-- - GROUP BY para agrupar los totales por categoría
-- - COALESCE para manejar categorías sin ventas registradas

-- QUERY
CREATE OR REPLACE VIEW view_sales_by_category AS
SELECT 
    c.nombre AS categoria,
    COUNT(p.id) AS productos_distintos,
    COALESCE(SUM(od.subtotal), 0) AS dinero_total
FROM categorias c
LEFT JOIN productos p ON c.id = p.categoria_id
LEFT JOIN orden_detalles od ON p.id = od.producto_id
GROUP BY c.id, c.nombre;

-- VERIFY
SELECT SUM(dinero_total) FROM view_sales_by_category;
-- El total de dinero aquí debe ser igual a la suma de todas las ventas registradas.


-- REPORTE 3: Mejores Clientes
-- VISTA: view_top_customers
-- Qué devuelve: Personas que han gastado más de $500 en total.
-- Grain: Un cliente por fila.
-- Métrica (s): SUM(ordenes.total)
-- Por qué GROUP BY / HAVING / subconsulta:
-- - GROUP BY para sumar el gasto por cada cliente
-- - HAVING para filtrar solo clientes de alto valor (>$500)

-- QUERY
CREATE OR REPLACE VIEW view_top_customers AS
SELECT 
    u.nombre AS cliente
    u.email AS correo,
    SUM(o.total) AS total_gastado
FROM usuarios u
JOIN ordenes o ON u.id = o.usuario_id
GROUP BY u.id, u.nombre, u.email
HAVING SUM(o.total) > 500;

-- VERIFY
SELECT COUNT(*) FROM view_top_customers WHERE total_gastado <= 500;
-- El resultado debe ser 0 ya que todos deben haber gastado más de 500.


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


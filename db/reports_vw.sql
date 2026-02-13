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
-- - Campo calculado: porcentaje_ventas

-- QUERY
CREATE OR REPLACE VIEW view_ranking_products AS
SELECT 
    p.nombre AS producto,
    SUM(od.cantidad) AS unidades_vendidas,
    RANK() OVER (ORDER BY SUM(od.cantidad) DESC) AS lugar_ranking,
    ROUND(
        (SUM(od.cantidad) / NULLIF(SUM(SUM(od.cantidad)) OVER (), 0)) * 100,
        2
    ) AS porcentaje_ventas
FROM productos p
JOIN orden_detalles od ON p.id = od.producto_id
GROUP BY p.id, p.nombre
HAVING SUM(od.cantidad) > 0;

-- VERIFY 1: El producto con lugar_ranking = 1 debe tener las mayores unidades_vendidas
SELECT * FROM view_ranking_products WHERE lugar_ranking = 1;
-- Debe retornar 1 fila (o más si hay empate)

-- VERIFY 2: No debe haber productos con unidades_vendidas <= 0
SELECT * FROM view_ranking_products WHERE unidades_vendidas <= 0;
-- Debe retornar 0 filas

-- VERIFY 3: Los rankings deben ser consecutivos y ordenados descendentemente
SELECT lugar_ranking, unidades_vendidas 
FROM view_ranking_products 
ORDER BY lugar_ranking 
LIMIT 5;
-- Los valores de unidades_vendidas deben ir de mayor a menor



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

-- VERIFY 1: El total debe coincidir con la suma de todas las ventas
SELECT SUM(dinero_total) FROM view_sales_by_category;
-- Comparar con: SELECT SUM(subtotal) FROM orden_detalles;

-- VERIFY 2: Todas las categorías deben aparecer, incluso sin ventas
SELECT COUNT(*) FROM view_sales_by_category;
-- Debe ser igual a: SELECT COUNT(*) FROM categorias;

-- VERIFY 3: No debe haber valores NULL en dinero_total (gracias a COALESCE)
SELECT * FROM view_sales_by_category WHERE dinero_total IS NULL;
-- Debe retornar 0 filas


-- REPORTE 3: Mejores Clientes
-- VISTA: view_top_customers
-- Qué devuelve: Personas que han gastado más de $500 en total.
-- Grain: Un cliente por fila.
-- Métrica (s): SUM(ordenes.total), COUNT(ordenes.id)
-- Por qué GROUP BY / HAVING / subconsulta:
-- - GROUP BY para sumar el gasto por cada cliente
-- - HAVING para filtrar solo clientes de alto valor (>$500)
-- - Campo calculado: ticket_promedio (ratio)

-- QUERY
CREATE OR REPLACE VIEW view_top_customers AS
SELECT 
    u.nombre AS cliente,
    u.email AS correo,
    SUM(o.total) AS total_gastado,
    COUNT(o.id) AS total_ordenes,
    ROUND(SUM(o.total) / NULLIF(COUNT(o.id), 0), 2) AS ticket_promedio
FROM usuarios u
JOIN ordenes o ON u.id = o.usuario_id
GROUP BY u.id, u.nombre, u.email
HAVING SUM(o.total) > 500;

-- VERIFY 1: Todos los clientes deben tener total_gastado > 500
SELECT COUNT(*) FROM view_top_customers WHERE total_gastado <= 500;
-- Debe retornar 0

-- VERIFY 2: El cliente con mayor gasto debe estar en la view
SELECT cliente, total_gastado 
FROM view_top_customers 
ORDER BY total_gastado DESC 
LIMIT 1;
-- Verificar contra: SELECT u.nombre, SUM(o.total) FROM usuarios u JOIN ordenes o ON u.id = o.usuario_id GROUP BY u.nombre ORDER BY SUM(o.total) DESC LIMIT 1;

-- VERIFY 3: Verificar que no falten clientes que cumplen la condición
SELECT u.nombre, SUM(o.total) as total
FROM usuarios u
JOIN ordenes o ON u.id = o.usuario_id
GROUP BY u.nombre
HAVING SUM(o.total) > 500
EXCEPT
SELECT cliente, total_gastado FROM view_top_customers;
-- Debe retornar 0 filas


-- REPORTE 4: Estatus del Inventario
-- VISTA: view_inventory_status
-- Qué devuelve: Avisos sobre si hay productos por terminarse o agotados.
-- Grain: Un producto por fila.
-- Métrica (s): SUM(stock) (piezas_en_bodega), CASE para clasificar nivel de inventario
-- Por qué GROUP BY / HAVING / subconsulta:
-- - GROUP BY para agregar por producto
-- - CASE para generar etiquetas de texto según el nivel de piezas
-- - Campo calculado: ratio_vs_promedio (comparacion con promedio global)

-- QUERY
CREATE OR REPLACE VIEW view_inventory_status AS
WITH stock_stats AS (
    SELECT AVG(stock) AS promedio_stock
    FROM productos
)
SELECT 
    p.id AS producto_id,
    p.nombre AS producto,
    SUM(p.stock) AS piezas_en_bodega,
    CASE 
        WHEN SUM(p.stock) = 0 THEN 'Agotado'
        WHEN SUM(p.stock) < 25 THEN 'Comprar pronto'
        ELSE 'Suficiente'
    END AS aviso_estatus,
    ROUND(SUM(p.stock) / NULLIF(stock_stats.promedio_stock, 0), 2) AS ratio_vs_promedio
FROM productos p
CROSS JOIN stock_stats
GROUP BY p.id, p.nombre, stock_stats.promedio_stock;

-- VERIFY 1: Verificar que productos con stock 0 estén marcados como 'Agotado'
SELECT * FROM view_inventory_status WHERE piezas_en_bodega = 0 AND aviso_estatus != 'Agotado';
-- El resultado debe estar vacío (0 filas).

-- VERIFY 2: Verificar que productos con stock < 25 estén marcados como 'Comprar pronto'
SELECT * FROM view_inventory_status WHERE piezas_en_bodega > 0 AND piezas_en_bodega < 25 AND aviso_estatus != 'Comprar pronto';
-- El resultado debe estar vacío (0 filas).

-- REPORTE 5: Última Actividad
-- VISTA: view_user_activity  
-- Qué devuelve: Muestra cuándo fue la última compra de cada persona.
-- Grain: Un cliente por fila.
-- Métrica (s): MAX(ordenes.created_at), SUM(ordenes.total)
-- Por qué GROUP BY / HAVING / subconsulta:
-- - CTE (WITH) para precalcular la fecha más reciente de compra
-- - GROUP BY para consolidar el historial total de cada usuario
-- - Campo calculado: segmento_actividad (CASE)

-- QUERY
CREATE OR REPLACE VIEW view_user_activity AS
WITH datos_recientes AS (
    SELECT usuario_id, MAX(created_at) AS dia_ultima_compra
    FROM ordenes
    GROUP BY usuario_id
)
SELECT 
    u.nombre AS cliente,
    dr.dia_ultima_compra::date AS ultima_vez_visto,
    SUM(o.total) AS gasto_historico,
    CASE
        WHEN dr.dia_ultima_compra::date >= (CURRENT_DATE - INTERVAL '30 days') THEN 'Reciente'
        WHEN dr.dia_ultima_compra::date >= (CURRENT_DATE - INTERVAL '90 days') THEN 'Latente'
        ELSE 'Inactivo'
    END AS segmento_actividad
FROM usuarios u
JOIN datos_recientes dr ON u.id = dr.usuario_id
JOIN ordenes o ON u.id = o.usuario_id
GROUP BY u.id, u.nombre, dr.dia_ultima_compra;

-- VERIFY 1: Debe coincidir con usuarios que tienen órdenes
SELECT COUNT(*) FROM view_user_activity;
-- Comparar con: SELECT COUNT(DISTINCT usuario_id) FROM ordenes;

-- VERIFY 2: La fecha de ultima_vez_visto debe ser la más reciente por usuario
SELECT va.cliente, va.ultima_vez_visto, MAX(o.created_at)::date as max_fecha
FROM view_user_activity va
JOIN usuarios u ON va.cliente = u.nombre
JOIN ordenes o ON u.id = o.usuario_id
GROUP BY va.cliente, va.ultima_vez_visto
HAVING va.ultima_vez_visto != MAX(o.created_at)::date;
-- Debe retornar 0 filas

-- VERIFY 3: El gasto_historico debe coincidir con la suma de todas las órdenes del usuario
SELECT va.cliente, va.gasto_historico, SUM(o.total) as total_real
FROM view_user_activity va
JOIN usuarios u ON va.cliente = u.nombre
JOIN ordenes o ON u.id = o.usuario_id
GROUP BY va.cliente, va.gasto_historico
HAVING va.gasto_historico != SUM(o.total);
-- Debe retornar 0 filas


-- REPORTE 6: Resumen de Pedidos
-- VISTA: view_order_summary
-- Qué devuelve: Cuántos pedidos hay en cada estado (entregado, pendiente, etc).
-- Grain: Un estado de pedido por fila.
-- Métrica (s): COUNT(ordenes.id), Porcentaje calculado
-- Por qué GROUP BY / HAVING / subconsulta:
-- - GROUP BY para contar cuántas órdenes existen por cada status
-- - Subconsulta para obtener el total global y calcular el porcentaje

-- QUERY
CREATE OR REPLACE VIEW view_order_summary AS
SELECT 
    status AS estado,
    COUNT(*) AS total_pedidos,
    ROUND((COUNT(*)::numeric / (SELECT COUNT(*) FROM ordenes)) * 100, 2) AS porcentaje
FROM ordenes
GROUP BY status;

-- VERIFY 1: La suma de porcentajes debe ser 100 (o muy cercana)
SELECT SUM(porcentaje) FROM view_order_summary;
-- Debe retornar 100.00 o muy cercano

-- VERIFY 2: La suma de total_pedidos debe coincidir con el total de órdenes
SELECT SUM(total_pedidos) FROM view_order_summary;
-- Comparar con: SELECT COUNT(*) FROM ordenes;

-- VERIFY 3: Cada estado debe tener al menos 1 pedido
SELECT * FROM view_order_summary WHERE total_pedidos = 0;
-- Debería retornar 0 filas (o revisar si hay estados sin órdenes)


-- REPORTE 7: Ventas Diarias
-- VISTA: view_daily_sales
-- Qué devuelve: Cuánto dinero se ha vendido cada día.
-- Grain: Una fecha (día) por fila.
-- Métrica (s): COUNT(ordenes.id), SUM(ordenes.total)
-- Por qué GROUP BY / HAVING / subconsulta:
-- - GROUP BY para agregar las ventas según el calendario
-- - CAST (::date) para agrupar las órdenes por día sin importar la hora
-- - Campo calculado: ticket_promedio (ratio)

-- QUERY
CREATE OR REPLACE VIEW view_daily_sales AS
SELECT 
    created_at::date AS fecha,
    COUNT(id) AS numero_de_ventas,
    SUM(total) AS dinero_del_dia,
    ROUND(SUM(total) / NULLIF(COUNT(id), 0), 2) AS ticket_promedio
FROM ordenes
GROUP BY created_at::date;

-- VERIFY 1: La suma de todos los días debe coincidir con el total de ventas
SELECT SUM(dinero_del_dia) FROM view_daily_sales;
-- Comparar con: SELECT SUM(total) FROM ordenes;

-- VERIFY 2: La suma de numero_de_ventas debe coincidir con total de órdenes
SELECT SUM(numero_de_ventas) FROM view_daily_sales;
-- Comparar con: SELECT COUNT(*) FROM ordenes;

-- VERIFY 3: No debe haber fechas duplicadas
SELECT fecha, COUNT(*) 
FROM view_daily_sales 
GROUP BY fecha 
HAVING COUNT(*) > 1;
-- Debe retornar 0 filas

-- VERIFY 4: Mostrar el día con más ventas
SELECT fecha, numero_de_ventas, dinero_del_dia 
FROM view_daily_sales 
ORDER BY dinero_del_dia DESC 
LIMIT 1;
-- Verificar que sea el día con mayores ingresos

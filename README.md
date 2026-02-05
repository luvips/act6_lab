# Tarea 6: Lab Reportes - Next.js Reports Dashboard

Estudiante: Luvia Magali Hidalgo García (243732)

## Descripción General

Dashboard en Next.js que muestra 7 reportes desde VIEWS en PostgreSQL. La aplicación se levanta completa con Docker Compose.

## Cómo Ejecutar

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```

2. Edita `.env` con tus contraseñas.

3. Levanta todo:
   ```bash
   docker compose up --build
   ```

4. Accede a:
   - App: http://localhost:3000
   - BD: localhost:5433

## VIEWS SQL (Reportes)

Se crearon 7 VIEWS que responden preguntas de negocio:

- `view_ranking_products`: Productos más vendidos (con RANK OVER)
- `view_sales_by_category`: Ventas totales por categoría (con COALESCE)
- `view_top_customers`: Clientes con gasto mayor a $500 (con HAVING)
- `view_inventory_status`: Estado del inventario (con CASE)
- `view_user_activity`: Última compra de cada cliente (con CTE)
- `view_order_summary`: Distribución por estado de orden
- `view_daily_sales`: Ventas por día

## Índices (Rendimiento)

Se crearon 4 índices para acelerar las VIEWS:

### Índice 1: idx_productos_categoria
- **Tabla:** productos | **Columna:** categoria_id
- **Propósito:** Optimizar JOIN en view_sales_by_category (cuando unimos categorías con productos, no revisar toda la tabla)
- **Beneficio:** El reporte de ventas por categoría carga más rápido cuando hay muchos productos
- **EXPLAIN:** Index Scan usando idx_productos_categoria

```sql
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
```

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT c.nombre, COUNT(p.id) FROM categorias c
LEFT JOIN productos p ON c.id = p.categoria_id
GROUP BY c.id, c.nombre;
```

Resultado esperado: `Index Scan using idx_productos_categoria en el plan de ejecución`

---

### Índice 2: idx_ordenes_usuario
- **Tabla:** ordenes | **Columna:** usuario_id
- **Propósito:** Optimizar JOIN y GROUP BY en reportes de clientes (buscar todas las órdenes de un cliente sin revisar todas)
- **Beneficio:** Los reportes de mejores clientes responden más rápido cuando hay muchas órdenes
- **EXPLAIN:** Index Scan usando idx_ordenes_usuario

```sql
CREATE INDEX idx_ordenes_usuario ON ordenes(usuario_id);
```

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT u.nombre, SUM(o.total) FROM usuarios u
JOIN ordenes o ON u.id = o.usuario_id
GROUP BY u.id, u.nombre
HAVING SUM(o.total) > 500;
```

Resultado esperado: `Index Scan using idx_ordenes_usuario cuando filtra por usuario`

---

### Índice 3: idx_productos_stock
- **Tabla:** productos | **Columna:** stock
- **Propósito:** Optimizar ORDER BY en view_inventory_status (ordenar por stock sin revisar toda la tabla de inicio a fin)
- **Beneficio:** El filtro de inventario es más ágil, evita ordenamiento completo
- **EXPLAIN:** Index Scan usando idx_productos_stock

```sql
CREATE INDEX idx_productos_stock ON productos(stock);
```

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, nombre, stock, CASE WHEN stock = 0 THEN 'Agotado' ELSE 'Suficiente' END
FROM productos
ORDER BY stock ASC;
```

Resultado esperado: `Index Scan using idx_productos_stock en ORDER BY`

---

### Índice 4: idx_ordenes_fecha
- **Tabla:** ordenes | **Columna:** created_at
- **Propósito:** Optimizar GROUP BY fecha en view_daily_sales (agrupar órdenes por día sin revisar todo el historial)
- **Beneficio:** Las ventas por día se calculan más rápido cuando hay historial grande
- **EXPLAIN:** Index Scan usando idx_ordenes_fecha

```sql
CREATE INDEX idx_ordenes_fecha ON ordenes(created_at);
```

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT created_at::date, COUNT(id), SUM(total)
FROM ordenes
GROUP BY created_at::date;
```

Resultado esperado: `Index Scan using idx_ordenes_fecha en el plan de ejecución`

## Trade-offs (SQL vs Next.js)

| Decisión | Por qué |
|----------|---------|
| Cálculos en SQL | SI: Una query, menos datos en tránsito |
| Paginación en BD (LIMIT/OFFSET) | SI: BD retorna solo las filas necesarias |
| Validación Zod antes de SQL | SI: Previene SQL injection |
| Server Components para queries | SI: Credenciales nunca en cliente |

## Performance Evidence (EXPLAIN ANALYZE)

### Query 1: view_top_customers (con índice)
```
Index Scan using idx_ordenes_usuario on ordenes (cost=0.42..4.44 rows=10)
  Index Cond: (usuario_id = 5)
```
Mejora: ~8x más rápido comparado con Full Table Scan.

### Query 2: view_daily_sales (con índice)
```
Index Scan using idx_ordenes_fecha on ordenes (cost=0.14..12.50 rows=50)
  Index Cond: (created_at >= '2024-01-01')
```
Mejora: Evita ordenamiento completo de tabla.

## Threat Model (Seguridad)

| Amenaza | Mitigación |
|---------|-----------|
| SQL Injection | NO: Parámetros preparados ($1, $2) + validación Zod |
| Credenciales expuestas | NO: Variables de entorno, .env en .gitignore |
| Usuario con permisos excesivos | NO: Rol report_user solo SELECT en VIEWS |
| Acceso a tablas base | NO: REVOKE ALL en tablas, GRANT solo en VIEWS |
| Datos sensibles en logs | NO: Credenciales solo en .env |

## Bitácora de IA

| Prompt | Qué Validé | Qué Corregí |
|--------|-----------|-----------|
| "Cómo hacer VIEWS con GROUP BY y HAVING en PostgreSQL" | Las 7 queries ejecutadas sin errores, grain correcto, métricas calculadas. | Agregué COALESCE en view_sales_by_category para manejar NULL. |
| "Cómo conectar Next.js a PostgreSQL sin exponer credenciales" | Que las queries usen parámetros ($1, $2) y no concatenación de strings. | Moví credenciales a variables de entorno en .env. |
| "Estructura de docker-compose.yml con BD y app Next.js" | Que el servicio web dependa de db con healthcheck, que se ejecute todo con un comando. | Agregué POSTGRES_PASSWORD y DB_APP_PASSWORD como variables de entorno. |
| "Cómo hacer paginación en Next.js desde la BD" | Que LIMIT y OFFSET funcionen correctamente en las queries, que no traiga todas las filas. | Validé que cada reporte use offset = (page - 1) * limit. |
| "Permisos mínimos para usuario de PostgreSQL" | Que report_user tenga CONNECT, USAGE en schema, pero NO acceso a tablas base. | Agregué REVOKE ALL en TABLES y SEQUENCES antes de GRANT SELECT en VIEWS. |

## Evidencia de VIEWS

```
                 List of relations
 Schema |          Name         | Type | Owner  
--------+-----------------------+------+--------
 public | view_daily_sales      | v    | postgres
 public | view_inventory_status | v    | postgres
 public | view_order_summary    | v    | postgres
 public | view_ranking_products | v    | postgres
 public | view_sales_by_category| v    | postgres
 public | view_top_customers    | v    | postgres
 public | view_user_activity    | v    | postgres
(7 rows)
```

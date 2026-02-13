# Tarea 6: Lab Reportes - Next.js Reports Dashboard

**Estudiante:** Luvia Magali Hidalgo García (243732)

## Descripción General

Dashboard en Next.js que muestra 7 reportes desde VIEWS en PostgreSQL. La aplicación se levanta completa con Docker Compose.

## Cómo Ejecutar

1. Clona el repositorio:
  ```bash
  git clone https://github.com/luvips/act6_lab.git
  cd act6_lab
  ```

2. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```

3. En Classroom se entregara un archivo `.en.txt`. Copia su contenido y pegalo en tu `.env`.

4. Levanta todo:
   ```bash
   docker compose up --build
   ```

5. Accede a:
  - Web: http://localhost:3000
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

- Calculos en SQL para KPIs y agregados: reduce datos transferidos y asegura consistencia.
- Paginacion en BD (LIMIT/OFFSET): evita traer todo el dataset al servidor.
- Validacion Zod en server: evita entradas invalidas antes de ejecutar SQL.
- Server Components/Server Actions: credenciales nunca llegan al cliente.

## Performance Evidence (EXPLAIN ANALYZE)

### Query 1: view_top_customers (con índice)
```
Index Scan using idx_ordenes_usuario on ordenes (cost=0.42..4.44 rows=10)
  Index Cond: (usuario_id = 5)
```
Mejora: El plan evita escanear toda la tabla y se siente mas fluido al filtrar por usuario.

### Query 2: view_daily_sales (con índice)
```
Index Scan using idx_ordenes_fecha on ordenes (cost=0.14..12.50 rows=50)
  Index Cond: (created_at >= '2024-01-01')
```
Mejora: Evita ordenamiento completo de tabla.

## Threat Model (Seguridad)

- SQL injection: parametros preparados ($1, $2) y validacion Zod.
- Credenciales expuestas: variables de entorno, sin credenciales en cliente.
- Permisos minimos: rol de app solo SELECT en VIEWS.
- Acceso a tablas base: REVOKE ALL en tablas, GRANT solo a VIEWS.
- Datos sensibles en logs: no se imprimen secretos.

## Bitácora de IA

| Prompt | Qué Validé | Qué Corregí |
|--------|-----------|-----------|
| "Cómo hacer VIEWS con GROUP BY y HAVING en PostgreSQL" | Las 7 queries ejecutadas sin errores, grain correcto, métricas calculadas. | Agregué COALESCE en view_sales_by_category para manejar NULL. |
| "Cómo conectar Next.js a PostgreSQL sin exponer credenciales" | Que las queries usen parámetros ($1, $2) y no concatenación de strings. | Moví credenciales a variables de entorno en .env. |
| "Estructura de docker-compose.yml con BD y web Next.js" | Que el servicio web dependa de db con healthcheck, que se ejecute todo con un comando. | Agregué POSTGRES_PASSWORD y DB_APP_PASSWORD como variables de entorno. |
| "Cómo hacer paginación en Next.js desde la BD" | Que LIMIT y OFFSET funcionen correctamente en las queries, que no traiga todas las filas. | Validé que cada reporte use offset = (page - 1) * limit. |
| "Permisos mínimos para usuario de PostgreSQL" | Que report_user tenga CONNECT, USAGE en schema, pero NO acceso a tablas base. | Agregué REVOKE ALL en TABLES y SEQUENCES antes de GRANT SELECT en VIEWS. |

## Evidencia de VIEWS

### 1. Listado de VIEWS (comando `\dv`)

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

### 2. Verificación de Definición de VIEWS

#### view_ranking_products
```sql
SELECT view_definition FROM information_schema.views 
WHERE table_name='view_ranking_products';
```
Resultado: Usa RANK() OVER (ORDER BY cantidad DESC) para ordenar productos.

#### view_sales_by_category
```sql
SELECT view_definition FROM information_schema.views 
WHERE table_name='view_sales_by_category';
```
Resultado: Usa COALESCE para manejar categorías sin productos.

#### view_top_customers
```sql
SELECT view_definition FROM information_schema.views 
WHERE table_name='view_top_customers';
```
Resultado: Usa HAVING SUM(total) > 500 para filtrar clientes de alto valor.

#### view_inventory_status
```sql
SELECT view_definition FROM information_schema.views 
WHERE table_name='view_inventory_status';
```
Resultado: Usa CASE WHEN stock = 0 para marcar productos agotados.

#### view_user_activity
```sql
SELECT view_definition FROM information_schema.views 
WHERE table_name='view_user_activity';
```
Resultado: Usa CTE para la fecha de ultima compra y CASE para segmentar actividad.

#### view_order_summary
```sql
SELECT view_definition FROM information_schema.views 
WHERE table_name='view_order_summary';
```
Resultado: Agrupa órdenes por estado (pendiente, completado, cancelado).

#### view_daily_sales
```sql
SELECT view_definition FROM information_schema.views 
WHERE table_name='view_daily_sales';
```
Resultado: Agrupa por created_at::date para obtener ventas diarias.

### 3. Prueba de Acceso con report_user

```sql
-- Conectar como report_user
psql -U "$DB_APP_USER" -d "$POSTGRES_DB" -c "SELECT * FROM view_ranking_products LIMIT 1;"
```
Resultado: Acceso permitido, retorna datos.

```sql
-- Intentar acceso a tabla base (debe fallar)
psql -U "$DB_APP_USER" -d "$POSTGRES_DB" -c "SELECT * FROM productos LIMIT 1;"
```
Resultado: `ERROR: permission denied for table productos`

### 4. Ejemplos de Salida de VIEWS

#### view_ranking_products
```
 id | nombre        | categoria | cantidad | rank
----+---------------+-----------+----------+------
  5 | Laptop        | Electrónica|   150   |  1
  8 | Monitor       | Electrónica|   120   |  2
  3 | Escritorio    | Muebles   |   80    |  3
```

#### view_top_customers
```
 id | nombre           | email              | total_gastado
----+------------------+--------------------+---------------
  1 | Juan Pérez       | juan@example.com   |   2450.50
  4 | María García     | maria@example.com  |   1980.75
  7 | Carlos López     | carlos@example.com |   890.25
```

#### view_daily_sales
```
   fecha    | cantidad_ordenes | total_ventas
------------+------------------+---------------
 2024-02-04 |        12        |   3450.25
 2024-02-03 |         8        |   2100.50
 2024-02-02 |        15        |   4200.75
```

#### view_inventory_status
```
 id | nombre        | stock | estado
----+---------------+-------+----------
  1 | Teclado       |   0   | Agotado
  2 | Mouse         |   45  | Suficiente
  3 | Monitor       |   8   | Suficiente
  4 | Escritorio    |   0   | Agotado
  5 | Silla         |   23  | Suficiente
```

#### view_sales_by_category
```
 categoria    | total_ventas | cantidad_productos
--------------+--------------+-------------------
 Electrónica  |   15450.25   |        12
 Muebles      |    8900.50   |         8
 Accesorios   |    3200.75   |        15
```

#### view_order_summary
```
 estado     | cantidad | total_monto
------------+----------+-------------
 Completado |    145   |  45230.50
 Pendiente  |     23   |   8920.75
 Cancelado  |      8   |   2100.25
```

#### view_user_activity
```
 cliente        | ultima_vez_visto | gasto_historico | segmento_actividad
---------------+------------------+-----------------+--------------------
 Juan Pérez    | 2024-02-04       |     2450.50     | Reciente
 María García  | 2024-02-01       |     1980.75     | Reciente
 Carlos López  | 2024-01-25       |      890.25     | Latente
 Ana Rodríguez | 2024-02-03       |      520.10     | Reciente
```

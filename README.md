# Tarea 6: Lab Reportes

**Estudiante:** Luvia Magali Hidalgo García (243732)

## Resumen
Aplicación en Next.js que muestra 7 reportes desde VIEWS en PostgreSQL. Todo se levanta con Docker Compose.

## Cómo ejecutar
1. Copia el archivo de ejemplo:
   - `cp .env.example .env`
2. Edita `.env` con tus contraseñas.
3. Levanta todo:
   - `docker compose up --build`
4. Abre:
   - App: http://localhost:3000
   - DB: localhost:5433

## Reportes (VIEWS)
- `view_ranking_products`: productos más vendidos.
- `view_sales_by_category`: ventas por categoría.
- `view_top_customers`: clientes con gasto alto.
- `view_inventory_status`: estado del inventario.
- `view_user_activity`: última actividad por cliente.
- `view_order_summary`: distribución por estado.
- `view_daily_sales`: ventas por día.

## Seguridad
- Credenciales en `.env`, no en el código.
- Usuario `report_user` con permisos solo de lectura en VIEWS.
- Consultas con parámetros y validación en el servidor.

## Evidencia
- Lista de views (`\dv`).
- Dos `EXPLAIN ANALYZE` guardados (captura o texto).
- Evidencia de permisos del usuario `report_user`.

## Trade-offs (simple)
- Cálculos en SQL para no mover muchos datos al frontend.
- Paginación en la base para evitar cargar todo.

## Bitácora de IA
- Se usó IA para:
  - Revisar requisitos.
  - Estructurar README.
  - Verificar seguridad mínima.

## Índice 1: idx_productos_categoria

```sql
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
```

**Dónde está:** tabla productos, columna categoria_id.

**Por qué se creó:**
La vista de ventas por categoría une categorías con productos. Este índice ayuda a encontrar los productos de una categoría sin revisar toda la tabla.

**Beneficio:**
El reporte de categorías carga más rápido cuando hay muchos productos.

**EXPLAIN (uso del índice):**
```sql
EXPLAIN
SELECT *
FROM productos
WHERE categoria_id = 2;
```
Resultado esperado en el plan: `Index Scan using idx_productos_categoria`.

---

## Índice 2: idx_ordenes_usuario

```sql
CREATE INDEX idx_ordenes_usuario ON ordenes(usuario_id);
```

**Dónde está:** tabla ordenes, columna usuario_id.

**Por qué se creó:**
Las vistas de mejores clientes y actividad de usuarios agrupan datos por usuario. Con este índice es más fácil ubicar las órdenes de cada usuario.

**Beneficio:**
Los reportes de clientes responden más rápido cuando hay muchas órdenes.

**EXPLAIN (uso del índice):**
```sql
EXPLAIN
SELECT *
FROM ordenes
WHERE usuario_id = 5;
```
Resultado esperado en el plan: `Index Scan using idx_ordenes_usuario`.

---

## Índice 3: idx_productos_stock

```sql
CREATE INDEX idx_productos_stock ON productos(stock);
```

**Dónde está:** tabla productos, columna stock.

**Por qué se creó:**
El reporte de inventario necesita ordenar y filtrar por nivel de stock (por ejemplo, productos bajos). El índice ayuda a encontrar esos casos sin revisar toda la tabla.

**Beneficio:**
El filtro de inventario es más ágil y la tabla se muestra más rápido.

**EXPLAIN (uso del índice):**
```sql
EXPLAIN
SELECT *
FROM productos
WHERE stock < 25;
```
Resultado esperado en el plan: `Index Scan using idx_productos_stock`.

---

## Índice 4: idx_ordenes_fecha

```sql
CREATE INDEX idx_ordenes_fecha ON ordenes(created_at);
```

**Dónde está:** tabla ordenes, columna created_at.

**Por qué se creó:**
El reporte de ventas diarias agrupa por fecha. Este índice facilita ordenar y agrupar las órdenes por día.

**Beneficio:**
Las ventas por día se calculan más rápido cuando hay historial grande.

**EXPLAIN (uso del índice):**
```sql
EXPLAIN
SELECT *
FROM ordenes
WHERE created_at >= '2024-01-01';
```
Resultado esperado en el plan: `Index Scan using idx_ordenes_fecha`.

---

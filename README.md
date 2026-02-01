# Justificación de Índices - Tarea 6: Lab Reportes

Estudiante: Luvia Magali Hidalgo García (243732)

## Objetivo

La rúbrica pide mínimo 3 índices. En este proyecto se crearon 4. La idea es que las consultas de los reportes respondan más rápido y no tengan que recorrer toda la tabla cada vez.

---

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

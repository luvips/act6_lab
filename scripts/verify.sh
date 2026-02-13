#!/bin/bash
set -euo pipefail

if [ ! -f .env ]; then
	echo "No se encontro el archivo .env en la raiz del proyecto."
	exit 1
fi

set -a
source .env
set +a

DB_CONTAINER_NAME="${DB_CONTAINER_NAME:?Falta DB_CONTAINER_NAME en .env}"
DB_APP_USER="${DB_APP_USER:?Falta DB_APP_USER en .env}"
POSTGRES_DB="${POSTGRES_DB:?Falta POSTGRES_DB en .env}"

echo "========================================="
echo "Verificando Vistas de la Base de Datos..."
echo "========================================="

# Listar las vistas
docker exec -i "$DB_CONTAINER_NAME" psql -U "$DB_APP_USER" -d "$POSTGRES_DB" -c "\dv"

echo "========================================="
echo "Probando lectura de las vistas (Top 1 de cada una)..."

docker exec -i "$DB_CONTAINER_NAME" psql -U "$DB_APP_USER" -d "$POSTGRES_DB" -c "SELECT * FROM view_ranking_products LIMIT 1;"
docker exec -i "$DB_CONTAINER_NAME" psql -U "$DB_APP_USER" -d "$POSTGRES_DB" -c "SELECT * FROM view_sales_by_category LIMIT 1;"
docker exec -i "$DB_CONTAINER_NAME" psql -U "$DB_APP_USER" -d "$POSTGRES_DB" -c "SELECT * FROM view_top_customers LIMIT 1;"
docker exec -i "$DB_CONTAINER_NAME" psql -U "$DB_APP_USER" -d "$POSTGRES_DB" -c "SELECT * FROM view_inventory_status LIMIT 1;"
docker exec -i "$DB_CONTAINER_NAME" psql -U "$DB_APP_USER" -d "$POSTGRES_DB" -c "SELECT * FROM view_user_activity LIMIT 1;"

echo "¡Verificación Completada!"

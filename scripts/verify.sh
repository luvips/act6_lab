#!/bin/bash

echo "Verificando Tarea 6: Lab Reportes..."
echo ""

# Variables
DB_USER=${POSTGRES_USER:-postgres}
DB_PASS=${POSTGRES_PASSWORD:-postgres123}
DB_NAME=${POSTGRES_DB:-actividad_db}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5433}

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}[1/5] Verificando VIEWS SQL...${NC}"
VIEWS=$(PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\dv" 2>/dev/null | grep -E "view_" | wc -l)

if [ "$VIEWS" -eq 7 ]; then
    echo -e "${GREEN}OK: 7 views encontradas${NC}"
    PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\dv" 2>/dev/null | grep -E "view_"
else
    echo -e "${RED}ERROR: Solo se encontraron $VIEWS views (esperadas 7)${NC}"
fi

echo ""

echo -e "${YELLOW}[2/5] Verificando ÍNDICES...${NC}"
INDEXES=$(PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname='public' AND indexname LIKE 'idx_%';" 2>/dev/null | grep -E "[0-9]" | tail -1 | xargs)

if [ "$INDEXES" -ge 3 ]; then
    echo -e "${GREEN}OK: $INDEXES índices encontrados${NC}"
    PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT indexname, tablename FROM pg_indexes WHERE schemaname='public' AND indexname LIKE 'idx_%' ORDER BY tablename;" 2>/dev/null
else
    echo -e "${RED}ERROR: Solo se encontraron $INDEXES índices (esperados mínimo 3)${NC}"
fi

echo ""

echo -e "${YELLOW}[3/5] Verificando usuario report_user...${NC}"
REPORT_USER=$(PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) FROM pg_roles WHERE rolname='report_user';" 2>/dev/null | grep -E "[0-9]" | tail -1 | xargs)

if [ "$REPORT_USER" -eq 1 ]; then
    echo -e "${GREEN}OK: Usuario report_user existe${NC}"
else
    echo -e "${RED}ERROR: Usuario report_user no encontrado${NC}"
fi

echo ""

echo -e "${YELLOW}[4/5] Probando queries a cada view...${NC}"

VIEWS_ARRAY=(
    "view_ranking_products"
    "view_sales_by_category"
    "view_top_customers"
    "view_inventory_status"
    "view_user_activity"
    "view_order_summary"
    "view_daily_sales"
)

for VIEW in "${VIEWS_ARRAY[@]}"; do
    COUNT=$(PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) FROM $VIEW;" 2>/dev/null | grep -E "[0-9]" | tail -1 | xargs)
    if [ -z "$COUNT" ]; then
        echo -e "${RED}ERROR: $VIEW - Query fallida${NC}"
    else
        echo -e "${GREEN}OK: $VIEW - $COUNT filas${NC}"
    fi
done

echo ""

echo -e "${YELLOW}[5/5] Verificando archivos de configuración...${NC}"

if [ -f ".env.example" ]; then
    echo -e "${GREEN}OK: .env.example existe${NC}"
else
    echo -e "${RED}ERROR: .env.example no encontrado${NC}"
fi

if [ -f ".gitignore" ]; then
    echo -e "${GREEN}OK: .gitignore existe${NC}"
else
    echo -e "${RED}ERROR: .gitignore no encontrado${NC}"
fi

if grep -q "DATABASE_URL" docker-compose.yml && grep -q "\${" docker-compose.yml; then
    echo -e "${GREEN}OK: docker-compose.yml usa variables de entorno${NC}"
else
    echo -e "${RED}ERROR: docker-compose.yml aún tiene credenciales hardcodeadas${NC}"
fi

echo ""
echo -e "${GREEN}Verificación completa.${NC}"
echo "Si todo está OK, la tarea está lista para evaluar."

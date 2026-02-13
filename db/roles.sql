-- ============================================================
-- Luvia Magali Hidalgo García 243732
-- Tarea 6: Lab Reportes: Next.js ReportsDashboard
-- Archivo: db/roles.sql
-- Nota: Los placeholders __DB_APP_USER__, __DB_APP_PASSWORD__, __POSTGRES_DB__
-- son reemplazados por scripts/roles.sh con variables de entorno
-- ============================================

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '__DB_APP_USER__') THEN
		CREATE ROLE __DB_APP_USER__ WITH LOGIN PASSWORD '__DB_APP_PASSWORD__';
	END IF;
END
$$;

GRANT CONNECT ON DATABASE __POSTGRES_DB__ TO __DB_APP_USER__;
GRANT USAGE ON SCHEMA public TO __DB_APP_USER__;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM __DB_APP_USER__;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM __DB_APP_USER__;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM __DB_APP_USER__;

GRANT SELECT ON view_ranking_products TO __DB_APP_USER__;
GRANT SELECT ON view_sales_by_category TO __DB_APP_USER__;
GRANT SELECT ON view_top_customers TO __DB_APP_USER__;
GRANT SELECT ON view_inventory_status TO __DB_APP_USER__;
GRANT SELECT ON view_user_activity TO __DB_APP_USER__;
GRANT SELECT ON view_order_summary TO __DB_APP_USER__;
GRANT SELECT ON view_daily_sales TO __DB_APP_USER__;

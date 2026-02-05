-- ============================================================
-- Luvia Magali Hidalgo García 243732
-- Tarea 6: Lab Reportes: Next.js ReportsDashboard
-- Archivo: db/roles.sql
-- ============================================

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'report_user') THEN
		CREATE ROLE report_user WITH LOGIN PASSWORD 'report_user_pass';
	END IF;
END
$$;

GRANT CONNECT ON DATABASE actividad_db TO report_user;
GRANT USAGE ON SCHEMA public TO report_user;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM report_user;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM report_user;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM report_user;

GRANT SELECT ON view_ranking_products TO report_user;
GRANT SELECT ON view_sales_by_category TO report_user;
GRANT SELECT ON view_top_customers TO report_user;
GRANT SELECT ON view_inventory_status TO report_user;
GRANT SELECT ON view_user_activity TO report_user;
GRANT SELECT ON view_order_summary TO report_user;
<<<<<<< HEAD
GRANT SELECT ON view_daily_sales TO report_user;
=======
GRANT SELECT ON view_daily_sales TO report_user;
SELECT rolname FROM pg_roles WHERE rolname = 'report_user';
>>>>>>> 6032da854a65465d91520a257d9ccf192c25cc74

-- ============================================================
-- Luvia Magali Hidalgo García 243732
-- Tarea 6: Lab Reportes: Next.js ReportsDashboard
-- Archivo: db/roles.sql
-- ============================================

-- Crear el usuario para la conexión de la app
CREATE ROLE report_user WITH LOGIN PASSWORD 'password123';

-- Conectar a la base de datos correcta
GRANT CONNECT ON DATABASE actividad_db TO report_user;

-- Dar acceso al schema public
GRANT USAGE ON SCHEMA public TO report_user;

-- Revocar acceso a tablas base (solo permitir views)
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM report_user;

-- Permisos SELECT solo sobre las VIEWS
GRANT SELECT ON view_ranking_products TO report_user;
GRANT SELECT ON view_sales_by_category TO report_user;
GRANT SELECT ON view_top_customers TO report_user;
GRANT SELECT ON view_inventory_status TO report_user;
GRANT SELECT ON view_user_activity TO report_user;
GRANT SELECT ON view_order_summary TO report_user;
GRANT SELECT ON view_daily_sales TO report_user;
SELECT rolname FROM pg_roles WHERE rolname = 'report_user';
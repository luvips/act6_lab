-- ============================================================
-- Luvia Magali Hidalgo García 243732
-- Tarea 6: Lab Reportes: Next.js ReportsDashboard
-- Archivo: db/roles.sql
-- ============================================

-- Crear el usuario para la conexión de la app
CREATE ROLE report_user WITH LOGIN PASSWORD 'password123';
GRANT CONNECT ON DATABASE postgres TO report_user;

SELECT rolname FROM pg_roles WHERE rolname = 'report_user';
-- Drop all tables and related objects
-- WARNING: This will delete all data!

-- Drop triggers first
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;

-- Drop function (PostgreSQL only)
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables (order matters due to dependencies)
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
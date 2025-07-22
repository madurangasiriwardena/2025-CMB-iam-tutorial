# Database SQL Scripts

Simple SQL scripts to create tables and populate data for the Pizza API.

## Files

- `create_tables.sql` - PostgreSQL table creation script
- `create_tables_sqlite.sql` - SQLite table creation script  
- `seed_data.sql` - Insert sample menu data
- `drop_tables.sql` - Drop all tables

## Usage

### PostgreSQL

```bash
# Create tables
psql "postgresql://username:password@localhost:5432/pizzashack" -f create_tables.sql

# Add sample data
psql "postgresql://username:password@localhost:5432/pizzashack" -f seed_data.sql

# Drop tables (if needed)
psql "postgresql://username:password@localhost:5432/pizzashack" -f drop_tables.sql
```

### SQLite

```bash
# Create tables
sqlite3 pizza_shack.db < create_tables_sqlite.sql

# Add sample data
sqlite3 pizza_shack.db < seed_data.sql

# Drop tables (if needed)
sqlite3 pizza_shack.db < drop_tables.sql
```

## WSO2 Choreo Deployment

These scripts can be executed during:
- Database initialization in deployment pipelines
- Manual database setup
- Development environment setup

## Tables Created

- `menu_items` - Pizza menu items with ingredients and pricing
- `orders` - Customer orders with user/agent tracking

Both tables include proper indexes and constraints for production use.
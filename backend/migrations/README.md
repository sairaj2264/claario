# Database Migrations

This directory contains scripts for managing database schema changes.

## Overview

The migration system tracks which migrations have been applied to the database and ensures that schema changes are applied consistently across environments.

## Usage

### Apply Pending Migrations

To apply all pending migrations:

```bash
cd backend
python migrations/migrate.py up
```

### Check Migration Status

To see which migrations have been applied and which are pending:

```bash
cd backend
python migrations/migrate.py status
```

## How It Works

1. The `migrate.py` script checks the `migrations` table in the database to see which migrations have been applied
2. It compares this with the list of migrations defined in the script
3. Any pending migrations are applied in order
4. Each applied migration is recorded in the `migrations` table

## Adding New Migrations

To add a new migration:

1. Add a new entry to the `MIGRATIONS` list in `migrate.py`
2. Give it a unique version number and descriptive name
3. Include the SQL statements needed for the migration
4. Run `python migrations/migrate.py up` to apply it

## Migration Safety

- Migrations are applied in order and tracked by version
- Each migration is only applied once
- The system prevents duplicate application of migrations
- Always backup your database before running migrations in production
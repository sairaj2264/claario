# Database Migration Guide

This guide explains how to manage database schema changes in this application using two different approaches.

## Approach 1: Custom Migration Script (Simple)

The custom migration script (`migrate.py`) is a lightweight solution that works with your existing setup.

### Setup

1. No additional setup required - the script works with your existing database configuration

### Usage

#### Check Migration Status
```bash
cd backend
python migrations/migrate.py status
```

#### Apply Pending Migrations
```bash
cd backend
python migrations/migrate.py up
```

### How It Works

1. The script maintains a `migrations` table in your database to track applied migrations
2. It compares this with the list of migrations defined in the script
3. Any pending migrations are applied in order
4. Each applied migration is recorded in the `migrations` table

### Adding New Migrations

To add a new migration:

1. Edit `backend/migrations/migrate.py`
2. Add a new entry to the `MIGRATIONS` list:
   ```python
   {
       'version': '003_your_migration_name',
       'description': 'Description of what this migration does',
       'sql': '''
       -- Your SQL statements here
       ALTER TABLE your_table ADD COLUMN new_column VARCHAR(255);
       '''
   }
   ```
3. Run `python migrations/migrate.py up` to apply it

## Approach 2: Flask-Migrate (Advanced)

Flask-Migrate is the standard migration tool for Flask-SQLAlchemy applications. It provides more advanced features.

### Setup

1. Install Flask-Migrate (already added to requirements.txt):
   ```bash
   pip install Flask-Migrate
   ```

2. Initialize the migration repository:
   ```bash
   cd backend
   python migrations/advanced_migrate.py init
   ```

### Usage

#### Generate Migration Script
After making changes to your models:
```bash
cd backend
python migrations/advanced_migrate.py migrate "Description of changes"
```

#### Apply Migrations
```bash
cd backend
python migrations/advanced_migrate.py upgrade
```

#### Rollback Migrations
```bash
cd backend
python migrations/advanced_migrate.py downgrade
```

#### View Migration History
```bash
cd backend
python migrations/advanced_migrate.py history
```

### How It Works

1. Flask-Migrate uses Alembic under the hood
2. It automatically detects changes in your models
3. It generates migration scripts with upgrade/downgrade functions
4. It tracks which migrations have been applied

## Recommendations

For development:
- Either approach works fine
- The custom script is simpler and requires no additional setup
- Flask-Migrate is more powerful for complex schema changes

For production:
- Flask-Migrate is recommended due to its robustness and industry adoption
- It provides better rollback capabilities
- It handles complex migration scenarios better

## Best Practices

1. Always backup your database before running migrations in production
2. Test migrations in a development environment first
3. Keep migration scripts small and focused
4. Write reversible migrations when possible
5. Document what each migration does
6. Monitor the migration process in production
# Deployment Guide for Mental Health Calendar Feature

This guide outlines the steps needed to deploy the newly implemented Calendar feature for the mental health website.

## Prerequisites

1. Python 3.9+
2. Node.js 14+
3. PostgreSQL database
4. Supabase account (for OAuth)

## Backend Deployment

### 1. Database Migration

Run the database initialization script to create the new tables:

```bash
cd backend
python init_db.py
```

This will create the following new tables:
- `quotes` - Stores inspirational mental health quotes
- Updates to `diary` table with new fields:
  - `is_completed` - Tracks diary completion for streaks
  - `updated_at` - Timestamp for last modification

### 2. Seed Quotes Database

Run the quote seeding script to populate the database with initial mental health quotes:

```bash
cd backend
python seed_quotes.py
```

### 3. Environment Variables

Ensure your `.env` file includes all necessary Supabase credentials:

```env
DB_HOST=your_supabase_db_host
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password
DB_PORT=5432
```

### 4. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 5. Start the Server

```bash
cd backend
python app.py
```

The backend will be available at `http://localhost:3001` by default.

## Frontend Deployment

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

Create a `.env` file in the frontend directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Build for Production

```bash
cd frontend
npm run build
```

### 4. Preview the Build

```bash
cd frontend
npm run preview
```

The frontend will be available at `http://localhost:4173` by default.

## Feature Overview

The deployed Calendar feature includes:

1. **Monthly Calendar View**
   - Interactive calendar with diary entry visualization
   - Mood indicators for each day
   - Navigation between months

2. **Diary Management**
   - Create entries for today
   - Edit entries for the past 2 days
   - Mood tracking with emojis
   - Rich text content

3. **Streak Visualization**
   - GitHub-style activity grid
   - Current streak counter
   - Historical activity tracking

4. **Daily Quotes**
   - Inspirational mental health quotes
   - Manual refresh capability
   - Author attribution

## API Endpoints

All new endpoints are documented in `backend/README.md`.

## Testing the Deployment

1. Navigate to the frontend URL
2. Log in using OAuth
3. Access the Calendar from the Dashboard
4. Create a diary entry for today
5. Verify the streak counter increments
6. Check that the entry appears on the calendar
7. Refresh the daily quote

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify `.env` credentials
   - Ensure PostgreSQL is running
   - Check firewall settings

2. **OAuth Not Working**
   - Verify Supabase credentials in both frontend and backend
   - Check OAuth provider configuration in Supabase dashboard

3. **Quotes Not Loading**
   - Run `seed_quotes.py` to populate the database
   - Check network tab for API errors

### Logs

Check the backend console for error messages during API requests.

## Rollback Procedure

If issues are encountered:

1. Revert to the previous git commit
2. Restore the database from backup
3. Redeploy the previous version

## Performance Considerations

- The streak calculation algorithm is optimized for 35-day views
- Quote selection avoids recent repetitions
- Calendar data is loaded per-month for efficiency
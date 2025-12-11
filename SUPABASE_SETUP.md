# Supabase Setup Instructions

## 1. Run Database Schema

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Click "Run" to execute the SQL

This will create all necessary tables:
- `notes` - For storing notes
- `tasks` - For storing tasks
- `recipe_cards` - For storing recipe cards
- `files` - For storing file metadata
- `activity` - For storing activity logs

## 2. Environment Variables

The `.env` file has been created with your Supabase credentials:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

**Note:** The `.env` file is already in `.gitignore` to keep your credentials secure.

## 3. Authentication Setup

**IMPORTANT:** The app now requires authentication. See `AUTHENTICATION_SETUP.md` for detailed instructions on:
- Creating user accounts
- Setting up shared workspace access
- Testing the login system

## 4. Row Level Security (RLS)

The database schema includes RLS policies that:
- Require authentication to access any data
- Allow all authenticated users to see and edit all data (shared workspace)
- Track `user_id` for each record (optional, for future use)

This setup is perfect for a shared workspace where you and your friend collaborate.

## 5. Verify Connection

After running the schema and creating user accounts:
1. Start the dev server: `npm run dev`
2. Go to `http://localhost:8080`
3. You'll see the login page
4. Log in with credentials created in Supabase
5. All data operations will persist to your Supabase database

## Troubleshooting

If you encounter connection issues:
1. Verify your Supabase URL and anon key in `.env`
2. Check that all tables were created successfully in the Supabase dashboard
3. Check the browser console for any error messages
4. Verify RLS policies allow authenticated users (see schema)
5. Make sure you've created user accounts (see `AUTHENTICATION_SETUP.md`)


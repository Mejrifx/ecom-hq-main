# Authentication Setup Guide

This guide will help you set up authentication for your shared workspace.

## Overview

The app now requires authentication to access. You and your friend will both need accounts to log in. Once logged in, you'll both be able to see and edit all data in the shared workspace.

## Step 1: Run the Updated Database Schema

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to the SQL Editor
3. **IMPORTANT:** If you already ran the old schema, you need to update it. Run this SQL to update the policies:

```sql
-- Drop old policies if they exist
DROP POLICY IF EXISTS "Allow all operations on notes" ON notes;
DROP POLICY IF EXISTS "Allow all operations on tasks" ON tasks;
DROP POLICY IF EXISTS "Allow all operations on recipe_cards" ON recipe_cards;
DROP POLICY IF EXISTS "Allow all operations on files" ON files;
DROP POLICY IF EXISTS "Allow all operations on activity" ON activity;

-- Create new shared workspace policies
CREATE POLICY "Authenticated users can view all notes" ON notes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert notes" ON notes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update all notes" ON notes
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete all notes" ON notes
  FOR DELETE USING (auth.role() = 'authenticated');

-- Repeat for other tables (tasks, recipe_cards, files, activity)
-- See supabase-schema.sql for complete policies
```

4. Or simply run the complete updated `supabase-schema.sql` file (it will handle existing tables)

## Step 2: Create User Accounts

You have two options to create user accounts:

### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"** → **"Create new user"**
4. Enter:
   - **Email**: Your email address (e.g., `you@example.com`)
   - **Password**: A strong password
   - **Auto Confirm User**: ✅ Check this box
5. Click **"Create user"**
6. Repeat for your friend's account

### Option B: Via Supabase CLI (If you have access token)

If you provide your Supabase CLI access token, I can help set this up automatically. Otherwise, use Option A.

## Step 3: Test the Login

1. Start your dev server: `npm run dev`
2. Go to `http://localhost:8080`
3. You should see the login page
4. Enter the email and password you created
5. You should be redirected to the dashboard

## Step 4: Share Credentials Securely

Share the login credentials with your friend securely (use a password manager or encrypted message).

## Security Notes

- Only authenticated users can access the dashboard
- All authenticated users can see and edit all data (shared workspace)
- The `user_id` field tracks who created each item, but everyone can see everything
- Passwords are securely hashed by Supabase
- Sessions are managed automatically

## Troubleshooting

### "Invalid login credentials"
- Double-check email and password
- Make sure the user was created in Supabase
- Check that "Auto Confirm User" was checked when creating the user

### "User not found"
- Verify the user exists in Supabase Authentication → Users
- Make sure the email is correct

### Can't see data after login
- Check that you ran the updated database schema
- Verify RLS policies are set correctly
- Check browser console for errors

### Database connection errors
- Verify your `.env` file has correct Supabase URL and anon key
- Check that Supabase project is active

## Next Steps

Once both users are set up:
1. Both of you can log in with your respective credentials
2. All data created by either user will be visible to both
3. You can collaborate on notes, tasks, and recipes in real-time
4. Use the Settings page to see your account info and sign out





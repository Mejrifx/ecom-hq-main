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
- `files` - For storing file metadata (includes `storage_path` column for Supabase Storage)
- `activity` - For storing activity logs

## 1.1. Create Storage Bucket ⚠️ REQUIRED FOR FILE UPLOADS

**IMPORTANT:** File uploads will fail with "Bucket not found" error until this step is completed!

For file uploads and downloads to work, you need to create a Supabase Storage bucket:

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **New bucket** button
5. Name it exactly: `files` (must match exactly)
6. Choose one of these options:
   - **Option A (Recommended for shared workspace):** Make it **Public** - allows all authenticated users to upload/download
   - **Option B:** Make it **Private** and set up RLS policies (see below)
7. Click **Create bucket**

**Verify the bucket was created:**
- You should see a bucket named `files` in your Storage list
- If you don't see it, refresh the page and check again

**Storage RLS Policies (REQUIRED):**
**IMPORTANT:** Even if you made the bucket public, you may still need RLS policies. Run the SQL from `fix-storage-rls.sql` in your Supabase SQL Editor, or manually add these policies:

1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL from `fix-storage-rls.sql` file, or copy this:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'files');

-- Allow authenticated users to read/download files
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'files');

-- Allow authenticated users to delete files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'files');
```

**Alternative: Make bucket public**
If you prefer, you can make the bucket public instead:
1. Go to Storage → files bucket
2. Click the bucket settings
3. Toggle "Public bucket" to ON
4. This removes the need for RLS policies (but files will be publicly accessible)

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

### File Upload RLS Errors

**Database RLS Error:** If you get "new row violates row-level security policy" when uploading files (database error):

1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL from `fix-files-rls.sql` to fix the database RLS policies

**Storage RLS Error:** If you get "new row violates row-level security policy" from Storage (StorageApiError):

1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL from `fix-storage-rls.sql` to fix the Storage RLS policies
3. Or make your bucket public (see Storage RLS Policies section above)


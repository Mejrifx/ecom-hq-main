-- Remove Whiteboard table and all related objects
-- Run this in your Supabase SQL Editor

-- Step 1: Remove from Realtime publication (if it exists)
-- Note: This will error if table isn't in publication, which is fine
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE whiteboard;
EXCEPTION WHEN OTHERS THEN
  -- Table might not be in publication, ignore error
  NULL;
END $$;

-- Step 2: Drop the trigger
DROP TRIGGER IF EXISTS update_whiteboard_updated_at ON whiteboard;

-- Step 3: Drop RLS policies
DROP POLICY IF EXISTS "Allow all operations on whiteboard" ON whiteboard;
DROP POLICY IF EXISTS "Authenticated users can view whiteboard" ON whiteboard;
DROP POLICY IF EXISTS "Authenticated users can update whiteboard" ON whiteboard;

-- Step 4: Drop the index
DROP INDEX IF EXISTS idx_whiteboard_updated_at;

-- Step 5: Drop the table (this will also drop the foreign key constraint)
DROP TABLE IF EXISTS whiteboard;

-- Verification: Check if table was removed
-- This should return 0 rows if successful
SELECT COUNT(*) as remaining_whiteboard_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'whiteboard';

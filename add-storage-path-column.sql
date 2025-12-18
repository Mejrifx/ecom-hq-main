-- Add storage_path column to files table
-- Run this in your Supabase SQL Editor

-- Check if column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'files' AND column_name = 'storage_path'
  ) THEN
    ALTER TABLE files ADD COLUMN storage_path TEXT;
    RAISE NOTICE 'storage_path column added successfully';
  ELSE
    RAISE NOTICE 'storage_path column already exists';
  END IF;
END $$;

-- Verify the column was added
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'files'
ORDER BY ordinal_position;







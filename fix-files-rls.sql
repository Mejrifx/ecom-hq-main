-- Fix RLS policies for files table
-- Run this in your Supabase SQL Editor

-- First, drop existing policies to start fresh
DROP POLICY IF EXISTS "Allow all operations on files" ON files;
DROP POLICY IF EXISTS "Authenticated users can view all files" ON files;
DROP POLICY IF EXISTS "Authenticated users can insert files" ON files;
DROP POLICY IF EXISTS "Authenticated users can delete all files" ON files;

-- Create policies that allow all authenticated users to work with files
CREATE POLICY "Authenticated users can view all files" ON files
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert files" ON files
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete all files" ON files
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'files';

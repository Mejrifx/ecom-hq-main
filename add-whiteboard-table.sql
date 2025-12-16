-- Add Whiteboard table for real-time collaboration
-- Run this in your Supabase SQL Editor
-- This script is idempotent - safe to run multiple times

-- Whiteboard table (single shared whiteboard)
CREATE TABLE IF NOT EXISTS whiteboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canvas_data TEXT NOT NULL, -- Base64 encoded canvas image
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID, -- User who made the last update
  CONSTRAINT whiteboard_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create a single row for the whiteboard (we'll always update this one row)
INSERT INTO whiteboard (id, canvas_data, updated_at)
VALUES ('00000000-0000-0000-0000-000000000000', '', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create index
CREATE INDEX IF NOT EXISTS idx_whiteboard_updated_at ON whiteboard(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE whiteboard ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on whiteboard" ON whiteboard;
DROP POLICY IF EXISTS "Authenticated users can view whiteboard" ON whiteboard;
DROP POLICY IF EXISTS "Authenticated users can update whiteboard" ON whiteboard;

-- Create RLS policies
CREATE POLICY "Authenticated users can view whiteboard" ON whiteboard
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update whiteboard" ON whiteboard
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Enable Realtime for whiteboard table
ALTER PUBLICATION supabase_realtime ADD TABLE whiteboard;

-- Create trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_whiteboard_updated_at ON whiteboard;
CREATE TRIGGER update_whiteboard_updated_at BEFORE UPDATE ON whiteboard
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created
SELECT 
  id,
  LENGTH(canvas_data) as canvas_data_length,
  updated_at,
  updated_by
FROM whiteboard;

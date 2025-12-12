-- Supabase Database Schema for Ecom HQ
-- Shared workspace for authenticated users
-- This script is idempotent - safe to run multiple times
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID, -- Optional: tracks who created it, but all authenticated users can see it
  CONSTRAINT notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'done')),
  assignee TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID, -- Optional: tracks who created it, but all authenticated users can see it
  CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Recipe cards table
CREATE TABLE IF NOT EXISTS recipe_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  image_url TEXT,
  ingredients TEXT NOT NULL,
  steps TEXT NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  time_minutes INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID, -- Optional: tracks who created it, but all authenticated users can see it
  CONSTRAINT recipe_cards_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  size BIGINT NOT NULL,
  storage_path TEXT, -- Path in Supabase Storage
  added_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID, -- Optional: tracks who created it, but all authenticated users can see it
  CONSTRAINT files_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Card Products table
CREATE TABLE IF NOT EXISTS card_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID, -- Optional: tracks who created it, but all authenticated users can see it
  CONSTRAINT card_products_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT,
  ingredients TEXT NOT NULL,
  instructions TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID, -- Optional: tracks who created it, but all authenticated users can see it
  CONSTRAINT cards_product_id_fkey FOREIGN KEY (product_id) REFERENCES card_products(id) ON DELETE CASCADE,
  CONSTRAINT cards_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add storage_path column if it doesn't exist (for existing databases)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'files' AND column_name = 'storage_path'
  ) THEN
    ALTER TABLE files ADD COLUMN storage_path TEXT;
  END IF;
END $$;

-- Activity log table
CREATE TABLE IF NOT EXISTS activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'duplicated')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('note', 'task', 'recipe', 'cardProduct', 'card')),
  entity_title TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID, -- Optional: tracks who created it, but all authenticated users can see it
  CONSTRAINT activity_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_recipe_cards_user_id ON recipe_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_cards_created_at ON recipe_cards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_card_products_user_id ON card_products(user_id);
CREATE INDEX IF NOT EXISTS idx_card_products_created_at ON card_products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cards_product_id ON cards(product_id);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON cards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON activity(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity(timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (from previous schema)
DROP POLICY IF EXISTS "Allow all operations on notes" ON notes;
DROP POLICY IF EXISTS "Allow all operations on tasks" ON tasks;
DROP POLICY IF EXISTS "Allow all operations on recipe_cards" ON recipe_cards;
DROP POLICY IF EXISTS "Allow all operations on files" ON files;
DROP POLICY IF EXISTS "Allow all operations on card_products" ON card_products;
DROP POLICY IF EXISTS "Allow all operations on cards" ON cards;
DROP POLICY IF EXISTS "Allow all operations on activity" ON activity;

-- Drop new policies if they exist (in case script was run before)
DROP POLICY IF EXISTS "Authenticated users can view all notes" ON notes;
DROP POLICY IF EXISTS "Authenticated users can insert notes" ON notes;
DROP POLICY IF EXISTS "Authenticated users can update all notes" ON notes;
DROP POLICY IF EXISTS "Authenticated users can delete all notes" ON notes;
DROP POLICY IF EXISTS "Authenticated users can view all tasks" ON tasks;
DROP POLICY IF EXISTS "Authenticated users can insert tasks" ON tasks;
DROP POLICY IF EXISTS "Authenticated users can update all tasks" ON tasks;
DROP POLICY IF EXISTS "Authenticated users can delete all tasks" ON tasks;
DROP POLICY IF EXISTS "Authenticated users can view all recipe_cards" ON recipe_cards;
DROP POLICY IF EXISTS "Authenticated users can insert recipe_cards" ON recipe_cards;
DROP POLICY IF EXISTS "Authenticated users can update all recipe_cards" ON recipe_cards;
DROP POLICY IF EXISTS "Authenticated users can delete all recipe_cards" ON recipe_cards;
DROP POLICY IF EXISTS "Authenticated users can view all files" ON files;
DROP POLICY IF EXISTS "Authenticated users can insert files" ON files;
DROP POLICY IF EXISTS "Authenticated users can delete all files" ON files;
DROP POLICY IF EXISTS "Authenticated users can view all card_products" ON card_products;
DROP POLICY IF EXISTS "Authenticated users can insert card_products" ON card_products;
DROP POLICY IF EXISTS "Authenticated users can update all card_products" ON card_products;
DROP POLICY IF EXISTS "Authenticated users can delete all card_products" ON card_products;
DROP POLICY IF EXISTS "Authenticated users can view all cards" ON cards;
DROP POLICY IF EXISTS "Authenticated users can insert cards" ON cards;
DROP POLICY IF EXISTS "Authenticated users can update all cards" ON cards;
DROP POLICY IF EXISTS "Authenticated users can delete all cards" ON cards;
DROP POLICY IF EXISTS "Authenticated users can view all activity" ON activity;
DROP POLICY IF EXISTS "Authenticated users can insert activity" ON activity;

-- Shared workspace policies: All authenticated users can see and modify everything
-- This allows you and your friend to collaborate on all data

-- Notes policies
CREATE POLICY "Authenticated users can view all notes" ON notes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert notes" ON notes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update all notes" ON notes
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete all notes" ON notes
  FOR DELETE USING (auth.role() = 'authenticated');

-- Tasks policies
CREATE POLICY "Authenticated users can view all tasks" ON tasks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert tasks" ON tasks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update all tasks" ON tasks
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete all tasks" ON tasks
  FOR DELETE USING (auth.role() = 'authenticated');

-- Recipe cards policies
CREATE POLICY "Authenticated users can view all recipe_cards" ON recipe_cards
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert recipe_cards" ON recipe_cards
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update all recipe_cards" ON recipe_cards
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete all recipe_cards" ON recipe_cards
  FOR DELETE USING (auth.role() = 'authenticated');

-- Files policies
CREATE POLICY "Authenticated users can view all files" ON files
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert files" ON files
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete all files" ON files
  FOR DELETE USING (auth.role() = 'authenticated');

-- Card Products policies
CREATE POLICY "Authenticated users can view all card_products" ON card_products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert card_products" ON card_products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update all card_products" ON card_products
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete all card_products" ON card_products
  FOR DELETE USING (auth.role() = 'authenticated');

-- Cards policies
CREATE POLICY "Authenticated users can view all cards" ON cards
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert cards" ON cards
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update all cards" ON cards
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete all cards" ON cards
  FOR DELETE USING (auth.role() = 'authenticated');

-- Activity policies
CREATE POLICY "Authenticated users can view all activity" ON activity
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert activity" ON activity
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_card_products_updated_at ON card_products;
CREATE TRIGGER update_card_products_updated_at BEFORE UPDATE ON card_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cards_updated_at ON cards;
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

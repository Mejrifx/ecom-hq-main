-- Add Card Products and Cards tables to Supabase
-- Run this in your Supabase SQL Editor
-- This script is idempotent - safe to run multiple times

-- Card Products table
CREATE TABLE IF NOT EXISTS card_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID,
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
  user_id UUID,
  CONSTRAINT cards_product_id_fkey FOREIGN KEY (product_id) REFERENCES card_products(id) ON DELETE CASCADE,
  CONSTRAINT cards_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_card_products_user_id ON card_products(user_id);
CREATE INDEX IF NOT EXISTS idx_card_products_created_at ON card_products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cards_product_id ON cards(product_id);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON cards(created_at DESC);

-- Enable Row Level Security
ALTER TABLE card_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on card_products" ON card_products;
DROP POLICY IF EXISTS "Allow all operations on cards" ON cards;
DROP POLICY IF EXISTS "Authenticated users can view all card_products" ON card_products;
DROP POLICY IF EXISTS "Authenticated users can insert card_products" ON card_products;
DROP POLICY IF EXISTS "Authenticated users can update all card_products" ON card_products;
DROP POLICY IF EXISTS "Authenticated users can delete all card_products" ON card_products;
DROP POLICY IF EXISTS "Authenticated users can view all cards" ON cards;
DROP POLICY IF EXISTS "Authenticated users can insert cards" ON cards;
DROP POLICY IF EXISTS "Authenticated users can update all cards" ON cards;
DROP POLICY IF EXISTS "Authenticated users can delete all cards" ON cards;

-- Create RLS policies
CREATE POLICY "Authenticated users can view all card_products" ON card_products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert card_products" ON card_products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update all card_products" ON card_products
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete all card_products" ON card_products
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all cards" ON cards
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert cards" ON cards
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update all cards" ON cards
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete all cards" ON cards
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create or replace function to update updated_at timestamp (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_card_products_updated_at ON card_products;
CREATE TRIGGER update_card_products_updated_at BEFORE UPDATE ON card_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cards_updated_at ON cards;
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update activity table to include new entity types
ALTER TABLE activity DROP CONSTRAINT IF EXISTS activity_entity_type_check;
ALTER TABLE activity ADD CONSTRAINT activity_entity_type_check 
  CHECK (entity_type IN ('note', 'task', 'recipe', 'cardProduct', 'card', 'table'));

-- Verify tables were created
SELECT 
  'card_products' as table_name,
  COUNT(*) as row_count
FROM card_products
UNION ALL
SELECT 
  'cards' as table_name,
  COUNT(*) as row_count
FROM cards;





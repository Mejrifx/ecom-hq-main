-- Remove the old recipe_cards table
-- This table has been replaced by card_products and cards tables
-- Run this in your Supabase SQL Editor

-- First, drop any foreign key constraints that might reference recipe_cards
-- (Check if any tables reference recipe_cards - if so, drop those constraints first)

-- Drop RLS policies for recipe_cards
DROP POLICY IF EXISTS "Allow all operations on recipe_cards" ON recipe_cards;
DROP POLICY IF EXISTS "Authenticated users can view all recipe_cards" ON recipe_cards;
DROP POLICY IF EXISTS "Authenticated users can insert recipe_cards" ON recipe_cards;
DROP POLICY IF EXISTS "Authenticated users can update all recipe_cards" ON recipe_cards;
DROP POLICY IF EXISTS "Authenticated users can delete all recipe_cards" ON recipe_cards;

-- Drop indexes on recipe_cards
DROP INDEX IF EXISTS idx_recipe_cards_user_id;
DROP INDEX IF EXISTS idx_recipe_cards_created_at;

-- Drop the recipe_cards table
DROP TABLE IF EXISTS recipe_cards CASCADE;

-- Verify the table was removed
SELECT 
  table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'recipe_cards';

-- If the query returns no rows, the table has been successfully removed





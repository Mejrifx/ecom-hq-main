-- Clean up base64 images from cards table
-- This removes large base64 data URLs that are causing database performance issues
-- Run this in your Supabase SQL Editor

-- STEP 1: First, let's see how many cards are affected
SELECT 
  COUNT(*) as total_cards_with_base64,
  AVG(LENGTH(image_url)) / 1024 as avg_size_kb,
  SUM(LENGTH(image_url)) / 1024 / 1024 as total_size_mb
FROM cards
WHERE image_url IS NOT NULL 
  AND image_url NOT LIKE 'cards/%';

-- STEP 2: Clear base64 images in small batches (run this multiple times if needed)
-- This clears 10 cards at a time to avoid timeout
UPDATE cards 
SET image_url = NULL 
WHERE id IN (
  SELECT id 
  FROM cards 
  WHERE image_url IS NOT NULL 
    AND image_url NOT LIKE 'cards/%'
  LIMIT 10
);

-- STEP 3: Check if there are more to clear (run this after each batch)
SELECT COUNT(*) as remaining_cards_with_base64
FROM cards
WHERE image_url IS NOT NULL AND image_url NOT LIKE 'cards/%';

-- ALTERNATIVE: If you want to just delete all cards with base64 images instead:
-- (Uncomment and run this if you prefer to start fresh)
-- DELETE FROM cards WHERE image_url IS NOT NULL AND image_url NOT LIKE 'cards/%';

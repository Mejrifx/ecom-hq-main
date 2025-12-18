-- Clean up base64 images from cards table
-- This removes large base64 data URLs that are causing database performance issues
-- Run this in your Supabase SQL Editor

-- Option 1: Clear all image_url data (you'll need to re-upload images)
-- Uncomment the line below to run:
-- UPDATE cards SET image_url = NULL WHERE image_url IS NOT NULL AND image_url NOT LIKE 'cards/%';

-- Option 2: View cards with base64 images (to see what will be affected)
SELECT 
  id,
  title,
  LENGTH(image_url) as image_data_size_bytes,
  LENGTH(image_url) / 1024 as image_data_size_kb
FROM cards
WHERE image_url IS NOT NULL 
  AND image_url NOT LIKE 'cards/%'
  AND LENGTH(image_url) > 1000
ORDER BY LENGTH(image_url) DESC;

-- After running Option 2, you can decide whether to:
-- 1. Delete all cards with large images and recreate them
-- 2. Clear just the image_url field (run Option 1)
-- 3. Manually migrate images to Storage (contact support if needed)

-- To clear all card images:
-- UPDATE cards SET image_url = NULL WHERE image_url NOT LIKE 'cards/%';

-- To delete all cards with base64 images:
-- DELETE FROM cards WHERE image_url IS NOT NULL AND image_url NOT LIKE 'cards/%';

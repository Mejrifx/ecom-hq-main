-- Update existing tasks with old assignee names to new ones
-- Run this in your Supabase SQL Editor
-- This script updates tasks that have old assignee names ("You", "Alex", "Kim") to the new ones ("Dave", "Mej")

-- Update "You" to "Dave" (or "Mej" - adjust as needed)
UPDATE tasks 
SET assignee = 'Dave' 
WHERE assignee = 'You';

-- Update "Alex" to "Dave" (or "Mej" - adjust as needed)
UPDATE tasks 
SET assignee = 'Dave' 
WHERE assignee = 'Alex';

-- Update "Kim" to "Mej" (or "Dave" - adjust as needed)
UPDATE tasks 
SET assignee = 'Mej' 
WHERE assignee = 'Kim';

-- Verify the updates
SELECT 
  assignee,
  COUNT(*) as count
FROM tasks
GROUP BY assignee
ORDER BY assignee;

-- This should only show "Dave" and "Mej" after running the script



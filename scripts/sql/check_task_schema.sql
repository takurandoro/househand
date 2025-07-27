-- Check the current task table schema
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if both min_price/max_price and budget_min/budget_max exist
SELECT 
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND table_schema = 'public'
AND column_name IN ('min_price', 'max_price', 'budget_min', 'budget_max');

-- Check a sample task to see what fields are populated
SELECT 
  id,
  title,
  min_price,
  max_price,
  budget_min,
  budget_max,
  created_at
FROM tasks 
LIMIT 3; 
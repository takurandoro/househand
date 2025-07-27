-- Check the actual database schema to see what fields exist
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Specifically check for price-related columns
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND table_schema = 'public'
AND column_name LIKE '%price%' OR column_name LIKE '%budget%'
ORDER BY column_name;

-- Check if we can insert with min_price/max_price
INSERT INTO tasks (
  title,
  description,
  category,
  location,
  min_price,
  max_price,
  hours,
  client_id,
  status,
  payment_status
) VALUES (
  'Test with min_price/max_price',
  'Testing the correct field names',
  'cleaning',
  'Test Location',
  1000,
  2000,
  '1-2 hours',
  '82b33cda-9654-438a-a6af-3a4757553e09',
  'open',
  false
) RETURNING id, title, min_price, max_price, status; 
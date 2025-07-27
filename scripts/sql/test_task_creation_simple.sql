-- Simple test to create a task with minimal required fields
-- This will help identify if the issue is with the data or the schema

-- Test 1: Check if we can insert a basic task
INSERT INTO tasks (
  title,
  description,
  category,
  location,
  budget_min,
  budget_max,
  hours,
  client_id,
  status,
  payment_status
) VALUES (
  'Test Task',
  'This is a test task',
  'cleaning',
  'Test Location',
  1000,
  2000,
  '1-2 hours',
  '82b33cda-9654-438a-a6af-3a4757553e09',
  'open',
  false
) RETURNING id, title, category, budget_min, budget_max, status;

-- Test 2: Check the current schema
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND table_schema = 'public'
AND column_name IN ('budget_min', 'budget_max', 'category', 'hours')
ORDER BY column_name;

-- Test 3: Check if the enum values are correct
SELECT unnest(enum_range(NULL::task_category)) as valid_categories; 
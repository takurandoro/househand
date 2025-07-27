-- Test task creation with correct category values
-- This script tests that all valid task categories work

-- Test 1: Create a task with 'home_maintenance' category
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
  payment_status,
  created_at,
  updated_at
) VALUES (
  'Test Home Maintenance Task',
  'This is a test task for home maintenance',
  'home_maintenance',
  'Kanombe, Kigali',
  5000,
  10000,
  '2-4 hours',
  '82b33cda-9654-438a-a6af-3a4757553e09', -- Use a valid user ID
  'open',
  false,
  NOW(),
  NOW()
) RETURNING id, title, category, status;

-- Test 2: Create a task with 'cleaning' category
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
  payment_status,
  created_at,
  updated_at
) VALUES (
  'Test Cleaning Task',
  'This is a test task for cleaning',
  'cleaning',
  'Kanombe, Kigali',
  3000,
  6000,
  '1-2 hours',
  '82b33cda-9654-438a-a6af-3a4757553e09',
  'open',
  false,
  NOW(),
  NOW()
) RETURNING id, title, category, status;

-- Test 3: Check all valid categories
SELECT unnest(enum_range(NULL::task_category)) as valid_categories;

-- Test 4: Check recent tasks
SELECT 
  id,
  title,
  category,
  status,
  created_at
FROM tasks 
WHERE client_id = '82b33cda-9654-438a-a6af-3a4757553e09'
ORDER BY created_at DESC
LIMIT 5; 
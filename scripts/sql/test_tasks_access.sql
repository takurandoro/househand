-- Test tasks table access after fixing policies

-- Test 1: Check if we can see any tasks at all
SELECT 
    id,
    title,
    status,
    client_id,
    selected_helper_id,
    created_at
FROM tasks 
LIMIT 5;

-- Test 2: Check tasks by status
SELECT 
    status,
    COUNT(*) as count
FROM tasks 
GROUP BY status
ORDER BY status;

-- Test 3: Check tasks for a specific user (replace 'user-id-here' with actual user ID)
-- SELECT 
--     id,
--     title,
--     status,
--     client_id,
--     selected_helper_id
-- FROM tasks 
-- WHERE client_id = 'user-id-here' OR selected_helper_id = 'user-id-here'
-- LIMIT 10;

-- Test 4: Check open tasks (should be visible to helpers)
SELECT 
    id,
    title,
    description,
    category,
    location,
    budget_min,
    budget_max,
    status,
    created_at
FROM tasks 
WHERE status = 'open'
ORDER BY created_at DESC
LIMIT 5; 
-- Test simple queries that should work with current RLS policies

-- Test 1: Simple tasks query
SELECT 
    id,
    title,
    status,
    client_id,
    created_at
FROM tasks 
LIMIT 5;

-- Test 2: Simple bids query
SELECT 
    id,
    helper_id,
    task_id,
    status,
    created_at
FROM bids 
LIMIT 5;

-- Test 3: Simple profiles query
SELECT 
    id,
    full_name,
    user_type,
    created_at
FROM profiles 
LIMIT 5;

-- Test 4: Tasks for specific user (client)
SELECT 
    id,
    title,
    status,
    client_id,
    created_at
FROM tasks 
WHERE client_id = '82b33cda-9654-438a-a6af-3a4757553e09'
LIMIT 5;

-- Test 5: Open tasks (for helpers)
SELECT 
    id,
    title,
    status,
    location,
    budget_min,
    budget_max,
    created_at
FROM tasks 
WHERE status = 'open'
ORDER BY created_at DESC
LIMIT 5;

-- Test 6: Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('tasks', 'bids', 'profiles');

-- Test 7: Check current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('tasks', 'bids', 'profiles')
ORDER BY tablename, policyname; 
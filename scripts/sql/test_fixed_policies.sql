-- Test if the recursion issue is fixed

-- Test 1: Check if we can query tasks without recursion error
SELECT 
    id,
    title,
    status,
    client_id,
    created_at
FROM tasks 
LIMIT 5;

-- Test 2: Check if we can query bids without recursion error
SELECT 
    id,
    helper_id,
    task_id,
    status,
    created_at
FROM bids 
LIMIT 5;

-- Test 3: Check if we can query tasks with bids (the problematic query)
SELECT 
    t.id,
    t.title,
    t.status,
    t.client_id,
    COUNT(b.id) as bid_count
FROM tasks t
LEFT JOIN bids b ON t.id = b.task_id
GROUP BY t.id, t.title, t.status, t.client_id
LIMIT 5;

-- Test 4: Check tasks for a specific user
SELECT 
    id,
    title,
    status,
    client_id,
    selected_helper_id
FROM tasks 
WHERE client_id = '82b33cda-9654-438a-a6af-3a4757553e09'
   OR selected_helper_id = '82b33cda-9654-438a-a6af-3a4757553e09'
LIMIT 10; 
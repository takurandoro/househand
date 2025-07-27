-- Debug user and tasks

-- Check the current user's profile
SELECT 
    id,
    full_name,
    email,
    user_type,
    created_at
FROM profiles 
WHERE id = '82b33cda-9654-438a-a6af-3a4757553e09';

-- Check if this user has any tasks as a client
SELECT 
    id,
    title,
    status,
    client_id,
    created_at
FROM tasks 
WHERE client_id = '82b33cda-9654-438a-a6af-3a4757553e09';

-- Check if this user has any bids as a helper
SELECT 
    id,
    helper_id,
    task_id,
    status,
    created_at
FROM bids 
WHERE helper_id = '82b33cda-9654-438a-a6af-3a4757553e09';

-- Check if this user is assigned to any tasks as a helper
SELECT 
    id,
    title,
    status,
    selected_helper_id,
    created_at
FROM tasks 
WHERE selected_helper_id = '82b33cda-9654-438a-a6af-3a4757553e09';

-- Count total tasks by status
SELECT 
    status,
    COUNT(*) as count
FROM tasks 
GROUP BY status
ORDER BY status;

-- Count tasks by client
SELECT 
    client_id,
    COUNT(*) as task_count
FROM tasks 
GROUP BY client_id
ORDER BY task_count DESC
LIMIT 10; 
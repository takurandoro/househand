-- Temporarily disable RLS to test if that's the issue
-- WARNING: This is for testing only - do not use in production!

-- Disable RLS on tasks table
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- Disable RLS on bids table  
ALTER TABLE bids DISABLE ROW LEVEL SECURITY;

-- Disable RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Test if we can now query tasks
SELECT 
    id,
    title,
    status,
    client_id,
    created_at
FROM tasks 
LIMIT 5;

-- Test the complex query that was failing
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
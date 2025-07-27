-- Check current RLS policies on tasks table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'tasks'
ORDER BY policyname;

-- Check if RLS is enabled on tasks table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'tasks';

-- Check total count of tasks
SELECT COUNT(*) as total_tasks
FROM tasks;

-- Check tasks by status
SELECT 
    status,
    COUNT(*) as count
FROM tasks 
GROUP BY status
ORDER BY status; 
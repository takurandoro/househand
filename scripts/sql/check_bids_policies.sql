-- Check current RLS policies on bids table
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
WHERE tablename = 'bids'
ORDER BY policyname;

-- Check if RLS is enabled on bids table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'bids';

-- Check total count of bids
SELECT COUNT(*) as total_bids
FROM bids;

-- Check bids by status
SELECT 
    status,
    COUNT(*) as count
FROM bids 
GROUP BY status
ORDER BY status; 
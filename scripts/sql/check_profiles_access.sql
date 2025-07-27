-- Check profiles table RLS status and policies
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- Check existing policies on profiles table
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
WHERE tablename = 'profiles';

-- Check if we can access profiles data
SELECT 
    id,
    full_name,
    avatar_url,
    location,
    created_at
FROM profiles 
LIMIT 5;

-- Check if there are any profiles with full_name
SELECT 
    COUNT(*) as total_profiles,
    COUNT(full_name) as profiles_with_name,
    COUNT(*) - COUNT(full_name) as profiles_without_name
FROM profiles; 
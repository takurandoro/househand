-- Simple test to check profiles access
-- This should work for any authenticated user

-- Check if we can read profiles at all
SELECT 
    'Profiles table accessible' as test,
    COUNT(*) as total_profiles
FROM profiles;

-- Check if we can read specific profile fields
SELECT 
    'Profile fields accessible' as test,
    id,
    full_name,
    avatar_url,
    location
FROM profiles 
LIMIT 3;

-- Check if there are any profiles with actual names
SELECT 
    'Profiles with names' as test,
    COUNT(*) as total,
    COUNT(full_name) as with_names,
    COUNT(*) - COUNT(full_name) as without_names
FROM profiles;

-- Check sample profiles to see what data exists
SELECT 
    'Sample profiles' as test,
    id,
    full_name,
    COALESCE(full_name, 'NULL') as name_status,
    created_at
FROM profiles 
ORDER BY created_at DESC
LIMIT 5; 
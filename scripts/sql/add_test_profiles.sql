-- Add test profiles with proper names if they don't exist
-- This will help resolve the "Anonymous Client" issue

-- First, let's see what profiles exist
SELECT 
    'Existing profiles' as info,
    id,
    full_name,
    email,
    created_at
FROM profiles 
ORDER BY created_at DESC
LIMIT 10;

-- Update profiles that don't have full_name
-- This will set a default name for profiles without names
UPDATE profiles 
SET 
    full_name = COALESCE(full_name, 'Client ' || SUBSTRING(id::text, 1, 8)),
    updated_at = NOW()
WHERE full_name IS NULL OR full_name = '';

-- Check if there are any profiles that still don't have names
SELECT 
    'Profiles still without names' as info,
    COUNT(*) as count
FROM profiles 
WHERE full_name IS NULL OR full_name = '';

-- Show updated profiles
SELECT 
    'Updated profiles' as info,
    id,
    full_name,
    email,
    updated_at
FROM profiles 
ORDER BY updated_at DESC
LIMIT 10;

-- Verify the fix worked
SELECT 
    'Final check' as info,
    COUNT(*) as total_profiles,
    COUNT(full_name) as profiles_with_names,
    COUNT(*) - COUNT(full_name) as profiles_without_names
FROM profiles; 
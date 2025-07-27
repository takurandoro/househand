-- Test profiles table access
-- This should work for helper profiles

SELECT 
    id,
    full_name,
    user_type,
    created_at
FROM profiles 
WHERE user_type = 'helper'
LIMIT 5;

-- Test with specific fields
SELECT 
    id,
    full_name,
    bio,
    avatar_url,
    location,
    user_type,
    created_at
FROM profiles 
WHERE user_type = 'helper'
ORDER BY created_at DESC
LIMIT 3; 
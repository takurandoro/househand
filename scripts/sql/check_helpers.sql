-- Check helpers in the database
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
LIMIT 10; 
-- Create a function to get helper profiles
CREATE OR REPLACE FUNCTION get_helper_profiles(helper_ids UUID[])
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  avatar_url TEXT,
  location TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    (au.raw_user_meta_data->>'full_name')::TEXT as full_name,
    (au.raw_user_meta_data->>'avatar_url')::TEXT as avatar_url,
    (au.raw_user_meta_data->>'location')::TEXT as location
  FROM auth.users au
  WHERE au.id = ANY(helper_ids);
END;
$$; 
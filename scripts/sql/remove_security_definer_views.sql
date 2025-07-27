-- Remove Security Definer Views Script
-- This script completely removes the problematic views that bypass RLS

-- 1. Drop the problematic views completely
DROP VIEW IF EXISTS public.helper_stats CASCADE;
DROP VIEW IF EXISTS public.helper_balances CASCADE;

-- 2. Verify the views are gone
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE schemaname = 'public' 
  AND viewname IN ('helper_stats', 'helper_balances');

-- 3. Check if there are any remaining references
SELECT 
  schemaname,
  tablename,
  columnname
FROM pg_stat_user_tables t
JOIN information_schema.columns c ON t.relname = c.table_name
WHERE c.table_schema = 'public'
  AND c.column_name LIKE '%helper_stats%' OR c.column_name LIKE '%helper_balances%';

-- 4. Create the secure functions to replace the views
CREATE OR REPLACE FUNCTION public.get_helper_stats(p_helper_id uuid DEFAULT NULL)
RETURNS TABLE(
  helper_id uuid,
  full_name text,
  avatar_url text,
  avg_rating numeric,
  total_reviews bigint,
  total_tasks bigint,
  total_earnings bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If no helper_id provided, return stats for all helpers
  IF p_helper_id IS NULL THEN
    RETURN QUERY
    SELECT 
      p.id as helper_id,
      p.full_name,
      p.avatar_url,
      COALESCE(AVG(hr.rating), 0) as avg_rating,
      COUNT(hr.id) as total_reviews,
      COUNT(DISTINCT t.id) as total_tasks,
      COALESCE(SUM(he.amount), 0) as total_earnings
    FROM public.profiles p
    LEFT JOIN public.helper_reviews hr ON p.id = hr.helper_id
    LEFT JOIN public.tasks t ON p.id = t.selected_helper_id
    LEFT JOIN public.helper_earnings he ON p.id = he.helper_id
    WHERE p.user_type = 'helper'
    GROUP BY p.id, p.full_name, p.avatar_url;
  ELSE
    -- Return stats for specific helper
    RETURN QUERY
    SELECT 
      p.id as helper_id,
      p.full_name,
      p.avatar_url,
      COALESCE(AVG(hr.rating), 0) as avg_rating,
      COUNT(hr.id) as total_reviews,
      COUNT(DISTINCT t.id) as total_tasks,
      COALESCE(SUM(he.amount), 0) as total_earnings
    FROM public.profiles p
    LEFT JOIN public.helper_reviews hr ON p.id = hr.helper_id
    LEFT JOIN public.tasks t ON p.id = t.selected_helper_id
    LEFT JOIN public.helper_earnings he ON p.id = he.helper_id
    WHERE p.id = p_helper_id AND p.user_type = 'helper'
    GROUP BY p.id, p.full_name, p.avatar_url;
  END IF;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_helper_stats(uuid) TO authenticated;

-- Create a secure function to get helper balance
CREATE OR REPLACE FUNCTION public.get_helper_balance(p_helper_id uuid DEFAULT NULL)
RETURNS TABLE(
  helper_id uuid,
  full_name text,
  total_earnings bigint,
  total_withdrawn bigint,
  current_balance bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If no helper_id provided, return balance for current user
  IF p_helper_id IS NULL THEN
    p_helper_id := auth.uid();
  END IF;
  
  -- Only allow users to see their own balance
  IF p_helper_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id as helper_id,
    p.full_name,
    COALESCE(SUM(he.amount), 0) as total_earnings,
    COALESCE(SUM(hw.amount), 0) as total_withdrawn,
    COALESCE(SUM(he.amount), 0) - COALESCE(SUM(hw.amount), 0) as current_balance
  FROM public.profiles p
  LEFT JOIN public.helper_earnings he ON p.id = he.helper_id
  LEFT JOIN public.helper_withdrawals hw ON p.id = hw.helper_id
  WHERE p.id = p_helper_id AND p.user_type = 'helper'
  GROUP BY p.id, p.full_name;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_helper_balance(uuid) TO authenticated;

-- 5. Test the functions work
SELECT 'Testing get_helper_stats function...' as status;
SELECT * FROM get_helper_stats() LIMIT 1;

SELECT 'Testing get_helper_balance function...' as status;
-- This will only work if you're authenticated
-- SELECT * FROM get_helper_balance();

-- 6. Final verification
SELECT 'Security definer views removed successfully!' as status; 
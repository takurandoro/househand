-- Check Existing Views Script
-- This script shows all views and their properties

-- Check all views in public schema
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- Check if helper_stats and helper_balances exist
SELECT 
  schemaname,
  viewname,
  CASE 
    WHEN definition LIKE '%SECURITY DEFINER%' THEN 'SECURITY DEFINER'
    ELSE 'Normal'
  END as security_type
FROM pg_views 
WHERE schemaname = 'public' 
  AND viewname IN ('helper_stats', 'helper_balances');

-- Check all functions that might be related
SELECT 
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND (p.proname LIKE '%helper%' OR p.proname LIKE '%stats%' OR p.proname LIKE '%balance%')
ORDER BY p.proname; 
-- Check for any functions that reference social_fund_contributions
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND pg_get_functiondef(p.oid) ILIKE '%social_fund_contributions%';

-- Check for any views that reference social_fund_contributions
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views
WHERE schemaname = 'public'
AND definition ILIKE '%social_fund_contributions%';

-- Check for any triggers that might reference social_fund_contributions
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND action_statement ILIKE '%social_fund_contributions%'; 
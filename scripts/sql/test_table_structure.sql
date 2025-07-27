-- Test Table Structure Script
-- Run this first to verify your table structure before applying security fixes

-- Check if tables exist and their structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'payments', 'helper_reviews', 'bids', 'notifications', 'transactions', 'helper_withdrawals')
ORDER BY table_name, ordinal_position;

-- Check current RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'payments', 'helper_reviews', 'bids', 'notifications', 'transactions', 'helper_withdrawals');

-- Check if views exist
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE schemaname = 'public' 
  AND viewname IN ('helper_stats', 'helper_balances');

-- Test basic queries to ensure tables are accessible
SELECT 'profiles' as table_name, COUNT(*) as row_count FROM public.profiles
UNION ALL
SELECT 'payments' as table_name, COUNT(*) as row_count FROM public.payments
UNION ALL
SELECT 'helper_reviews' as table_name, COUNT(*) as row_count FROM public.helper_reviews
UNION ALL
SELECT 'bids' as table_name, COUNT(*) as row_count FROM public.bids
UNION ALL
SELECT 'notifications' as table_name, COUNT(*) as row_count FROM public.notifications
UNION ALL
SELECT 'transactions' as table_name, COUNT(*) as row_count FROM public.transactions
UNION ALL
SELECT 'helper_withdrawals' as table_name, COUNT(*) as row_count FROM public.helper_withdrawals; 
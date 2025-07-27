# 🔒 Database Security Fixes Guide

## 🚨 Critical Security Issues Found

Your database has several **CRITICAL** security vulnerabilities that must be fixed before going to production:

### 1. **Security Definer Views** (2 errors)
- `helper_stats` view bypasses Row Level Security
- `helper_balances` view bypasses Row Level Security

### 2. **RLS Disabled** (8 errors)
- Multiple tables have Row Level Security disabled
- This means **anyone can access all data** in these tables

## 🛠️ How to Fix These Issues

### Option 1: Run the SQL Script (Recommended)

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the entire contents of `scripts/sql/fix_security_issues.sql`**
4. **Click "Run"**

This will automatically fix all security issues.

### Option 2: Run the Migration

If you're using Supabase CLI:

```bash
# Apply the security fixes migration
supabase db push
```

### Option 3: Manual Fix (Not Recommended)

If you prefer to fix issues one by one, run these commands in Supabase SQL Editor:

#### Step 1: Enable RLS on All Tables
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helper_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helper_withdrawals ENABLE ROW LEVEL SECURITY;
```

#### Step 2: Create RLS Policies
```sql
-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Add more policies as shown in the full script...
```

#### Step 3: Fix Security Definer Views
```sql
-- Drop and recreate views without SECURITY DEFINER
DROP VIEW IF EXISTS public.helper_stats;
DROP VIEW IF EXISTS public.helper_balances;

-- Recreate with proper RLS policies
CREATE VIEW public.helper_stats AS
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

CREATE POLICY "Anyone can view helper stats" ON public.helper_stats FOR SELECT USING (true);
```

## ✅ Verification Steps

After applying the fixes, verify they worked:

### 1. Check RLS Status
```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'payments', 'helper_reviews', 'bids', 'notifications', 'transactions', 'helper_withdrawals');
```

All should show `t` (true) for `rowsecurity`.

### 2. Check Policies
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public';
```

You should see policies for all tables.

### 3. Test Security
```sql
-- This should only return your own profile
SELECT * FROM public.profiles;

-- This should only return your own notifications
SELECT * FROM public.notifications;
```

## 🔧 Application Code Updates

The security fixes include new secure functions to replace the views:

### New Functions Available:
- `get_helper_stats(helper_id)` - Get helper statistics securely
- `get_helper_balance(helper_id)` - Get helper balance securely

### Updated API Functions:
```typescript
// Use these instead of direct view access
import { getHelperStats, getHelperBalance } from '@/api/profiles';

// Get stats for all helpers
const stats = await getHelperStats();

// Get stats for specific helper
const helperStats = await getHelperStats(helperId);

// Get balance for current user
const balance = await getHelperBalance();
```

## 🚨 Important Notes

### 1. **Data Access Changes**
After applying RLS, users will only see their own data:
- Users can only see their own profiles
- Helpers can only see their own bids
- Clients can only see bids on their tasks
- Users can only see their own notifications

### 2. **System Functions**
Some functions still use `SECURITY DEFINER` because they need to bypass RLS for system operations:
- `process_task_payment()` - Processes payments
- `get_helper_stats()` - Gets helper statistics
- `get_helper_balance()` - Gets helper balance

### 3. **Performance Impact**
RLS adds a small performance overhead, but the security benefits far outweigh this cost.

## 🔍 Troubleshooting

### Common Issues:

1. **"Access denied" errors**
   - Check if user is authenticated
   - Verify RLS policies are correct
   - Ensure user has proper permissions

2. **Functions not found**
   - Make sure the migration ran successfully
   - Check if functions were created properly

3. **Data not visible**
   - This is expected behavior with RLS
   - Users should only see their own data
   - Use secure functions for cross-user data access

### Debug Commands:
```sql
-- Check current user
SELECT auth.uid();

-- Check RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Test function access
SELECT * FROM get_helper_stats();
```

## ✅ Success Criteria

After applying fixes, you should see:
- ✅ No security errors in Supabase linter
- ✅ All tables have RLS enabled
- ✅ All tables have appropriate policies
- ✅ Views are recreated without SECURITY DEFINER
- ✅ Application still works correctly
- ✅ Users can only access their own data

## 🎯 Next Steps

1. **Apply the security fixes immediately**
2. **Test your application thoroughly**
3. **Verify all functionality still works**
4. **Deploy to production with confidence**

**⚠️ DO NOT deploy to production without fixing these security issues!** 
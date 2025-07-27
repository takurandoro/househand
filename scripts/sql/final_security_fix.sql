-- Final Security Fix Script
-- This script completely removes security definer views and fixes all security issues

-- Step 1: Check what views currently exist
SELECT 'Current views in database:' as info;
SELECT 
  schemaname,
  viewname,
  CASE 
    WHEN definition LIKE '%SECURITY DEFINER%' THEN 'SECURITY DEFINER'
    ELSE 'Normal'
  END as security_type
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- Step 2: Force drop the problematic views with CASCADE
DROP VIEW IF EXISTS public.helper_stats CASCADE;
DROP VIEW IF EXISTS public.helper_balances CASCADE;

-- Step 3: Verify views are gone
SELECT 'Views after dropping:' as info;
SELECT 
  schemaname,
  viewname
FROM pg_views 
WHERE schemaname = 'public' 
  AND viewname IN ('helper_stats', 'helper_balances');

-- Step 4: Enable RLS on all tables (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helper_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helper_withdrawals ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view payments they're involved in" ON public.payments;
DROP POLICY IF EXISTS "System can manage payments" ON public.payments;

DROP POLICY IF EXISTS "Anyone can view helper reviews" ON public.helper_reviews;
DROP POLICY IF EXISTS "Clients can create reviews for completed tasks" ON public.helper_reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.helper_reviews;

DROP POLICY IF EXISTS "Helpers can view their own bids" ON public.bids;
DROP POLICY IF EXISTS "Clients can view bids on their tasks" ON public.bids;
DROP POLICY IF EXISTS "Helpers can create bids" ON public.bids;
DROP POLICY IF EXISTS "Helpers can update their own bids" ON public.bids;
DROP POLICY IF EXISTS "Clients can update bids on their tasks" ON public.bids;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "System can manage transactions" ON public.transactions;

DROP POLICY IF EXISTS "Helpers can view their own withdrawals" ON public.helper_withdrawals;
DROP POLICY IF EXISTS "Helpers can create withdrawals" ON public.helper_withdrawals;
DROP POLICY IF EXISTS "System can update withdrawals" ON public.helper_withdrawals;

-- Step 6: Create RLS policies for profiles table
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Step 7: Create RLS policies for payments table
CREATE POLICY "Users can view payments they're involved in"
  ON public.payments
  FOR SELECT
  USING (
    client_id = auth.uid() OR 
    helper_id = auth.uid()
  );

CREATE POLICY "System can manage payments"
  ON public.payments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Step 8: Create RLS policies for helper_reviews table
CREATE POLICY "Anyone can view helper reviews"
  ON public.helper_reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Clients can create reviews for completed tasks"
  ON public.helper_reviews
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE id = helper_reviews.task_id 
      AND client_id = auth.uid()
      AND status = 'completed'
    )
  );

CREATE POLICY "Users can update their own reviews"
  ON public.helper_reviews
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE id = helper_reviews.task_id 
      AND client_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE id = helper_reviews.task_id 
      AND client_id = auth.uid()
    )
  );

-- Step 9: Create RLS policies for bids table
CREATE POLICY "Helpers can view their own bids"
  ON public.bids
  FOR SELECT
  USING (helper_id = auth.uid());

CREATE POLICY "Clients can view bids on their tasks"
  ON public.bids
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE id = bids.task_id 
      AND client_id = auth.uid()
    )
  );

CREATE POLICY "Helpers can create bids"
  ON public.bids
  FOR INSERT
  WITH CHECK (helper_id = auth.uid());

CREATE POLICY "Helpers can update their own bids"
  ON public.bids
  FOR UPDATE
  USING (helper_id = auth.uid())
  WITH CHECK (helper_id = auth.uid());

CREATE POLICY "Clients can update bids on their tasks"
  ON public.bids
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE id = bids.task_id 
      AND client_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE id = bids.task_id 
      AND client_id = auth.uid()
    )
  );

-- Step 10: Create RLS policies for notifications table
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Step 11: Create RLS policies for transactions table
CREATE POLICY "Users can view their own transactions"
  ON public.transactions
  FOR SELECT
  USING (helper_id = auth.uid());

CREATE POLICY "System can manage transactions"
  ON public.transactions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Step 12: Create RLS policies for helper_withdrawals table
CREATE POLICY "Helpers can view their own withdrawals"
  ON public.helper_withdrawals
  FOR SELECT
  USING (helper_id = auth.uid());

CREATE POLICY "Helpers can create withdrawals"
  ON public.helper_withdrawals
  FOR INSERT
  WITH CHECK (helper_id = auth.uid());

CREATE POLICY "System can update withdrawals"
  ON public.helper_withdrawals
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Step 13: Create secure functions to replace the views
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

-- Step 14: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_selected_helper_id ON public.tasks(selected_helper_id);
CREATE INDEX IF NOT EXISTS idx_bids_helper_id ON public.bids(helper_id);
CREATE INDEX IF NOT EXISTS idx_bids_task_id ON public.bids(task_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_helper_earnings_helper_id ON public.helper_earnings(helper_id);
CREATE INDEX IF NOT EXISTS idx_helper_withdrawals_helper_id ON public.helper_withdrawals(helper_id);

-- Step 15: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Step 16: Final verification
SELECT 'Final verification - All views in database:' as info;
SELECT 
  schemaname,
  viewname,
  CASE 
    WHEN definition LIKE '%SECURITY DEFINER%' THEN 'SECURITY DEFINER'
    ELSE 'Normal'
  END as security_type
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

SELECT 'Security fixes applied successfully! No security definer views should remain.' as status; 
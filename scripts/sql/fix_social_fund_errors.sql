-- Drop any functions that reference social_fund_contributions
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT p.proname as function_name
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND pg_get_functiondef(p.oid) ILIKE '%social_fund_contributions%'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.function_name || ' CASCADE';
        RAISE NOTICE 'Dropped function: %', func_record.function_name;
    END LOOP;
END $$;

-- Drop any views that reference social_fund_contributions
DO $$
DECLARE
    view_record RECORD;
BEGIN
    FOR view_record IN 
        SELECT viewname
        FROM pg_views
        WHERE schemaname = 'public'
        AND definition ILIKE '%social_fund_contributions%'
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS ' || view_record.viewname || ' CASCADE';
        RAISE NOTICE 'Dropped view: %', view_record.viewname;
    END LOOP;
END $$;

-- Update helper_withdrawals table to remove social_fund_amount column if it exists
ALTER TABLE helper_withdrawals DROP COLUMN IF EXISTS social_fund_amount;

-- Update the process_withdrawal function to not use social_fund_amount
CREATE OR REPLACE FUNCTION process_withdrawal(
  p_helper_id UUID,
  p_amount INTEGER
) RETURNS helper_withdrawals AS $$
DECLARE
  v_withdrawal helper_withdrawals;
BEGIN
  -- Create withdrawal record
  INSERT INTO helper_withdrawals (
    helper_id,
    amount,
    status,
    created_at,
    completed_at
  ) VALUES (
    p_helper_id,
    p_amount,
    'completed',
    NOW(),
    NOW()
  ) RETURNING * INTO v_withdrawal;

  -- Update earnings status
  UPDATE helper_earnings
  SET status = 'withdrawn',
      withdrawn_at = NOW()
  WHERE helper_id = p_helper_id
  AND status = 'paid';

  RETURN v_withdrawal;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
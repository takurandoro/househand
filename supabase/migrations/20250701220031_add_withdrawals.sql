-- Add withdrawn_at column to helper_earnings
ALTER TABLE helper_earnings
ADD COLUMN IF NOT EXISTS withdrawn_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'paid'
  CHECK (status IN ('paid', 'withdrawn'));

-- Create helper_withdrawals table
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS helper_withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    helper_id UUID NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    social_fund_amount INTEGER NOT NULL CHECK (social_fund_amount >= 0),
    status TEXT NOT NULL DEFAULT 'completed'
      CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
  );

  -- Add foreign key if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'helper_withdrawals_helper_id_fkey'
  ) THEN
    ALTER TABLE helper_withdrawals
    ADD CONSTRAINT helper_withdrawals_helper_id_fkey
    FOREIGN KEY (helper_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add RLS policies for helper_withdrawals
ALTER TABLE helper_withdrawals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Helpers can view their own withdrawals" ON helper_withdrawals;
DROP POLICY IF EXISTS "Helpers can create withdrawals" ON helper_withdrawals;

-- Helpers can view their own withdrawals
CREATE POLICY "Helpers can view their own withdrawals"
  ON helper_withdrawals
  FOR SELECT
  USING (auth.uid() = helper_id);

-- Helpers can create withdrawals
CREATE POLICY "Helpers can create withdrawals"
  ON helper_withdrawals
  FOR INSERT
  WITH CHECK (auth.uid() = helper_id);

-- Create or replace function to process withdrawals
CREATE OR REPLACE FUNCTION process_withdrawal(
  p_helper_id UUID,
  p_amount INTEGER,
  p_social_fund_amount INTEGER
) RETURNS helper_withdrawals AS $$
DECLARE
  v_withdrawal helper_withdrawals;
BEGIN
  -- Create withdrawal record
  INSERT INTO helper_withdrawals (
    helper_id,
    amount,
    social_fund_amount,
    status,
    created_at,
    completed_at
  ) VALUES (
    p_helper_id,
    p_amount,
    p_social_fund_amount,
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
-- Drop existing enum type if it exists
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_effort') THEN
    ALTER TABLE public.tasks ALTER COLUMN effort_level DROP DEFAULT;
    DROP TYPE task_effort CASCADE;
  END IF;
END $$;

-- Create enum type with correct values
CREATE TYPE task_effort AS ENUM (
  '1-2 hours',
  '2-4 hours',
  '4-6 hours',
  '6-8 hours',
  '8-12 hours',
  '12-24 hours',
  '24-48 hours',
  '48+ hours'
);

-- Add missing columns to tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS payment_status boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS budget_min integer,
ADD COLUMN IF NOT EXISTS budget_max integer,
ADD COLUMN IF NOT EXISTS effort_level task_effort,
ADD COLUMN IF NOT EXISTS hours text;

-- Drop the old constraint if it exists
DO $$ 
BEGIN 
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'tasks_effort_level_check'
  ) THEN
    ALTER TABLE public.tasks DROP CONSTRAINT tasks_effort_level_check;
  END IF;
END $$;

-- Grant necessary permissions
GRANT ALL ON TABLE public.tasks TO authenticated;
GRANT ALL ON TABLE public.tasks TO anon;

-- Add payment-related columns to tasks table
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS payment_amount INTEGER,
  ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ;

-- Update existing tasks to have payment_status = false
UPDATE public.tasks SET payment_status = FALSE WHERE payment_status IS NULL;

-- Make payment_status non-nullable after setting default value
ALTER TABLE public.tasks ALTER COLUMN payment_status SET NOT NULL; 
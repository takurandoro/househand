-- Drop the existing task_category enum if it exists
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_category') THEN
    DROP TYPE task_category CASCADE;
  END IF;
END $$;

-- Create the task_category enum type
CREATE TYPE task_category AS ENUM (
  'cleaning',
  'gardening',
  'moving',
  'home_maintenance',
  'other'
);

-- Add category column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tasks' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE public.tasks 
    ADD COLUMN category task_category NOT NULL DEFAULT 'other'::task_category;
  ELSE
    -- If column exists, temporarily convert to text to handle any invalid values
    ALTER TABLE public.tasks 
    ALTER COLUMN category TYPE text;

    -- Update any invalid category values to 'other'
    UPDATE public.tasks 
    SET category = 'other' 
    WHERE category NOT IN ('cleaning', 'gardening', 'moving', 'home_maintenance', 'other');

    -- Convert category column to use task_category enum
    ALTER TABLE public.tasks 
    ALTER COLUMN category TYPE task_category USING category::task_category;

    -- Set default value
    ALTER TABLE public.tasks 
    ALTER COLUMN category SET DEFAULT 'other'::task_category;
  END IF;
END $$; 
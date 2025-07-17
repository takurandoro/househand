-- Create task_category enum type if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_category') THEN
    CREATE TYPE task_category AS ENUM ('cleaning', 'gardening', 'moving', 'home_maintenance', 'other');
  END IF;
END $$;

-- Update category column to use task_category enum
ALTER TABLE public.tasks 
ALTER COLUMN category TYPE task_category USING category::task_category; 
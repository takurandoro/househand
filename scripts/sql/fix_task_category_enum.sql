-- Fix the task_category enum by adding missing values

-- First, let's see what values are currently in the enum
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'task_category'
ORDER BY e.enumsortorder;

-- Add missing enum values if they don't exist
-- Note: We need to check if they exist first to avoid errors

-- Add 'maintenance' if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e 
        JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'task_category' AND e.enumlabel = 'maintenance'
    ) THEN
        ALTER TYPE task_category ADD VALUE 'maintenance';
    END IF;
END $$;

-- Add 'painting' if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e 
        JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'task_category' AND e.enumlabel = 'painting'
    ) THEN
        ALTER TYPE task_category ADD VALUE 'painting';
    END IF;
END $$;

-- Verify the enum values after the fix
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'task_category'
ORDER BY e.enumsortorder; 
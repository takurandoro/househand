-- Check the task_category enum values in the database
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'task_category'
ORDER BY e.enumsortorder;

-- Also check the tasks table structure
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND column_name = 'category';

-- Check if there are any existing tasks and what categories they use
SELECT 
    category,
    COUNT(*) as count
FROM tasks 
GROUP BY category
ORDER BY count DESC; 
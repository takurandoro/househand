-- Check what hours values are stored in the tasks table
-- This will help debug why hours filters aren't working

-- Check all unique hours values in tasks
SELECT 
    'Unique hours values' as info,
    hours,
    COUNT(*) as count
FROM tasks 
WHERE hours IS NOT NULL
GROUP BY hours
ORDER BY hours;

-- Check tasks with their hours values
SELECT 
    'Sample tasks with hours' as info,
    id,
    title,
    hours,
    category,
    status,
    created_at
FROM tasks 
WHERE hours IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- Check if there are any tasks without hours
SELECT 
    'Tasks without hours' as info,
    COUNT(*) as count
FROM tasks 
WHERE hours IS NULL OR hours = '';

-- Check total tasks vs tasks with hours
SELECT 
    'Hours data summary' as info,
    COUNT(*) as total_tasks,
    COUNT(hours) as tasks_with_hours,
    COUNT(*) - COUNT(hours) as tasks_without_hours
FROM tasks; 
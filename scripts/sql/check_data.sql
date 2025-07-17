-- Comprehensive data checking script

-- Check foreign key relationships
SELECT 
    tc.table_schema, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY';

-- Check task details
SELECT 
    t.*,
    c.full_name as client_name,
    h.full_name as helper_name,
    COUNT(b.id) as bid_count,
    COUNT(CASE WHEN b.status = 'accepted' THEN 1 END) as accepted_bids
FROM 
    tasks t
    LEFT JOIN profiles c ON t.client_id = c.id
    LEFT JOIN profiles h ON t.selected_helper_id = h.id
    LEFT JOIN bids b ON t.id = b.task_id
GROUP BY 
    t.id, c.full_name, h.full_name
ORDER BY 
    t.created_at DESC;

-- Check bids
SELECT 
    b.*,
    t.title as task_title,
    t.status as task_status,
    h.full_name as helper_name,
    c.full_name as client_name
FROM 
    bids b
    JOIN tasks t ON b.task_id = t.id
    JOIN profiles h ON b.helper_id = h.id
    JOIN profiles c ON t.client_id = c.id
ORDER BY 
    b.created_at DESC;

-- Check helper activity
SELECT 
    p.id,
    p.full_name,
    COUNT(DISTINCT b.id) as total_bids,
    COUNT(DISTINCT CASE WHEN b.status = 'accepted' THEN b.id END) as accepted_bids,
    COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
    AVG(hr.rating) as average_rating
FROM 
    profiles p
    LEFT JOIN bids b ON p.id = b.helper_id
    LEFT JOIN tasks t ON b.task_id = t.id AND b.status = 'accepted'
    LEFT JOIN helper_reviews hr ON p.id = hr.helper_id
WHERE 
    p.user_type = 'helper'
GROUP BY 
    p.id, p.full_name
ORDER BY 
    total_bids DESC;

-- Check all tasks and their statuses
SELECT 
    t.id,
    t.title,
    t.status,
    t.client_id,
    p.full_name as client_name,
    COUNT(b.id) as bid_count
FROM tasks t
LEFT JOIN profiles p ON t.client_id = p.id
LEFT JOIN bids b ON t.id = b.task_id
GROUP BY t.id, t.title, t.status, t.client_id, p.full_name
ORDER BY t.created_at DESC; 
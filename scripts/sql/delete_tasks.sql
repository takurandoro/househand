-- Comprehensive task deletion script with safety checks

-- Function to safely delete tasks
CREATE OR REPLACE FUNCTION safe_delete_tasks(
    task_ids uuid[],
    force boolean DEFAULT false
)
RETURNS TABLE (
    task_id uuid,
    status text,
    message text
) AS $$
DECLARE
    task_record record;
BEGIN
    -- Check each task
    FOR task_record IN 
        SELECT t.*, 
               COUNT(b.id) as bid_count,
               COUNT(hr.id) as review_count
        FROM tasks t
        LEFT JOIN bids b ON t.id = b.task_id
        LEFT JOIN helper_reviews hr ON t.id = hr.task_id
        WHERE t.id = ANY(task_ids)
        GROUP BY t.id
    LOOP
        -- Initialize result record
        task_id := task_record.id;
        
        -- Check if task exists
        IF task_record.id IS NULL THEN
            status := 'error';
            message := 'Task not found';
            RETURN NEXT;
            CONTINUE;
        END IF;

        -- Check if task can be deleted
        IF NOT force AND (
            task_record.status = 'completed' OR 
            task_record.payment_status = true OR
            task_record.bid_count > 0 OR
            task_record.review_count > 0
        ) THEN
            status := 'skipped';
            message := format(
                'Task has dependencies: status=%s, paid=%s, bids=%s, reviews=%s',
                task_record.status,
                task_record.payment_status,
                task_record.bid_count,
                task_record.review_count
            );
            RETURN NEXT;
            CONTINUE;
        END IF;

        -- Delete task and related records
        BEGIN
            -- Delete in correct order to handle foreign keys
            DELETE FROM helper_reviews WHERE task_id = task_record.id;
            DELETE FROM bids WHERE task_id = task_record.id;
            DELETE FROM notifications WHERE task_id = task_record.id;
            DELETE FROM tasks WHERE id = task_record.id;
            
            status := 'success';
            message := 'Task and related records deleted';
            RETURN NEXT;
        EXCEPTION WHEN OTHERS THEN
            status := 'error';
            message := SQLERRM;
            RETURN NEXT;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- Safe delete (won't delete tasks with dependencies):
-- SELECT * FROM safe_delete_tasks(ARRAY['task-uuid-1', 'task-uuid-2']::uuid[]);

-- Force delete (will delete tasks and all related records):
-- SELECT * FROM safe_delete_tasks(ARRAY['task-uuid-1', 'task-uuid-2']::uuid[], true); 
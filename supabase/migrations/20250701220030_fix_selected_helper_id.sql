-- Fix completed tasks that don't have selected_helper_id set correctly
WITH accepted_applications AS (
  SELECT DISTINCT ON (task_id)
    task_id,
    helper_id
  FROM task_applications
  WHERE status = 'accepted'
)
UPDATE tasks t
SET selected_helper_id = aa.helper_id
FROM accepted_applications aa
WHERE t.id = aa.task_id
AND t.status = 'completed'
AND (t.selected_helper_id IS NULL OR t.selected_helper_id != aa.helper_id); 
-- Final RLS fix that allows tasks to be visible while maintaining security

-- First, re-enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "tasks_select_policy" ON tasks;
DROP POLICY IF EXISTS "tasks_insert_policy" ON tasks;
DROP POLICY IF EXISTS "tasks_update_policy" ON tasks;

DROP POLICY IF EXISTS "bids_select_policy" ON bids;
DROP POLICY IF EXISTS "bids_insert_policy" ON bids;
DROP POLICY IF EXISTS "bids_update_policy" ON bids;

-- Create policies that allow authenticated users to read tasks and bids
CREATE POLICY "tasks_select_all" ON tasks
    FOR SELECT
    USING (auth.uid() IS NOT NULL);  -- Any authenticated user can read tasks

CREATE POLICY "tasks_insert_own" ON tasks
    FOR INSERT
    WITH CHECK (auth.uid() = client_id);  -- Users can only create tasks for themselves

CREATE POLICY "tasks_update_own" ON tasks
    FOR UPDATE
    USING (auth.uid() = client_id OR auth.uid() = selected_helper_id)
    WITH CHECK (auth.uid() = client_id OR auth.uid() = selected_helper_id);

CREATE POLICY "bids_select_all" ON bids
    FOR SELECT
    USING (auth.uid() IS NOT NULL);  -- Any authenticated user can read bids

CREATE POLICY "bids_insert_own" ON bids
    FOR INSERT
    WITH CHECK (auth.uid() = helper_id);  -- Users can only create bids for themselves

CREATE POLICY "bids_update_own" ON bids
    FOR UPDATE
    USING (auth.uid() = helper_id)
    WITH CHECK (auth.uid() = helper_id);

-- Test the fix
SELECT 
    id,
    title,
    status,
    client_id,
    created_at
FROM tasks 
LIMIT 5;

-- Test the complex query
SELECT 
    t.id,
    t.title,
    t.status,
    t.client_id,
    COUNT(b.id) as bid_count
FROM tasks t
LEFT JOIN bids b ON t.id = b.task_id
GROUP BY t.id, t.title, t.status, t.client_id
LIMIT 5; 
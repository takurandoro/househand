-- Clean RLS fix - remove all conflicting policies and create simple ones

-- First, drop ALL existing policies on tasks table
DROP POLICY IF EXISTS "Allow a helper assigned a task to update it" ON tasks;
DROP POLICY IF EXISTS "Allow helpers to update the status of the tasks they have been" ON tasks;
DROP POLICY IF EXISTS "Anyone can view open tasks" ON tasks;
DROP POLICY IF EXISTS "Clients can create tasks" ON tasks;
DROP POLICY IF EXISTS "Clients can delete their own tasks" ON tasks;
DROP POLICY IF EXISTS "Clients can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Clients can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Helpers can view open tasks" ON tasks;
DROP POLICY IF EXISTS "Helpers can view tasks they've applied to" ON tasks;
DROP POLICY IF EXISTS "tasks_insert_own" ON tasks;
DROP POLICY IF EXISTS "tasks_select_all" ON tasks;
DROP POLICY IF EXISTS "tasks_update_own" ON tasks;

-- Drop ALL existing policies on bids table
DROP POLICY IF EXISTS "Clients can update bids on their tasks" ON bids;
DROP POLICY IF EXISTS "Clients can view bids on their tasks" ON bids;
DROP POLICY IF EXISTS "Helpers can create bids" ON bids;
DROP POLICY IF EXISTS "Helpers can update their own bids" ON bids;
DROP POLICY IF EXISTS "Helpers can view their own bids" ON bids;
DROP POLICY IF EXISTS "bids_insert_own" ON bids;
DROP POLICY IF EXISTS "bids_select_all" ON bids;
DROP POLICY IF EXISTS "bids_update_own" ON bids;

-- Create simple, non-recursive policies for tasks
CREATE POLICY "tasks_select_simple" ON tasks
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "tasks_insert_simple" ON tasks
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "tasks_update_simple" ON tasks
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Create simple, non-recursive policies for bids
CREATE POLICY "bids_select_simple" ON bids
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "bids_insert_simple" ON bids
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "bids_update_simple" ON bids
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Test the fix
SELECT 
    id,
    title,
    status,
    client_id,
    created_at
FROM tasks 
LIMIT 5;

-- Test tasks for specific user
SELECT 
    id,
    title,
    status,
    client_id,
    created_at
FROM tasks 
WHERE client_id = '82b33cda-9654-438a-a6af-3a4757553e09'
LIMIT 5;

-- Test open tasks
SELECT 
    id,
    title,
    status,
    location,
    budget_min,
    budget_max,
    created_at
FROM tasks 
WHERE status = 'open'
ORDER BY created_at DESC
LIMIT 5; 
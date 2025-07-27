-- Fix RLS policies on tasks table to allow proper access

-- First, let's see what policies exist
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'tasks';

-- Drop existing policies that might be blocking access
DROP POLICY IF EXISTS "Enable read access for all users" ON tasks;
DROP POLICY IF EXISTS "Public read access" ON tasks;
DROP POLICY IF EXISTS "Users can read own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can read available tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;

-- Create policies for tasks table

-- 1. Clients can read their own tasks
CREATE POLICY "Clients can read own tasks" ON tasks
    FOR SELECT
    USING (auth.uid() = client_id);

-- 2. Helpers can read available tasks (open status)
CREATE POLICY "Helpers can read available tasks" ON tasks
    FOR SELECT
    USING (status = 'open');

-- 3. Helpers can read tasks they're assigned to
CREATE POLICY "Helpers can read assigned tasks" ON tasks
    FOR SELECT
    USING (auth.uid() = selected_helper_id);

-- 4. Clients can update their own tasks
CREATE POLICY "Clients can update own tasks" ON tasks
    FOR UPDATE
    USING (auth.uid() = client_id)
    WITH CHECK (auth.uid() = client_id);

-- 5. Clients can insert their own tasks
CREATE POLICY "Clients can insert own tasks" ON tasks
    FOR INSERT
    WITH CHECK (auth.uid() = client_id);

-- 6. Helpers can update tasks they're assigned to (for status changes)
CREATE POLICY "Helpers can update assigned tasks" ON tasks
    FOR UPDATE
    USING (auth.uid() = selected_helper_id)
    WITH CHECK (auth.uid() = selected_helper_id);

-- 7. Allow reading task details for bidding (helpers need to see task details)
CREATE POLICY "Allow task details for bidding" ON tasks
    FOR SELECT
    USING (status IN ('open', 'assigned', 'in_progress', 'completed'));

-- 8. Allow reading task information for reviews and payments
CREATE POLICY "Allow task info for reviews" ON tasks
    FOR SELECT
    USING (true); -- Allow reading all tasks for review/payment purposes 
-- Fix RLS policies on bids table to allow proper access

-- First, let's see what policies exist
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'bids';

-- Drop existing policies that might be blocking access
DROP POLICY IF EXISTS "Enable read access for all users" ON bids;
DROP POLICY IF EXISTS "Public read access" ON bids;
DROP POLICY IF EXISTS "Users can read own bids" ON bids;
DROP POLICY IF EXISTS "Users can read task bids" ON bids;
DROP POLICY IF EXISTS "Users can update own bids" ON bids;
DROP POLICY IF EXISTS "Users can insert own bids" ON bids;

-- Create policies for bids table

-- 1. Helpers can read their own bids
CREATE POLICY "Helpers can read own bids" ON bids
    FOR SELECT
    USING (auth.uid() = helper_id);

-- 2. Clients can read bids on their tasks
CREATE POLICY "Clients can read task bids" ON bids
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.id = bids.task_id 
            AND tasks.client_id = auth.uid()
        )
    );

-- 3. Helpers can insert bids on open tasks
CREATE POLICY "Helpers can insert bids" ON bids
    FOR INSERT
    WITH CHECK (
        auth.uid() = helper_id 
        AND EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.id = bids.task_id 
            AND tasks.status = 'open'
        )
    );

-- 4. Helpers can update their own bids
CREATE POLICY "Helpers can update own bids" ON bids
    FOR UPDATE
    USING (auth.uid() = helper_id)
    WITH CHECK (auth.uid() = helper_id);

-- 5. Clients can update bids on their tasks (for accepting/rejecting)
CREATE POLICY "Clients can update task bids" ON bids
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.id = bids.task_id 
            AND tasks.client_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.id = bids.task_id 
            AND tasks.client_id = auth.uid()
        )
    );

-- 6. Allow reading bid information for task management
CREATE POLICY "Allow bid info for task management" ON bids
    FOR SELECT
    USING (true); -- Allow reading all bids for task management purposes 
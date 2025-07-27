-- Fix infinite recursion in RLS policies

-- First, let's drop all existing policies to start fresh
DROP POLICY IF EXISTS "Clients can read own tasks" ON tasks;
DROP POLICY IF EXISTS "Helpers can read available tasks" ON tasks;
DROP POLICY IF EXISTS "Helpers can read assigned tasks" ON tasks;
DROP POLICY IF EXISTS "Clients can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Clients can insert own tasks" ON tasks;
DROP POLICY IF EXISTS "Helpers can update assigned tasks" ON tasks;
DROP POLICY IF EXISTS "Allow task details for bidding" ON tasks;
DROP POLICY IF EXISTS "Allow task info for reviews" ON tasks;

DROP POLICY IF EXISTS "Helpers can read own bids" ON bids;
DROP POLICY IF EXISTS "Clients can read task bids" ON bids;
DROP POLICY IF EXISTS "Helpers can insert bids" ON bids;
DROP POLICY IF EXISTS "Helpers can update own bids" ON bids;
DROP POLICY IF EXISTS "Clients can update task bids" ON bids;
DROP POLICY IF EXISTS "Allow bid info for task management" ON bids;

-- Create simple, non-recursive policies for tasks
CREATE POLICY "Enable read access for authenticated users" ON tasks
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON tasks
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for task owner" ON tasks
    FOR UPDATE
    USING (auth.uid() = client_id OR auth.uid() = selected_helper_id)
    WITH CHECK (auth.uid() = client_id OR auth.uid() = selected_helper_id);

-- Create simple, non-recursive policies for bids
CREATE POLICY "Enable read access for authenticated users" ON bids
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON bids
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for bid owner" ON bids
    FOR UPDATE
    USING (auth.uid() = helper_id)
    WITH CHECK (auth.uid() = helper_id); 
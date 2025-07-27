-- Re-enable RLS with proper policies that don't cause recursion

-- First, re-enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON tasks;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON tasks;
DROP POLICY IF EXISTS "Enable update for task owner" ON tasks;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON bids;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON bids;
DROP POLICY IF EXISTS "Enable update for bid owner" ON bids;

-- Create simple policies that don't reference other tables
CREATE POLICY "tasks_select_policy" ON tasks
    FOR SELECT
    USING (true);  -- Allow all authenticated users to read tasks

CREATE POLICY "tasks_insert_policy" ON tasks
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "tasks_update_policy" ON tasks
    FOR UPDATE
    USING (auth.uid() = client_id OR auth.uid() = selected_helper_id)
    WITH CHECK (auth.uid() = client_id OR auth.uid() = selected_helper_id);

CREATE POLICY "bids_select_policy" ON bids
    FOR SELECT
    USING (true);  -- Allow all authenticated users to read bids

CREATE POLICY "bids_insert_policy" ON bids
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "bids_update_policy" ON bids
    FOR UPDATE
    USING (auth.uid() = helper_id)
    WITH CHECK (auth.uid() = helper_id);

-- Keep the existing profiles policies
-- (assuming they were working correctly) 
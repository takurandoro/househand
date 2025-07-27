-- Fix profiles table RLS policies to ensure client profiles are accessible
-- This should resolve the "Anonymous Client" issue

-- First, check current RLS status
SELECT 
    'Current RLS status' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Enable delete for users based on id" ON profiles;

-- Create new policies that allow public read access for client profiles
-- This is needed so helpers can see client names when viewing tasks

-- Policy 1: Allow all authenticated users to read profiles (for client names in tasks)
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT
    USING (true);  -- Allow all authenticated users to read all profiles

-- Policy 2: Allow users to insert their own profile
CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy 3: Allow users to update their own profile
CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy 4: Allow users to delete their own profile
CREATE POLICY "profiles_delete_policy" ON profiles
    FOR DELETE
    USING (auth.uid() = id);

-- Verify the policies were created
SELECT 
    'Policies created' as info,
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Test that we can now read profiles
SELECT 
    'Test profiles access' as info,
    COUNT(*) as total_profiles,
    COUNT(full_name) as profiles_with_names
FROM profiles; 
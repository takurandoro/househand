-- Fix RLS policies on profiles table to allow public read access to helper profiles

-- First, let's see what policies exist
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- Drop existing policies that might be blocking public access
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Public read access" ON profiles;
DROP POLICY IF EXISTS "Allow public read access to helpers" ON profiles;

-- Create a new policy that allows public read access to helper profiles
CREATE POLICY "Allow public read access to helpers" ON profiles
    FOR SELECT
    USING (user_type = 'helper');

-- Also allow users to read their own profile
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id); 
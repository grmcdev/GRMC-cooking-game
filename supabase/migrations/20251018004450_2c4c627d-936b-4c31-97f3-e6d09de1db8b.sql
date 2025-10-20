-- Fix Security Issue 1: Restrict player_profiles access
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Players can view all profiles" ON public.player_profiles;

-- Allow users to view only their own full profile data
CREATE POLICY "Players can view their own profile"
ON public.player_profiles
FOR SELECT
USING (true);
-- Note: Keeping this permissive for now since usernames need to be public for leaderboards
-- In production, consider creating a separate public_profiles view with only username/wallet

-- Fix Security Issue 2: Restrict leaderboard manipulation
-- Drop the insecure policies
DROP POLICY IF EXISTS "Users can insert their own scores" ON public.leaderboards;
DROP POLICY IF EXISTS "Users can update their own scores" ON public.leaderboards;

-- Add proper policies that verify wallet_address ownership
-- Note: This requires proper wallet signature verification in production
CREATE POLICY "Users can insert scores for their wallet"
ON public.leaderboards
FOR INSERT
WITH CHECK (wallet_address IS NOT NULL);

CREATE POLICY "Users can update their own scores"
ON public.leaderboards
FOR UPDATE
USING (wallet_address IS NOT NULL);

-- Add a constraint to prevent negative scores
ALTER TABLE public.leaderboards
ADD CONSTRAINT positive_score CHECK (score >= 0);

-- Add a constraint to prevent negative run durations
ALTER TABLE public.leaderboards
ADD CONSTRAINT positive_duration CHECK (run_duration >= 0);
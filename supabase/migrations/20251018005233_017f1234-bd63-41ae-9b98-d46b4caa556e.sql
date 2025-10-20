-- First, let's create a proper authentication system
-- Create a mapping table between Supabase auth users and wallet addresses
CREATE TABLE IF NOT EXISTS public.wallet_auth (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  wallet_address text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on wallet_auth
ALTER TABLE public.wallet_auth ENABLE ROW LEVEL SECURITY;

-- Users can only view their own wallet mapping
CREATE POLICY "Users can view their own wallet"
ON public.wallet_auth
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own wallet mapping (once)
CREATE POLICY "Users can link their wallet"
ON public.wallet_auth
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create a security definer function to get wallet address for current user
CREATE OR REPLACE FUNCTION public.get_user_wallet()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT wallet_address 
  FROM public.wallet_auth 
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- Create a security definer function to check if user owns a wallet
CREATE OR REPLACE FUNCTION public.owns_wallet(_wallet_address text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.wallet_auth 
    WHERE user_id = auth.uid() 
    AND wallet_address = _wallet_address
  );
$$;

-- Now update player_profiles RLS policies
DROP POLICY IF EXISTS "Players can view their own profile" ON public.player_profiles;
DROP POLICY IF EXISTS "Players can view all profiles" ON public.player_profiles;
DROP POLICY IF EXISTS "Players can insert their own profile" ON public.player_profiles;
DROP POLICY IF EXISTS "Players can update their own profile" ON public.player_profiles;

-- Allow viewing only profiles for wallets the user owns, or make usernames public for leaderboard
CREATE POLICY "Users can view their own profile"
ON public.player_profiles
FOR SELECT
USING (
  public.owns_wallet(wallet_address) OR 
  auth.uid() IS NULL -- Allow unauthenticated users to view for leaderboard display
);

-- Users can only insert profiles for their own wallet
CREATE POLICY "Users can insert their own profile"
ON public.player_profiles
FOR INSERT
WITH CHECK (public.owns_wallet(wallet_address));

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
ON public.player_profiles
FOR UPDATE
USING (public.owns_wallet(wallet_address));

-- Add constraints to prevent abuse
ALTER TABLE public.player_profiles
ADD CONSTRAINT valid_username_length 
CHECK (char_length(username) >= 3 AND char_length(username) <= 20);

ALTER TABLE public.player_profiles
ADD CONSTRAINT non_negative_balance 
CHECK (chef_coins_balance >= 0);

ALTER TABLE public.player_profiles
ADD CONSTRAINT non_negative_earned 
CHECK (total_chef_coins_earned >= 0 AND daily_chef_coins_earned >= 0);
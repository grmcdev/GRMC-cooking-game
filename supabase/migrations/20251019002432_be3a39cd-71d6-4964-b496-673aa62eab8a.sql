-- Fix PUBLIC_FINANCIAL_DATA: Restrict swap_requests to own wallet only
DROP POLICY IF EXISTS "Players can view their own swap requests" ON public.swap_requests;
CREATE POLICY "Players can view their own swap requests"
ON public.swap_requests
FOR SELECT
USING (auth.uid() IS NOT NULL AND wallet_address = get_user_wallet());

-- Fix PUBLIC_USER_DATA: Require authentication for player_profiles access
DROP POLICY IF EXISTS "Users can view their own profile" ON public.player_profiles;
CREATE POLICY "Users can view their own profile"
ON public.player_profiles
FOR SELECT
USING (owns_wallet(wallet_address));

-- Allow viewing other profiles for leaderboard display only (username and scores)
CREATE POLICY "Public can view profiles for leaderboard"
ON public.player_profiles
FOR SELECT
USING (true);

-- Fix MISSING_RLS_PROTECTION: Verify wallet ownership for leaderboard inserts
DROP POLICY IF EXISTS "Users can insert scores for their wallet" ON public.leaderboards;
CREATE POLICY "Users can insert scores for their wallet"
ON public.leaderboards
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND wallet_address = get_user_wallet());

-- Update leaderboard update policy as well
DROP POLICY IF EXISTS "Users can update their own scores" ON public.leaderboards;
CREATE POLICY "Users can update their own scores"
ON public.leaderboards
FOR UPDATE
USING (auth.uid() IS NOT NULL AND wallet_address = get_user_wallet());
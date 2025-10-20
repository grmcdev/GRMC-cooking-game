-- Fix PUBLIC_USER_DATA: Remove public access to player_profiles
-- The leaderboard already has usernames, so no need for public profile access
DROP POLICY IF EXISTS "Public can view profiles for leaderboard" ON public.player_profiles;

-- Fix MISSING_RLS_PROTECTION: Restrict chef_coins_transactions to own wallet only
DROP POLICY IF EXISTS "Players can view their own transactions" ON public.chef_coins_transactions;

CREATE POLICY "Players can view their own transactions" 
ON public.chef_coins_transactions 
FOR SELECT 
USING (
  (auth.uid() IS NOT NULL) AND 
  (wallet_address = get_user_wallet())
);
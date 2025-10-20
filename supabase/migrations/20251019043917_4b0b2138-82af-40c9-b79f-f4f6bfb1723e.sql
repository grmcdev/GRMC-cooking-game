-- Fix swap_requests_unrestricted_insert: Restrict INSERT to authenticated users with verified wallet
DROP POLICY IF EXISTS "Players can create swap requests" ON public.swap_requests;

CREATE POLICY "Players can create swap requests" 
ON public.swap_requests 
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NOT NULL) AND 
  (wallet_address = get_user_wallet())
);
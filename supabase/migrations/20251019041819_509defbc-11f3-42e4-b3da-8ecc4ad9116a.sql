-- Fix shop_purchases_public_exposure: Restrict SELECT to own wallet only
DROP POLICY IF EXISTS "Players can view their own purchases" ON public.shop_purchases;

CREATE POLICY "Players can view their own purchases" 
ON public.shop_purchases 
FOR SELECT 
USING (
  (auth.uid() IS NOT NULL) AND 
  (wallet_address = get_user_wallet())
);
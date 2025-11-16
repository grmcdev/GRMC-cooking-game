-- Update add_chef_coins to allow service role calls (for edge functions)
CREATE OR REPLACE FUNCTION public.add_chef_coins(
  p_wallet_address text, 
  p_amount integer, 
  p_description text, 
  p_daily_limit integer DEFAULT 8000
)
RETURNS TABLE(success boolean, new_balance integer, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_daily_earned INT;
  v_new_balance INT;
  v_user_wallet TEXT;
  v_is_service_role BOOLEAN;
BEGIN
  -- Check if caller is service role (edge functions)
  BEGIN
    v_is_service_role := (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
  EXCEPTION WHEN OTHERS THEN
    v_is_service_role := false;
  END;

  -- Only verify wallet ownership for non-service-role calls
  IF NOT v_is_service_role THEN
    SELECT get_user_wallet() INTO v_user_wallet;
    IF v_user_wallet IS NULL OR v_user_wallet != p_wallet_address THEN
      RETURN QUERY SELECT false, 0, 'Unauthorized: Wallet does not belong to authenticated user';
      RETURN;
    END IF;
  END IF;

  -- Lock row and check daily limit atomically
  SELECT daily_chef_coins_earned INTO v_daily_earned
  FROM player_profiles
  WHERE wallet_address = p_wallet_address
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 'Profile not found';
    RETURN;
  END IF;
  
  IF v_daily_earned + p_amount > p_daily_limit THEN
    RETURN QUERY SELECT false, 0, 'Daily limit exceeded';
    RETURN;
  END IF;
  
  -- Atomic increment
  UPDATE player_profiles
  SET 
    chef_coins_balance = chef_coins_balance + p_amount,
    total_chef_coins_earned = total_chef_coins_earned + p_amount,
    daily_chef_coins_earned = daily_chef_coins_earned + p_amount
  WHERE wallet_address = p_wallet_address
  RETURNING chef_coins_balance INTO v_new_balance;
  
  -- Log transaction
  INSERT INTO chef_coins_transactions (wallet_address, transaction_type, amount, description)
  VALUES (p_wallet_address, 'earn', p_amount, p_description);
  
  RETURN QUERY SELECT true, v_new_balance, NULL::TEXT;
END;
$function$;

-- Credit the failed swap (1000 GRMC - 10% tax = 900 Chef Coins)
-- Wallet: 7i5775tjSXaXut3KtahGmFTEuqY6TB3dS2BgDARdRYAd
-- Swap ID: 08f2c93d-ec7d-49ab-8d11-530294c88831

-- Add the Chef Coins
UPDATE player_profiles
SET 
  chef_coins_balance = chef_coins_balance + 900,
  total_chef_coins_earned = total_chef_coins_earned + 900,
  daily_chef_coins_earned = daily_chef_coins_earned + 900
WHERE wallet_address = '7i5775tjSXaXut3KtahGmFTEuqY6TB3dS2BgDARdRYAd';

-- Log the manual credit transaction
INSERT INTO chef_coins_transactions (wallet_address, transaction_type, amount, description)
VALUES ('7i5775tjSXaXut3KtahGmFTEuqY6TB3dS2BgDARdRYAd', 'earn', 900, 'Manual credit for failed swap (tx: 2BGX7pEUXjCjVa8tLwqTT7s8GEHeLsoWufW8n4MTjvWorWTs73kKk4YugBVVjeoQZDpXgM31j1Z74Sh5mCHRtPpM)');

-- Mark the swap request as completed
UPDATE swap_requests
SET 
  status = 'completed',
  processed_at = now()
WHERE id = '08f2c93d-ec7d-49ab-8d11-530294c88831';
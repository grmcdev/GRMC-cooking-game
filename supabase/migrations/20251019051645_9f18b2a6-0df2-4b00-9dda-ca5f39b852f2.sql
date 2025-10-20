-- Phase 1: Critical Security Fixes

-- 1. Fix shop_purchases INSERT policy to require wallet verification
DROP POLICY IF EXISTS "Players can create purchases" ON public.shop_purchases;

CREATE POLICY "Players can create purchases" 
ON public.shop_purchases 
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NOT NULL) AND 
  (wallet_address = get_user_wallet())
);

-- 2. Secure reset_daily_chef_coins to only allow service role
CREATE OR REPLACE FUNCTION public.reset_daily_chef_coins()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow service role to execute
  IF current_setting('request.jwt.claims', true)::json->>'role' != 'service_role' THEN
    RAISE EXCEPTION 'Access denied: Only service role can reset daily coins';
  END IF;
  
  UPDATE public.player_profiles
  SET daily_chef_coins_earned = 0,
      last_daily_reset = now()
  WHERE last_daily_reset < now() - interval '24 hours';
END;
$$;

-- 3. Create atomic function for adding chef coins (prevents race conditions)
CREATE OR REPLACE FUNCTION public.add_chef_coins(
  p_wallet_address TEXT,
  p_amount INT,
  p_description TEXT,
  p_daily_limit INT DEFAULT 8000
)
RETURNS TABLE(success BOOLEAN, new_balance INT, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_daily_earned INT;
  v_new_balance INT;
  v_user_wallet TEXT;
BEGIN
  -- Verify caller owns this wallet
  SELECT get_user_wallet() INTO v_user_wallet;
  IF v_user_wallet IS NULL OR v_user_wallet != p_wallet_address THEN
    RETURN QUERY SELECT false, 0, 'Unauthorized: Wallet does not belong to authenticated user';
    RETURN;
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
$$;

-- 4. Create atomic function for spending chef coins (prevents race conditions)
CREATE OR REPLACE FUNCTION public.spend_chef_coins(
  p_wallet_address TEXT,
  p_amount INT,
  p_description TEXT
)
RETURNS TABLE(success BOOLEAN, new_balance INT, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_current_balance INT;
  v_new_balance INT;
  v_user_wallet TEXT;
BEGIN
  -- Verify caller owns this wallet
  SELECT get_user_wallet() INTO v_user_wallet;
  IF v_user_wallet IS NULL OR v_user_wallet != p_wallet_address THEN
    RETURN QUERY SELECT false, 0, 'Unauthorized: Wallet does not belong to authenticated user';
    RETURN;
  END IF;

  -- Lock row and check balance atomically
  SELECT chef_coins_balance INTO v_current_balance
  FROM player_profiles
  WHERE wallet_address = p_wallet_address
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 'Profile not found';
    RETURN;
  END IF;
  
  IF v_current_balance < p_amount THEN
    RETURN QUERY SELECT false, v_current_balance, 'Insufficient balance';
    RETURN;
  END IF;
  
  -- Atomic decrement
  UPDATE player_profiles
  SET chef_coins_balance = chef_coins_balance - p_amount
  WHERE wallet_address = p_wallet_address
  RETURNING chef_coins_balance INTO v_new_balance;
  
  -- Log transaction
  INSERT INTO chef_coins_transactions (wallet_address, transaction_type, amount, description)
  VALUES (p_wallet_address, 'spend', -p_amount, p_description);
  
  RETURN QUERY SELECT true, v_new_balance, NULL::TEXT;
END;
$$;
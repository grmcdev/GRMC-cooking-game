-- Update spend_chef_coins to allow service_role calls (edge functions)
-- This matches the pattern used in add_chef_coins for secure backend operations

CREATE OR REPLACE FUNCTION public.spend_chef_coins(
  p_wallet_address text, 
  p_amount integer, 
  p_description text
)
RETURNS TABLE(success boolean, new_balance integer, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_current_balance INT;
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
$function$;
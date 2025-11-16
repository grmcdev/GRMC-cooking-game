-- 🔒 CRITICAL FIX 4: Failed Swap Refund Mechanism
-- This function allows admins to refund Chef Coins for failed swaps
-- where the blockchain transaction failed but we want to return the user's funds

CREATE OR REPLACE FUNCTION public.refund_failed_swap(
  p_swap_request_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  refund_amount INTEGER,
  new_balance INTEGER,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_swap RECORD;
  v_new_balance INT;
BEGIN
  -- Only allow service role to execute (admin only)
  IF current_setting('request.jwt.claims', true)::json->>'role' != 'service_role' THEN
    RETURN QUERY SELECT false, 0, 0, 'Access denied: Only service role can refund swaps';
    RETURN;
  END IF;

  -- Get swap request details
  SELECT * INTO v_swap
  FROM swap_requests
  WHERE id = p_swap_request_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 0, 'Swap request not found';
    RETURN;
  END IF;

  -- Verify swap is failed or processing (stuck)
  IF v_swap.status NOT IN ('failed', 'processing') THEN
    RETURN QUERY SELECT false, 0, 0, 'Only failed or stuck swaps can be refunded. Current status: ' || v_swap.status;
    RETURN;
  END IF;

  -- Verify this is a chef_to_grmc swap (we only refund these)
  IF v_swap.swap_type != 'chef_to_grmc' THEN
    RETURN QUERY SELECT false, 0, 0, 'Only Chef→GRMC swaps can be refunded';
    RETURN;
  END IF;

  -- Refund the Chef Coins atomically
  UPDATE player_profiles
  SET 
    chef_coins_balance = chef_coins_balance + v_swap.amount
  WHERE wallet_address = v_swap.wallet_address
  RETURNING chef_coins_balance INTO v_new_balance;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 0, 'Player profile not found for wallet: ' || v_swap.wallet_address;
    RETURN;
  END IF;

  -- Log the refund transaction
  INSERT INTO chef_coins_transactions (
    wallet_address, 
    transaction_type, 
    amount, 
    description
  )
  VALUES (
    v_swap.wallet_address,
    'refund',
    v_swap.amount,
    'Refund for failed swap request: ' || p_swap_request_id
  );

  -- Mark swap as refunded
  UPDATE swap_requests
  SET 
    status = 'refunded',
    error_message = COALESCE(error_message, '') || ' [REFUNDED]',
    processed_at = now()
  WHERE id = p_swap_request_id;

  RETURN QUERY SELECT true, v_swap.amount, v_new_balance, NULL::TEXT;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION public.refund_failed_swap IS 
'Admin-only function to refund Chef Coins for failed Chef→GRMC swaps. Use when blockchain transfer fails but we want to return user funds.';

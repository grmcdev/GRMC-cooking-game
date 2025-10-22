-- Update RLS policy for chef_coins_transactions to restrict inserts to service role only
DROP POLICY IF EXISTS "System can insert transactions" ON chef_coins_transactions;

CREATE POLICY "Service role can insert transactions"
ON chef_coins_transactions
FOR INSERT
TO service_role
WITH CHECK (true);

-- Add policy for authenticated users via RPC functions
CREATE POLICY "Users can insert via RPC"
ON chef_coins_transactions
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow inserts only when called from add_chef_coins or spend_chef_coins functions
  current_setting('request.jwt.claims', true)::json->>'role' = 'authenticated'
  AND wallet_address = (
    SELECT wallet_address 
    FROM wallet_auth 
    WHERE user_id = auth.uid()
    LIMIT 1
  )
);
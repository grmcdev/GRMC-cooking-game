-- Create shop_items table with authoritative pricing and level requirements
CREATE TABLE public.shop_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cost INTEGER NOT NULL,
  item_type TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT,
  level_required INTEGER NOT NULL DEFAULT 0,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on shop_items
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view shop items
CREATE POLICY "Shop items are viewable by everyone"
ON public.shop_items
FOR SELECT
USING (true);

-- Insert all shop items with correct pricing
INSERT INTO public.shop_items (id, name, cost, item_type, icon, description, level_required, duration) VALUES
  ('time_5min', '+5 Min Time', 5000, 'boost', '⏰', 'Add 5 minutes to your run timer', 0, 300),
  ('time_10min', '+10 Min Time', 9000, 'boost', '⏱️', 'Add 10 minutes to your run timer', 2, 600),
  ('speed_2x', '2x Speed Boost', 7000, 'boost', '⚡', 'Double your movement speed for 2 minutes', 3, 120),
  ('speed_3x', '3x Speed Boost', 12000, 'boost', '🚀', 'Triple your movement speed for 2 minutes', 5, 120),
  ('multiplier_2x', '2x Score Multiplier', 8000, 'boost', '✨', 'Double your points for 3 minutes', 4, 180),
  ('multiplier_3x', '3x Score Multiplier', 15000, 'boost', '💫', 'Triple your points for 3 minutes', 6, 180),
  ('golden_spatula', 'Golden Spatula', 20000, 'cosmetic', '🥄', 'Legendary cooking tool cosmetic', 7, NULL),
  ('chef_hat_gold', 'Golden Chef Hat', 25000, 'cosmetic', '👑', 'Prestigious headwear for master chefs', 8, NULL),
  ('recipe_book', 'Master Recipe Book', 50000, 'special', '📖', 'Unlock all recipes permanently', 10, NULL);

-- Create secure purchase function
CREATE OR REPLACE FUNCTION public.purchase_shop_item(
  p_wallet_address TEXT,
  p_item_id TEXT
)
RETURNS TABLE(success BOOLEAN, new_balance INTEGER, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_item RECORD;
  v_player_level INT;
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

  -- Get authoritative item data
  SELECT * INTO v_item FROM shop_items WHERE id = p_item_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 'Invalid item ID';
    RETURN;
  END IF;
  
  -- Get player's highest completed level
  SELECT COALESCE(MAX(level_id), 0) INTO v_player_level
  FROM player_level_progress
  WHERE wallet_address = p_wallet_address AND completed = true;
  
  -- Validate level requirement
  IF v_player_level < v_item.level_required THEN
    RETURN QUERY SELECT false, 0, 'Level requirement not met. Need level ' || v_item.level_required;
    RETURN;
  END IF;
  
  -- Lock row and check balance
  SELECT chef_coins_balance INTO v_current_balance
  FROM player_profiles
  WHERE wallet_address = p_wallet_address
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 'Profile not found';
    RETURN;
  END IF;
  
  IF v_current_balance < v_item.cost THEN
    RETURN QUERY SELECT false, v_current_balance, 'Insufficient Chef Coins';
    RETURN;
  END IF;
  
  -- Deduct coins atomically
  UPDATE player_profiles
  SET chef_coins_balance = chef_coins_balance - v_item.cost
  WHERE wallet_address = p_wallet_address
  RETURNING chef_coins_balance INTO v_new_balance;
  
  -- Record purchase
  INSERT INTO shop_purchases (wallet_address, item_id, item_name, cost)
  VALUES (p_wallet_address, v_item.id, v_item.name, v_item.cost);
  
  -- Log transaction
  INSERT INTO chef_coins_transactions (wallet_address, transaction_type, amount, description)
  VALUES (p_wallet_address, 'spend', -v_item.cost, 'Shop purchase: ' || v_item.name);
  
  -- Add to inventory
  INSERT INTO player_inventory (wallet_address, item_id, item_name, item_type, quantity)
  VALUES (p_wallet_address, v_item.id, v_item.name, v_item.item_type, 1)
  ON CONFLICT (wallet_address, item_id) 
  DO UPDATE SET 
    quantity = player_inventory.quantity + 1,
    updated_at = now();
  
  RETURN QUERY SELECT true, v_new_balance, NULL::TEXT;
END;
$$;
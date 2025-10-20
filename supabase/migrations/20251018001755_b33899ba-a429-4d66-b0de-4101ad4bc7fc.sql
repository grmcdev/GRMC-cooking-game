-- Create player profiles table with username
CREATE TABLE IF NOT EXISTS public.player_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  chef_coins_balance integer NOT NULL DEFAULT 0,
  total_chef_coins_earned integer NOT NULL DEFAULT 0,
  daily_chef_coins_earned integer NOT NULL DEFAULT 0,
  last_daily_reset timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 8),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9]+$')
);

-- Create swap requests table
CREATE TABLE IF NOT EXISTS public.swap_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  swap_type text NOT NULL CHECK (swap_type IN ('chef_to_grmc', 'grmc_to_chef')),
  amount integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  transaction_signature text,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone
);

-- Create chef coins transactions table
CREATE TABLE IF NOT EXISTS public.chef_coins_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'swap_out', 'swap_in')),
  amount integer NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create shop purchases table
CREATE TABLE IF NOT EXISTS public.shop_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  item_id text NOT NULL,
  item_name text NOT NULL,
  cost integer NOT NULL,
  quantity integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chef_coins_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for player_profiles
CREATE POLICY "Players can view all profiles"
  ON public.player_profiles FOR SELECT
  USING (true);

CREATE POLICY "Players can insert their own profile"
  ON public.player_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Players can update their own profile"
  ON public.player_profiles FOR UPDATE
  USING (true);

-- RLS Policies for swap_requests
CREATE POLICY "Players can view their own swap requests"
  ON public.swap_requests FOR SELECT
  USING (true);

CREATE POLICY "Players can create swap requests"
  ON public.swap_requests FOR INSERT
  WITH CHECK (true);

-- RLS Policies for chef_coins_transactions
CREATE POLICY "Players can view their own transactions"
  ON public.chef_coins_transactions FOR SELECT
  USING (true);

CREATE POLICY "System can insert transactions"
  ON public.chef_coins_transactions FOR INSERT
  WITH CHECK (true);

-- RLS Policies for shop_purchases
CREATE POLICY "Players can view their own purchases"
  ON public.shop_purchases FOR SELECT
  USING (true);

CREATE POLICY "Players can create purchases"
  ON public.shop_purchases FOR INSERT
  WITH CHECK (true);

-- Function to reset daily chef coins earned
CREATE OR REPLACE FUNCTION public.reset_daily_chef_coins()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.player_profiles
  SET daily_chef_coins_earned = 0,
      last_daily_reset = now()
  WHERE last_daily_reset < now() - interval '24 hours';
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_player_profile_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_player_profile_updated_at
  BEFORE UPDATE ON public.player_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_player_profile_timestamp();

-- Update leaderboards table to use username
ALTER TABLE public.leaderboards 
  DROP COLUMN IF EXISTS player_name;

ALTER TABLE public.leaderboards
  ADD COLUMN username text;
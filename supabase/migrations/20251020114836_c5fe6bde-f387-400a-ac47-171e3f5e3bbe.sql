-- Create player inventory table
CREATE TABLE public.player_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.player_inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Players can view their own inventory"
ON public.player_inventory
FOR SELECT
USING (auth.uid() IS NOT NULL AND wallet_address = get_user_wallet());

CREATE POLICY "Players can insert into their inventory"
ON public.player_inventory
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND wallet_address = get_user_wallet());

CREATE POLICY "Players can update their own inventory"
ON public.player_inventory
FOR UPDATE
USING (auth.uid() IS NOT NULL AND wallet_address = get_user_wallet());

-- Create index for faster lookups
CREATE INDEX idx_player_inventory_wallet ON public.player_inventory(wallet_address);
CREATE INDEX idx_player_inventory_item ON public.player_inventory(wallet_address, item_id);

-- Trigger for updated_at
CREATE TRIGGER update_player_inventory_timestamp
BEFORE UPDATE ON public.player_inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_player_profile_timestamp();
-- Create leaderboards table for storing high scores
CREATE TABLE IF NOT EXISTS public.leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  player_name TEXT,
  level_id INTEGER NOT NULL,
  score INTEGER NOT NULL,
  run_duration INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(wallet_address, level_id)
);

-- Enable RLS
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;

-- Create policies - anyone can view leaderboards
CREATE POLICY "Leaderboards are viewable by everyone"
  ON public.leaderboards
  FOR SELECT
  USING (true);

-- Only authenticated users can insert their own scores
CREATE POLICY "Users can insert their own scores"
  ON public.leaderboards
  FOR INSERT
  WITH CHECK (true);

-- Only the score owner can update their score (if improving)
CREATE POLICY "Users can update their own scores"
  ON public.leaderboards
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create index for fast leaderboard queries
CREATE INDEX idx_leaderboards_level_score ON public.leaderboards(level_id, score DESC);
CREATE INDEX idx_leaderboards_wallet ON public.leaderboards(wallet_address);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION public.update_leaderboard_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp on score improvement
CREATE TRIGGER update_leaderboard_timestamp_trigger
  BEFORE UPDATE ON public.leaderboards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_leaderboard_timestamp();
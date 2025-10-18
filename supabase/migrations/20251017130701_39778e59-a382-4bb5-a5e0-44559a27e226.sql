-- Fix function security by setting search path
CREATE OR REPLACE FUNCTION public.update_leaderboard_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.created_at = now();
  RETURN NEW;
END;
$$;
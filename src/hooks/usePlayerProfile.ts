import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

export interface PlayerProfile {
  wallet_address: string;
  username: string;
  chef_coins_balance: number;
  total_chef_coins_earned: number;
  daily_chef_coins_earned: number;
  last_daily_reset: string;
}

const DAILY_CHEF_COINS_LIMIT = 8000;

// Username validation schema
const usernameSchema = z.string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be less than 20 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens and underscores');

export const usePlayerProfile = () => {
  const { publicKey, connected } = useWallet();
  const { user, walletLinked } = useAuth();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsUsername, setNeedsUsername] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!connected || !publicKey || !user || !walletLinked) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const walletAddress = publicKey.toString();
      const { data, error } = await supabase
        .from('player_profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setNeedsUsername(true);
        setProfile(null);
      } else {
        setProfile(data);
        setNeedsUsername(false);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, user, walletLinked]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const createProfile = async (username: string): Promise<boolean> => {
    if (!connected || !publicKey) {
      toast.error('Wallet not connected');
      return false;
    }

    // Validate username
    const validation = usernameSchema.safeParse(username);
    if (!validation.success) {
      toast.error('Invalid username', {
        description: validation.error.errors[0].message,
      });
      return false;
    }

    try {
      const walletAddress = publicKey.toString();
      const sanitizedUsername = validation.data.toLowerCase();
      
      const { data, error } = await supabase
        .from('player_profiles')
        .insert({
          wallet_address: walletAddress,
          username: sanitizedUsername,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('Username taken', {
            description: 'Please choose a different username.',
          });
        } else {
          throw error;
        }
        return false;
      }

      setProfile(data);
      setNeedsUsername(false);
      toast.success('Profile created!', {
        description: `Welcome, ${sanitizedUsername}!`,
      });
      return true;
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile');
      return false;
    }
  };

  const addChefCoins = async (amount: number, description: string): Promise<boolean> => {
    if (!profile) return false;

    try {
      // Use atomic database function
      const { data, error } = await supabase.rpc('add_chef_coins', {
        p_wallet_address: profile.wallet_address,
        p_amount: amount,
        p_description: description,
        p_daily_limit: DAILY_CHEF_COINS_LIMIT,
      });

      if (error) throw error;

      const result = data?.[0];
      if (!result?.success) {
        toast.error(result?.error_message || 'Failed to add Chef Coins');
        return false;
      }

      // Reload profile to get updated balance
      await loadProfile();
      
      toast.success(`+${amount} Chef Coins`, {
        description: description,
      });
      
      return true;
    } catch (error) {
      console.error('Error adding chef coins:', error);
      toast.error('Failed to update balance');
      return false;
    }
  };

  const spendChefCoins = async (amount: number, description: string): Promise<boolean> => {
    if (!profile) {
      toast.error('Profile not found');
      return false;
    }

    try {
      // Use atomic database function
      const { data, error } = await supabase.rpc('spend_chef_coins', {
        p_wallet_address: profile.wallet_address,
        p_amount: amount,
        p_description: description,
      });

      if (error) throw error;

      const result = data?.[0];
      if (!result?.success) {
        toast.error(result?.error_message || 'Failed to spend Chef Coins');
        return false;
      }

      // Reload profile to get updated balance
      await loadProfile();
      
      toast.success(`-${amount} Chef Coins`, {
        description: description,
      });
      
      return true;
    } catch (error) {
      console.error('Error spending chef coins:', error);
      toast.error('Failed to update balance');
      return false;
    }
  };

  return {
    profile,
    loading,
    needsUsername,
    createProfile,
    addChefCoins,
    spendChefCoins,
    reloadProfile: loadProfile,
  };
};
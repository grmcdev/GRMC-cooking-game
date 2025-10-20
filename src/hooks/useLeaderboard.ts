import { useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useLeaderboard = () => {
  const { publicKey, connected } = useWallet();

  const submitScore = useCallback(
    async (levelId: number, score: number, runDuration: number) => {
      if (!connected || !publicKey) {
        toast.error('Wallet not connected', {
          description: 'Connect your wallet to submit scores.',
        });
        return false;
      }

      try {
        const walletAddress = publicKey.toString();

        // Get username from player profile
        const { data: profileData } = await supabase
          .from('player_profiles')
          .select('username')
          .eq('wallet_address', walletAddress)
          .single();

        const username = profileData?.username || null;

        // Check if entry exists
        const { data: existing } = await supabase
          .from('leaderboards')
          .select('*')
          .eq('wallet_address', walletAddress)
          .eq('level_id', levelId)
          .maybeSingle();

        if (existing) {
          // Update if new score is higher
          if (score > existing.score) {
            const { error } = await supabase
              .from('leaderboards')
              .update({
                score,
                run_duration: runDuration,
                username,
              })
              .eq('wallet_address', walletAddress)
              .eq('level_id', levelId);

            if (error) throw error;

            toast.success('New High Score!', {
              description: `Your score of ${score} has been recorded.`,
            });
            return true;
          } else {
            toast.info('Score not improved', {
              description: `Your best score is still ${existing.score}.`,
            });
            return false;
          }
        } else {
          // Insert new entry
          const { error } = await supabase
            .from('leaderboards')
            .insert({
              wallet_address: walletAddress,
              level_id: levelId,
              score,
              run_duration: runDuration,
              username,
            });

          if (error) throw error;

          toast.success('Score Submitted!', {
            description: `Your score of ${score} has been recorded.`,
          });
          return true;
        }
      } catch (error) {
        console.error('Error submitting score:', error);
        toast.error('Failed to submit score', {
          description: 'Please try again later.',
        });
        return false;
      }
    },
    [connected, publicKey]
  );

  return {
    submitScore,
    connected,
  };
};

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

// Auto-processes pending swaps every 30 seconds
const POLL_INTERVAL = 30000; // 30 seconds
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SWAP_SECRET = import.meta.env.VITE_SWAP_PROCESSOR_SECRET;

export const useSwapProcessor = () => {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const processSwaps = async () => {
      try {
        console.log('[SwapProcessor] Processing pending swaps...');

        // Process GRMC to Chef swaps
        const grmc2chefResponse = await fetch(
          `${SUPABASE_URL}/functions/v1/process-grmc-to-chef-swaps`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-swap-secret': SWAP_SECRET || '',
            },
          }
        );

        if (!grmc2chefResponse.ok) {
          console.error('[SwapProcessor] GRMC→Chef error:', await grmc2chefResponse.text());
        } else {
          const grmc2chefResult = await grmc2chefResponse.json();
          console.log('[SwapProcessor] GRMC→Chef result:', grmc2chefResult);
          
          if (grmc2chefResult.processed > 0) {
            toast.success(`Processed ${grmc2chefResult.processed} GRMC→Chef swap(s)`);
          }
        }

        // Process Chef to GRMC swaps
        const chef2grmcResponse = await fetch(
          `${SUPABASE_URL}/functions/v1/process-chef-to-grmc-swaps`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-swap-secret': SWAP_SECRET || '',
            },
          }
        );

        if (!chef2grmcResponse.ok) {
          console.error('[SwapProcessor] Chef→GRMC error:', await chef2grmcResponse.text());
        } else {
          const chef2grmcResult = await chef2grmcResponse.json();
          console.log('[SwapProcessor] Chef→GRMC result:', chef2grmcResult);
          
          if (chef2grmcResult.processed > 0) {
            toast.success(`Processed ${chef2grmcResult.processed} Chef→GRMC swap(s)`);
          }
        }
      } catch (error) {
        console.error('[SwapProcessor] Error processing swaps:', error);
        // Don't show error toast to avoid spamming users
      }
    };

    // Run immediately on mount
    processSwaps();

    // Set up interval for subsequent runs
    intervalRef.current = window.setInterval(processSwaps, POLL_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return null;
};

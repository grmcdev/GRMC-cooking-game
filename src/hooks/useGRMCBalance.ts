import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// GRMC Token Configuration
const GRMC_MINT_ADDRESS = "6Q7EMLd1BL15TaJ5dmXa2xBoxEU4oj3MLRQd5sCpotuK";
const GRMC_TREASURY_WALLET = "12GCzXY2QecJrW7rwLoxMDSDjhgzaC4DsN9oL3Xw9xG9";
const MIN_GRMC_BALANCE = 1000; // Minimum balance required (0 = any amount)

export const useGRMCBalance = () => {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const checkBalance = async (isManualRefresh = false) => {
    if (!connected || !publicKey) {
      setBalance(0);
      setHasAccess(false);
      return;
    }

    setLoading(true);
    try {
      // Call the edge function instead of directly querying RPC
      const { data, error } = await supabase.functions.invoke('check-grmc-balance', {
        body: { walletAddress: publicKey.toString() }
      });

      if (error) throw error;

      const totalBalance = data?.balance || 0;
      
      setBalance(totalBalance);
      setHasAccess(totalBalance >= MIN_GRMC_BALANCE);
      setHasError(false);
      setRetryCount(0);

      if (isManualRefresh && totalBalance < MIN_GRMC_BALANCE) {
        toast.error("Insufficient GRMC Balance", {
          description: `You need at least ${MIN_GRMC_BALANCE} GRMC tokens to play.`,
        });
      }
      
      if (isManualRefresh) {
        toast.success("Balance Updated", {
          description: `${totalBalance.toFixed(2)} GRMC`,
        });
      }
    } catch (error) {
      console.error("Error checking GRMC balance:", error);
      
      setHasError(true);
      
      if (isManualRefresh) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        toast.error("Error checking token balance", {
          description: errorMessage,
        });
      }
      
      if (balance === 0) {
        setHasAccess(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!connected || !publicKey) {
      setBalance(0);
      setHasAccess(false);
      setHasError(false);
      return;
    }

    checkBalance();

    const getInterval = () => {
      if (hasError) {
        return Math.min(60000 * Math.pow(2, retryCount), 300000);
      }
      return 90000;
    };

    const interval = setInterval(() => {
      checkBalance();
      if (hasError) {
        setRetryCount(prev => prev + 1);
      }
    }, getInterval());

    return () => clearInterval(interval);
  }, [publicKey, connected, hasError, retryCount]);

  const refetch = () => {
    checkBalance(true);
  };

  return {
    balance,
    loading,
    hasAccess,
    hasError,
    connected,
    walletAddress: publicKey?.toString(),
    refetch,
  };
};

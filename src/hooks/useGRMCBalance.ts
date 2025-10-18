import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";

// GRMC Token Configuration
const GRMC_MINT_ADDRESS = "6Q7EMLd1BL15TaJ5dmXa2xBoxEU4oj3MLRQd5sCpotuK";
const GRMC_TREASURY_WALLET = "9Ctm5fCGoLrdXVZAkdKNBZnkf3YF5qD4Ejjdge4cmaWX";
const MIN_GRMC_BALANCE = 1000; // Minimum balance required (0 = any amount)

export const useGRMCBalance = () => {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey) {
      setBalance(0);
      setHasAccess(false);
      return;
    }

    const checkBalance = async () => {
      setLoading(true);
      try {
        const mintPubkey = new PublicKey(GRMC_MINT_ADDRESS);

        // Get token accounts for the wallet
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          mint: mintPubkey,
        });

        let totalBalance = 0;
        tokenAccounts.value.forEach((accountInfo) => {
          const amount = accountInfo.account.data.parsed.info.tokenAmount.uiAmount;
          totalBalance += amount || 0;
        });

        setBalance(totalBalance);
        setHasAccess(totalBalance >= MIN_GRMC_BALANCE);

        if (totalBalance < MIN_GRMC_BALANCE) {
          toast.error("Insufficient GRMC Balance", {
            description: `You need at least ${MIN_GRMC_BALANCE} GRMC tokens to play.`,
          });
        }
      } catch (error) {
        console.error("Error checking GRMC balance:", error);
        toast.error("Error checking token balance", {
          description: "Please try reconnecting your wallet.",
        });
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkBalance();

    // Re-check balance every 30 seconds
    const interval = setInterval(checkBalance, 30000);
    return () => clearInterval(interval);
  }, [connection, publicKey, connected]);

  return {
    balance,
    loading,
    hasAccess,
    connected,
    walletAddress: publicKey?.toString(),
  };
};

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { useGRMCBalance } from "@/hooks/useGRMCBalance";
import { useSwapProcessor } from "@/hooks/useSwapProcessor";
import { ArrowLeft, ArrowLeftRight, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress, 
  createTransferInstruction 
} from "@solana/spl-token";

export default function Transfer() {
  const navigate = useNavigate();
  const { profile } = usePlayerProfile();
  const { balance: grmc } = useGRMCBalance();
  const { publicKey, signTransaction } = useWallet();
  
  // Auto-process pending swaps in background
  useSwapProcessor();
  const [grmc2ChefAmount, setGrmc2ChefAmount] = useState("");
  const [chef2GrmcAmount, setChef2GrmcAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const TAX_RATE = 0.1; // 10% tax
  const GRMC_MINT = new PublicKey('6Q7EMLd1BL15TaJ5dmXa2xBoxEU4oj3MLRQd5sCpotuK');
  const TREASURY_WALLET = new PublicKey('12GCzXY2QecJrW7rwLoxMDSDjhgzaC4DsN9oL3Xw9xG9');
  
  // Use environment variable for RPC endpoint, fallback to public endpoint
  const connection = new Connection(
    import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    'confirmed'
  );

  const handleGRMCtoChef = async () => {
    const amount = parseFloat(grmc2ChefAmount);
    if (!amount || amount <= 0) {
      toast.error("Invalid amount");
      return;
    }

    if (amount < 500 || amount > 8000) {
      toast.error("Amount must be between 500 and 8000 GRMC");
      return;
    }

    if (amount > grmc) {
      toast.error("Insufficient GRMC balance");
      return;
    }

    if (!publicKey || !profile?.wallet_address || !signTransaction) {
      toast.error("Wallet not connected");
      return;
    }

    setLoading(true);
    try {
      toast.info("Sending GRMC to treasury...");

      // Get token accounts
      const fromTokenAccount = await getAssociatedTokenAddress(
        GRMC_MINT,
        publicKey
      );
      
      const toTokenAccount = await getAssociatedTokenAddress(
        GRMC_MINT,
        TREASURY_WALLET
      );

      // Convert to lamports (9 decimals for GRMC)
      const amountLamports = Math.floor(amount * 1_000_000_000);

      // Create transaction
      const transaction = new Transaction().add(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          publicKey,
          amountLamports,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign and send
      const signed = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      
      toast.info("Confirming transaction...");
      
      // Wait for confirmation
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      // Create swap request with transaction signature - processed automatically
      const { error: dbError } = await supabase.from('swap_requests').insert({
        wallet_address: profile.wallet_address,
        swap_type: 'grmc_to_chef',
        amount: Math.floor(amount),
        status: 'pending',
        transaction_signature: signature
      });

      if (dbError) {
        // Handle unique constraint violation for duplicate transactions
        if (dbError.code === '23505') {
          toast.error("This transaction has already been processed.");
        } else {
          throw dbError;
        }
        return;
      }

      toast.success("GRMC sent to treasury!", {
        description: `You will receive ${Math.floor(amount * 0.9)} Chef Coins within 2-3 minutes.`,
        duration: 5000
      });
      setGrmc2ChefAmount("");
    } catch (error) {
      console.error('Swap error:', error);
      toast.error("Swap failed", {
        description: error instanceof Error ? error.message : "Please try again later"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheftoGRMC = async () => {
    const amount = parseFloat(chef2GrmcAmount);
    if (!amount || amount <= 0) {
      toast.error("Invalid amount");
      return;
    }

    if (amount < 500) {
      toast.error("Minimum swap is 500 Chef Coins");
      return;
    }

    if (amount > 8000) {
      toast.error("Maximum swap is 8000 Chef Coins");
      return;
    }

    if (!profile || amount > profile.chef_coins_balance) {
      toast.error("Insufficient Chef Coins");
      return;
    }

    if (!publicKey || !profile?.wallet_address) {
      toast.error("Wallet not connected");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('swap_requests').insert({
        wallet_address: profile.wallet_address,
        swap_type: 'chef_to_grmc',
        amount: Math.floor(amount),
        status: 'pending'
      });

      if (error) {
        // Handle constraint violations
        if (error.code === '23514') {
          toast.error("Invalid swap amount. Must be between 500 and 8000.");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Swap request created!", {
        description: `You will receive ${Math.floor(amount * 0.9)} GRMC within 2-3 minutes.`,
        duration: 5000
      });
      setChef2GrmcAmount("");
    } catch (error) {
      console.error('Swap error:', error);
      toast.error("Swap failed", {
        description: "Please try again later"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateReceived = (amount: string) => {
    const num = parseFloat(amount);
    if (!num || num <= 0) return 0;
    return Math.floor(num * (1 - TAX_RATE));
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-accent mb-2 flex items-center justify-center gap-3">
            <ArrowLeftRight className="w-10 h-10" />
            CURRENCY EXCHANGE
          </h1>
          <p className="text-muted-foreground">
            Convert between GRMC and Chef Coins (10% tax applies)
          </p>
        </div>

        {/* Balance Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="game-panel bg-wood p-6">
            <div className="flex items-center gap-3">
              <Coins className="w-8 h-8 text-accent" />
              <div>
                <div className="text-sm text-muted-foreground">GRMC Balance</div>
                <div className="text-2xl font-bold text-foreground">{grmc.toFixed(2)}</div>
              </div>
            </div>
          </Card>
          
          <Card className="game-panel bg-wood p-6">
            <div className="flex items-center gap-3">
              <Coins className="w-8 h-8 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Chef Coins</div>
                <div className="text-2xl font-bold text-foreground">{profile?.chef_coins_balance || 0}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Conversion Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GRMC to Chef */}
          <Card className="game-panel bg-wood p-6">
            <h2 className="text-xl font-bold mb-4 text-center text-accent">GRMC → Chef Coins</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Amount (GRMC)</label>
                <Input
                  type="number"
                  value={grmc2ChefAmount}
                  onChange={(e) => setGrmc2ChefAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                />
              </div>
              
              {grmc2ChefAmount && (
                <div className="bg-background/50 p-3 rounded">
                  <div className="text-sm text-muted-foreground">You will receive</div>
                  <div className="text-xl font-bold text-primary">
                    {calculateReceived(grmc2ChefAmount)} Chef Coins
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    (After 10% tax)
                  </div>
                </div>
              )}
              
              <Button
                className="w-full"
                onClick={handleGRMCtoChef}
                disabled={loading || !grmc2ChefAmount || parseFloat(grmc2ChefAmount) <= 0}
              >
                Convert to Chef Coins
              </Button>
            </div>
          </Card>

          {/* Chef to GRMC */}
          <Card className="game-panel bg-wood p-6">
            <h2 className="text-xl font-bold mb-4 text-center text-primary">Chef Coins → GRMC</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Amount (Chef Coins)</label>
                <Input
                  type="number"
                  value={chef2GrmcAmount}
                  onChange={(e) => setChef2GrmcAmount(e.target.value)}
                  placeholder="Enter amount (500-8000)"
                  min="500"
                  max="8000"
                  step="1"
                />
              </div>
              
              {chef2GrmcAmount && (
                <div className="bg-background/50 p-3 rounded">
                  <div className="text-sm text-muted-foreground">You will receive</div>
                  <div className="text-xl font-bold text-accent">
                    {calculateReceived(chef2GrmcAmount)} GRMC
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    (After 10% tax)
                  </div>
                </div>
              )}
              
              <div className="text-xs text-muted-foreground">
                Min: 500 | Max: 8000 Chef Coins
              </div>
              
              <Button
                className="w-full"
                onClick={handleCheftoGRMC}
                disabled={loading || !chef2GrmcAmount || parseFloat(chef2GrmcAmount) < 500 || parseFloat(chef2GrmcAmount) > 8000}
              >
                Convert to GRMC
              </Button>
            </div>
          </Card>
        </div>

        {/* Info */}
        <div className="mt-8 game-panel bg-wood/50 p-4 text-center text-sm text-muted-foreground">
          <p>💡 All conversions are subject to a 10% tax. Swaps are processed automatically.</p>
        </div>
      </div>
    </div>
  );
}
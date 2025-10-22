import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Connection, PublicKey } from "npm:@solana/web3.js@1.98.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GRMC_MINT_ADDRESS = "6Q7EMLd1BL15TaJ5dmXa2xBoxEU4oj3MLRQd5sCpotuK";
const RPC_ENDPOINT = Deno.env.get('SOLANA_RPC_URL') || 'https://solana-mainnet.g.alchemy.com/v2/demo';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { walletAddress } = await req.json();
    
    if (!walletAddress) {
      return new Response(
        JSON.stringify({ error: 'Wallet address is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking GRMC balance for wallet: ${walletAddress}`);
    
    // Create connection to Solana
    const connection = new Connection(RPC_ENDPOINT, 'confirmed');
    
    // Convert wallet address and mint address to PublicKey
    const walletPubkey = new PublicKey(walletAddress);
    const mintPubkey = new PublicKey(GRMC_MINT_ADDRESS);

    // Get token accounts for the wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPubkey, {
      mint: mintPubkey,
    });

    let totalBalance = 0;
    tokenAccounts.value.forEach((accountInfo) => {
      const amount = accountInfo.account.data.parsed.info.tokenAmount.uiAmount;
      totalBalance += amount || 0;
    });

    console.log(`GRMC balance for ${walletAddress}: ${totalBalance}`);

    return new Response(
      JSON.stringify({ 
        balance: totalBalance,
        walletAddress,
        success: true 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error checking GRMC balance:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to check GRMC balance';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false,
        balance: 0
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Connection, PublicKey } from 'https://esm.sh/@solana/web3.js@1.98.0';
import { getAssociatedTokenAddress, getAccount } from 'https://esm.sh/@solana/spl-token@0.3.11';

const GRMC_MINT_ADDRESS = '6Q7EMLd1BL15TaJ5dmXa2xBoxEU4oj3MLRQd5sCpotuK';
const TREASURY_WALLET = '12GCzXY2QecJrW7rwLoxMDSDjhgzaC4DsN9oL3Xw9xG9';
const TAX_RATE = 0.1; // 10% tax
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate swap processor secret
  const authSecret = Deno.env.get('SWAP_PROCESSOR_SECRET');
  const providedSecret = req.headers.get('x-swap-secret');

  if (providedSecret !== authSecret) {
    console.error('Unauthorized swap processing attempt');
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    console.log('Processing GRMC → Chef Coin swap requests...');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const connection = new Connection(SOLANA_RPC, 'confirmed');
    const mintPubkey = new PublicKey(GRMC_MINT_ADDRESS);
    const treasuryPubkey = new PublicKey(TREASURY_WALLET);

    // Get pending swap requests
    const { data: swapRequests, error: fetchError } = await supabaseClient
      .from('swap_requests')
      .select('*')
      .eq('swap_type', 'grmc_to_chef')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (fetchError) throw fetchError;

    console.log(`Found ${swapRequests?.length || 0} pending swap requests`);

    let processed = 0;
    let failed = 0;

    for (const request of swapRequests || []) {
      try {
        // Mark as processing
        await supabaseClient
          .from('swap_requests')
          .update({ status: 'processing' })
          .eq('id', request.id);

        // Validate min/max amounts
        if (request.amount < 500 || request.amount > 8000) {
          throw new Error('Invalid swap amount');
        }

        // CRITICAL SECURITY: Verify GRMC transfer with transaction signature
        if (!request.transaction_signature) {
          throw new Error('Transaction signature required for verification');
        }

        // Fetch and verify the transaction from blockchain
        let txInfo;
        try {
          txInfo = await connection.getTransaction(request.transaction_signature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0,
          });
        } catch (txError) {
          throw new Error(`Failed to fetch transaction: ${txError instanceof Error ? txError.message : String(txError)}`);
        }

        if (!txInfo || !txInfo.meta) {
          throw new Error('Transaction not found or not confirmed');
        }

        // Verify transaction succeeded
        if (txInfo.meta.err) {
          throw new Error('Transaction failed on blockchain');
        }

        // Verify transaction is recent (within last hour)
        const txTimestamp = txInfo.blockTime;
        const currentTime = Math.floor(Date.now() / 1000);
        if (!txTimestamp || currentTime - txTimestamp > 3600) {
          throw new Error('Transaction too old (>1 hour) or timestamp unavailable');
        }

        // Verify treasury received the tokens by checking token balance changes
        const preBalances = txInfo.meta.preTokenBalances || [];
        const postBalances = txInfo.meta.postTokenBalances || [];
        
        let transferredToTreasury = false;
        let transferAmount = 0;

        // Find treasury account in token balance changes
        for (const postBalance of postBalances) {
          const preBalance = preBalances.find(
            (pb) => pb.accountIndex === postBalance.accountIndex
          );
          
          // Check if this is the treasury account and it received tokens
          if (postBalance.owner === treasuryPubkey.toBase58() && 
              postBalance.mint === GRMC_MINT_ADDRESS) {
            const preAmount = preBalance?.uiTokenAmount?.uiAmount || 0;
            const postAmount = postBalance.uiTokenAmount?.uiAmount || 0;
            transferAmount = postAmount - preAmount;
            
            if (transferAmount >= request.amount) {
              transferredToTreasury = true;
              break;
            }
          }
        }

        if (!transferredToTreasury) {
          throw new Error(
            `Treasury did not receive sufficient GRMC. Required: ${request.amount}, Received: ${transferAmount}`
          );
        }

        console.log(`✅ Verified ${request.amount} GRMC transferred to treasury via tx: ${request.transaction_signature}`);

        // Calculate chef coins after tax
        const afterTax = Math.floor(request.amount * (1 - TAX_RATE));

        // Use atomic function to add chef coins (prevents race conditions)
        const { data: addResult, error: addError } = await supabaseClient
          .rpc('add_chef_coins', {
            p_wallet_address: request.wallet_address,
            p_amount: afterTax,
            p_description: `Swapped ${request.amount} GRMC for ${afterTax} Chef Coins`,
            p_daily_limit: 999999, // No daily limit for swaps
          });

        if (addError) throw addError;

        const result = addResult?.[0];
        if (!result?.success) {
          throw new Error(result?.error_message || 'Failed to add Chef Coins');
        }

        // Mark as completed with transaction signature
        await supabaseClient
          .from('swap_requests')
          .update({
            status: 'completed',
            processed_at: new Date().toISOString(),
          })
          .eq('id', request.id);

        processed++;
        console.log(`✓ Processed swap for ${request.wallet_address}: ${afterTax} Chef Coins`);
      } catch (error) {
        console.error(`✗ Failed to process swap ${request.id}:`, error);
        
        await supabaseClient
          .from('swap_requests')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : String(error),
            processed_at: new Date().toISOString(),
          })
          .eq('id', request.id);

        failed++;
      }
    }

    console.log(`Swap processing complete: ${processed} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        processed,
        failed,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in swap processing:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
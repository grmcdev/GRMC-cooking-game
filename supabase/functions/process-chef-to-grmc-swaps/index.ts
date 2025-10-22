import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Connection, Keypair, PublicKey, Transaction, SystemProgram } from 'https://esm.sh/@solana/web3.js@1.98.4';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } from 'https://esm.sh/@solana/spl-token@0.3.11';

const GRMC_MINT_ADDRESS = '6Q7EMLd1BL15TaJ5dmXa2xBoxEU4oj3MLRQd5sCpotuK';
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
    console.log('Processing Chef Coin → GRMC swap requests...');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const connection = new Connection(SOLANA_RPC, 'confirmed');
    const treasuryPrivateKey = Deno.env.get('TREASURY_WALLET_PRIVATE_KEY');
    
    if (!treasuryPrivateKey) {
      throw new Error('Treasury private key not configured');
    }

    const treasuryKeypair = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(treasuryPrivateKey))
    );

    // Get pending swap requests
    const { data: swapRequests, error: fetchError } = await supabaseClient
      .from('swap_requests')
      .select('*')
      .eq('swap_type', 'chef_to_grmc')
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

        // Calculate amounts (10% tax)
        const afterTax = Math.floor(request.amount * (1 - TAX_RATE));

        // Get player's token account
        const playerPubkey = new PublicKey(request.wallet_address);
        const mintPubkey = new PublicKey(GRMC_MINT_ADDRESS);
        
        const playerTokenAccount = await getAssociatedTokenAddress(
          mintPubkey,
          playerPubkey
        );

        const treasuryTokenAccount = await getAssociatedTokenAddress(
          mintPubkey,
          treasuryKeypair.publicKey
        );

        // Create transfer instruction
        const transferInstruction = createTransferInstruction(
          treasuryTokenAccount,
          playerTokenAccount,
          treasuryKeypair.publicKey,
          afterTax * 1_000_000_000, // Convert to token decimals (GRMC has 9 decimals)
          [],
          TOKEN_PROGRAM_ID
        );

        // Create and send transaction
        const transaction = new Transaction().add(transferInstruction);
        transaction.feePayer = treasuryKeypair.publicKey;
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;

        const signature = await connection.sendTransaction(
          transaction,
          [treasuryKeypair],
          { skipPreflight: false }
        );

        await connection.confirmTransaction(signature);

        // Update swap request as completed
        await supabaseClient
          .from('swap_requests')
          .update({
            status: 'completed',
            transaction_signature: signature,
            processed_at: new Date().toISOString(),
          })
          .eq('id', request.id);

        // Get current profile
        const { data: profile } = await supabaseClient
          .from('player_profiles')
          .select('chef_coins_balance')
          .eq('wallet_address', request.wallet_address)
          .single();

        // Update player profile (deduct chef coins)
        await supabaseClient
          .from('player_profiles')
          .update({
            chef_coins_balance: (profile?.chef_coins_balance || 0) - request.amount
          })
          .eq('wallet_address', request.wallet_address);

        // Log transaction
        await supabaseClient
          .from('chef_coins_transactions')
          .insert({
            wallet_address: request.wallet_address,
            transaction_type: 'swap_out',
            amount: -request.amount,
            description: `Swapped ${request.amount} Chef Coins for ${afterTax} GRMC`,
          });

        processed++;
        console.log(`✓ Processed swap for ${request.wallet_address}: ${afterTax} GRMC`);
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
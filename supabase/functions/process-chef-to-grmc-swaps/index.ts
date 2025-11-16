import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Connection, Keypair, PublicKey, Transaction, SystemProgram } from 'https://esm.sh/@solana/web3.js@1.98.0';
import { 
  getAssociatedTokenAddress, 
  createTransferInstruction, 
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID 
} from 'https://esm.sh/@solana/spl-token@0.3.11';

const GRMC_MINT_ADDRESS = '6Q7EMLd1BL15TaJ5dmXa2xBoxEU4oj3MLRQd5sCpotuK';
const TREASURY_WALLET = '12GCzXY2QecJrW7rwLoxMDSDjhgzaC4DsN9oL3Xw9xG9'; // Hardcoded treasury wallet address
const TAX_RATE = 0.1; // 10% tax
const SOLANA_RPC = Deno.env.get('SOLANA_RPC_URL') || 'https://api.mainnet-beta.solana.com';

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

    // Validate that the keypair matches the hardcoded treasury wallet
    if (treasuryKeypair.publicKey.toBase58() !== TREASURY_WALLET) {
      throw new Error(
        `Treasury wallet mismatch! Private key derives to ${treasuryKeypair.publicKey.toBase58()} but expected ${TREASURY_WALLET}. Please update TREASURY_WALLET_PRIVATE_KEY secret.`
      );
    }
    console.log(`✓ Treasury wallet validated: ${TREASURY_WALLET}`);

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

        // 🔒 CRITICAL FIX 3: Upfront balance validation
        const { data: profile, error: profileError } = await supabaseClient
          .from('player_profiles')
          .select('chef_coins_balance')
          .eq('wallet_address', request.wallet_address)
          .single();

        if (profileError) {
          throw new Error(`Profile not found: ${profileError.message}`);
        }

        if (!profile || profile.chef_coins_balance < request.amount) {
          throw new Error(`Insufficient Chef Coins balance. Has: ${profile?.chef_coins_balance || 0}, Needs: ${request.amount}`);
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

        // Use hardcoded treasury wallet address for token account derivation
        const treasuryTokenAccount = await getAssociatedTokenAddress(
          mintPubkey,
          new PublicKey(TREASURY_WALLET)
        );

        // 🔒 CRITICAL FIX 1: Check treasury token account exists and has balance
        const treasuryAccountInfo = await connection.getAccountInfo(treasuryTokenAccount);
        const transaction = new Transaction();
        
        if (!treasuryAccountInfo) {
          throw new Error(
            `Treasury token account does not exist. Treasury needs to receive GRMC at: ${treasuryTokenAccount.toBase58()}`
          );
        }

        // Verify treasury has sufficient GRMC balance
        const treasuryAccount = await getAccount(connection, treasuryTokenAccount);
        const requiredBalance = BigInt(afterTax) * BigInt(1_000_000_000);
        
        if (treasuryAccount.amount < requiredBalance) {
          throw new Error(
            `Insufficient treasury balance. Required: ${afterTax} GRMC, Available: ${Number(treasuryAccount.amount) / 1_000_000_000} GRMC. Treasury token account: ${treasuryTokenAccount.toBase58()}`
          );
        }
        
        console.log(`✓ Treasury balance verified: ${Number(treasuryAccount.amount) / 1_000_000_000} GRMC available`);

        // Check if player's token account exists, create if not
        const playerAccountInfo = await connection.getAccountInfo(playerTokenAccount);
        
        if (!playerAccountInfo) {
          console.log(`Creating token account for player ${request.wallet_address}`);
          transaction.add(
            createAssociatedTokenAccountInstruction(
              treasuryKeypair.publicKey, // payer
              playerTokenAccount,
              playerPubkey,
              mintPubkey,
              TOKEN_PROGRAM_ID,
              ASSOCIATED_TOKEN_PROGRAM_ID
            )
          );
        }

        // Create transfer instruction
        const transferInstruction = createTransferInstruction(
          treasuryTokenAccount,
          playerTokenAccount,
          treasuryKeypair.publicKey,
          afterTax * 1_000_000_000, // Convert to token decimals (GRMC has 9 decimals)
          [],
          TOKEN_PROGRAM_ID
        );

        // Add transfer to transaction
        transaction.add(transferInstruction);
        transaction.feePayer = treasuryKeypair.publicKey;
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;

        const signature = await connection.sendTransaction(
          transaction,
          [treasuryKeypair],
          { skipPreflight: false }
        );

        await connection.confirmTransaction(signature);

        // 🔒 CRITICAL FIX 2: Use atomic spend_chef_coins RPC to prevent race conditions
        const { data: spendResult, error: spendError } = await supabaseClient
          .rpc('spend_chef_coins', {
            p_wallet_address: request.wallet_address,
            p_amount: request.amount,
            p_description: `Swapped ${request.amount} Chef Coins for ${afterTax} GRMC (tx: ${signature.slice(0, 8)}...)`
          });

        if (spendError || !spendResult?.[0]?.success) {
          // Blockchain transfer succeeded but Chef Coins deduction failed
          // Mark as failed so admin can manually refund
          throw new Error(
            `CRITICAL: Blockchain transfer succeeded (${signature}) but Chef Coins deduction failed: ${spendError?.message || spendResult?.[0]?.error_message || 'Unknown error'}. Manual refund required.`
          );
        }

        console.log(`✓ Atomically deducted ${request.amount} Chef Coins. New balance: ${spendResult[0].new_balance}`);

        // Update swap request as completed
        await supabaseClient
          .from('swap_requests')
          .update({
            status: 'completed',
            transaction_signature: signature,
            processed_at: new Date().toISOString(),
          })
          .eq('id', request.id);

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
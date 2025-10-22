-- Fix #1: Prevent transaction replay attacks
-- Create unique partial index on transaction_signature to prevent reusing the same Solana transaction
CREATE UNIQUE INDEX unique_transaction_signature_idx 
ON public.swap_requests (transaction_signature) 
WHERE transaction_signature IS NOT NULL;

-- Fix #2: Server-side validation for swap amounts
-- Add CHECK constraint to enforce 500-8000 range at database level
ALTER TABLE public.swap_requests
ADD CONSTRAINT valid_swap_amount 
CHECK (amount >= 500 AND amount <= 8000);
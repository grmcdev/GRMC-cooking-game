# Production Setup Guide

## ✅ Security Fixes Implemented

The following critical security fixes have been implemented:

### 1. Transaction Replay Protection ✅
- **Fixed**: Added unique index on `transaction_signature` to prevent duplicate processing
- **Impact**: Users can no longer reuse the same Solana transaction to get unlimited Chef Coins

### 2. Server-Side Amount Validation ✅
- **Fixed**: Added CHECK constraint to enforce 500-8000 range at database level
- **Impact**: Invalid swap amounts are rejected at the database level, not just client-side

### 3. Removed Client-Side Swap Triggering ✅
- **Fixed**: Removed `supabase.functions.invoke()` calls from Transfer.tsx
- **Impact**: Swap processing no longer exposes attack surface through client code

---

## 🔧 Required Manual Setup

### Enable Automatic Swap Processing (Cron Jobs)

Since swap processing is no longer triggered from the client, you need to set up automatic processing via cron jobs in Supabase.

**Option 1: Using Supabase Dashboard (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Extensions**
3. Enable the `pg_cron` extension
4. Navigate to **SQL Editor** and run:

```sql
-- Process GRMC → Chef swaps every 2 minutes
SELECT cron.schedule(
  'process-grmc-to-chef-swaps',
  '*/2 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://mmmnghihshsjuawwcplj.supabase.co/functions/v1/process-grmc-to-chef-swaps',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-swap-secret', current_setting('app.settings.swap_processor_secret', true)
    ),
    body := jsonb_build_object('time', now())
  );
  $$
);

-- Process Chef → GRMC swaps every 2 minutes
SELECT cron.schedule(
  'process-chef-to-grmc-swaps',
  '*/2 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://mmmnghihshsjuawwcplj.supabase.co/functions/v1/process-chef-to-grmc-swaps',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-swap-secret', current_setting('app.settings.swap_processor_secret', true)
    ),
    body := jsonb_build_object('time', now())
  );
  $$
);
```

**Option 2: Using External Cron Service**

If `pg_cron` is not available, use an external service like:
- Vercel Cron Jobs
- GitHub Actions (scheduled workflows)
- Any server with cron capability

Set up HTTP POST requests to your edge functions with the `x-swap-secret` header.

---

## 🔒 Additional Security Recommendations

### 1. Enable Leaked Password Protection
A security warning was detected for leaked password protection. To enable:

1. Go to Supabase Dashboard → **Authentication** → **Policies**
2. Enable **Leaked Password Protection**
3. This checks passwords against known breached password databases

### 2. Add Helius RPC URL (Optional but Recommended)
For better performance and transaction fee rebates:

1. Sign up at https://helius.dev
2. Get your API key
3. Add to your `.env`:
```
VITE_HELIUS_RPC_URL="https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY"
```

### 3. Monitor Swap Processing
- Check edge function logs regularly for errors
- Monitor the `swap_requests` table for stuck requests
- Set up alerts for failed swaps

---

## 🧪 Testing Checklist

Before going live, test:

- [ ] Create a GRMC → Chef swap and verify it processes within 2-3 minutes
- [ ] Try creating duplicate swap with same transaction signature (should fail)
- [ ] Try creating swap with invalid amount like 100 or 10000 (should fail)
- [ ] Create a Chef → GRMC swap and verify GRMC is received
- [ ] Check edge function logs for any errors

---

## 📊 Monitoring

### Key Metrics to Track
- Swap request status distribution (pending/completed/failed)
- Average swap processing time
- Failed swap reasons (check error_message field)
- Edge function execution times and errors

### SQL Query for Monitoring
```sql
-- Check pending swaps
SELECT * FROM swap_requests 
WHERE status = 'pending' 
ORDER BY created_at DESC;

-- Check failed swaps
SELECT * FROM swap_requests 
WHERE status = 'failed' 
ORDER BY created_at DESC 
LIMIT 10;

-- Swap statistics
SELECT 
  swap_type,
  status,
  COUNT(*) as count,
  AVG(amount) as avg_amount
FROM swap_requests 
GROUP BY swap_type, status;
```

---

## 🚀 You're Ready for Production!

All critical security vulnerabilities have been fixed. Once you set up the cron jobs, your swap system will be production-ready.

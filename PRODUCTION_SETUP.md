# Production Setup Guide - Gordon's Minecraft Nightmares

## 🎯 Quick Start: Frontend Polling

This system uses **frontend polling** to automatically process swap requests. When users visit the Transfer page, it polls the swap processor edge functions every 30 seconds.

### How It Works
1. User opens the Transfer page (`/transfer`)
2. Background polling starts automatically
3. Every 30 seconds: Processes all pending GRMC↔Chef swaps
4. Swaps complete within 30-60 seconds while page is open

### ✅ Already Implemented
- ✅ Transaction replay protection
- ✅ Server-side amount validation (500-8000 GRMC)
- ✅ Frontend polling hook (`useSwapProcessor`)
- ✅ Automatic background processing
- ✅ Secure RPC configuration

### ⚠️ Required Configuration

**You must complete these steps for the swap system to work:**

1. **Add VITE_SWAP_PROCESSOR_SECRET** to `.env` file (Step 1)
2. **Configure SOLANA_RPC_URL Secret** (Step 2) 
3. **(Optional) Set Up Backup Cron Job** (Step 3)

---

## 🔐 Step 1: Configure Frontend Swap Processor Secret

### Add to .env File

The frontend polling system needs a secret to authenticate with the swap processor edge functions.

1. **Open your `.env` file** (in project root)

2. **Add this line** (replace `your-secret-here` with a secure random string):
   ```env
   VITE_SWAP_PROCESSOR_SECRET=your-secret-here
   ```

3. **Generate a secure secret** using one of these methods:
   ```bash
   # Method 1: OpenSSL
   openssl rand -hex 32
   
   # Method 2: Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Important**: This value **must match** the `SWAP_PROCESSOR_SECRET` already configured in your backend secrets

### How Frontend Polling Works

- **Auto-start**: Polling begins when user opens Transfer page
- **Interval**: Checks for pending swaps every 30 seconds
- **Scope**: Processes ALL pending swaps (not just current user's)
- **Background**: Runs silently without blocking UI
- **Notifications**: Shows toast messages when swaps complete

### Advantages
✅ No database configuration needed  
✅ Works immediately after adding secret  
✅ Processes swaps for all users  
✅ Easy to debug via console logs  

### Limitations
⚠️ Requires at least one user to have Transfer page open  
⚠️ 30-60 second processing delay  
⚠️ Consider backup cron job for 24/7 processing (Step 3)  

---

## 🔐 Step 2: Configure Solana RPC Secret

**REQUIRED:** All API keys must be stored as secrets, not hardcoded in code.

### 1.1 Set SOLANA_RPC_URL Secret

1. Go to your Supabase Dashboard → **Settings** → **Edge Functions** → **Manage Secrets**
2. Add a new secret named `SOLANA_RPC_URL`
3. Set the value to your Helius RPC endpoint with API key:
   ```
   https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY_HERE
   ```

⚠️ **Important:** The edge functions will fallback to the public Solana RPC (`https://api.mainnet-beta.solana.com`) if this secret is not set, which has:
- Strict rate limits
- Slower transaction confirmation
- Higher failure rates

### 1.2 Frontend RPC Configuration (Optional)

To use a custom RPC in the frontend (wallet connections and transfers), add to your `.env` file:
```env
VITE_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY_HERE
```

If not set, the frontend will fallback to the public Solana RPC endpoint.

**Why separate frontend/backend RPC?**
- Backend (edge functions): Uses `SOLANA_RPC_URL` secret (secure)
- Frontend (browser): Uses `VITE_SOLANA_RPC_URL` env variable (public, rate-limited per browser)

---

## 🔄 Step 3: (Optional) Backup Cron Job

### Why Use a Backup Cron Job?

Frontend polling works great when users are online. A backup ensures 24/7 swap processing when:
- No users have Transfer page open
- All users close their browsers
- You need guaranteed processing without relying on user activity

### Recommended: cron-job.org Setup

[cron-job.org](https://cron-job.org) is a free service that can call your edge functions on schedule.

**Create Two Cron Jobs:**

**Job 1: Process GRMC→Chef Swaps**
- **URL**: `https://mmmnghihshsjuawwcplj.supabase.co/functions/v1/process-grmc-to-chef-swaps`
- **Method**: POST
- **Schedule**: Every 2 minutes (`*/2 * * * *`)
- **Headers**:
  ```
  Content-Type: application/json
  x-swap-secret: YOUR_VITE_SWAP_PROCESSOR_SECRET
  ```
- **Body**: `{"trigger": "cron"}`

**Job 2: Process Chef→GRMC Swaps**
- **URL**: `https://mmmnghihshsjuawwcplj.supabase.co/functions/v1/process-chef-to-grmc-swaps`
- **Method**: POST
- **Schedule**: Every 2 minutes (`*/2 * * * *`)
- **Headers**:
  ```
  Content-Type: application/json
  x-swap-secret: YOUR_VITE_SWAP_PROCESSOR_SECRET
  ```
- **Body**: `{"trigger": "cron"}`

### Verify Setup
- Enable both cron jobs on cron-job.org
- Check execution logs after 2-4 minutes
- Verify swaps are processing in your database

### Alternative Cron Services

You can also use:
- **EasyCron** (https://www.easycron.com)
- **GitHub Actions** (scheduled workflows)
- **AWS CloudWatch Events**

All follow the same pattern: POST to edge function URLs with `x-swap-secret` header

---

## 🔒 Step 4: (Optional) Additional Security

### 4.1 Enable Leaked Password Protection

1. Go to **Authentication** → **Policies** in Supabase Dashboard
2. Find **Password Protection** section
3. Toggle ON **"Check against leaked passwords database"**
4. Click **Save**

**Why?** Prevents users from using passwords that have been exposed in data breaches.

### 4.2 Testing Frontend Polling

To verify the polling system is working:

1. **Open Transfer page** in your browser
2. **Open browser console** (F12 → Console tab)
3. **Look for logs** every 30 seconds:
   ```
   [SwapProcessor] Processing pending swaps...
   [SwapProcessor] GRMC→Chef result: {...}
   [SwapProcessor] Chef→GRMC result: {...}
   ```
4. **Create test swap** and watch console for processing
5. **Verify completion** within 30-60 seconds

---

## 🧪 Step 5: Test the Swap System

### 5.1 Create a Test Swap (GRMC → Chef Coins)

1. **Get Test GRMC**: Use Phantom wallet on Solana devnet or buy small amount on mainnet
2. **Initiate Swap in App**:
   - Go to `/transfer` page
   - Enter amount between 500-8000 GRMC
   - Click "Swap GRMC to Chef Coins"
   - Sign transaction in your wallet
3. **Wait 2-4 minutes** for cron job to process
4. **Verify Chef Coins Updated** in your profile

### 5.2 Verify Swap Processing

```sql
-- Check recent swap requests
SELECT 
  id,
  wallet_address,
  swap_type,
  amount,
  status,
  created_at,
  processed_at,
  error_message
FROM swap_requests
ORDER BY created_at DESC
LIMIT 10;

-- Expected status flow:
-- pending → processing → completed (successful)
-- pending → processing → failed (with error_message)
```

### 5.3 Check Edge Function Logs

1. Go to **Functions** in Supabase Dashboard
2. Select `process-grmc-to-chef-swaps` or `process-chef-to-grmc-swaps`
3. Click **Logs** tab
4. Look for:
   - ✅ "Processing GRMC → Chef Coin swap requests..."
   - ✅ "Found X pending swap requests"
   - ✅ "✓ Processed swap for [wallet]: X Chef Coins"

**Troubleshooting logs**:
- ❌ "Unauthorized swap processing attempt" → Cron secret mismatch
- ❌ "Transaction not found" → Transaction hasn't confirmed yet
- ❌ "Treasury did not receive sufficient GRMC" → Invalid transaction

---

## 📊 Step 6: Set Up Monitoring

### 6.1 Daily Monitoring Queries

Run these queries daily to catch issues:

```sql
-- Check for stuck pending swaps (older than 10 minutes)
SELECT 
  id,
  wallet_address,
  swap_type,
  amount,
  created_at,
  EXTRACT(EPOCH FROM (now() - created_at))/60 as minutes_pending
FROM swap_requests
WHERE status = 'pending'
  AND created_at < now() - interval '10 minutes'
ORDER BY created_at;

-- Check failed swaps in last 24 hours
SELECT 
  swap_type,
  COUNT(*) as failed_count,
  array_agg(DISTINCT error_message) as error_types
FROM swap_requests
WHERE status = 'failed'
  AND created_at > now() - interval '24 hours'
GROUP BY swap_type;

-- Swap success rate (last 24 hours)
SELECT 
  swap_type,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
  ROUND(100.0 * SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM swap_requests
WHERE created_at > now() - interval '24 hours'
GROUP BY swap_type;
```

### 6.2 Set Up Alerts (Manual Check)

Check these metrics weekly:
- **Success Rate**: Should be >95%
- **Stuck Swaps**: Should be 0
- **Average Processing Time**: Should be <3 minutes

---

## 🐛 Troubleshooting Common Issues

### Issue: Swaps Stay "Pending" Too Long

**Diagnosis**: Check browser console on Transfer page for polling logs

**Possible Causes**:
- Transfer page not open (no polling active)
- Secret mismatch between frontend and backend
- Edge function errors

**Fix**:
1. Open Transfer page and check console for `[SwapProcessor]` logs
2. Verify `VITE_SWAP_PROCESSOR_SECRET` matches backend secret
3. Check edge function logs for errors
4. Set up backup cron job (Step 3) for 24/7 processing

---

### Issue: Swaps Fail with "Unauthorized"

**Diagnosis**: Check edge function logs for 401 errors

**Fix**: Verify `SWAP_PROCESSOR_SECRET` is set:
1. Go to **Settings** → **Edge Functions** → **Secrets**
2. Verify `SWAP_PROCESSOR_SECRET` exists and matches cron job configuration

---

### Issue: Transaction Not Found

**Common Causes**:
- Transaction hasn't confirmed on blockchain yet (wait 1-2 minutes)
- User sent to wrong wallet (not treasury)
- Network congestion delaying confirmation

**Fix**: Swaps will auto-retry on next cron run (2 minutes). Failed swaps need manual investigation.

---

### Issue: "Buffer is not defined" in Browser

**Already Fixed** - The `Buffer` polyfill is configured in `src/main.tsx`

**If issue persists**:
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check console for other errors

---

## 📈 Performance Optimization

### Monitor Transaction Fees

Helius RPC provides better performance. Configure using `SOLANA_RPC_URL` secret (Step 2).

**Benefits of premium RPC**:
- Faster transaction confirmation
- Lower failure rates  
- Better rate limits
- Fee rebates for high-volume projects

### Adjust Polling Frequency

Default: Every 30 seconds

To modify polling interval, edit `src/hooks/useSwapProcessor.ts`:
```typescript
const POLL_INTERVAL = 30000; // Change to desired milliseconds
// 15000 = 15 seconds (faster)
// 60000 = 60 seconds (slower, less load)
```

---

## ✅ Production Readiness Checklist

Use this checklist before going live:

### Code-Level (Already Complete ✅)
- [x] Transaction replay protection enabled
- [x] Server-side amount validation (500-8000)
- [x] API keys stored as secrets (not hardcoded)
- [x] Client-side swap triggering removed
- [x] Buffer polyfill for browser compatibility

### Configuration (You Must Complete)
- [ ] `VITE_SWAP_PROCESSOR_SECRET` added to `.env` (Step 1)
- [ ] `SOLANA_RPC_URL` secret configured (Step 2)
- [ ] Frontend polling tested on Transfer page (Step 4.2)
- [ ] (Optional) Backup cron job configured on cron-job.org (Step 3)
- [ ] (Optional) Leaked password protection enabled (Step 4.1)

### Testing (You Must Complete)
- [ ] Open Transfer page and check console logs
- [ ] Test GRMC → Chef swap with real transaction
- [ ] Verify swap completes within 30-60 seconds
- [ ] Test Chef → GRMC swap
- [ ] Verify GRMC received in wallet
- [ ] Check edge function logs show no errors
- [ ] Verify no duplicate transaction processing

### Monitoring Setup
- [ ] Bookmark monitoring queries (Step 6.1)
- [ ] Set calendar reminder for weekly monitoring
- [ ] Document who to contact for stuck swaps

---

## 🚨 Emergency Procedures

### If Swaps Are Failing

1. **Check Browser Console**: Open Transfer page → F12 → Console tab for errors
2. **Check Edge Function Logs**: Go to **Functions** → Select function → **Logs**
3. **Verify Secret**: Ensure `VITE_SWAP_PROCESSOR_SECRET` matches backend `SWAP_PROCESSOR_SECRET`
4. **Check Treasury Balance**: Ensure treasury has sufficient GRMC for Chef → GRMC swaps
5. **Test Manually**: Open Transfer page and watch console logs for 30 seconds

### If Users Report Missing Funds

**DO NOT PANIC** - All transactions are recorded:

```sql
-- Find user's swap history
SELECT * FROM swap_requests 
WHERE wallet_address = 'USER_WALLET_ADDRESS'
ORDER BY created_at DESC;

-- Check their Chef Coins transactions
SELECT * FROM chef_coins_transactions
WHERE wallet_address = 'USER_WALLET_ADDRESS'
ORDER BY created_at DESC;
```

**If swap shows "completed"**: Funds were delivered successfully
**If swap shows "failed"**: Check `error_message` for reason
**If swap shows "pending"**: Wait 5 minutes or manually trigger processing

---

## 🎉 You're Production Ready!

Once you complete the checklist above, your swap system is fully production-ready with:
- ✅ Frontend polling (auto-processes when Transfer page is open)
- ✅ Transaction replay protection
- ✅ Enterprise-grade security
- ✅ Proper error handling and logging
- ✅ Optimized RPC endpoints
- ✅ (Optional) 24/7 backup cron processing

**Need Help?** 
1. Check browser console on Transfer page
2. Check edge function logs
3. Review this guide's troubleshooting section

**Pro Tip**: Keep Transfer page open in a browser tab during active use for fastest swap processing!

# Gordon's Minecraft Nightmares

A fast-paced browser-based kitchen management game where you guide Chef Gordon through a chaotic Minecraft-inspired kitchen. Race against the clock to complete customer orders, manage multiple cooking stations, and chase high scores across 10 escalating levels. Built with React, TypeScript, and integrated with Solana blockchain for token-gated gameplay and in-game economy.

## 🎮 What Is This Game?

Gordon's Minecraft Nightmares is a time-management cooking game inspired by titles like Overcooked, featuring:
- **Pixelated chef and zombie characters** with retro sprite animations
- **10 challenging levels** with increasing difficulty and score targets
- **Minecraft-inspired recipes** requiring strategic ingredient management
- **GRMC token integration** for access control and in-game currency
- **Chef Coins economy** with swap functionality between GRMC and Chef Coins
- **Global leaderboards** to compete with other players
- **Responsive controls** optimized for both desktop and mobile play

## 🎯 Game Objectives

Your mission is to complete customer orders before time runs out by preparing the correct ingredients and earning enough points to meet each level's target score.

### Level Structure

The game features 10 progressively challenging levels:

- **Level 1-2 (Easy)**: 3-minute services with 25-35 point targets. Perfect for learning the basics.
- **Level 3-4 (Easy-Medium)**: 4-minute services with 45-60 point targets. Multiple orders at once.
- **Level 5-6 (Medium)**: 5-minute services with 80-100 point targets. Fast-paced multitasking required.
- **Level 7-8 (Medium-Hard)**: 6-minute services with 120-150 point targets. Expert station management needed.
- **Level 9-10 (Hard)**: 7-8 minute services with 180-250 point targets. Master every technique to succeed.

### Recipe Scoring

- **Easy recipes**: 6 points – Simple ingredients, minimal prep
- **Medium recipes**: 10 points – Multiple steps, requires chopping and cooking
- **Hard recipes**: 16 points – Complex workflows, precise timing needed

## 🍳 How to Play

### Core Gameplay Loop

1. **Check Active Orders** – View customer tickets at the top showing required ingredients and remaining time
2. **Grab Ingredients** – Click ingredient crates on the left wall to pick up raw items
3. **Prep Ingredients** – Use cutting boards to chop items that need preparation
4. **Cook Items** – Place ingredients on skillets or cauldrons to transform them into cooked versions
5. **Plate and Serve** – Bring completed ingredients to the plating counter to fulfill orders
6. **Repeat** – Keep the workflow moving to complete as many orders as possible before time expires

### Kitchen Stations

Your kitchen contains several station types, each serving a specific purpose:

#### Ingredient Crates
- Located on the left wall
- Click to grab a random ingredient needed for current orders
- Always contains items you need – no wasted picks

#### Cutting Boards (2 stations)
- Transform raw ingredients into chopped versions
- Click with a raw ingredient in hand to start chopping
- Progress bar fills automatically – no button mashing needed
- Click again when ready to pick up the chopped ingredient

#### Cooking Stations
- **Skillets (2 stations)**: For frying and sautéing ingredients
- **Cauldrons (2 stations)**: For brewing and boiling ingredients
- Match ingredients to the correct cooking method
- Ingredients transform from chopped → cooked automatically
- Watch for completion to avoid overcooking

#### Plating Counter (2 stations)
- Final stop for completed ingredients
- Click to deliver an ingredient that matches an active order
- Orders auto-complete when all required ingredients are delivered
- Points are awarded immediately upon order completion

### Controls

- **Mouse/Trackpad**: Click any station to interact
- **Touch**: Tap stations directly on mobile devices
- **Strategy**: Plan your route – walking between stations takes time!

### What You Can Do

✅ Pick up ingredients from crates  
✅ Chop raw ingredients on cutting boards  
✅ Cook chopped ingredients on appropriate stations  
✅ Plate cooked ingredients to complete orders  
✅ Work on multiple orders simultaneously  
✅ Restart levels to improve your score  

### What You Can't Do

❌ Rush cooking/chopping – progress bars fill at fixed rates  
❌ Carry multiple ingredients at once – hands can only hold one item  
❌ Skip prep steps – raw ingredients can't be cooked directly  
❌ Use wrong cooking stations – ingredients require specific methods  
❌ Pause the timer during levels (but you can view it between levels)  

### Pro Tips

- **Prioritize expiring orders** – Orders with low time remaining should be completed first
- **Batch similar tasks** – Chop multiple items before starting to cook
- **Learn station layouts** – Efficient movement is key to high scores
- **Watch for patterns** – Recipes often share common ingredients
- **Use all stations** – Don't let cutting boards or stoves sit idle

## 🪙 Token Economy

### GRMC Access Token

This game requires GRMC (Gordon Ramsay Meme Coin) tokens on the Solana blockchain for access:

1. **Connect Your Wallet** – Link a Solana wallet (Phantom, Solflare, etc.) on the main menu
2. **Verify GRMC Balance** – System checks that you hold the minimum required GRMC tokens
3. **Gain Access** – With sufficient balance, all game features unlock
4. **Maintain Balance** – Balance is checked periodically during gameplay

**Minimum Balance**: 1 GRMC token required to play

### Chef Coins (In-Game Currency)

Earn Chef Coins by completing levels, which can be used for:

- **Purchasing power-ups** in the in-game shop (coming soon)
- **Unlocking cosmetics** and chef customizations (coming soon)
- **Swapping to GRMC** via the Transfer page at configurable exchange rates

### Currency Transfer

Navigate to the **Transfer** page to:
- **Convert GRMC → Chef Coins**: Swap your Solana tokens for in-game currency
- **Convert Chef Coins → GRMC**: Exchange earned currency back to blockchain tokens
- View your current balances of both currencies
- Track conversion rates and transaction history

## 🏆 Leaderboards

Compete globally by submitting your best scores:

- **Per-Level Rankings** – See how you stack up on each individual level
- **Wallet Integration** – Scores tied to your Solana wallet address
- **Custom Usernames** – Set your player name when first signing up
- **Live Updates** – Leaderboard refreshes to show latest top performers
- **Score Verification** – All submissions validated server-side to prevent cheating

Access leaderboards from the main menu or after completing any level.

## 🚀 Running Locally

### Prerequisites

- Node.js (v18 or higher)
- npm or similar package manager
- A Solana wallet (Phantom recommended) for testing token features

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
```

The game will open at `http://localhost:8080` (or similar). Connect your wallet and ensure you have GRMC tokens to test the full experience.

### Environment Variables

The game connects to Lovable Cloud (Supabase) automatically. Key environment variables are managed through the `.env` file:

- `VITE_SUPABASE_URL` – Backend API endpoint
- `VITE_SUPABASE_PUBLISHABLE_KEY` – Public authentication key
- `VITE_SUPABASE_PROJECT_ID` – Project identifier

These are pre-configured and should not require manual changes.

## 🌐 Deploying to Production

### Option 1: Lovable Publish (Recommended)

1. Open your project in the Lovable editor
2. Click the **Publish** button in the top right
3. Your game deploys automatically to `yourproject.lovable.app`
4. Share the link – players can start playing immediately

### Option 2: Custom Domain

1. In Lovable, navigate to **Project → Settings → Domains**
2. Click **Connect Domain**
3. Follow DNS setup instructions for your domain provider
4. Access your game at your custom URL

*Note: Custom domains require a paid Lovable plan*

### Option 3: Self-Host

Export to GitHub and deploy to any static hosting platform:

- **Vercel**: Connect repository, deploy automatically on push
- **Netlify**: Drag-and-drop build folder or link repository  
- **Cloudflare Pages**: Connect Git, configure build settings
- **AWS S3 + CloudFront**: Upload build files, configure distribution

For all platforms:
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 18+

### Blockchain Considerations

When hosting, ensure:
- ✅ Site served over **HTTPS** (required for wallet connections)
- ✅ **CORS configured** properly if using custom backend
- ✅ **RPC endpoints** have sufficient rate limits for your traffic
- ✅ **Wallet adapters** bundled correctly in production build

## 🔧 Technical Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI + shadcn/ui
- **Blockchain**: Solana Web3.js, Wallet Adapter
- **Backend**: Lovable Cloud (Supabase) - PostgreSQL, Auth, Edge Functions
- **State Management**: React Context + TanStack Query
- **Routing**: React Router v6

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── GameHeader.tsx      # Timer, score, level display
│   ├── Kitchen.tsx         # Main game board with stations
│   ├── Station.tsx         # Individual cooking station
│   ├── RecipeCard.tsx      # Order ticket display
│   ├── MainMenu.tsx        # Level selection screen
│   ├── WalletButton.tsx    # Solana wallet connector
│   └── ui/                 # shadcn component library
├── pages/              # Route pages
│   ├── Index.tsx          # Main game page
│   ├── Shop.tsx           # In-game store (WIP)
│   ├── Transfer.tsx       # GRMC/Chef Coin swaps
│   └── Auth.tsx           # Login/signup
├── hooks/              # Custom React hooks
│   ├── useCookingMechanics.ts  # Core game logic
│   ├── usePlayerProfile.ts     # User data management
│   ├── useGRMCBalance.ts       # Token balance checking
│   └── useLeaderboard.ts       # Score submission
├── contexts/           # React contexts
│   ├── AuthContext.tsx    # User authentication
│   └── WalletContext.tsx  # Solana wallet state
├── data/               # Game configuration
│   ├── recipes.ts         # Recipe definitions
│   └── levels.ts          # Level configurations
└── types/              # TypeScript definitions
    └── game.ts            # Game state interfaces
```

## 🎨 Game Mechanics Deep Dive

### Order Management

- New orders spawn periodically based on level difficulty
- Each order has an independent countdown timer
- Maximum active orders varies by level (1-4 simultaneous orders)
- Failed orders (time expired) disappear but don't penalize score
- Completing orders awards points and clears kitchen space

### Ingredient States

Every ingredient follows a state progression:

1. **Raw** – Fresh from the crate, not yet prepared
2. **Chopped** – Processed on cutting board (if needed)
3. **Cooked** – Transformed via skillet or cauldron (if needed)
4. **Plated** – Delivered to complete order

Some ingredients skip steps (e.g., items that don't need cooking), but you must always follow the required sequence.

### Station Cooldowns

- Cutting boards and cooking stations have automatic progress timers
- Timers cannot be accelerated – plan ahead!
- You cannot interrupt an in-progress station
- Stations can only process one item at a time

### Victory Conditions

Each level completes when:
- ✅ Target score reached **OR**
- ❌ Time expires (shows game over if score insufficient)

Three-star ratings (planned feature) will reward:
- ⭐ Meeting target score
- ⭐⭐ Exceeding target by 25%
- ⭐⭐⭐ Exceeding target by 50%

## 🤝 Contributing

This project is built with Lovable. To contribute:

1. **Via Lovable**: Open the [project](https://lovable.dev/projects/d9c8224b-9174-4371-b911-5f4ea1e73609) and start prompting for changes
2. **Via Git**: Clone repository, make changes, push to trigger auto-deploy
3. **Via GitHub**: Edit files directly in browser, commit changes

Changes sync automatically between Lovable and GitHub.

## 📝 License

MIT License - Feel free to remix, modify, and build upon this game!

## 🙏 Credits

- **Game Design**: Inspired by Overcooked and Cooking Mama
- **Art Style**: Minecraft aesthetic with custom pixel art
- **Blockchain**: Powered by Solana
- **Built With**: [Lovable](https://lovable.dev) - AI-powered full-stack platform

---

**Ready to Cook?** Connect your wallet, grab those ingredients, and show the world your culinary skills! 👨‍🍳🔥

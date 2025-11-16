import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { useInventory } from "@/hooks/useInventory";
import { ArrowLeft, ShoppingCart, Coins, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  type: 'cosmetic' | 'boost' | 'special';
  levelRequired?: number;
  duration?: number; // in seconds for timed boosts
}

const SHOP_ITEMS: ShopItem[] = [
  // Time Extensions (stackable, 3 second intervals)
  {
    id: 'time_3s',
    name: '+3 Seconds',
    description: 'Adds 3 seconds to timer',
    cost: 500,
    icon: '⏱️',
    type: 'boost',
    duration: 3,
    levelRequired: 1
  },
  {
    id: 'time_6s',
    name: '+6 Seconds',
    description: 'Adds 6 seconds to timer',
    cost: 900,
    icon: '⏰',
    type: 'boost',
    duration: 6,
    levelRequired: 1
  },
  {
    id: 'time_15s',
    name: '+15 Seconds',
    description: 'Adds 15 seconds to timer',
    cost: 2000,
    icon: '⏲️',
    type: 'boost',
    duration: 15,
    levelRequired: 2
  },
  {
    id: 'time_30s',
    name: '+30 Seconds',
    description: 'Adds 30 seconds to timer',
    cost: 3500,
    icon: '🕐',
    type: 'boost',
    duration: 30,
    levelRequired: 3
  },
  
  // Speed Boosts (single use per game)
  {
    id: 'speed_boost_10',
    name: 'Speed +10%',
    description: 'Cooking speed +10%',
    cost: 2000,
    icon: '⚡',
    type: 'boost',
    duration: 60,
    levelRequired: 2
  },
  {
    id: 'speed_boost_20',
    name: 'Speed +20%',
    description: 'Cooking speed +20%',
    cost: 4000,
    icon: '⚡⚡',
    type: 'boost',
    duration: 60,
    levelRequired: 3
  },
  {
    id: 'speed_boost_50',
    name: 'Mega Speed',
    description: 'Cooking speed +50%',
    cost: 8000,
    icon: '💨',
    type: 'boost',
    duration: 60,
    levelRequired: 5
  },
  
  // Perfect Plating (single use per game)
  {
    id: 'perfect_plate_30s',
    name: 'Perfect 30s',
    description: '2x points for 30s',
    cost: 3000,
    icon: '🍽️',
    type: 'boost',
    duration: 30,
    levelRequired: 3
  },
  {
    id: 'perfect_plate_60s',
    name: 'Perfect 60s',
    description: '2x points for 60s',
    cost: 5000,
    icon: '✨🍽️',
    type: 'boost',
    duration: 60,
    levelRequired: 4
  },
  
  // Score Multipliers
  {
    id: 'score_2x',
    name: '2x Score',
    description: 'Double points for 45s',
    cost: 6000,
    icon: '💫',
    type: 'boost',
    duration: 45,
    levelRequired: 4
  },
  {
    id: 'score_3x',
    name: '3x Score',
    description: 'Triple points for 30s',
    cost: 10000,
    icon: '🌟',
    type: 'boost',
    duration: 30,
    levelRequired: 6
  },
  
  // Cosmetics
  {
    id: 'chef_hat_gold',
    name: 'Golden Hat',
    description: 'Luxurious golden chef hat',
    cost: 15000,
    icon: '👑',
    type: 'cosmetic',
    levelRequired: 5
  },
  {
    id: 'diamond_apron',
    name: 'Diamond Apron',
    description: 'Show off your wealth',
    cost: 30000,
    icon: '💎',
    type: 'cosmetic',
    levelRequired: 7
  },
  {
    id: 'master_knife',
    name: 'Master Knife',
    description: 'Mark of a master chef',
    cost: 50000,
    icon: '🔪',
    type: 'cosmetic',
    levelRequired: 8
  },
  
  // Special - Requires Level 10
  {
    id: 'recipe_book',
    name: 'Recipe Book',
    description: 'Secret recipes & techniques',
    cost: 10000000,
    icon: '📖',
    type: 'special',
    levelRequired: 10
  }
];

export default function Shop() {
  const navigate = useNavigate();
  const { profile, spendChefCoins } = usePlayerProfile();
  const { addToInventory } = useInventory(profile?.wallet_address);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [playerLevel, setPlayerLevel] = useState(0);

  useEffect(() => {
    const fetchPlayerLevel = async () => {
      if (!profile?.wallet_address) return;
      
      const { data } = await supabase
        .from('player_level_progress')
        .select('level_id')
        .eq('wallet_address', profile.wallet_address)
        .eq('completed', true)
        .order('level_id', { ascending: false })
        .limit(1);
      
      if (data && data.length > 0) {
        setPlayerLevel(data[0].level_id);
      }
    };
    
    fetchPlayerLevel();
  }, [profile?.wallet_address]);

  const handlePurchase = async (item: ShopItem) => {
    if (!profile?.wallet_address) {
      toast.error("Profile not found");
      return;
    }

    if (profile.chef_coins_balance < item.cost) {
      toast.error("Insufficient Chef Coins", {
        description: `You need ${item.cost} Chef Coins but only have ${profile.chef_coins_balance}`
      });
      return;
    }

    setPurchasing(item.id);

    try {
      // Spend chef coins
      const success = await spendChefCoins(item.cost, `Purchased ${item.name}`);
      
      if (!success) {
        toast.error("Purchase failed", {
          description: "Insufficient balance or error occurred"
        });
        return;
      }

      // Record purchase
      const { error: purchaseError } = await supabase
        .from('shop_purchases')
        .insert({
          wallet_address: profile.wallet_address,
          item_id: item.id,
          item_name: item.name,
          cost: item.cost
        });

      if (purchaseError) throw purchaseError;

      // Add to inventory
      await addToInventory(item.id, item.name, item.type);

      toast.success("Purchase successful!", {
        description: `You bought ${item.name} for ${item.cost} Chef Coins`
      });
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error("Purchase failed", {
        description: "Something went wrong. Please try again."
      });
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
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
          
          <div className="game-panel bg-wood/90 backdrop-blur-sm px-6 py-3 flex items-center gap-3">
            <Coins className="w-6 h-6 text-accent" />
            <div>
              <div className="font-bold text-lg text-foreground">
                {profile?.chef_coins_balance || 0}
              </div>
              <div className="text-xs text-muted-foreground">Chef Coins</div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-accent mb-2 flex items-center justify-center gap-3">
            <ShoppingCart className="w-10 h-10" />
            CHEF'S SHOP
          </h1>
          <p className="text-muted-foreground">
            Upgrade your kitchen with exclusive items!
          </p>
        </div>

        {/* Shop Items Grid */}
        <ScrollArea className="h-[600px] pr-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {SHOP_ITEMS.map((item) => {
              const isLocked = item.levelRequired && playerLevel < item.levelRequired;
              const canAfford = profile && profile.chef_coins_balance >= item.cost;
              
              return (
                <Card key={item.id} className={`game-panel bg-wood p-3 transition-transform ${isLocked ? 'opacity-60' : 'hover:scale-105'}`}>
                  <div className="text-center mb-2">
                    <div className="text-4xl mb-2 relative">
                      {item.icon}
                      {isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock className="w-5 h-5 text-destructive" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-xs text-foreground mb-1">{item.name}</h3>
                    <p className="text-[10px] text-muted-foreground mb-1 line-clamp-2">{item.description}</p>
                    {item.duration && (
                      <p className="text-[9px] text-accent font-bold">{item.duration}s</p>
                    )}
                    {isLocked && (
                      <p className="text-[9px] text-destructive font-bold mt-1">
                        🔒 Level {item.levelRequired}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Coins className="w-3 h-3 text-accent" />
                    <span className={`font-bold text-[10px] ${canAfford ? 'text-accent' : 'text-destructive'}`}>
                      {item.cost.toLocaleString()}
                    </span>
                  </div>

                  <Button
                    className="w-full h-7 text-[10px]"
                    onClick={() => handlePurchase(item)}
                    disabled={!profile || !canAfford || purchasing === item.id || isLocked}
                  >
                    {purchasing === item.id ? 'Buying...' : isLocked ? 'Locked' : 'Buy'}
                  </Button>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
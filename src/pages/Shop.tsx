import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { ArrowLeft, ShoppingCart, Coins } from "lucide-react";
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
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'chef_hat_gold',
    name: 'Golden Chef Hat',
    description: 'A luxurious golden chef hat for the master chef',
    cost: 1000,
    icon: '👑',
    type: 'cosmetic'
  },
  {
    id: 'speed_boost',
    name: 'Speed Boost',
    description: 'Increases cooking speed by 20% for 3 games',
    cost: 500,
    icon: '⚡',
    type: 'boost'
  },
  {
    id: 'time_extension',
    name: 'Time Extension',
    description: 'Adds 30 seconds to your next game',
    cost: 300,
    icon: '⏰',
    type: 'boost'
  },
  {
    id: 'diamond_apron',
    name: 'Diamond Apron',
    description: 'Show off your wealth with this diamond-studded apron',
    cost: 2000,
    icon: '💎',
    type: 'cosmetic'
  },
  {
    id: 'recipe_book',
    name: 'Ancient Recipe Book',
    description: 'Unlocks secret recipes and cooking tips',
    cost: 1500,
    icon: '📖',
    type: 'special'
  },
  {
    id: 'perfect_plate',
    name: 'Perfect Plating',
    description: 'Bonus points for plating for 5 games',
    cost: 750,
    icon: '🍽️',
    type: 'boost'
  }
];

export default function Shop() {
  const navigate = useNavigate();
  const { profile, spendChefCoins } = usePlayerProfile();
  const [purchasing, setPurchasing] = useState<string | null>(null);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SHOP_ITEMS.map((item) => (
            <Card key={item.id} className="game-panel bg-wood p-6 hover:scale-105 transition-transform">
              <div className="text-center mb-4">
                <div className="text-6xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-lg text-foreground mb-2">{item.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-accent" />
                  <span className="font-bold text-accent text-lg">{item.cost}</span>
                </div>
                <span className="text-xs text-muted-foreground uppercase px-2 py-1 bg-background/50 rounded">
                  {item.type}
                </span>
              </div>

              <Button
                className="w-full"
                onClick={() => handlePurchase(item)}
                disabled={!profile || profile.chef_coins_balance < item.cost || purchasing === item.id}
              >
                {purchasing === item.id ? 'Purchasing...' : 'Buy Now'}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card } from './ui/card';
import { Package, Zap } from 'lucide-react';
import { useInventory, InventoryItem } from '@/hooks/useInventory';
import { toast } from 'sonner';

interface InventoryButtonProps {
  walletAddress: string | undefined;
  onUseItem: (item: InventoryItem) => void;
}

export const InventoryButton = ({ walletAddress, onUseItem }: InventoryButtonProps) => {
  const [open, setOpen] = useState(false);
  const { inventory, loading, useItem } = useInventory(walletAddress);

  const handleUseItem = async (item: InventoryItem) => {
    const success = await useItem(item.item_id);
    if (success) {
      onUseItem(item);
      toast.success(`Used ${item.item_name}!`);
      setOpen(false);
    }
  };

  const boostItems = inventory.filter(i => i.item_type === 'boost');

  return (
    <>
      <Button
        variant="game"
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 z-40 gap-2 shadow-lg"
      >
        <Package className="w-5 h-5" />
        Items ({boostItems.length})
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] bg-wood border-accent">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-accent flex items-center gap-2">
              <Package className="w-6 h-6" />
              MY ITEMS
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading inventory...</div>
          ) : boostItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No items in inventory</p>
              <p className="text-sm text-muted-foreground">Visit the shop to buy boosts!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
              {boostItems.map((item) => (
                <Card key={item.id} className="game-panel bg-wood/80 p-4">
                  <div className="text-center mb-3">
                    <div className="text-4xl mb-2">
                      {item.item_name.includes('Time') ? '⏰' : 
                       item.item_name.includes('Speed') ? '⚡' :
                       item.item_name.includes('Plating') ? '🍽️' :
                       item.item_name.includes('Score') ? '💫' : '✨'}
                    </div>
                    <h4 className="font-bold text-sm text-foreground mb-1">{item.item_name}</h4>
                    <div className="text-xs text-accent font-bold">Qty: {item.quantity}</div>
                  </div>
                  
                  <Button
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => handleUseItem(item)}
                  >
                    <Zap className="w-4 h-4" />
                    Use
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

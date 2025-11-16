import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InventoryItem {
  id: string;
  item_id: string;
  item_name: string;
  item_type: string;
  quantity: number;
}

export const useInventory = (walletAddress: string | undefined) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('player_inventory')
        .select('*')
        .eq('wallet_address', walletAddress);

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToInventory = async (itemId: string, itemName: string, itemType: string) => {
    if (!walletAddress) return false;

    try {
      // Check if item already exists
      const existing = inventory.find(i => i.item_id === itemId);

      if (existing) {
        // Update quantity
        const { error } = await supabase
          .from('player_inventory')
          .update({ quantity: existing.quantity + 1 })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from('player_inventory')
          .insert({
            wallet_address: walletAddress,
            item_id: itemId,
            item_name: itemName,
            item_type: itemType,
            quantity: 1
          });

        if (error) throw error;
      }

      await fetchInventory();
      return true;
    } catch (error) {
      console.error('Error adding to inventory:', error);
      return false;
    }
  };

  const useItem = async (itemId: string) => {
    if (!walletAddress) return false;

    try {
      const item = inventory.find(i => i.item_id === itemId);
      if (!item || item.quantity <= 0) return false;

      const newQuantity = item.quantity - 1;

      if (newQuantity === 0) {
        // Delete item if quantity reaches 0
        const { error } = await supabase
          .from('player_inventory')
          .delete()
          .eq('id', item.id);

        if (error) throw error;
      } else {
        // Decrease quantity
        const { error } = await supabase
          .from('player_inventory')
          .update({ quantity: newQuantity })
          .eq('id', item.id);

        if (error) throw error;
      }

      await fetchInventory();
      return true;
    } catch (error) {
      console.error('Error using item:', error);
      toast.error('Failed to use item');
      return false;
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [walletAddress]);

  return {
    inventory,
    loading,
    addToInventory,
    useItem,
    refetch: fetchInventory
  };
};

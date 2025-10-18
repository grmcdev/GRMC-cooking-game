import { useState, useCallback } from "react";
import { StationState, IngredientState, OrderTicket } from "@/types/game";
import { RECIPES } from "@/data/recipes";
import { toast } from "sonner";

interface UseCookingMechanicsProps {
  orders: OrderTicket[];
  onOrderComplete: (orderId: string, points: number) => void;
}

export const useCookingMechanics = ({ orders, onOrderComplete }: UseCookingMechanicsProps) => {
  const [playerHand, setPlayerHand] = useState<IngredientState | undefined>();
  const [stations, setStations] = useState<StationState[]>(initializeStations());

  // Initialize kitchen stations
  function initializeStations(): StationState[] {
    return [
      // Ingredient crates (left side)
      { id: 'crate-1', type: 'crate', isActive: false },
      { id: 'crate-2', type: 'crate', isActive: false },
      { id: 'crate-3', type: 'crate', isActive: false },
      
      // Cutting boards (top center)
      { id: 'cutting-1', type: 'cutting', isActive: false },
      { id: 'cutting-2', type: 'cutting', isActive: false },
      
      // Cooking stations (top right)
      { id: 'skillet-1', type: 'skillet', isActive: false },
      { id: 'cauldron-1', type: 'cauldron', isActive: false },
      
      // Plating counter (bottom center)
      { id: 'plating-1', type: 'plating', isActive: false },
    ];
  }

  // Get random ingredient from current orders
  const getRandomIngredient = useCallback((): IngredientState | null => {
    if (orders.length === 0) return null;
    
    const allIngredients = orders.flatMap(order => 
      order.recipe.ingredients.filter(ing => !order.completedIngredients.has(ing.id))
    );
    
    if (allIngredients.length === 0) return null;
    
    const randomIng = allIngredients[Math.floor(Math.random() * allIngredients.length)];
    return {
      id: `${randomIng.id}-${Date.now()}`,
      ingredientId: randomIng.id,
      type: 'raw',
      name: randomIng.name,
      icon: randomIng.icon,
      needsChopping: randomIng.needsChopping,
      needsCooking: randomIng.needsCooking,
      cookMethod: randomIng.cookMethod,
    };
  }, [orders]);

  // Handle station clicks
  const handleStationClick = useCallback((stationId: string) => {
    const station = stations.find(s => s.id === stationId);
    if (!station) return;

    // CRATE: Pick up new ingredient
    if (station.type === 'crate') {
      if (playerHand) {
        toast.error("Hands are full!", { description: "Finish with current ingredient first" });
        return;
      }
      
      const newIngredient = getRandomIngredient();
      if (!newIngredient) {
        toast.error("No ingredients needed!", { description: "Complete some orders first" });
        return;
      }
      
      setPlayerHand(newIngredient);
      toast.success(`Picked up ${newIngredient.name}`);
      return;
    }

    // CUTTING BOARD: Place ingredient to chop
    if (station.type === 'cutting') {
      if (!playerHand) {
        // Pick up from station
        if (station.ingredient) {
          setPlayerHand(station.ingredient);
          setStations(prev => prev.map(s => 
            s.id === stationId ? { ...s, ingredient: undefined, progress: 0, isActive: false } : s
          ));
          toast.success(`Picked up ${station.ingredient.name}`);
        }
        return;
      }
      
      if (!playerHand.needsChopping || playerHand.type !== 'raw') {
        toast.error("Doesn't need chopping!", { description: "Try a different station" });
        return;
      }
      
      // Place on cutting board
      setStations(prev => prev.map(s => 
        s.id === stationId ? { ...s, ingredient: playerHand, progress: 0, isActive: true } : s
      ));
      setPlayerHand(undefined);
      
      // Auto-chop after 2 seconds
      setTimeout(() => {
        setStations(prev => prev.map(s => {
          if (s.id === stationId && s.ingredient) {
            const chopped: IngredientState = { ...s.ingredient, type: 'chopped' };
            toast.success(`Chopped ${chopped.name}!`);
            return { ...s, ingredient: chopped, progress: 100, isActive: false };
          }
          return s;
        }));
      }, 2000);
      
      return;
    }

    // COOKING STATIONS: Place ingredient to cook
    if (station.type === 'skillet' || station.type === 'cauldron') {
      if (!playerHand) {
        // Pick up from station
        if (station.ingredient) {
          setPlayerHand(station.ingredient);
          setStations(prev => prev.map(s => 
            s.id === stationId ? { ...s, ingredient: undefined, progress: 0, isActive: false } : s
          ));
          toast.success(`Picked up ${station.ingredient.name}`);
        }
        return;
      }
      
      if (!playerHand.needsCooking) {
        toast.error("Doesn't need cooking!", { description: "Try plating it instead" });
        return;
      }
      
      if (playerHand.cookMethod !== station.type) {
        toast.error("Wrong cooking station!", { 
          description: `Use ${playerHand.cookMethod} instead` 
        });
        return;
      }
      
      if (playerHand.type === 'raw' && playerHand.needsChopping) {
        toast.error("Needs chopping first!", { description: "Use cutting board" });
        return;
      }
      
      // Place on stove
      setStations(prev => prev.map(s => 
        s.id === stationId ? { ...s, ingredient: playerHand, progress: 0, isActive: true } : s
      ));
      setPlayerHand(undefined);
      
      // Auto-cook after 3 seconds
      setTimeout(() => {
        setStations(prev => prev.map(s => {
          if (s.id === stationId && s.ingredient) {
            const cooked: IngredientState = { ...s.ingredient, type: 'cooked' };
            toast.success(`Cooked ${cooked.name}!`);
            return { ...s, ingredient: cooked, progress: 100, isActive: false };
          }
          return s;
        }));
      }, 3000);
      
      return;
    }

    // PLATING: Complete ingredient for order
    if (station.type === 'plating') {
      if (!playerHand) {
        toast.error("Nothing to plate!", { description: "Pick up an ingredient first" });
        return;
      }
      
      // Check if ingredient is ready for plating
      const isReady = 
        (!playerHand.needsChopping || playerHand.type !== 'raw') &&
        (!playerHand.needsCooking || playerHand.type === 'cooked');
      
      if (!isReady) {
        toast.error("Not ready to plate!", { 
          description: playerHand.needsChopping && playerHand.type === 'raw' 
            ? "Needs chopping first" 
            : "Needs cooking first" 
        });
        return;
      }
      
      // Find matching order
      const matchingOrder = orders.find(order => 
        order.recipe.ingredients.some(ing => 
          ing.id === playerHand.ingredientId && 
          !order.completedIngredients.has(ing.id)
        )
      );
      
      if (!matchingOrder) {
        toast.error("No order for this ingredient!", { description: "Check active orders" });
        return;
      }
      
      // Mark ingredient as complete
      matchingOrder.completedIngredients.add(playerHand.ingredientId);
      setPlayerHand(undefined);
      toast.success(`Plated ${playerHand.name}!`, { description: "Ingredient complete" });
      
      // Check if order is complete
      const allComplete = matchingOrder.recipe.ingredients.every(ing =>
        matchingOrder.completedIngredients.has(ing.id)
      );
      
      if (allComplete) {
        onOrderComplete(matchingOrder.id, matchingOrder.recipe.points);
      }
      
      return;
    }
  }, [stations, playerHand, orders, getRandomIngredient, onOrderComplete]);

  return {
    playerHand,
    stations,
    handleStationClick,
  };
};

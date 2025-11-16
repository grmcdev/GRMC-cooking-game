import { useState, useCallback, useRef, useEffect } from "react";
import { StationState, IngredientState, OrderTicket } from "@/types/game";
import { RECIPES } from "@/data/recipes";
import { toast } from "sonner";

interface UseCookingMechanicsProps {
  orders: OrderTicket[];
  onOrderComplete: (orderId: string, points: number) => void;
  initialStations?: StationState[];
}

// Initialize kitchen stations - exported for use in game start
export function initializeStations(): StationState[] {
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

export const useCookingMechanics = ({ orders, onOrderComplete, initialStations }: UseCookingMechanicsProps) => {
  const [playerHand, setPlayerHand] = useState<IngredientState | undefined>();
  // Initialize with stations if provided and non-empty, otherwise create new ones
  const [stations, setStations] = useState<StationState[]>(() => 
    initialStations && initialStations.length > 0 ? initialStations : initializeStations()
  );

  // Use refs to prevent callback recreation on every render
  const stationsRef = useRef(stations);
  const playerHandRef = useRef(playerHand);
  const ordersRef = useRef(orders);

  // Update refs whenever values change
  useEffect(() => {
    stationsRef.current = stations;
  }, [stations]);

  useEffect(() => {
    playerHandRef.current = playerHand;
  }, [playerHand]);

  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

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
    console.log('🎯 handleStationClick called:', stationId);
    console.log('📋 Current state:', {
      playerHand: playerHandRef.current,
      stationsCount: stationsRef.current.length,
      ordersCount: ordersRef.current.length
    });

    const station = stationsRef.current.find(s => s.id === stationId);
    if (!station) {
      console.log('❌ Station not found:', stationId);
      return;
    }
    console.log('🏪 Station found:', station.type, station);

    // CRATE: Pick up new ingredient
    if (station.type === 'crate') {
      console.log('📦 Crate interaction');
      if (playerHandRef.current) {
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
      console.log('🔪 Cutting board interaction');
      if (!playerHandRef.current) {
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
      
      if (!playerHandRef.current.needsChopping || playerHandRef.current.type !== 'raw') {
        toast.error("Doesn't need chopping!", { description: "Try a different station" });
        return;
      }
      
      // Place on cutting board
      const ingredientToPlace = playerHandRef.current;
      setStations(prev => prev.map(s => 
        s.id === stationId ? { ...s, ingredient: ingredientToPlace, progress: 0, isActive: true } : s
      ));
      setPlayerHand(undefined);
      
      // Gradual chopping progress
      const progressInterval = setInterval(() => {
        setStations(prev => prev.map(s => {
          if (s.id === stationId && s.ingredient) {
            const newProgress = Math.min(100, (s.progress || 0) + 5);
            
            if (newProgress >= 100) {
              clearInterval(progressInterval);
              const chopped: IngredientState = { ...s.ingredient, type: 'chopped' };
              toast.success(`Chopped ${chopped.name}!`);
              return { ...s, ingredient: chopped, progress: 100, isActive: false };
            }
            
            return { ...s, progress: newProgress };
          }
          return s;
        }));
      }, 100);
      
      return;
    }

    // COOKING STATIONS: Place ingredient to cook
    if (station.type === 'skillet' || station.type === 'cauldron') {
      console.log('🔥 Cooking station interaction');
      if (!playerHandRef.current) {
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
      
      if (!playerHandRef.current.needsCooking) {
        toast.error("Doesn't need cooking!", { description: "Try plating it instead" });
        return;
      }
      
      if (playerHandRef.current.cookMethod !== station.type) {
        toast.error("Wrong cooking station!", { 
          description: `Use ${playerHandRef.current.cookMethod} instead` 
        });
        return;
      }
      
      if (playerHandRef.current.type === 'raw' && playerHandRef.current.needsChopping) {
        toast.error("Needs chopping first!", { description: "Use cutting board" });
        return;
      }
      
      // Place on stove
      const ingredientToPlace = playerHandRef.current;
      setStations(prev => prev.map(s => 
        s.id === stationId ? { ...s, ingredient: ingredientToPlace, progress: 0, isActive: true } : s
      ));
      setPlayerHand(undefined);
      
      // Gradual cooking progress
      const progressInterval = setInterval(() => {
        setStations(prev => prev.map(s => {
          if (s.id === stationId && s.ingredient) {
            const newProgress = Math.min(100, (s.progress || 0) + 3.33);
            
            if (newProgress >= 100) {
              clearInterval(progressInterval);
              const cooked: IngredientState = { ...s.ingredient, type: 'cooked' };
              toast.success(`Cooked ${cooked.name}!`);
              return { ...s, ingredient: cooked, progress: 100, isActive: false };
            }
            
            return { ...s, progress: newProgress };
          }
          return s;
        }));
      }, 100);
      
      return;
    }

    // PLATING: Complete ingredient for order
    if (station.type === 'plating') {
      console.log('🍽️ Plating interaction');
      if (!playerHandRef.current) {
        toast.error("Nothing to plate!", { description: "Pick up an ingredient first" });
        return;
      }
      
      // Check if ingredient is ready for plating
      const isReady = 
        (!playerHandRef.current.needsChopping || playerHandRef.current.type !== 'raw') &&
        (!playerHandRef.current.needsCooking || playerHandRef.current.type === 'cooked');
      
      if (!isReady) {
        toast.error("Not ready to plate!", { 
          description: playerHandRef.current.needsChopping && playerHandRef.current.type === 'raw' 
            ? "Needs chopping first" 
            : "Needs cooking first" 
        });
        return;
      }
      
      // Find matching order
      const matchingOrder = ordersRef.current.find(order => 
        order.recipe.ingredients.some(ing => 
          ing.id === playerHandRef.current!.ingredientId && 
          !order.completedIngredients.has(ing.id)
        )
      );
      
      if (!matchingOrder) {
        toast.error("No order for this ingredient!", { description: "Check active orders" });
        return;
      }
      
      // Mark ingredient as complete
      const completedIngredient = playerHandRef.current;
      matchingOrder.completedIngredients.add(completedIngredient.ingredientId);
      setPlayerHand(undefined);
      toast.success(`Plated ${completedIngredient.name}!`, { description: "Ingredient complete" });
      
      // Check if order is complete
      const allComplete = matchingOrder.recipe.ingredients.every(ing =>
        matchingOrder.completedIngredients.has(ing.id)
      );
      
      if (allComplete) {
        onOrderComplete(matchingOrder.id, matchingOrder.recipe.points);
      }
      
      return;
    }
  }, [getRandomIngredient, onOrderComplete]);

  return {
    playerHand,
    stations,
    handleStationClick,
  };
};

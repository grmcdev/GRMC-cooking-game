import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { StationState } from "@/types/game";

interface Position {
  x: number;
  y: number;
}

export const useGordonMovement = (stations: StationState[], onInteract: (stationId: string) => void, deviceType: 'desktop' | 'tablet' | 'phone' = 'desktop') => {
  const [gordonPosition, setGordonPosition] = useState<Position>({ x: 50, y: 50 });
  const [nearbyStation, setNearbyStation] = useState<string | null>(null);
  
  // Use ref to store onInteract callback to avoid re-registering event listener
  const onInteractRef = useRef(onInteract);
  
  // Update ref on every render to ensure we always have the latest callback
  useEffect(() => {
    onInteractRef.current = onInteract;
  });

  // Station positions matching Kitchen.tsx - pinned to background locations (device-specific)
  const stationPositions: Record<string, Position> = useMemo(() => 
    deviceType === 'phone' ? {
      // Phone positions - matching reference image
      'crate-1': { x: 12, y: 26 },
      'crate-2': { x: 12, y: 43 },
      'crate-3': { x: 12, y: 62 },
      'cutting-1': { x: 32, y: 28 },
      'cutting-2': { x: 48, y: 28 },
      'skillet-1': { x: 72, y: 28 },
      'cauldron-1': { x: 50, y: 32 },
      'plating-1': { x: 50, y: 78 },
    } : deviceType === 'tablet' ? {
      // Tablet positions - matching reference image
      'crate-1': { x: 12, y: 26 },
      'crate-2': { x: 12, y: 43 },
      'crate-3': { x: 12, y: 62 },
      'cutting-1': { x: 32, y: 28 },
      'cutting-2': { x: 48, y: 28 },
      'skillet-1': { x: 72, y: 28 },
      'cauldron-1': { x: 50, y: 32 },
      'plating-1': { x: 50, y: 78 },
    } : {
      // Desktop positions - matching reference image
      'crate-1': { x: 12, y: 26 },
      'crate-2': { x: 12, y: 43 },
      'crate-3': { x: 12, y: 62 },
      'cutting-1': { x: 32, y: 28 },
      'cutting-2': { x: 48, y: 28 },
      'skillet-1': { x: 72, y: 28 },
      'cauldron-1': { x: 50, y: 32 },
      'plating-1': { x: 50, y: 78 },
    }, [deviceType]);

  // Collision detection helper
  const isColliding = useCallback((newPos: Position): boolean => {
    const collisionRadius = 5; // 5% of screen space to match interaction zones
    
    for (const [stationId, stationPos] of Object.entries(stationPositions)) {
      const dx = Math.abs(newPos.x - stationPos.x);
      const dy = Math.abs(newPos.y - stationPos.y);
      
      // Check if Gordon would be too close to this station
      if (dx < collisionRadius && dy < collisionRadius) {
        return true;
      }
    }
    
    return false;
  }, [stationPositions]);

  // Check proximity to stations
  useEffect(() => {
    const interactionDistance = 8; // percentage of screen - increased for easier interaction
    
    let closest: string | null = null;
    let closestDistance = Infinity;

    for (const [stationId, stationPos] of Object.entries(stationPositions)) {
      const dx = gordonPosition.x - stationPos.x;
      const dy = gordonPosition.y - stationPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < interactionDistance && distance < closestDistance) {
        closest = stationId;
        closestDistance = distance;
      }
    }

    setNearbyStation(closest);
  }, [gordonPosition, stationPositions]);

  // Handle interaction with E key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e' && nearbyStation) {
        e.preventDefault();
        console.log('E key pressed! Nearby station:', nearbyStation);
        onInteractRef.current(nearbyStation);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [nearbyStation]);

  const handlePositionChange = useCallback((newPosition: Position) => {
    // Check if the new position would collide with any station
    if (isColliding(newPosition)) {
      // Don't allow the move
      return;
    }
    
    setGordonPosition(newPosition);
  }, [isColliding]);

  return {
    gordonPosition,
    nearbyStation,
    handlePositionChange,
  };
};

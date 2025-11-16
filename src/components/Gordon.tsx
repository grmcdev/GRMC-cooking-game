import { useEffect, useState } from "react";

// Import all 20 sprite frames
import gordonDown0 from "@/assets/sprites/gordon-down-0.png";
import gordonDown1 from "@/assets/sprites/gordon-down-1.png";
import gordonDown2 from "@/assets/sprites/gordon-down-2.png";
import gordonDown3 from "@/assets/sprites/gordon-down-3.png";
import gordonDown4 from "@/assets/sprites/gordon-down-4.png";

import gordonUp0 from "@/assets/sprites/gordon-up-0.png";
import gordonUp1 from "@/assets/sprites/gordon-up-1.png";
import gordonUp2 from "@/assets/sprites/gordon-up-2.png";
import gordonUp3 from "@/assets/sprites/gordon-up-3.png";
import gordonUp4 from "@/assets/sprites/gordon-up-4.png";

import gordonLeft0 from "@/assets/sprites/gordon-left-0.png";
import gordonLeft1 from "@/assets/sprites/gordon-left-1.png";
import gordonLeft2 from "@/assets/sprites/gordon-left-2.png";
import gordonLeft3 from "@/assets/sprites/gordon-left-3.png";
import gordonLeft4 from "@/assets/sprites/gordon-left-4.png";

import gordonRight0 from "@/assets/sprites/gordon-right-0.png";
import gordonRight1 from "@/assets/sprites/gordon-right-1.png";
import gordonRight2 from "@/assets/sprites/gordon-right-2.png";
import gordonRight3 from "@/assets/sprites/gordon-right-3.png";
import gordonRight4 from "@/assets/sprites/gordon-right-4.png";

interface GordonProps {
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  isInteracting?: boolean;
  isCelebrating?: boolean;
  isSad?: boolean;
  isHoldingIngredient?: boolean;
}

// Sprite frame arrays
const SPRITE_FRAMES = {
  down: [gordonDown0, gordonDown1, gordonDown2, gordonDown3, gordonDown4],
  up: [gordonUp0, gordonUp1, gordonUp2, gordonUp3, gordonUp4],
  left: [gordonLeft0, gordonLeft1, gordonLeft2, gordonLeft3, gordonLeft4],
  right: [gordonRight0, gordonRight1, gordonRight2, gordonRight3, gordonRight4],
};

export const Gordon = ({ position, onPositionChange, isInteracting, isCelebrating, isSad, isHoldingIngredient }: GordonProps) => {
  const [direction, setDirection] = useState<'down' | 'up' | 'left' | 'right'>('down');
  const [isMoving, setIsMoving] = useState(false);
  const [animationFrame, setAnimationFrame] = useState(0);

  // Animation frame cycling - 5 frames for smooth arcade feel
  useEffect(() => {
    if (!isMoving || isInteracting || isCelebrating || isSad) return;
    
    const frameInterval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 5); // 5 frames now
    }, 100); // Fast arcade animation
    
    return () => clearInterval(frameInterval);
  }, [isMoving, isInteracting, isCelebrating, isSad]);

  useEffect(() => {
    const keysPressed = new Set<string>();
    const moveSpeed = 5;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault();
        keysPressed.add(key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.delete(key);
    };

    const gameLoop = setInterval(() => {
      if (keysPressed.size === 0) {
        setIsMoving(false);
        return;
      }

      setIsMoving(true);
      let newX = position.x;
      let newY = position.y;
      let newDirection = direction;

      // Handle movement with WASD or arrow keys
      if (keysPressed.has('w') || keysPressed.has('arrowup')) {
        newY = Math.max(5, position.y - moveSpeed);
        newDirection = 'up';
      }
      if (keysPressed.has('s') || keysPressed.has('arrowdown')) {
        newY = Math.min(85, position.y + moveSpeed);
        newDirection = 'down';
      }
      if (keysPressed.has('a') || keysPressed.has('arrowleft')) {
        newX = Math.max(5, position.x - moveSpeed);
        newDirection = 'left';
      }
      if (keysPressed.has('d') || keysPressed.has('arrowright')) {
        newX = Math.min(90, position.x + moveSpeed);
        newDirection = 'right';
      }

      if (newX !== position.x || newY !== position.y) {
        setDirection(newDirection);
        onPositionChange({ x: newX, y: newY });
      }
    }, 50);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      clearInterval(gameLoop);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [position, direction, onPositionChange]);

  // Get current sprite image
  const getCurrentSprite = () => {
    // Special animations could use specific frames
    if (isCelebrating) return SPRITE_FRAMES.down[0]; // Standing pose
    if (isSad) return SPRITE_FRAMES.down[0]; // Standing pose
    if (isInteracting) return SPRITE_FRAMES.down[0]; // Standing pose
    
    // Walking animations
    const frame = isMoving ? animationFrame : 0;
    return SPRITE_FRAMES[direction][frame];
  };

  const currentSprite = getCurrentSprite();

  return (
    <div
      className="gordon-character absolute pointer-events-none transition-all duration-75"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: position.y > 50 ? 25 : 15,
      }}
    >
      <img
        src={currentSprite}
        alt="Gordon Ramsay"
        style={{
          width: '128px',
          height: '128px',
          imageRendering: 'pixelated',
          filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.8))',
        }}
      />
    </div>
  );
};

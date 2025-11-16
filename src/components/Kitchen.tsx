import { OrderTicket, StationState } from "@/types/game";
import { Station } from "./Station";
import { Gordon } from "./Gordon";
import { StationStateOverlay } from "./StationStateOverlay";
import { cn } from "@/lib/utils";
import kitchenBg from "@/assets/kitchen-bg-integrated.png";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useRef, useEffect } from "react";

interface KitchenProps {
  stations: StationState[];
  onStationClick: (stationId: string) => void;
  gordonPosition: { x: number; y: number };
  onGordonMove: (position: { x: number; y: number }) => void;
  nearbyStation: string | null;
  isInteracting?: boolean;
  isCelebrating?: boolean;
  isSad?: boolean;
  isPortrait?: boolean;
  deviceType?: 'desktop' | 'tablet' | 'phone';
}

export const Kitchen = ({ stations, onStationClick, gordonPosition, onGordonMove, nearbyStation, isInteracting, isCelebrating, isSad, isPortrait, deviceType = 'desktop' }: KitchenProps) => {
  const isMobile = useIsMobile();
  // Higher zoom on mobile/tablet for camera-follow experience
  const [scale, setScale] = useState(isMobile ? 1.8 : 0.5);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const lastTouch = useRef({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });
  
  // Station positions - pinned to kitchen background locations (device-specific)
  const stationPositions = 
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
    };
  
  // Calculate station screen positions (accounting for scale and pan)
  const calculateStationScreenPosition = (mapPosition: { x: number; y: number }) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    // Convert map percentage to screen pixels
    const mapX = (mapPosition.x / 100) * containerWidth;
    const mapY = (mapPosition.y / 100) * containerHeight;
    
    // Apply scale and pan transformations
    const screenX = mapX * scale + pan.x;
    const screenY = mapY * scale + pan.y;
    
    return { x: screenX, y: screenY };
  };
  
  // Camera follow for mobile/tablet
  useEffect(() => {
    if (isMobile && containerRef.current) {
      const container = containerRef.current;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      
      // Calculate background dimensions at current scale
      const bgWidth = containerWidth;
      const bgHeight = containerHeight;
      
      // Convert Gordon's percentage position to screen coordinates
      const gordonScreenX = (gordonPosition.x / 100) * bgWidth * scale;
      const gordonScreenY = (gordonPosition.y / 100) * bgHeight * scale;
      
      // Calculate pan needed to center Gordon
      let targetPanX = (containerWidth / 2) - gordonScreenX;
      let targetPanY = (containerHeight / 2) - gordonScreenY;
      
      // Constrain pan to keep kitchen visible
      const maxPanX = (bgWidth * scale - containerWidth) / 2;
      const maxPanY = (bgHeight * scale - containerHeight) / 2;
      
      targetPanX = Math.max(-maxPanX, Math.min(maxPanX, targetPanX));
      targetPanY = Math.max(-maxPanY, Math.min(maxPanY, targetPanY));
      
      setPan({ x: targetPanX, y: targetPanY });
    }
  }, [gordonPosition, isMobile, scale]);
  
  // Pan and zoom handlers for all devices
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * -0.001;
      setScale(prev => Math.min(Math.max(0.3, prev + delta), 3));
    };
    
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // Left click
        isPanning.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning.current) {
        const deltaX = e.clientX - lastMousePos.current.x;
        const deltaY = e.clientY - lastMousePos.current.y;
        setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };
    
    const handleMouseUp = () => {
      isPanning.current = false;
    };
    
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isPanning.current = true;
        lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isPanning.current) {
        const deltaX = e.touches[0].clientX - lastTouch.current.x;
        const deltaY = e.touches[0].clientY - lastTouch.current.y;
        setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
        lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        // Pinch zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        
        if (lastTouch.current.x !== 0) {
          const prevDistance = lastTouch.current.x;
          const delta = (distance - prevDistance) * 0.01;
          setScale(prev => Math.min(Math.max(0.3, prev + delta), 3));
        }
        lastTouch.current = { x: distance, y: 0 };
      }
    };
    
    const handleTouchEnd = () => {
      isPanning.current = false;
      lastTouch.current = { x: 0, y: 0 };
    };
    
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);
  
  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing">
      <div className="absolute top-4 right-4 z-50 bg-black/80 text-white px-3 py-2 rounded text-xs">
        {isMobile ? "Pinch to zoom • Drag to pan" : "Scroll to zoom • Drag to pan"}
      </div>
      
      {/* Scaled Container - Background and Gordon only */}
      <div 
        className="relative z-10 w-full h-full mx-auto transition-transform duration-100"
        style={{
          transform: `scale(${scale}) translate(${pan.x / scale}px, ${pan.y / scale}px)`,
          transformOrigin: 'center center',
        }}
      >
        <div className="relative w-full h-full">
          {/* Kitchen Background */}
          <div
            className="absolute inset-0 opacity-100 border-8 border-[hsl(var(--wood))] rounded-2xl shadow-2xl"
            style={{
              backgroundImage: `url(${kitchenBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          
          {/* Enhanced Floor Grid for Navigation */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none rounded-2xl"
            style={{
              backgroundImage: `
                linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .08) 25%, rgba(255, 255, 255, .08) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .08) 75%, rgba(255, 255, 255, .08) 76%, transparent 77%, transparent),
                linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .08) 25%, rgba(255, 255, 255, .08) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .08) 75%, rgba(255, 255, 255, .08) 76%, transparent 77%, transparent)
              `,
              backgroundSize: '50px 50px',
            }}
          />

          {/* Floor Grid Overlay */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent)',
              backgroundSize: '50px 50px',
            }}
          />
          
          {/* Gordon Character - inside scaled container */}
          <Gordon 
            position={gordonPosition}
            onPositionChange={onGordonMove}
            isInteracting={isInteracting}
            isCelebrating={isCelebrating}
            isSad={isSad}
          />

          {/* Debug: Show Gordon's position */}
          <div className="absolute top-4 left-4 bg-black/80 text-white px-4 py-2 rounded font-mono text-sm z-50 pointer-events-none">
            Gordon: ({gordonPosition.x.toFixed(0)}, {gordonPosition.y.toFixed(0)})
          </div>

          {/* Debug: Show interaction zones */}
          {stations.map((station) => {
            const pos = stationPositions[station.id as keyof typeof stationPositions];
            if (!pos) return null;
            return (
              <div
                key={`debug-${station.id}`}
                className="absolute border-2 border-yellow-400 rounded-full opacity-20 pointer-events-none"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  width: '5%',
                  height: '5%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            );
          })}
          
          {/* Stations - inside scaled container, pinned to map positions */}
          {stations.map((station) => {
            const pos = stationPositions[station.id as keyof typeof stationPositions];
            const isNearby = nearbyStation === station.id;
            return (
              <Station
                key={station.id}
                station={station}
                onClick={onStationClick}
                position={pos}
                highlighted={isNearby}
                deviceType={deviceType}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

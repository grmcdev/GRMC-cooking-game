import { StationState } from "@/types/game";
import { cn } from "@/lib/utils";

// Helper to get station display visuals - SUPER BRIGHT for debugging
const getStationVisuals = (type: string) => {
  const styles = {
    'crate': { bg: '#FF6B00', label: 'CRATE' },      // Bright orange
    'cutting': { bg: '#00D9FF', label: 'CUTTING' },  // Cyan
    'skillet': { bg: '#FF0000', label: 'SKILLET' },  // Pure red
    'cauldron': { bg: '#9D00FF', label: 'CAULDRON' }, // Purple
    'plating': { bg: '#00FF00', label: 'PLATING' },  // Pure green
  };
  return styles[type as keyof typeof styles] || styles['crate'];
};

interface StationProps {
  station: StationState;
  onClick: (stationId: string) => void;
  position: { x: number; y: number };
  highlighted?: boolean;
  deviceType?: 'desktop' | 'tablet' | 'phone';
}

export const Station = ({ station, onClick, position, highlighted, deviceType = 'desktop' }: StationProps) => {
  const handleClick = () => {
    onClick(station.id);
  };

  const visuals = getStationVisuals(station.type);
  
  // Device-specific station sizes - tablet is tiny, phone compact, desktop full size
  const size = deviceType === 'phone' ? 8 : deviceType === 'tablet' ? 4 : 18;
  const fontSize = deviceType === 'phone' ? 'text-[4px]' : deviceType === 'tablet' ? 'text-[2px]' : 'text-[6px]';
  const iconSize = deviceType === 'phone' ? 'text-[5px]' : deviceType === 'tablet' ? 'text-[3px]' : 'text-[9px]';
  const borderWidth = deviceType === 'phone' ? '1px' : deviceType === 'tablet' ? '0.5px' : '2px';
  const borderRadius = deviceType === 'phone' ? '1px' : deviceType === 'tablet' ? '0.5px' : '3px';
  const ingredientSize = deviceType === 'phone' ? 6 : deviceType === 'tablet' ? 3 : 12;
  const ingredientIconSize = deviceType === 'phone' ? 'text-[4px]' : deviceType === 'tablet' ? 'text-[2px]' : 'text-[7px]';
  
  return (
    <button
      onClick={handleClick}
      className={cn(
        "absolute station-button cursor-pointer font-black",
        highlighted && "animate-pulse",
        "transition-all duration-200"
      )}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: visuals.bg,
        border: highlighted ? `${borderWidth} solid #FFFF00` : `${borderWidth} solid #FFFFFF`,
        borderRadius: borderRadius,
        boxShadow: highlighted 
          ? '0 0 30px rgba(255, 255, 0, 1), 0 0 50px rgba(255, 255, 0, 0.5), 0 8px 15px rgba(0,0,0,1)' 
          : '0 6px 12px rgba(0,0,0,1)',
        zIndex: 20,
        imageRendering: 'pixelated',
      }}
    >
      <div className="flex flex-col items-center justify-center h-full relative">
        <span className={cn("font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)] uppercase tracking-tight", fontSize)}>
          {visuals.label}
        </span>
        
        {station.ingredient && (
          <div 
            className={cn("absolute -top-1 -right-1 bg-white border-2 border-black rounded-full flex items-center justify-center shadow-lg z-10")}
            style={{ width: `${ingredientSize}px`, height: `${ingredientSize}px` }}
          >
            <span className={ingredientIconSize}>{station.ingredient.icon}</span>
          </div>
        )}
        
        {station.progress !== undefined && station.progress > 0 && (
          <div className="absolute left-0 right-0 bottom-0 px-0.5 pb-0.5">
            <div className="relative bg-black/90 rounded-sm overflow-hidden border-2 border-white shadow-xl" style={{ height: deviceType === 'phone' ? '6px' : deviceType === 'tablet' ? '3px' : '12px' }}>
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 transition-all duration-200 animate-pulse"
                style={{ width: `${station.progress}%` }}
              />
              {deviceType === 'desktop' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[8px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)] z-10">
                    {Math.round(station.progress)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {highlighted && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-400 px-1 py-0.5 rounded text-[4px] font-black text-black whitespace-nowrap border border-white shadow-lg z-50">
            ⚡ E ⚡
          </div>
        )}
      </div>
    </button>
  );
};

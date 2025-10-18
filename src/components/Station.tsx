import { StationState } from "@/types/game";
import { cn } from "@/lib/utils";

interface StationProps {
  station: StationState;
  onClick: (stationId: string) => void;
  position: { x: number; y: number };
}

const STATION_ICONS = {
  crate: '📦',
  cutting: '🔪',
  skillet: '🍳',
  cauldron: '🔮',
  plating: '🍽️',
};

const STATION_LABELS = {
  crate: 'INGREDIENT CRATE',
  cutting: 'CUTTING BOARD',
  skillet: 'SKILLET',
  cauldron: 'CAULDRON',
  plating: 'PLATING COUNTER',
};

export const Station = ({ station, onClick, position }: StationProps) => {
  const handleClick = () => {
    onClick(station.id);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "absolute game-panel bg-wood/90 backdrop-blur-sm",
        "w-32 h-32 flex flex-col items-center justify-center gap-2",
        "hover:bg-wood hover:scale-105 transition-all cursor-pointer",
        "border-4 border-stone-light",
        station.isActive && "ring-4 ring-accent animate-pulse"
      )}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
    >
      {/* Station Icon */}
      <div className="text-5xl">{STATION_ICONS[station.type]}</div>
      
      {/* Ingredient on Station */}
      {station.ingredient && (
        <div className="absolute -top-2 -right-2 text-3xl bg-background/90 rounded-full p-1 border-2 border-accent">
          {station.ingredient.icon}
        </div>
      )}
      
      {/* Progress Bar */}
      {station.progress !== undefined && station.progress > 0 && (
        <div className="absolute bottom-2 left-2 right-2 h-2 bg-muted border border-stone-light overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-200"
            style={{ width: `${station.progress}%` }}
          />
        </div>
      )}
      
      {/* Station Label */}
      <div className="text-[0.5rem] text-foreground font-bold text-center leading-tight">
        {STATION_LABELS[station.type]}
      </div>
    </button>
  );
};

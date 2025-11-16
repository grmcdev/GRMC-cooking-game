import { StationState } from "@/types/game";
import crateOpen from "@/assets/station-states/crate-open.png";
import cuttingActive from "@/assets/station-states/cutting-active.png";
import skilletCooking from "@/assets/station-states/skillet-cooking.png";
import cauldronCooking from "@/assets/station-states/cauldron-cooking.png";
import platingReady from "@/assets/station-states/plating-ready.png";

interface StationStateOverlayProps {
  station: StationState;
  position: { x: number; y: number };
}

export const StationStateOverlay = ({ station, position }: StationStateOverlayProps) => {
  const getStateImage = () => {
    if (!station.isActive && !station.ingredient) return null;
    
    switch (station.type) {
      case 'crate':
        return station.isActive ? crateOpen : null;
      case 'cutting':
        return station.isActive ? cuttingActive : null;
      case 'skillet':
        return station.isActive ? skilletCooking : null;
      case 'cauldron':
        return station.isActive ? cauldronCooking : null;
      case 'plating':
        return station.ingredient ? platingReady : null;
      default:
        return null;
    }
  };

  const stateImage = getStateImage();
  if (!stateImage) return null;

  return (
    <div
      className="absolute pointer-events-none z-10"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <img
        src={stateImage}
        alt="Station state"
        className="w-40 h-40 animate-pulse"
        style={{ 
          imageRendering: 'pixelated',
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.8)) brightness(1.2)',
        }}
      />
    </div>
  );
};

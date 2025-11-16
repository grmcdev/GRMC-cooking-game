import { StationState } from "@/types/game";
import { cn } from "@/lib/utils";

// Match the station colors and labels from Station.tsx
const getStationInfo = (type: string) => {
  const info = {
    'crate': { bg: '#FF6B00', label: 'COLLECTING', action: 'Collecting' },
    'cutting': { bg: '#00D9FF', label: 'CUTTING', action: 'Cutting' },
    'skillet': { bg: '#FF0000', label: 'COOKING', action: 'Cooking' },
    'cauldron': { bg: '#9D00FF', label: 'BOILING', action: 'Boiling' },
    'plating': { bg: '#00FF00', label: 'PLATING', action: 'Plating' },
  };
  return info[type as keyof typeof info] || info['crate'];
};

interface GlobalProgressBarProps {
  stations: StationState[];
}

export const GlobalProgressBar = ({ stations }: GlobalProgressBarProps) => {
  // Find the first station that has progress > 0
  const activeStation = stations.find(s => s.progress !== undefined && s.progress > 0 && s.progress < 100);

  if (!activeStation) return null;

  const stationInfo = getStationInfo(activeStation.type);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 border-t-4 border-white shadow-2xl">
      <div className="relative h-16 overflow-hidden">
        {/* Progress bar background */}
        <div 
          className="absolute inset-0 transition-all duration-300"
          style={{ 
            width: `${activeStation.progress}%`,
            backgroundColor: stationInfo.bg,
            boxShadow: `0 0 20px ${stationInfo.bg}80`
          }}
        />
        
        {/* Content */}
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)] uppercase tracking-wider">
              {stationInfo.action}
            </div>
            <div className="text-4xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
              {Math.round(activeStation.progress || 0)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

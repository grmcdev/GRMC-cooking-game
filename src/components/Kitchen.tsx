import { OrderTicket, StationState } from "@/types/game";
import { RecipeCard } from "./RecipeCard";
import { Station } from "./Station";
import kitchenBg from "@/assets/kitchen-bg.png";

interface KitchenProps {
  orders: OrderTicket[];
  stations: StationState[];
  onStationClick: (stationId: string) => void;
}

export const Kitchen = ({ orders, stations, onStationClick }: KitchenProps) => {
  // Station positions (x%, y%)
  const stationPositions = {
    'crate-1': { x: 5, y: 20 },
    'crate-2': { x: 5, y: 45 },
    'crate-3': { x: 5, y: 70 },
    'cutting-1': { x: 35, y: 25 },
    'cutting-2': { x: 50, y: 25 },
    'skillet-1': { x: 75, y: 25 },
    'cauldron-1': { x: 85, y: 45 },
    'plating-1': { x: 45, y: 65 },
  };
  return (
    <div className="relative w-full h-full pt-24 pb-8 px-4">
      {/* Kitchen Background */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url(${kitchenBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Orders Board */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="game-panel bg-craft-brown/90 backdrop-blur-sm mb-6">
          <h2 className="text-accent text-xl font-bold mb-4 flex items-center gap-2">
            📋 ACTIVE ORDERS
          </h2>
          
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-lg">Waiting for orders...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {orders.map((order) => (
                <RecipeCard
                  key={order.id}
                  recipe={order.recipe}
                  timeRemaining={order.timeRemaining}
                  completedIngredients={order.completedIngredients}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Interactive Kitchen Stations */}
        <div className="relative h-96 mt-8">
          {stations.map((station) => (
            <Station
              key={station.id}
              station={station}
              onClick={onStationClick}
              position={stationPositions[station.id as keyof typeof stationPositions]}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

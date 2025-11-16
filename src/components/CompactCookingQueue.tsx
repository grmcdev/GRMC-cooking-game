import { OrderTicket } from "@/types/game";
import { cn } from "@/lib/utils";

interface CompactCookingQueueProps {
  orders: OrderTicket[];
  isPortrait?: boolean;
}

export const CompactCookingQueue = ({ orders, isPortrait }: CompactCookingQueueProps) => {
  if (orders.length === 0) return null;

  // Portrait layout - vertical stack
  if (isPortrait) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-40 max-h-[12vh]">
        <div className="bg-craft-brown/95 backdrop-blur-sm rounded-lg border-4 border-craft-wood shadow-2xl p-1">
          <div className="flex flex-col gap-1 overflow-y-auto max-h-[10vh]">
            {orders.slice(0, 3).map((order) => {
              const isUrgent = order.timeRemaining <= 10;
              const timeColor = order.timeRemaining <= 5 
                ? 'text-red-600' 
                : order.timeRemaining <= 10 
                ? 'text-yellow-500' 
                : 'text-green-500';

              return (
                  <div
                    key={order.id}
                    className={cn(
                      "bg-white/95 rounded-lg p-1 border-2 w-full",
                      isUrgent ? "border-red-500 animate-pulse" : "border-gray-300"
                    )}
                  >
                    {/* Header with recipe name and timer */}
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-[10px] font-bold text-gray-800 truncate flex-1">
                        {order.recipe.name}
                      </h4>
                      <div className={cn(
                        "ml-2 text-[10px] font-bold flex items-center gap-1 flex-shrink-0",
                        timeColor
                      )}>
                        ⏱️ {order.timeRemaining}s
                      </div>
                    </div>

                    {/* Ingredients in 2-column grid */}
                    <div className="grid grid-cols-4 gap-1 mb-1">
                      {order.recipe.ingredients.map((ingredient) => {
                        const isComplete = order.completedIngredients?.has(ingredient.id);
                        return (
                          <div
                            key={ingredient.id}
                            className={cn(
                              "relative flex items-center justify-center w-full aspect-square rounded border transition-all",
                              isComplete 
                                ? "bg-green-100 border-green-500 opacity-60" 
                                : "bg-gray-50 border-gray-300"
                            )}
                            title={ingredient.name}
                          >
                            <span className="text-sm">{ingredient.icon}</span>
                            {isComplete && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-green-600 font-bold text-xs">✓</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <span className="text-[9px] font-bold text-yellow-600">
                        +{order.recipe.points} pts
                      </span>
                    </div>
                  </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Landscape layout (existing)
  return (
    <div className="fixed bottom-4 left-4 right-32 z-40">
      <div className="bg-craft-brown/95 backdrop-blur-sm rounded-lg border-2 border-craft-wood shadow-2xl p-1">
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {orders.map((order) => {
            const isUrgent = order.timeRemaining <= 10;
            const timeColor = order.timeRemaining <= 5 
              ? 'text-red-600' 
              : order.timeRemaining <= 10 
              ? 'text-yellow-500' 
              : 'text-green-500';

            return (
              <div
                key={order.id}
                className={cn(
                  "flex-shrink-0 bg-white/95 rounded-lg p-1 border border-gray-300 min-w-[180px]",
                  isUrgent && "border-red-500 animate-pulse"
                )}
              >
                {/* Header with recipe name and timer */}
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-[10px] font-bold text-gray-800 truncate flex-1">
                    {order.recipe.name}
                  </h4>
                  <div className={cn(
                    "ml-1 text-[10px] font-bold flex items-center gap-0.5 flex-shrink-0",
                    timeColor
                  )}>
                    ⏱️ {order.timeRemaining}s
                  </div>
                </div>

                {/* Ingredients as icons */}
                <div className="flex gap-0.5 flex-wrap mb-1">
                  {order.recipe.ingredients.map((ingredient) => {
                    const isComplete = order.completedIngredients?.has(ingredient.id);
                    return (
                      <div
                        key={ingredient.id}
                        className={cn(
                          "relative flex items-center justify-center w-4 h-4 rounded border transition-all",
                          isComplete 
                            ? "bg-green-100 border-green-500 opacity-60" 
                            : "bg-gray-50 border-gray-300"
                        )}
                        title={ingredient.name}
                      >
                        <span className="text-[10px]">{ingredient.icon}</span>
                        {isComplete && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-green-600 font-bold text-[8px]">✓</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Points */}
                <div className="text-right">
                  <span className="text-[9px] font-bold text-yellow-600">
                    +{order.recipe.points} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

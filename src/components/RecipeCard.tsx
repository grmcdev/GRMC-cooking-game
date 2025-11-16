import { Recipe } from "@/types/game";
import { cn } from "@/lib/utils";

interface RecipeCardProps {
  recipe: Recipe;
  timeRemaining: number;
  completedIngredients: Set<string>;
}

export const RecipeCard = ({ recipe, timeRemaining, completedIngredients }: RecipeCardProps) => {
  const progress = (completedIngredients.size / recipe.ingredients.length) * 100;
  const isUrgent = timeRemaining <= 15;
  
  const timeColor = timeRemaining <= 5 ? 'stroke-red-600' : timeRemaining <= 15 ? 'stroke-yellow-500' : 'stroke-green-500';
  const circumference = 2 * Math.PI * 36;
  const timeProgress = (timeRemaining / recipe.timeLimit) * 100;
  
  return (
    <div className={cn(
      "relative bg-white rounded-lg p-4 shadow-2xl",
      "border-4",
      isUrgent ? "border-red-500 animate-pulse" : "border-gray-300",
      "transform rotate-1",
      "min-w-[220px] max-w-[220px]"
    )}>
      {/* Circular Timer */}
      <div className="absolute -top-4 -right-4 z-10">
        <div className="relative w-20 h-20">
          <svg className="transform -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="36"
              className={timeColor}
              strokeWidth="8"
              fill="white"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={circumference - (timeProgress / 100) * circumference}
              style={{ transition: 'stroke-dashoffset 0.5s' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              "text-2xl font-bold",
              isUrgent && "text-red-600 animate-pulse"
            )}>
              {timeRemaining}s
            </span>
          </div>
        </div>
      </div>

      {/* Urgent Banner */}
      {isUrgent && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-bounce shadow-lg">
          URGENT!
        </div>
      )}

      {/* Recipe Name */}
      <h3 className="text-lg font-bold text-gray-800 mb-3 pr-16">
        {recipe.name}
      </h3>

      {/* Ingredient Checklist */}
      <div className="space-y-2 mb-3">
        {recipe.ingredients.map((ingredient) => {
          const isComplete = completedIngredients?.has(ingredient.id);
          return (
            <div
              key={ingredient.id}
              className={cn(
                "flex items-center gap-2 p-2 rounded-md transition-all",
                isComplete ? "bg-green-100 line-through opacity-50" : "bg-gray-50"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0",
                isComplete ? "bg-green-500 border-green-600" : "bg-white border-gray-400"
              )}>
                {isComplete && <span className="text-white text-sm">✓</span>}
              </div>
              
              <span className="text-3xl">{ingredient.icon}</span>
              
              <div className="flex-1 text-sm">
                <div className="font-medium text-gray-700">{ingredient.name}</div>
                <div className="text-xs text-gray-500">
                  {ingredient.needsChopping && "✂️ Chop → "}
                  {ingredient.needsCooking && `🔥 ${ingredient.cookMethod} → `}
                  🍽️ Plate
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Points Display */}
      <div className="flex items-center justify-between border-t-2 border-dashed border-gray-300 pt-2">
        <span className="text-sm text-gray-600">Reward:</span>
        <span className="text-xl font-bold text-yellow-600">+{recipe.points} pts</span>
      </div>
    </div>
  );
};

import { Recipe } from "@/types/game";
import { Clock, Star } from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe;
  timeRemaining: number;
  completedIngredients: Set<string>;
}

export const RecipeCard = ({ recipe, timeRemaining, completedIngredients }: RecipeCardProps) => {
  const progress = completedIngredients.size / recipe.ingredients.length;
  const isUrgent = timeRemaining <= 15;
  
  const difficultyColor = {
    easy: 'bg-primary',
    medium: 'bg-secondary',
    hard: 'bg-accent'
  }[recipe.difficulty];
  
  const difficultyStars = {
    easy: 1,
    medium: 2,
    hard: 3
  }[recipe.difficulty];
  
  return (
    <div className={`recipe-card relative ${isUrgent ? 'animate-pulse border-destructive' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className={`${difficultyColor} text-background px-2 py-1 text-xs flex items-center gap-1`}>
          {Array.from({ length: difficultyStars }).map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-current" />
          ))}
        </div>
        <div className={`flex items-center gap-1 text-sm ${isUrgent ? 'text-destructive' : 'text-accent'}`}>
          <Clock className="w-4 h-4" />
          <span className="font-bold">{timeRemaining}s</span>
        </div>
      </div>
      
      {/* Recipe name */}
      <h3 className="text-foreground text-sm font-bold mb-2">{recipe.name}</h3>
      
      {/* Ingredients */}
      <div className="space-y-1 mb-2">
        {recipe.ingredients.map((ingredient) => {
          const isCompleted = completedIngredients.has(ingredient.id);
          return (
            <div
              key={ingredient.id}
              className={`flex items-center gap-2 text-xs p-1 border ${
                isCompleted ? 'bg-primary/20 border-primary' : 'bg-muted/50 border-stone-light'
              }`}
            >
              <span className="text-lg">{ingredient.icon}</span>
              <span className={isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}>
                {ingredient.name}
              </span>
              {ingredient.needsChopping && <span className="text-xs">🔪</span>}
              {ingredient.needsCooking && <span className="text-xs">🔥</span>}
            </div>
          );
        })}
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-2 bg-muted border border-stone-light overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      
      {/* Points */}
      <div className="absolute -top-2 -right-2 bg-accent text-craft-brown w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-background">
        {recipe.points}
      </div>
    </div>
  );
};

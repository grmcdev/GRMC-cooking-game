import { IngredientState } from "@/types/game";

interface PlayerHandProps {
  ingredient?: IngredientState;
}

export const PlayerHand = ({ ingredient }: PlayerHandProps) => {
  if (!ingredient) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className="game-panel bg-wood/95 backdrop-blur-sm flex flex-col items-center gap-2 p-4 border-4 border-accent animate-bounce">
        <div className="text-sm font-bold text-accent">HOLDING</div>
        <div className="text-6xl">{ingredient.icon}</div>
        <div className="text-xs text-foreground text-center">{ingredient.name}</div>
        <div className="text-[0.65rem] text-muted-foreground uppercase">{ingredient.type}</div>
      </div>
    </div>
  );
};

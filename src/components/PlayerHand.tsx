import { IngredientState } from "@/types/game";

interface PlayerHandProps {
  ingredient?: IngredientState;
  gordonPosition: { x: number; y: number };
}

export const PlayerHand = ({ ingredient, gordonPosition }: PlayerHandProps) => {
  if (!ingredient) return null;

  return (
    <div 
      className="fixed pointer-events-none z-50"
      style={{
        left: `${gordonPosition.x}%`,
        top: `${gordonPosition.y - 8}%`,
        transform: 'translate(-50%, -100%)',
      }}
    >
      {/* Large ingredient icon floating above Gordon */}
      <div className="text-6xl filter drop-shadow-2xl animate-bounce">
        {ingredient.icon}
      </div>
      
      {/* Small badge showing state */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/90 text-white px-2 py-0.5 rounded-full text-xs font-bold border-2 border-white uppercase">
        {ingredient.type}
      </div>
    </div>
  );
};

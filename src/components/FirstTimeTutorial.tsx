import { Button } from "./ui/button";

interface FirstTimeTutorialProps {
  onClose: () => void;
}

export const FirstTimeTutorial = ({ onClose }: FirstTimeTutorialProps) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-8">
      <div className="bg-[hsl(var(--craft-brown))] border-8 border-[hsl(var(--accent))] rounded-2xl p-8 max-w-3xl shadow-2xl">
        <h1 className="text-4xl font-black text-[hsl(var(--accent))] mb-6 text-center">
          🍳 How to Cook! 🍳
        </h1>
        
        <div className="space-y-4 text-foreground text-lg">
          <div className="flex items-start gap-4">
            <div className="text-5xl">📦</div>
            <div>
              <strong className="text-[hsl(var(--accent))]">Ingredient Crates:</strong> Walk near and press <kbd className="bg-black px-3 py-1 rounded font-bold text-white">E</kbd> to grab ingredients (wheat, tomatoes, etc.)
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="text-5xl">🔪</div>
            <div>
              <strong className="text-[hsl(var(--accent))]">Cutting Board:</strong> Place raw ingredients here and press <kbd className="bg-black px-3 py-1 rounded font-bold text-white">E</kbd> to chop them
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="text-5xl">🍳</div>
            <div>
              <strong className="text-[hsl(var(--accent))]">Skillet/Cauldron:</strong> Place chopped ingredients here and press <kbd className="bg-black px-3 py-1 rounded font-bold text-white">E</kbd> to cook them
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="text-5xl">🍽️</div>
            <div>
              <strong className="text-[hsl(var(--accent))]">Plating Counter:</strong> Place finished ingredients here to complete orders!
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-[hsl(var(--primary))] text-primary-foreground p-4 rounded-lg">
          <strong>💡 TIP:</strong> Watch the icons above Gordon's head to see what you're holding!
        </div>
        
        <Button 
          onClick={onClose}
          className="w-full mt-6 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-primary-foreground font-black text-2xl py-6 rounded-xl border-4 border-white shadow-2xl"
        >
          GOT IT! LET'S COOK! 🚀
        </Button>
      </div>
    </div>
  );
};

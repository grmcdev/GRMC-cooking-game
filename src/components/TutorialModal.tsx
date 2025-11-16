import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TutorialModalProps {
  open: boolean;
  onClose: () => void;
}

export const TutorialModal = ({ open, onClose }: TutorialModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-accent">Welcome to Gordon's Minecraft Nightmares!</DialogTitle>
          <DialogDescription className="text-base">
            Help Chef Gordon survive the chaotic kitchen!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="game-panel">
            <h3 className="text-accent font-bold mb-2 text-lg">🎮 Controls</h3>
            <ul className="space-y-1 text-foreground">
              <li>• <strong>Move:</strong> WASD or Arrow Keys</li>
              <li>• <strong>Interact:</strong> E key (when near a station)</li>
            </ul>
          </div>

          <div className="game-panel">
            <h3 className="text-accent font-bold mb-2 text-lg">🎯 Objective</h3>
            <p className="text-foreground">
              Complete customer orders before time runs out! Reach the target score to beat each level.
            </p>
          </div>

          <div className="game-panel">
            <h3 className="text-accent font-bold mb-2 text-lg">🍳 How to Cook</h3>
            <ol className="space-y-2 text-foreground list-decimal list-inside">
              <li><strong>Pick up ingredients</strong> from crates (left side)</li>
              <li><strong>Chop ingredients</strong> that need chopping (🔪) on cutting boards</li>
              <li><strong>Cook ingredients</strong> that need cooking (🔥) on skillet or cauldron</li>
              <li><strong>Plate the finished ingredient</strong> at the plating counter</li>
              <li><strong>Complete all ingredients</strong> in an order to earn points!</li>
            </ol>
          </div>

          <div className="game-panel">
            <h3 className="text-accent font-bold mb-2 text-lg">📋 Stations</h3>
            <ul className="space-y-1 text-foreground">
              <li>• <strong>Crates:</strong> Pick up raw ingredients</li>
              <li>• <strong>Cutting Boards:</strong> Chop vegetables and prepare ingredients</li>
              <li>• <strong>Skillet:</strong> Pan-fry ingredients</li>
              <li>• <strong>Cauldron:</strong> Boil or brew ingredients</li>
              <li>• <strong>Plating Counter:</strong> Serve completed ingredients</li>
            </ul>
          </div>

          <div className="game-panel bg-destructive/20 border-destructive">
            <h3 className="text-destructive font-bold mb-2 text-lg">⚠️ Watch Out!</h3>
            <ul className="space-y-1 text-foreground">
              <li>• Orders expire if not completed in time</li>
              <li>• Each level has a time limit</li>
              <li>• Match ingredients to the correct cooking station</li>
              <li>• Can only hold one ingredient at a time</li>
            </ul>
          </div>

          <div className="text-center pt-4">
            <Button onClick={onClose} size="lg" className="text-lg px-8">
              Let's Cook! 🔥
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw, Home } from "lucide-react";

interface GameOverModalProps {
  level: number;
  score: number;
  targetScore: number;
  success: boolean;
  onRestart: () => void;
  onMenu: () => void;
}

export const GameOverModal = ({ level, score, targetScore, success, onRestart, onMenu }: GameOverModalProps) => {
  const message = success 
    ? level === 3 
      ? "You're a Kitchen Legend!"
      : "Level Complete!"
    : "Time's Up!";
    
  const subtitle = success
    ? "Outstanding work, Chef!"
    : "Keep practicing!";
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="game-panel bg-craft-brown max-w-md w-full animate-in zoom-in duration-300">
        {/* Result icon */}
        <div className="text-center mb-6">
          <div className="text-8xl mb-4">
            {success ? "🏆" : "⏰"}
          </div>
          <h2 className={`text-3xl font-bold mb-2 ${success ? 'text-accent' : 'text-secondary'}`}>
            {message}
          </h2>
          <p className="text-foreground">{subtitle}</p>
        </div>
        
        {/* Score display */}
        <div className="game-panel bg-wood mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Trophy className="w-6 h-6 text-accent" />
            <span className="text-2xl font-bold text-foreground">Final Score</span>
          </div>
          <div className="text-center">
            <span className={`text-5xl font-bold ${success ? 'text-primary' : 'text-secondary'}`}>
              {score}
            </span>
            <span className="text-2xl text-muted-foreground"> / {targetScore}</span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full h-4 bg-muted border-2 border-stone-light overflow-hidden mt-4">
            <div
              className={`h-full ${success ? 'bg-primary' : 'bg-secondary'} transition-all duration-500`}
              style={{ width: `${Math.min((score / targetScore) * 100, 100)}%` }}
            />
          </div>
        </div>
        
        {/* Level complete message */}
        {success && level === 3 && (
          <div className="game-panel bg-wood/50 mb-6 text-center text-sm text-foreground/80">
            <p className="mb-2">🎮 More content coming soon!</p>
            <p className="text-xs text-muted-foreground">- BigRigDev</p>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="space-y-3">
          <Button
            onClick={onRestart}
            className="w-full pixel-button bg-primary hover:bg-primary/90 text-primary-foreground border-0 py-6 text-lg"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Try Again
          </Button>
          <Button
            onClick={onMenu}
            className="w-full pixel-button bg-wood hover:bg-wood/80 text-foreground border-2 border-stone-light py-6 text-lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Main Menu
          </Button>
        </div>
      </div>
    </div>
  );
};

import { Clock, Trophy } from "lucide-react";
import { WalletButton } from "./WalletButton";

interface GameHeaderProps {
  timeLeft: number;
  score: number;
  targetScore: number;
  level: number;
}

export const GameHeader = ({ timeLeft, score, targetScore, level }: GameHeaderProps) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (score / targetScore) * 100;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-craft-brown border-b-4 border-stone-light p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Level indicator */}
        <div className="game-panel bg-wood text-accent text-sm px-4 py-2">
          LEVEL {level}
        </div>
        
        {/* Timer */}
        <div className="game-panel bg-wood flex items-center gap-2 px-4 py-2">
          <Clock className="w-5 h-5 text-secondary" />
          <span className={`text-xl font-bold ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
        
        {/* Score display with progress bar */}
        <div className="game-panel bg-wood flex-1 max-w-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              <span className="text-xl font-bold text-foreground">{score}</span>
              <span className="text-muted-foreground text-sm">/ {targetScore}</span>
            </div>
          </div>
          <div className="w-full h-3 bg-muted border-2 border-stone-light overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Wallet Info */}
        <div>
          <WalletButton />
        </div>
      </div>
    </div>
  );
};

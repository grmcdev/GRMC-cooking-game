import { Clock, Trophy, HelpCircle, Pause, Play, Home, Smartphone } from "lucide-react";
import { WalletButton } from "./WalletButton";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface GameHeaderProps {
  timeLeft: number;
  score: number;
  targetScore: number;
  level: number;
  onShowHelp?: () => void;
  onPause?: () => void;
  onMenu?: () => void;
  isPaused?: boolean;
  isPortrait?: boolean;
  layoutMode?: 'landscape' | 'portrait' | 'auto';
  onToggleLayout?: () => void;
}

export const GameHeader = ({ timeLeft, score, targetScore, level, onShowHelp, onPause, onMenu, isPaused, isPortrait, layoutMode, onToggleLayout }: GameHeaderProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const progress = (score / targetScore) * 100;
  
  // Portrait layout
  if (isPortrait) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-craft-brown/95 backdrop-blur-sm border-b-2 border-stone-light shadow-xl">
        <div className="p-1 space-y-1">
          {/* Top row: Level, buttons */}
          <div className="flex items-center justify-between gap-2">
            <div className="game-panel bg-wood text-accent text-xs px-2 py-1">
              LVL {level}
            </div>
            
            <div className="flex items-center gap-1">
              {/* Layout Toggle */}
              {onToggleLayout && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleLayout}
                  className="border-2 border-primary hover:bg-primary/20 h-7 px-2"
                  title={`Layout: ${layoutMode || 'auto'}`}
                >
                  <Smartphone className="w-4 h-4 text-primary" />
                </Button>
              )}
              {onPause && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPause}
                  className="border-2 border-secondary hover:bg-secondary/20 h-7 px-2"
                >
                  {isPaused ? <Play className="w-4 h-4 text-secondary" /> : <Pause className="w-4 h-4 text-secondary" />}
                </Button>
              )}
              {onMenu && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onMenu}
                  className="border-2 border-destructive hover:bg-destructive/20 h-7 px-2"
                >
                  <Home className="w-4 h-4 text-destructive" />
                </Button>
              )}
              {onShowHelp && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShowHelp}
                  className="border-2 border-primary hover:bg-primary/20 h-7 px-2"
                >
                  <HelpCircle className="w-4 h-4 text-primary" />
                </Button>
              )}
              <WalletButton />
            </div>
          </div>

          {/* Timer - Hero element */}
          <div className="game-panel bg-wood flex items-center justify-center gap-1 py-1">
            <Clock className="w-4 h-4 text-secondary" />
            <span className={cn(
              "text-lg font-bold",
              timeLeft <= 30 && "text-red-500 animate-pulse",
              timeLeft <= 10 && "text-red-600 animate-bounce"
            )}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Score progress bar */}
          <div className="game-panel bg-wood p-1">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1">
                <Trophy className="w-3 h-3 text-accent" />
                <span className="text-sm font-bold text-foreground">{score}</span>
                <span className="text-muted-foreground text-xs">/ {targetScore}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden border border-white shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Landscape layout (existing)
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-craft-brown/95 backdrop-blur-sm border-b-2 border-stone-light p-2 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Level indicator */}
        <div className="game-panel bg-wood text-accent text-xs px-2 py-1">
          LVL {level}
        </div>
        
        {/* Timer */}
        <div className="game-panel bg-wood flex items-center gap-1 px-2 py-1">
          <Clock className="w-4 h-4 text-secondary" />
          <span className={cn(
            "text-2xl font-bold",
            timeLeft <= 30 && "text-red-500 animate-pulse",
            timeLeft <= 10 && "text-red-600 animate-bounce"
          )}>
            {formatTime(timeLeft)}
          </span>
        </div>
        
        {/* Score display with progress bar */}
        <div className="game-panel bg-wood flex-1 max-w-md">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-accent" />
              <span className="text-lg font-bold text-foreground">{score}</span>
              <span className="text-muted-foreground text-sm">/ {targetScore}</span>
            </div>
          </div>
          <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden border-2 border-white shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500 flex items-center justify-end pr-1"
              style={{ width: `${Math.min(100, progress)}%` }}
            >
              {progress > 20 && (
                <span className="text-white font-bold text-[10px] drop-shadow">
                  {Math.round(progress)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Layout Toggle */}
          {onToggleLayout && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleLayout}
              className="border-2 border-primary hover:bg-primary/20"
              title={`Layout: ${layoutMode || 'auto'}`}
            >
              <Smartphone className="w-5 h-5 text-primary" />
            </Button>
          )}
          {/* Pause Button */}
          {onPause && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPause}
              className="border-2 border-secondary hover:bg-secondary/20"
            >
              {isPaused ? <Play className="w-5 h-5 text-secondary" /> : <Pause className="w-5 h-5 text-secondary" />}
            </Button>
          )}
          {/* Menu Button */}
          {onMenu && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMenu}
              className="border-2 border-destructive hover:bg-destructive/20"
            >
              <Home className="w-5 h-5 text-destructive" />
            </Button>
          )}
          {/* Help Button */}
          {onShowHelp && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShowHelp}
              className="border-2 border-primary hover:bg-primary/20"
            >
              <HelpCircle className="w-5 h-5 text-primary" />
            </Button>
          )}
          <WalletButton />
        </div>
      </div>
    </div>
  );
};

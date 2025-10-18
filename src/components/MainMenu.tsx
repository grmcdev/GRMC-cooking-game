import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/WalletButton";
import { LeaderboardModal } from "@/components/LeaderboardModal";
import { useGRMCBalance } from "@/hooks/useGRMCBalance";
import { Play, Trophy } from "lucide-react";
import { toast } from "sonner";

interface MainMenuProps {
  onStartGame: (level: number) => void;
}

export const MainMenu = ({ onStartGame }: MainMenuProps) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { hasAccess, connected, loading } = useGRMCBalance();

  const handleStartGame = (level: number) => {
    if (!connected) {
      toast.error("Wallet Required", {
        description: "Please connect your wallet to play.",
      });
      return;
    }

    if (!hasAccess) {
      toast.error("GRMC Required", {
        description: "You need GRMC tokens to access the game.",
      });
      return;
    }

    onStartGame(level);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-8xl animate-bounce">🥕</div>
        <div className="absolute top-20 right-20 text-8xl animate-bounce delay-100">🍄</div>
        <div className="absolute bottom-20 left-20 text-8xl animate-bounce delay-200">🐟</div>
        <div className="absolute bottom-10 right-10 text-8xl animate-bounce delay-300">🍎</div>
      </div>
      
      <div className="game-panel bg-craft-brown/95 backdrop-blur-sm max-w-2xl w-full relative z-10">
        {/* Wallet Connection */}
        <div className="absolute -top-4 right-4">
          <WalletButton />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-destructive mb-2 drop-shadow-lg">
            GORDON'S
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-accent mb-2 drop-shadow-lg">
            MINECRAFT
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-secondary mb-4 drop-shadow-lg">
            NIGHTMARES
          </h3>
          <div className="flex items-center justify-center gap-2 text-primary">
            <span className="text-lg">👨‍🍳</span>
            <p className="text-sm text-foreground">with Chef Gordon Ramsay</p>
            <span className="text-lg">🧟</span>
          </div>
        </div>
        
        {/* Leaderboard Button */}
        <div className="mb-6">
          <Button
            variant="gold"
            size="lg"
            className="w-full"
            onClick={() => setShowLeaderboard(true)}
          >
            <Trophy className="w-5 h-5 mr-2" />
            VIEW LEADERBOARDS
          </Button>
        </div>

        {/* Game description */}
        <div className="game-panel bg-wood mb-6 text-sm text-foreground/90 leading-relaxed">
          <p className="mb-2">
            Master the art of blocky cuisine! Gather ingredients, chop, cook, and serve
            Minecraft-inspired dishes before time runs out.
          </p>
          <p className="text-xs text-muted-foreground">
            💡 Tip: Complete recipes faster to maximize your score!
          </p>
        </div>
        
        {!connected && (
          <div className="bg-destructive/20 border-2 border-destructive rounded p-4 mb-4">
            <p className="text-sm text-center text-foreground">
              Connect your wallet to start playing!
            </p>
          </div>
        )}

        {connected && !hasAccess && !loading && (
          <div className="bg-destructive/20 border-2 border-destructive rounded p-4 mb-4">
            <p className="text-sm text-center text-foreground">
              You need GRMC tokens to play this game.
            </p>
          </div>
        )}

        {/* Level selection */}
        <div className="space-y-3 mb-6">
          <LevelButton
            level={1}
            title="Tutorial Service"
            duration="3 minutes"
            target="32 points"
            difficulty="easy"
            onStart={() => handleStartGame(1)}
            disabled={!connected || !hasAccess || loading}
          />
          <LevelButton
            level={2}
            title="Dinner Rush"
            duration="4 minutes"
            target="100 points"
            difficulty="medium"
            onStart={() => handleStartGame(2)}
            disabled={!connected || !hasAccess || loading}
          />
          <LevelButton
            level={3}
            title="Chef Showdown"
            duration="4 minutes"
            target="130 points"
            difficulty="hard"
            onStart={() => handleStartGame(3)}
            disabled={!connected || !hasAccess || loading}
          />
        </div>
        
        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>A BigRigDev Production</p>
        </div>
      </div>

      <LeaderboardModal open={showLeaderboard} onOpenChange={setShowLeaderboard} />
    </div>
  );
};

interface LevelButtonProps {
  level: number;
  title: string;
  duration: string;
  target: string;
  difficulty: 'easy' | 'medium' | 'hard';
  onStart: () => void;
  disabled?: boolean;
}

const LevelButton = ({ level, title, duration, target, difficulty, onStart, disabled }: LevelButtonProps) => {
  const difficultyColors = {
    easy: 'border-primary',
    medium: 'border-secondary',
    hard: 'border-accent'
  };
  
  return (
    <button
      onClick={onStart}
      disabled={disabled}
      className={`w-full pixel-button bg-wood hover:bg-wood/80 border-4 ${difficultyColors[difficulty]} p-4 text-left transition-all group disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-accent text-xl font-bold">LEVEL {level}</span>
            <span className="text-xs text-muted-foreground uppercase">{difficulty}</span>
          </div>
          <h3 className="text-foreground font-bold mb-2">{title}</h3>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>⏱️ {duration}</span>
            <span>🎯 {target}</span>
          </div>
        </div>
        <Play className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
      </div>
    </button>
  );
};

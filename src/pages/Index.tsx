import { useState, useEffect, useCallback } from "react";
import { MainMenu } from "@/components/MainMenu";
import { GameHeader } from "@/components/GameHeader";
import { Kitchen } from "@/components/Kitchen";
import { PlayerHand } from "@/components/PlayerHand";
import { GameOverModal } from "@/components/GameOverModal";
import { LEVELS } from "@/data/levels";
import { OrderTicket, GameState } from "@/types/game";
import { useCookingMechanics } from "@/hooks/useCookingMechanics";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { toast } from "sonner";

const Index = () => {
  const [gameState, setGameState] = useState<GameState>({
    level: 0,
    score: 0,
    targetScore: 0,
    timeLimit: 0,
    timeRemaining: 0,
    orders: [],
    isPlaying: false,
    isPaused: false,
    stations: [],
  });

  const [showGameOver, setShowGameOver] = useState(false);
  const [levelStartTime, setLevelStartTime] = useState<number>(0);
  
  // Leaderboard hook
  const { submitScore } = useLeaderboard();
  
  // Cooking mechanics hook
  const { playerHand, stations, handleStationClick } = useCookingMechanics({
    orders: gameState.orders,
    onOrderComplete: useCallback((orderId: string, points: number) => {
      setGameState((prev) => {
        const order = prev.orders.find(o => o.id === orderId);
        if (!order) return prev;
        
        const newScore = prev.score + points;
        
        toast.success(`Order Complete: ${order.recipe.name}`, {
          description: `+${points} points!`,
        });
        
        // Check if target reached
        if (newScore >= prev.targetScore) {
          setShowGameOver(true);
          
          // Submit score to leaderboard
          const runDuration = Math.floor((Date.now() - levelStartTime) / 1000);
          submitScore(prev.level, newScore, runDuration);
          
          return {
            ...prev,
            score: newScore,
            orders: prev.orders.filter((o) => o.id !== orderId),
            isPlaying: false,
          };
        }
        
        return {
          ...prev,
          score: newScore,
          orders: prev.orders.filter((o) => o.id !== orderId),
        };
      });
    }, []),
  });
  
  // Update stations in game state
  useEffect(() => {
    setGameState(prev => ({ ...prev, stations }));
  }, [stations]);

  // Start a new game
  const startGame = useCallback((level: number) => {
    const levelConfig = LEVELS[level - 1];
    setLevelStartTime(Date.now());
    
    // Generate initial orders
    const initialOrders: OrderTicket[] = [];
    for (let i = 0; i < Math.min(2, levelConfig.maxActiveOrders); i++) {
      const recipe = levelConfig.availableRecipes[Math.floor(Math.random() * levelConfig.availableRecipes.length)];
      initialOrders.push({
        id: `order-${Date.now()}-${i}`,
        recipe,
        timeRemaining: recipe.timeLimit,
        completedIngredients: new Set(),
        isComplete: false,
      });
    }

    setGameState({
      level,
      score: 0,
      targetScore: levelConfig.targetScore,
      timeLimit: levelConfig.duration,
      timeRemaining: levelConfig.duration,
      orders: initialOrders,
      isPlaying: true,
      isPaused: false,
      stations: [],
    });
    
    setShowGameOver(false);
    toast.success(`Level ${level} Started!`, {
      description: `Target: ${levelConfig.targetScore} points in ${Math.floor(levelConfig.duration / 60)} minutes`,
    });
  }, []);

  // Game loop - tick every second
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    const interval = setInterval(() => {
      setGameState((prev) => {
        // Decrease main timer
        const newTimeRemaining = Math.max(0, prev.timeRemaining - 1);
        
        // Check if game is over
        if (newTimeRemaining === 0) {
          clearInterval(interval);
          setShowGameOver(true);
          
          // Submit score to leaderboard
          const runDuration = Math.floor((Date.now() - levelStartTime) / 1000);
          submitScore(prev.level, prev.score, runDuration);
          
          return { ...prev, timeRemaining: 0, isPlaying: false };
        }

        // Update order timers and generate new orders
        const levelConfig = LEVELS[prev.level - 1];
        let updatedOrders = prev.orders.map((order) => {
          if (order.isComplete) return order;
          
          const newOrderTime = Math.max(0, order.timeRemaining - 1);
          
          // Order expired
          if (newOrderTime === 0) {
            toast.error(`Order Failed: ${order.recipe.name}`, {
              description: "Too slow! Try to be faster next time.",
            });
            return null;
          }
          
          return { ...order, timeRemaining: newOrderTime };
        }).filter((o): o is OrderTicket => o !== null && !o.isComplete);

        // Randomly add new orders if below max
        if (updatedOrders.length < levelConfig.maxActiveOrders && Math.random() < 0.3) {
          const recipe = levelConfig.availableRecipes[Math.floor(Math.random() * levelConfig.availableRecipes.length)];
          updatedOrders.push({
            id: `order-${Date.now()}`,
            recipe,
            timeRemaining: recipe.timeLimit,
            completedIngredients: new Set(),
            isComplete: false,
          });
        }

        return {
          ...prev,
          timeRemaining: newTimeRemaining,
          orders: updatedOrders,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.isPlaying, gameState.isPaused]);


  const handleRestart = () => {
    startGame(gameState.level);
  };

  const handleMenu = () => {
    setGameState((prev) => ({ ...prev, isPlaying: false, level: 0 }));
    setShowGameOver(false);
  };

  if (!gameState.isPlaying && gameState.level === 0) {
    return <MainMenu onStartGame={startGame} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <GameHeader
        timeLeft={gameState.timeRemaining}
        score={gameState.score}
        targetScore={gameState.targetScore}
        level={gameState.level}
      />
      
      <Kitchen 
        orders={gameState.orders}
        stations={gameState.stations}
        onStationClick={handleStationClick}
      />
      
      <PlayerHand ingredient={playerHand} />
      
      {showGameOver && (
        <GameOverModal
          level={gameState.level}
          score={gameState.score}
          targetScore={gameState.targetScore}
          success={gameState.score >= gameState.targetScore}
          onRestart={handleRestart}
          onMenu={handleMenu}
        />
      )}
    </div>
  );
};

export default Index;

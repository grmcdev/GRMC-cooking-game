import { useState, useEffect, useCallback } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MainMenu } from "@/components/MainMenu";
import { GameHeader } from "@/components/GameHeader";
import { Kitchen } from "@/components/Kitchen";
import { PlayerHand } from "@/components/PlayerHand";
import { GameOverModal } from "@/components/GameOverModal";
import { TutorialModal } from "@/components/TutorialModal";
import { TutorialGuide } from "@/components/TutorialGuide";
import { FirstTimeTutorial } from "@/components/FirstTimeTutorial";
import { InventoryButton } from "@/components/InventoryButton";
import { FloatingScore } from "@/components/FloatingScore";
import { Confetti } from "@/components/Confetti";
import { CompactCookingQueue } from "@/components/CompactCookingQueue";
import { GlobalProgressBar } from "@/components/GlobalProgressBar";
import { Button } from "@/components/ui/button";
import { LEVELS } from "@/data/levels";
import { OrderTicket, GameState } from "@/types/game";
import { useCookingMechanics, initializeStations } from "@/hooks/useCookingMechanics";
import { useGordonMovement } from "@/hooks/useGordonMovement";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { useScreenShake } from "@/hooks/useScreenShake";
import { useOrientation } from "@/hooks/useOrientation";
import { OrientationPrompt } from "@/components/OrientationPrompt";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Play } from "lucide-react";
import type { InventoryItem } from "@/hooks/useInventory";
import { cn } from "@/lib/utils";

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
    activeBoosts: [],
  });

  const [showGameOver, setShowGameOver] = useState(false);
  const [levelStartTime, setLevelStartTime] = useState<number>(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [inTutorialMode, setInTutorialMode] = useState(false);
  const [gordonIsInteracting, setGordonIsInteracting] = useState(false);
  const [gordonIsCelebrating, setGordonIsCelebrating] = useState(false);
  const [gordonIsSad, setGordonIsSad] = useState(false);
  const [floatingScores, setFloatingScores] = useState<Array<{
    id: string;
    points: number;
    position: { x: number; y: number };
  }>>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const { isShaking, shake } = useScreenShake();
  const [showFirstTimeTutorial, setShowFirstTimeTutorial] = useState(() => {
    return !localStorage.getItem('tutorial_completed');
  });
  const [gameScale, setGameScale] = useState(1);
  const { isMobile, isPortrait, deviceType, layoutMode, toggleLayoutMode } = useOrientation();

  const tutorialSteps = [
    {
      title: "Welcome Chef! 👨‍🍳",
      description: "You're Gordon Ramsay in Minecraft! Use WASD or Arrow Keys to move around the kitchen. Let's learn how to cook!",
      position: { x: 50, y: 10 }
    },
    {
      title: "Check Your Orders 📋",
      description: "Look at the top of the screen - that's your order board! Each card shows what ingredients you need to prepare. Let's make some bread!",
      position: { x: 50, y: 10 }
    },
    {
      title: "Get Ingredients 📦",
      description: "Move Gordon to the glowing INGREDIENT CRATES on the left side. Press E when nearby to pick up raw ingredients!",
      highlightStation: "crate-1",
      position: { x: 20, y: 15 }
    },
    {
      title: "Chop on Cutting Board 🔪",
      description: "Some ingredients need chopping! Move to the CUTTING BOARD station (it has a 🔪 icon) and press E to start chopping. Wait for the progress bar to fill!",
      highlightStation: "cutting-1",
      position: { x: 35, y: 15 }
    },
    {
      title: "Cook on Stations 🍳",
      description: "Ingredients that need cooking go on the SKILLET or CAULDRON. Look for the 🔥 icon in recipes to know which ingredients need cooking!",
      highlightStation: "skillet-1",
      position: { x: 70, y: 15 }
    },
    {
      title: "Plate Your Dish 🍽️",
      description: "Once an ingredient is fully prepared, take it to the PLATING COUNTER (🍽️ icon) and press E to serve it. Complete all ingredients in an order to earn points!",
      highlightStation: "plating-1",
      position: { x: 45, y: 55 }
    },
    {
      title: "You're Ready! 🎯",
      description: "Complete orders before time runs out! Reach the target score to beat each level. Now go show them what a REAL chef can do!",
      position: { x: 50, y: 10 }
    }
  ];
  
  // Leaderboard and profile hooks
  const { submitScore } = useLeaderboard();
  const { profile } = usePlayerProfile();
  
  // Show tutorial automatically when starting level 0 (tutorial level)
  useEffect(() => {
    if (gameState.isPlaying && gameState.level === 0 && !showGameOver) {
      setInTutorialMode(true);
      setTutorialStep(0);
    } else {
      setInTutorialMode(false);
    }
  }, [gameState.isPlaying, gameState.level, showGameOver]);
  
  // Cooking mechanics hook with interaction trigger
  const { playerHand, stations, handleStationClick: originalHandleStationClick } = useCookingMechanics({
    orders: gameState.orders,
    initialStations: gameState.stations,
    onOrderComplete: useCallback((orderId: string, points: number) => {
      setGameState((prev) => {
        const updatedOrders = prev.orders.map((order) =>
          order.id === orderId ? { ...order, isComplete: true } : order
        );

        const activeScoreBoost = prev.activeBoosts.find(b => b.type === 'score');
        const pointMultiplier = activeScoreBoost?.multiplier || 1;
        const finalPoints = points * pointMultiplier;

        toast.success("Order Complete!", {
          description: `+${finalPoints} points${pointMultiplier > 1 ? ` (${pointMultiplier}x boost!)` : ''}`,
        });

        // Add floating score popup
        setFloatingScores(scores => [...scores, {
          id: `score-${Date.now()}`,
          points: finalPoints,
          position: { x: 50, y: 50 }
        }]);

        return {
          ...prev,
          score: prev.score + finalPoints,
          orders: updatedOrders,
        };
      });
    }, []),
  });

  // Wrap handleStationClick to show interaction animation
  const handleStationClick = useCallback((stationId: string) => {
    setGordonIsInteracting(true);
    setTimeout(() => setGordonIsInteracting(false), 500);
    originalHandleStationClick(stationId);
  }, [originalHandleStationClick]);
  
  // Gordon movement hook
  const { gordonPosition, nearbyStation, handlePositionChange } = useGordonMovement(
    stations,
    handleStationClick,
    deviceType
  );
  
  // Update stations in game state
  useEffect(() => {
    setGameState(prev => ({ ...prev, stations }));
  }, [stations]);

  // No scaling needed - let Kitchen component handle zoom/pan
  useEffect(() => {
    setGameScale(1);
  }, []);

  // Start a new game
  const startGame = useCallback((level: number) => {
    const levelConfig = LEVELS[level];
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
      stations: initializeStations(),
      activeBoosts: [],
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
          
          // Check win/lose and set Gordon's animation
          const won = prev.score >= prev.targetScore;
          if (won) {
            setGordonIsCelebrating(true);
            setShowConfetti(true);
            setTimeout(() => setGordonIsCelebrating(false), 3000);
          } else {
            setGordonIsSad(true);
            setTimeout(() => setGordonIsSad(false), 3000);
          }
          
          // Submit score to leaderboard and award chef coins only if improved
          const runDuration = Math.floor((Date.now() - levelStartTime) / 1000);
          submitScore(prev.level, prev.score, runDuration).then(async (improved) => {
            if (improved && won && profile?.wallet_address) {
              // Award chef coins based on level (only if score improved)
              const chefCoinsReward = prev.level * 10;
              
              try {
                const { error } = await supabase.rpc('add_chef_coins', {
                  p_wallet_address: profile.wallet_address,
                  p_amount: chefCoinsReward,
                  p_description: `Level ${prev.level} completion reward`
                });
                
                if (error) {
                  console.error('Failed to award chef coins:', error);
                  toast.error('Failed to award Chef Coins', {
                    description: 'Please contact support if this persists.',
                  });
                } else {
                  toast.success(`Earned ${chefCoinsReward} Chef Coins!`, {
                    description: 'New personal best on this level!',
                  });
                }
              } catch (err) {
                console.error('Error awarding chef coins:', err);
              }
            }
          });
          
          return { ...prev, timeRemaining: 0, isPlaying: false };
        }

        // Update order timers and generate new orders
        const levelConfig = LEVELS[prev.level];
        let updatedOrders = prev.orders.map((order) => {
          if (order.isComplete) return order;
          
          const newOrderTime = Math.max(0, order.timeRemaining - 1);
          
          // Order expired
          if (newOrderTime === 0) {
            shake();
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
    setGameState((prev) => ({ ...prev, isPlaying: false, isPaused: false, level: 0 }));
    setShowGameOver(false);
    setInTutorialMode(false);
    setTutorialStep(0);
  };

  const handlePause = () => {
    setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const handleTutorialNext = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(prev => prev + 1);
    } else {
      setInTutorialMode(false);
      // Let them continue playing level 0 to practice
    }
  };

  const handleTutorialSkip = () => {
    setInTutorialMode(false);
    setTutorialStep(0);
  };

  const handleUseItem = (item: InventoryItem) => {
    const now = Date.now();
    
    // Handle time extensions instantly
    if (item.item_id.startsWith('time_')) {
      const seconds = parseInt(item.item_id.split('_')[1].replace('s', ''));
      setGameState(prev => ({
        ...prev,
        timeRemaining: prev.timeRemaining + seconds
      }));
      toast.success(`Added ${seconds} seconds to timer!`);
      return;
    }
    
    // Handle other boosts
    let boostType: 'speed' | 'score' = 'speed';
    let multiplier = 1;
    let duration = 60;
    
    if (item.item_id.includes('speed')) {
      boostType = 'speed';
      if (item.item_id.includes('10')) multiplier = 1.1;
      else if (item.item_id.includes('20')) multiplier = 1.2;
      else if (item.item_id.includes('50')) multiplier = 1.5;
      duration = 60;
    } else if (item.item_id.includes('score') || item.item_id.includes('plate')) {
      boostType = 'score';
      if (item.item_id.includes('2x')) multiplier = 2;
      else if (item.item_id.includes('3x')) multiplier = 3;
      else if (item.item_id.includes('plate')) multiplier = 2;
      duration = item.item_id.includes('30s') ? 30 : item.item_id.includes('60s') ? 60 : 45;
    }
    
    setGameState(prev => ({
      ...prev,
      activeBoosts: [...prev.activeBoosts, {
        itemId: item.item_id,
        itemName: item.item_name,
        type: boostType,
        multiplier,
        endTime: now + (duration * 1000)
      }]
    }));
    
    toast.success(`${item.item_name} activated!`, {
      description: `${multiplier}x ${boostType} for ${duration}s`
    });
  };

  if (!gameState.isPlaying) {
    return (
      <ProtectedRoute>
        <MainMenu onStartGame={startGame} />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      {/* Orientation Banner for Mobile Portrait */}
      {isMobile && isPortrait && gameState.isPlaying && (
        <OrientationPrompt onToggleLayout={toggleLayoutMode} />
      )}

      <div className={cn("min-h-screen bg-background", isShaking && "animate-shake")}>
        <GameHeader
          timeLeft={gameState.timeRemaining}
          score={gameState.score}
          targetScore={gameState.targetScore}
          level={gameState.level}
          onShowHelp={() => setShowTutorial(true)}
          onPause={handlePause}
          onMenu={handleMenu}
          isPaused={gameState.isPaused}
          isPortrait={isPortrait}
          layoutMode={layoutMode}
          onToggleLayout={toggleLayoutMode}
        />
        
        <div className="game-container h-[calc(100vh-200px)]">
          <Kitchen
            stations={gameState.stations}
            onStationClick={handleStationClick}
            gordonPosition={gordonPosition}
            onGordonMove={handlePositionChange}
            nearbyStation={inTutorialMode ? tutorialSteps[tutorialStep]?.highlightStation || nearbyStation : nearbyStation}
            isInteracting={gordonIsInteracting}
            isCelebrating={gordonIsCelebrating}
            isSad={gordonIsSad}
            isPortrait={isPortrait}
            deviceType={deviceType}
          />
          
          <CompactCookingQueue orders={gameState.orders} isPortrait={isPortrait} />
          
          <PlayerHand ingredient={playerHand} gordonPosition={gordonPosition} />
        </div>
        
        {gameState.isPlaying && (
          <InventoryButton
            walletAddress={profile?.wallet_address}
            onUseItem={handleUseItem}
          />
        )}
        
        <TutorialModal 
          open={showTutorial}
          onClose={() => setShowTutorial(false)}
        />
        
        {inTutorialMode && (
          <TutorialGuide
            currentStep={tutorialStep}
            onNextStep={handleTutorialNext}
            onSkip={handleTutorialSkip}
            steps={tutorialSteps}
          />
        )}
        
        {showFirstTimeTutorial && (
          <FirstTimeTutorial
            onClose={() => {
              localStorage.setItem('tutorial_completed', 'true');
              setShowFirstTimeTutorial(false);
            }}
          />
        )}
        
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

        {/* Visual Effects */}
        {floatingScores.map(score => (
          <FloatingScore
            key={score.id}
            points={score.points}
            position={score.position}
            onComplete={() => setFloatingScores(scores => 
              scores.filter(s => s.id !== score.id)
            )}
          />
        ))}

        <Confetti 
          active={showConfetti} 
          onComplete={() => setShowConfetti(false)} 
        />

        <GlobalProgressBar stations={stations} />

        {/* Pause Overlay */}
        {gameState.isPaused && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center">
            <div className="game-panel bg-craft-brown max-w-md">
              <h2 className="text-4xl font-bold text-accent mb-4 text-center">PAUSED</h2>
              <p className="text-foreground text-center mb-6">
                Press the play button or click anywhere to resume
              </p>
              <Button
                onClick={handlePause}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                <Play className="w-5 h-5 mr-2" />
                Resume Game
              </Button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Index;

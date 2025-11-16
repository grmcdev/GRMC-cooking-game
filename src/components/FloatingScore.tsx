import { useEffect, useState } from "react";

interface FloatingScoreProps {
  points: number;
  position: { x: number; y: number };
  onComplete: () => void;
}

export const FloatingScore = ({ points, position, onComplete }: FloatingScoreProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed pointer-events-none z-[100]"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        animation: 'floatUp 2s ease-out forwards',
      }}
    >
      <div className="text-6xl font-bold text-accent" style={{
        textShadow: '0 0 20px hsl(var(--accent) / 0.8), 0 0 40px hsl(var(--accent) / 0.5)',
      }}>
        +{points}
      </div>
    </div>
  );
};

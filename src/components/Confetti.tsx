import { useEffect, useState } from "react";

interface ConfettiProps {
  active: boolean;
  onComplete: () => void;
}

export const Confetti = ({ active, onComplete }: ConfettiProps) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    rotation: number;
    color: string;
  }>>([]);

  useEffect(() => {
    if (!active) return;

    // Generate 50 confetti particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      rotation: Math.random() * 360,
      color: ['hsl(45 100% 51%)', 'hsl(16 90% 55%)', 'hsl(140 65% 42%)', 'hsl(180 100% 50%)', 'hsl(0 72% 51%)'][Math.floor(Math.random() * 5)],
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[200]">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-4 h-4"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            animation: `confettiFall 3s ease-out forwards`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
};

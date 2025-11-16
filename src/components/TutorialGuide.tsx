import { Button } from "./ui/button";

interface TutorialStep {
  title: string;
  description: string;
  position: { x: number; y: number };
  highlightStation?: string;
}

interface TutorialGuideProps {
  currentStep: number;
  onNextStep: () => void;
  onSkip: () => void;
  steps: TutorialStep[];
}

export const TutorialGuide = ({ currentStep, onNextStep, onSkip, steps }: TutorialGuideProps) => {
  const step = steps[currentStep];
  
  if (!step) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[90] pointer-events-none">
      {/* Tutorial Panel */}
      <div 
        className="absolute pointer-events-auto"
        style={{
          left: `${step.position.x}%`,
          top: `${step.position.y}%`,
          transform: 'translate(-50%, 0)',
        }}
      >
        <div className="bg-[hsl(var(--craft-brown))] border-6 border-[hsl(var(--accent))] rounded-xl p-6 max-w-md shadow-2xl">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-black text-[hsl(var(--accent))]">{step.title}</h3>
            <div className="text-sm text-muted-foreground font-bold">
              {currentStep + 1}/{steps.length}
            </div>
          </div>
          
          <p className="text-foreground text-sm mb-4 leading-relaxed">
            {step.description}
          </p>
          
          <div className="flex gap-2">
            <Button
              onClick={onNextStep}
              className="flex-1 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-primary-foreground font-bold"
            >
              {currentStep < steps.length - 1 ? 'Next' : 'Finish'}
            </Button>
            <Button
              onClick={onSkip}
              variant="outline"
              className="font-bold"
            >
              Skip
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

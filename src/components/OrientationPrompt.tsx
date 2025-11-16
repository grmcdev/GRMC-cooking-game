import { useState } from 'react';
import { X, Smartphone } from 'lucide-react';
import { Button } from './ui/button';

interface OrientationPromptProps {
  onToggleLayout: () => void;
}

export const OrientationPrompt = ({ onToggleLayout }: OrientationPromptProps) => {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('orientation_banner_dismissed') === 'true';
  });

  const handleDismiss = () => {
    localStorage.setItem('orientation_banner_dismissed', 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-[100] md:left-8 md:right-8">
      <div className="bg-accent/95 backdrop-blur-sm rounded-lg border-2 border-accent-foreground shadow-2xl p-3 flex items-center gap-3">
        <Smartphone className="w-8 h-8 text-accent-foreground flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          <p className="text-accent-foreground text-xs leading-tight">
            <strong>Portrait mode detected!</strong> You can use the layout toggle in the header to switch between portrait and landscape layouts.
          </p>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <Button
            size="sm"
            onClick={onToggleLayout}
            className="bg-accent-foreground text-accent hover:bg-accent-foreground/90 text-xs h-8 px-3"
          >
            Toggle
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-accent-foreground hover:text-accent-foreground/80 h-8 w-8"
            onClick={handleDismiss}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

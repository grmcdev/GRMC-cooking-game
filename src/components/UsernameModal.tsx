import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface UsernameModalProps {
  open: boolean;
  onSubmit: (username: string) => Promise<boolean>;
}

export const UsernameModal = ({ open, onSubmit }: UsernameModalProps) => {
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username.length < 3 || username.length > 8) {
      return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      return;
    }

    setSubmitting(true);
    const success = await onSubmit(username);
    setSubmitting(false);
    
    if (success) {
      setUsername('');
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="game-panel bg-craft-brown border-4 border-stone-light">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-accent text-center">
            Choose Your Username
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3 text-center">
              Your username will appear on the leaderboard
            </p>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="Enter username"
              maxLength={8}
              className="text-center text-lg font-bold"
              disabled={submitting}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>3-8 characters</span>
              <span>{username.length}/8</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Letters and numbers only
            </p>
          </div>

          <Button
            type="submit"
            variant="default"
            size="lg"
            className="w-full"
            disabled={
              username.length < 3 ||
              username.length > 8 ||
              !/^[a-zA-Z0-9]+$/.test(username) ||
              submitting
            }
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Profile...
              </>
            ) : (
              'Create Profile'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
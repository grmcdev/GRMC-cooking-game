import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LeaderboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LeaderboardEntry {
  id: string;
  wallet_address: string;
  username: string | null;
  level_id: number;
  score: number;
  run_duration: number;
  created_at: string;
}

export const LeaderboardModal = ({ open, onOpenChange }: LeaderboardModalProps) => {
  const [leaderboards, setLeaderboards] = useState<Record<number, LeaderboardEntry[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;

    const fetchLeaderboards = async () => {
      setLoading(true);
      try {
        // Fetch top 10 scores for each level
        const { data, error } = await supabase
          .from('leaderboards')
          .select('*')
          .order('score', { ascending: false });

        if (error) throw error;

        // Group by level
        const grouped: Record<number, LeaderboardEntry[]> = {};
        data?.forEach((entry) => {
          if (!grouped[entry.level_id]) {
            grouped[entry.level_id] = [];
          }
          if (grouped[entry.level_id].length < 10) {
            grouped[entry.level_id].push(entry as LeaderboardEntry);
          }
        });

        setLeaderboards(grouped);
      } catch (error) {
        console.error('Error fetching leaderboards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboards();
  }, [open]);

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-accent" />;
      case 1:
        return <Medal className="w-6 h-6 text-secondary" />;
      case 2:
        return <Award className="w-6 h-6 text-primary" />;
      default:
        return <span className="w-6 text-center font-bold text-muted-foreground">{index + 1}</span>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl game-panel bg-craft-brown/95 backdrop-blur-sm border-4 border-stone-light">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-accent flex items-center gap-2">
            <Trophy className="w-8 h-8" />
            LEADERBOARDS
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="1" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-wood/50 h-auto gap-1 p-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
              <TabsTrigger 
                key={level}
                value={level.toString()} 
                className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-xs py-2"
              >
                LVL {level}
              </TabsTrigger>
            ))}
          </TabsList>

          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
            <TabsContent key={level} value={level.toString()} className="mt-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading leaderboard...
                </div>
              ) : leaderboards[level]?.length > 0 ? (
                <div className="space-y-2">
                  {leaderboards[level].map((entry, index) => (
                    <div
                      key={entry.id}
                      className="game-panel bg-wood/80 backdrop-blur-sm flex items-center justify-between p-3 hover:bg-wood transition-all"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-8 flex justify-center">
                          {getRankIcon(index)}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-foreground">
                            {entry.username || formatWalletAddress(entry.wallet_address)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatWalletAddress(entry.wallet_address)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-accent">
                            {entry.score} pts
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Time: {formatDuration(entry.run_duration)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-lg mb-2">No scores yet for this level!</p>
                  <p className="text-sm">Be the first to complete it.</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-end mt-4">
          <Button variant="game" onClick={() => onOpenChange(false)}>
            CLOSE
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, ArrowLeft } from 'lucide-react';

export const WalletLinkPrompt = () => {
  const { user, walletLinked, linkWallet } = useAuth();
  const { connected, publicKey } = useWallet();
  const [show, setShow] = useState(false);
  const [linking, setLinking] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Show prompt if user is authenticated, wallet is connected, but not linked
    setShow(!!user && connected && !walletLinked);
  }, [user, connected, walletLinked]);

  const handleLink = async () => {
    setLinking(true);
    setFailed(false);
    const success = await linkWallet();
    setLinking(false);
    if (success) {
      setShow(false);
    } else {
      setFailed(true);
    }
  };

  const handleClose = () => {
    setShow(false);
    setFailed(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Link Your Wallet
            </CardTitle>
            {failed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
          </div>
          <CardDescription>
            Connect your wallet to your account to save your progress and compete on the leaderboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-semibold mb-1">Connected Wallet:</p>
            <p className="font-mono text-xs break-all">{publicKey?.toBase58()}</p>
          </div>

          <Button 
            onClick={handleLink} 
            className="w-full" 
            disabled={linking}
          >
            {linking ? 'Linking...' : 'Link Wallet to Account'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            This will securely associate your wallet with your account
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

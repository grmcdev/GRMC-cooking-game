import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useGRMCBalance } from '@/hooks/useGRMCBalance';
import { Coins, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const WalletButton = () => {
  const { connected } = useWallet();
  const { balance, loading, hasAccess, hasError, refetch } = useGRMCBalance();

  return (
    <div className="flex flex-col gap-2 w-full">
      {connected && (
        <div className="game-panel bg-wood/90 backdrop-blur-sm px-3 py-2 flex items-center gap-2 justify-center">
          <Coins className={`w-5 h-5 ${hasAccess ? 'text-accent' : 'text-destructive'}`} />
          <div className="text-sm">
            <div className="font-bold text-foreground flex items-center gap-1">
              {loading ? '...' : balance.toFixed(2)}
              {hasError && !loading && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <AlertCircle className="w-3 h-3 text-warning" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Balance check limited. Using cached value.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="text-[0.6rem] text-muted-foreground">GRMC</div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-1"
                  onClick={refetch}
                  disabled={loading}
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh balance</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      
      <WalletMultiButton className="!bg-accent hover:!bg-accent/90 !text-accent-foreground !font-bold !px-4 !py-2 !rounded !border-4 !border-stone-light !transition-all hover:!scale-105 !w-full" />
    </div>
  );
};

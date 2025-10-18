import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useGRMCBalance } from '@/hooks/useGRMCBalance';
import { Wallet, Coins } from 'lucide-react';

export const WalletButton = () => {
  const { connected } = useWallet();
  const { balance, loading, hasAccess } = useGRMCBalance();

  return (
    <div className="flex items-center gap-4">
      {connected && (
        <div className="game-panel bg-wood/90 backdrop-blur-sm px-4 py-2 flex items-center gap-2">
          <Coins className={`w-5 h-5 ${hasAccess ? 'text-accent' : 'text-destructive'}`} />
          <div className="text-sm">
            <div className="font-bold text-foreground">
              {loading ? '...' : balance.toFixed(2)}
            </div>
            <div className="text-[0.6rem] text-muted-foreground">GRMC</div>
          </div>
        </div>
      )}
      
      <WalletMultiButton className="!bg-accent hover:!bg-accent/90 !text-accent-foreground !font-bold !px-4 !py-2 !rounded !border-4 !border-stone-light !transition-all hover:!scale-105" />
    </div>
  );
};

import React, { createContext, useContext, useMemo } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextProviderProps {
  children: React.ReactNode;
}

export const WalletContextProvider = ({ children }: WalletContextProviderProps) => {
  // Use mainnet-beta for production, devnet for testing
  const network = WalletAdapterNetwork.Mainnet;
  
  // Use a more reliable RPC endpoint - public endpoints often have rate limits
  // You can replace this with your own RPC provider (Helius, QuickNode, Alchemy, etc.)
  const endpoint = useMemo(() => {
    // Try environment variable first, fallback to public RPC
    const customRpc = import.meta.env.VITE_SOLANA_RPC_URL;
    if (customRpc) return customRpc;
    
    // Use a more reliable public endpoint
    return 'https://solana-mainnet.g.alchemy.com/v2/demo';
  }, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

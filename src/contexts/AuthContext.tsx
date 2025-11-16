import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  linkWallet: () => Promise<boolean>;
  walletLinked: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletLinked, setWalletLinked] = useState(false);
  const { publicKey } = useWallet();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check if wallet is linked when auth state changes
        if (session?.user && publicKey) {
          setTimeout(() => {
            checkWalletLink(session.user.id);
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user && publicKey) {
        checkWalletLink(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [publicKey]);

  const checkWalletLink = async (userId: string) => {
    if (!publicKey) return;
    
    const { data } = await supabase
      .from('wallet_auth')
      .select('wallet_address')
      .eq('user_id', userId)
      .eq('wallet_address', publicKey.toBase58())
      .single();
    
    setWalletLinked(!!data);
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setWalletLinked(false);
  };

  const linkWallet = async (): Promise<boolean> => {
    if (!user || !publicKey) {
      toast.error('Please connect your wallet first');
      return false;
    }

    try {
      // Check if wallet is already linked to another account
      const { data: existing } = await supabase
        .from('wallet_auth')
        .select('user_id')
        .eq('wallet_address', publicKey.toBase58())
        .single();

      if (existing && existing.user_id === user.id) {
        // Wallet already linked to this user
        setWalletLinked(true);
        return true;
      }

      if (existing && existing.user_id !== user.id) {
        toast.error('This wallet is already linked to another account');
        return false;
      }

      if (!existing) {
        // Link the wallet
        const { error } = await supabase
          .from('wallet_auth')
          .insert({
            user_id: user.id,
            wallet_address: publicKey.toBase58(),
          });

        if (error) throw error;
      }

      setWalletLinked(true);
      toast.success('Wallet linked successfully!');
      return true;
    } catch (error) {
      console.error('Error linking wallet:', error);
      toast.error('Failed to link wallet');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        linkWallet,
        walletLinked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

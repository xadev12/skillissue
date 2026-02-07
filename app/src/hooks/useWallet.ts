import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useMemo, useCallback } from 'react';

export interface WalletState {
  connected: boolean;
  connecting: boolean;
  publicKey: string | null;
  address: string | null;
  user: ReturnType<typeof usePrivy>['user'];
  login: () => void;
  logout: () => Promise<void>;
  ready: boolean;
}

export function useWallet(): WalletState {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();

  // Get the first available Solana wallet (embedded or external)
  const activeWallet = useMemo(() => {
    if (!wallets || wallets.length === 0) return null;
    // Find a Solana wallet first
    // ConnectedWallet may have a 'type' property for Solana wallets
    const solanaWallet = wallets.find(w => (w as any).type === 'solana');
    return solanaWallet || wallets[0];
  }, [wallets]);

  const publicKey = useMemo(() => {
    return activeWallet?.address || null;
  }, [activeWallet]);

  const handleLogin = useCallback(() => {
    login();
  }, [login]);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  return {
    connected: authenticated && !!publicKey,
    connecting: !ready,
    publicKey,
    address: publicKey,
    user,
    login: handleLogin,
    logout: handleLogout,
    ready,
  };
}

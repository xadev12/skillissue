import { useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';

// USDC on devnet - using mock address for devnet
// Real USDC on devnet: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v (mainnet)
const USDC_MINT_DEVNET = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
const USDC_MINT_MAINNET = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

const RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com';
const IS_DEVNET = RPC_ENDPOINT.includes('devnet');
const USDC_MINT = IS_DEVNET ? USDC_MINT_DEVNET : USDC_MINT_MAINNET;

export function useUSDCBalance(walletAddress: string | null) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setBalance(null);
      return;
    }

    let cancelled = false;

    async function fetchBalance() {
      if (!walletAddress) return;

      setLoading(true);
      setError(null);

      try {
        const connection = new Connection(RPC_ENDPOINT);
        const walletPubkey = new PublicKey(walletAddress);

        // Get the associated token account for USDC
        const tokenAccountAddress = await getAssociatedTokenAddress(
          USDC_MINT,
          walletPubkey
        );

        try {
          const tokenAccountInfo = await connection.getTokenAccountBalance(tokenAccountAddress);

          if (!cancelled) {
            const uiAmount = tokenAccountInfo.value.uiAmount;
            setBalance(uiAmount ?? 0);
          }
        } catch (tokenError) {
          // Token account doesn't exist - user has 0 USDC
          if (!cancelled) {
            setBalance(0);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch balance');
          setBalance(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchBalance();

    // Refetch every 30 seconds
    const interval = setInterval(fetchBalance, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [walletAddress]);

  return { balance, loading, error };
}

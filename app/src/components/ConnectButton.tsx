import { memo } from 'react';
import { useWallet } from '../hooks/useWallet';

interface ConnectButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ConnectButton = memo(function ConnectButton({
  className = '',
  size = 'md'
}: ConnectButtonProps) {
  const { connected, connecting, login, logout, publicKey, ready } = useWallet();

  const sizeClasses = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-sm',
    lg: 'h-14 px-10 text-base',
  };

  const baseClasses = `rounded-xl font-medium transition-all ${sizeClasses[size]}`;
  const gradientClasses = 'bg-gradient-to-r from-[#6B4EE6] to-[#5B3FD6] hover:from-[#7B5EF6] hover:to-[#6B4EE6] text-white shadow-lg shadow-[#6B4EE6]/25';

  if (!ready || connecting) {
    return (
      <button
        disabled
        className={`${baseClasses} ${gradientClasses} opacity-50 cursor-not-allowed ${className}`}
      >
        Loading...
      </button>
    );
  }

  if (connected && publicKey) {
    return (
      <button
        onClick={logout}
        className={`${baseClasses} ${gradientClasses} ${className}`}
      >
        {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
      </button>
    );
  }

  return (
    <button
      onClick={login}
      className={`${baseClasses} ${gradientClasses} ${className}`}
    >
      Connect Wallet
    </button>
  );
});

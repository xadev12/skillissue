import { useState, memo } from 'react';
import Link from 'next/link';
import { useWallet } from '../hooks/useWallet';
import { useUSDCBalance } from '../hooks/useUSDCBalance';

export const Navigation = memo(function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { connected, publicKey, login, logout, ready } = useWallet();
  const { balance: usdcBalance, loading: balanceLoading } = useUSDCBalance(publicKey);

  const navLinks = [
    { href: '/jobs', label: 'Browse Jobs' },
    { href: '/jobs/new', label: 'Post Job' },
    { href: '/my-jobs', label: 'My Jobs' },
  ];

  const profileLink = connected && publicKey ? `/profile/${publicKey}` : null;

  const truncatedAddress = publicKey
    ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
    : null;

  const formatBalance = (bal: number | null) => {
    if (bal === null) return '--';
    if (bal >= 1000) return `$${(bal / 1000).toFixed(1)}k`;
    return `$${bal.toFixed(2)}`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0F0F1A]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6B4EE6] to-[#2DD4BF] flex items-center justify-center shadow-lg shadow-[#6B4EE6]/20 group-hover:shadow-[#6B4EE6]/40 transition-shadow">
              <span className="text-white font-bold text-lg">SI</span>
            </div>
            <span className="text-white font-semibold text-xl hidden sm:block">SkillIssue</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
            {profileLink && (
              <Link
                href={profileLink}
                className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors text-sm font-medium"
              >
                Profile
              </Link>
            )}
          </div>

          {/* Desktop Wallet */}
          <div className="hidden md:flex items-center gap-3">
            {connected && (
              <>
                {/* USDC Balance */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#2DD4BF]/10 rounded-lg border border-[#2DD4BF]/20">
                  <svg className="w-4 h-4 text-[#2DD4BF]" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2" />
                    <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="bold">$</text>
                  </svg>
                  <span className="text-[#2DD4BF] text-sm font-medium">
                    {balanceLoading ? '...' : formatBalance(usdcBalance)}
                  </span>
                  <span className="text-[#2DD4BF]/60 text-xs">USDC</span>
                </div>
                {/* Wallet Address */}
                {truncatedAddress && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                    <div className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse" />
                    <span className="text-white/60 text-sm font-mono">
                      {truncatedAddress}
                    </span>
                  </div>
                )}
              </>
            )}
            {!ready ? (
              <button
                disabled
                className="bg-gradient-to-r from-[#6B4EE6]/50 to-[#5B3FD6]/50 rounded-xl h-10 px-5 font-medium text-sm text-white/50"
              >
                Loading...
              </button>
            ) : connected ? (
              <button
                onClick={logout}
                className="bg-gradient-to-r from-[#6B4EE6] to-[#5B3FD6] hover:from-[#7B5EF6] hover:to-[#6B4EE6] rounded-xl h-10 px-5 font-medium text-sm text-white transition-all"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={login}
                className="bg-gradient-to-r from-[#6B4EE6] to-[#5B3FD6] hover:from-[#7B5EF6] hover:to-[#6B4EE6] rounded-xl h-10 px-5 font-medium text-sm text-white transition-all"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white/70 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#0F0F1A]/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {profileLink && (
              <Link
                href={profileLink}
                className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
            )}
            <div className="pt-4 border-t border-white/[0.06]">
              {connected && (
                <div className="flex items-center justify-between gap-3 px-4 py-2 mb-3">
                  {/* USDC Balance */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#2DD4BF]/10 rounded-lg border border-[#2DD4BF]/20">
                    <span className="text-[#2DD4BF] text-sm font-medium">
                      {balanceLoading ? '...' : formatBalance(usdcBalance)}
                    </span>
                    <span className="text-[#2DD4BF]/60 text-xs">USDC</span>
                  </div>
                  {/* Wallet Address */}
                  {truncatedAddress && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse" />
                      <span className="text-white/60 text-sm font-mono">
                        {truncatedAddress}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {!ready ? (
                <button
                  disabled
                  className="w-full bg-gradient-to-r from-[#6B4EE6]/50 to-[#5B3FD6]/50 rounded-xl h-12 font-medium text-sm text-white/50 justify-center"
                >
                  Loading...
                </button>
              ) : connected ? (
                <button
                  onClick={logout}
                  className="w-full bg-gradient-to-r from-[#6B4EE6] to-[#5B3FD6] hover:from-[#7B5EF6] hover:to-[#6B4EE6] rounded-xl h-12 font-medium text-sm text-white transition-all"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={login}
                  className="w-full bg-gradient-to-r from-[#6B4EE6] to-[#5B3FD6] hover:from-[#7B5EF6] hover:to-[#6B4EE6] rounded-xl h-12 font-medium text-sm text-white transition-all"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
});

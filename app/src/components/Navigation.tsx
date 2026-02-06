import { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { connected, publicKey } = useWallet();

  const navLinks = [
    { href: '/jobs', label: 'Browse Jobs' },
    { href: '/jobs/new', label: 'Post Job' },
    { href: '/my-jobs', label: 'My Jobs' },
  ];

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
          </div>

          {/* Desktop Wallet */}
          <div className="hidden md:flex items-center gap-4">
            {connected && publicKey && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                <div className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse" />
                <span className="text-white/60 text-sm font-mono">
                  {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
                </span>
              </div>
            )}
            <WalletMultiButton className="!bg-gradient-to-r !from-[#6B4EE6] !to-[#5B3FD6] hover:!from-[#7B5EF6] hover:!to-[#6B4EE6] !rounded-xl !h-10 !px-5 !font-medium !text-sm !transition-all" />
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
            <div className="pt-4 border-t border-white/[0.06]">
              {connected && publicKey && (
                <div className="flex items-center gap-2 px-4 py-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse" />
                  <span className="text-white/60 text-sm font-mono">
                    {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
                  </span>
                </div>
              )}
              <WalletMultiButton className="!w-full !bg-gradient-to-r !from-[#6B4EE6] !to-[#5B3FD6] hover:!from-[#7B5EF6] hover:!to-[#6B4EE6] !rounded-xl !h-12 !font-medium !text-sm !transition-all !justify-center" />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

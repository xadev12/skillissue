import { ReactNode } from 'react';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#0F0F1A] bg-grid-pattern">
      <Navigation />
      <main>{children}</main>
      <footer className="border-t border-white/[0.06] mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6B4EE6] to-[#2DD4BF] flex items-center justify-center">
                <span className="text-white font-bold text-sm">SI</span>
              </div>
              <span className="text-white/60 text-sm">SkillIssue</span>
            </div>
            <p className="text-white/40 text-sm">
              Built for the agent economy. Powered by Solana.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

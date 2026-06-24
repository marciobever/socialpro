"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { BrainCircuit, ArrowLeft } from 'lucide-react';

interface PublicHeaderProps {
  showBack?: boolean;
  backLabel?: string;
  backHref?: string;
}

export function PublicHeader({ showBack, backLabel = 'Voltar', backHref = '/' }: PublicHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 w-full px-6 py-3.5 z-50">
      <div className="mx-auto max-w-7xl">
        <div className="glass-panel rounded-2xl px-6 py-3.5 flex items-center justify-between shadow-2xl border border-white/5">

          {/* Logo — matches the landing header for consistency */}
          <button onClick={() => router.push('/')} className="flex items-center gap-2.5 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-accent-purple to-accent-cyan p-[1.5px] transition-transform duration-300 group-hover:scale-105">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-dark-bg">
                <BrainCircuit className="h-[18px] w-[18px] brain-neon" />
              </div>
              <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-tr from-accent-purple to-accent-cyan opacity-40 blur-md group-hover:opacity-70 transition-opacity" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-white">
              Social<span className="bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">Pro</span>
            </span>
          </button>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Início',  href: '/'       },
              { label: 'Preços',  href: '/pricing' },
              { label: 'Entrar',  href: '/login'   },
            ].map(({ label, href }) => (
              <button key={href} onClick={() => router.push(href)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-dark-muted hover:text-white hover:bg-white/5 transition-all">
                {label}
              </button>
            ))}
          </nav>

          {/* Right: back or CTA */}
          {showBack ? (
            <button onClick={() => router.push(backHref)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all">
              <ArrowLeft className="h-3.5 w-3.5" />
              {backLabel}
            </button>
          ) : (
            <button onClick={() => router.push('/login')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan hover:shadow-[0_0_16px_rgba(139,92,246,0.4)] transition-all">
              Começar grátis
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

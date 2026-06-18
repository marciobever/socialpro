import React from 'react';
import { Sparkles, BrainCircuit, Calendar, Layers, BarChart2 } from 'lucide-react';

interface NavbarProps {
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onReset }) => {
  return (
    <header className="sticky top-0 z-50 w-full px-6 py-4">
      <div className="mx-auto max-w-7xl">
        <nav className="glass-panel rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl">
          {/* Logo */}
          <div 
            onClick={onReset}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-accent-purple to-accent-cyan p-[1px] transition-transform duration-300 group-hover:scale-105">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-dark-bg">
                <BrainCircuit className="h-5 w-5 brain-neon" />
              </div>
              {/* Outer Glow */}
              <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-tr from-accent-purple to-accent-cyan opacity-40 blur-md group-hover:opacity-75 transition-opacity"></div>
            </div>
            
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-tight text-white">
                Social<span className="bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">Pro</span>
              </span>
              <span className="text-[9px] text-dark-muted font-medium tracking-widest uppercase">AI Engine v2.0</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-sm text-dark-muted font-medium">
            <a href="#bento-grid" className="flex items-center gap-1.5 hover:text-white transition-colors py-1 px-3 rounded-lg hover:bg-white/5">
              <Layers className="h-4 w-4 text-accent-purple" />
              Estúdio
            </a>
            <a href="#bento-grid" className="flex items-center gap-1.5 hover:text-white transition-colors py-1 px-3 rounded-lg hover:bg-white/5">
              <Calendar className="h-4 w-4 text-accent-cyan" />
              Calendário
            </a>
            <a href="#bento-grid" className="flex items-center gap-1.5 hover:text-white transition-colors py-1 px-3 rounded-lg hover:bg-white/5">
              <BarChart2 className="h-4 w-4 text-accent-pink" />
              Analytics
            </a>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold py-1.5 px-3 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-purple opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-purple"></span>
              </span>
              IA ATIVA
            </div>

            <button 
              onClick={onReset}
              className="relative group overflow-hidden rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black transition-all hover:bg-transparent hover:text-white border border-white/10"
            >
              {/* Button inner glow on hover */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-accent-purple to-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 group-hover:animate-pulse" />
                Novo Projeto
              </span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

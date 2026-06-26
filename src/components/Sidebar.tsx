"use client";
import React from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { Layers, Calendar, BarChart2, Sparkles, LogOut, CreditCard } from 'lucide-react';
import { BrainCircuit } from 'lucide-react';

interface SidebarProps {
  brandName: string;
  brandHandle: string;
  avatarUrl: string;
  planName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  brandName,
  brandHandle,
  avatarUrl,
  planName,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const tNav = useTranslations('nav');

  const handleLogout = () => {
    // Navigate back to public landing page
    router.push('/');
  };

  const navItems = [
    { href: '/app/dashboard', label: tNav('studio'), icon: Layers },
    { href: '/app/calendar', label: tNav('calendar'), icon: Calendar },
    { href: '/app/analytics', label: tNav('analytics'), icon: BarChart2 },
    { href: '/app/brand', label: tNav('brandKit'), icon: Sparkles },
  ];

  return (
    <aside className="w-64 flex-shrink-0 h-[calc(100vh-2rem)] sticky top-4 glass-panel rounded-3xl p-6 flex flex-col justify-between shadow-2xl border border-white/5">
      <div className="space-y-8">
        {/* Brand/Logo Header */}
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => router.push('/')}>
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-accent-purple to-accent-cyan p-[1px] transition-transform duration-300 group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-dark-bg">
              <BrainCircuit className="h-4.5 w-4.5 text-accent-cyan group-hover:text-accent-purple transition-colors" />
            </div>
            <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-tr from-accent-purple to-accent-cyan opacity-40 blur-md group-hover:opacity-75 transition-opacity"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold tracking-tight text-white">
              Social<span className="bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">Pro</span>
            </span>
            <span className="text-[8px] text-dark-muted font-medium tracking-widest uppercase">Workspace</span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-dark-muted uppercase tracking-wider block px-3 mb-3">Menu Principal</span>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-accent-purple/15 to-accent-cyan/15 border-accent-purple/30 text-white shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                      : 'bg-transparent border-transparent text-dark-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Plan Details Badge */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <CreditCard className="h-4 w-4 text-accent-cyan" />
            <span>Assinatura Ativa</span>
          </div>
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-accent-purple/10 border border-accent-purple/20 text-accent-purple tracking-wider">
              {planName}
            </span>
          </div>
          <p className="text-[10px] text-dark-muted leading-relaxed">
            Seu ciclo de faturamento renova em 28/06/2026.
          </p>
        </div>
      </div>

      {/* User Section / Logout */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-1.5">
          <img 
            src={avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100"} 
            alt="Avatar"
            className="h-9 w-9 rounded-full object-cover border border-white/10"
          />
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-white truncate">{brandName}</h4>
            <span className="text-[10px] text-dark-muted truncate block">{brandHandle}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold border border-transparent text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair da Conta</span>
        </button>
      </div>
    </aside>
  );
};

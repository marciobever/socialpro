"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Layers, Calendar, BarChart2, Palette, Clock, LogOut, Menu, X, BrainCircuit, UserCircle, User } from 'lucide-react';

interface TopNavProps {
  brandName: string;
  brandHandle: string;
  avatarUrl: string;
  planName: string;
}

export const TopNav: React.FC<TopNavProps> = ({ brandName, brandHandle, avatarUrl, planName }) => {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('nav');
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Force dark mode — light mode not yet fully implemented
  React.useEffect(() => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.removeItem('sp-theme');
  }, []);

  // pathname from next/navigation includes the locale prefix (/en/app/dashboard)
  // so we check with endsWith for locale-agnostic active state
  const navItems = [
    { href: '/app/dashboard', label: t('studio'),   icon: Layers },
    { href: '/app/history',   label: t('history'),  icon: Clock },
    { href: '/app/calendar',  label: t('calendar'), icon: Calendar },
    { href: '/app/analytics', label: t('analytics'),icon: BarChart2 },
    { href: '/app/brand',     label: t('brandKit'), icon: Palette },
    { href: '/app/account',   label: 'Conta',       icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel-heavy border-b border-dark-border">
      <div className="flex items-center justify-between px-4 md:px-6 h-16 max-w-screen-xl mx-auto">

        {/* Logo */}
        <button onClick={() => router.push('/')} className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-accent-purple to-accent-cyan p-[1px]">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-dark-bg">
              <BrainCircuit className="h-4.5 w-4.5 brain-neon" />
            </div>
            <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-tr from-accent-purple to-accent-cyan opacity-30 blur-md" />
          </div>
          <span className="font-display text-sm font-bold text-dark-text hidden sm:block">
            Social<span className="bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">Pro</span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.endsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-accent-purple/15 border border-accent-purple/25 text-dark-text'
                    : 'text-dark-muted hover:text-dark-text hover:bg-dark-border border border-transparent'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />{item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Plan badge */}
          <span className="hidden lg:inline-flex text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple tracking-wider">
            {planName}
          </span>

          {/* Avatar — click to go to account page */}
          <button
            onClick={() => router.push('/app/account')}
            className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-dark-border/60 transition-all group"
            title="Minha conta"
          >
            <div className="text-right leading-none">
              <p className="text-[10px] font-bold text-dark-text group-hover:text-accent-cyan transition-colors">
                {brandName || 'Meu perfil'}
              </p>
              <p className="text-[9px] text-dark-muted">{brandHandle}</p>
            </div>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Avatar" className="h-7 w-7 rounded-full border border-accent-purple/30 object-cover" />
            ) : (
              <div className="h-7 w-7 rounded-full border border-accent-purple/30 bg-accent-purple/10 flex items-center justify-center">
                <UserCircle className="h-4 w-4 text-accent-purple" />
              </div>
            )}
          </button>

          {/* Logout */}
          <button onClick={() => router.push('/')} title={t('signOut')}
            className="p-1.5 rounded-lg text-dark-muted hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>

          {/* Hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 rounded-lg text-dark-muted hover:text-dark-text hover:bg-dark-border transition-all"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-dark-border px-4 py-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.endsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-accent-purple/15 border border-accent-purple/25 text-dark-text'
                    : 'text-dark-muted hover:text-dark-text border border-transparent'
                }`}
              >
                <Icon className="h-4 w-4" />{item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};

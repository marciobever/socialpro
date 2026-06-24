"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Calendar, BarChart2, Clock, LogOut, Menu, X, BrainCircuit, UserCircle, User } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;
const spring = { type: 'spring' as const, stiffness: 400, damping: 30 };

interface TopNavProps {
  brandName: string;
  brandHandle: string;
  avatarUrl: string;
  planName: string;
}

export const TopNav: React.FC<TopNavProps> = ({ brandName, brandHandle, avatarUrl, planName }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.removeItem('sp-theme');
  }, []);

  const navItems = [
    { href: '/app/dashboard', label: 'Estúdio',    icon: Layers },
    { href: '/app/history',   label: 'Histórico',  icon: Clock },
    { href: '/app/calendar',  label: 'Calendário', icon: Calendar },
    { href: '/app/analytics', label: 'Analytics',  icon: BarChart2 },
    { href: '/app/account',   label: 'Perfil',     icon: User,
      isActive: (p: string) => p.includes('/app/account') || p.includes('/app/brand') },
  ];

  const isActive = (item: typeof navItems[0]) =>
    item.isActive ? item.isActive(pathname) : pathname.endsWith(item.href);

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-white/[0.06] backdrop-blur-xl"
      style={{ background: 'rgba(7,8,12,0.88)' }}
    >
      <div className="flex items-center justify-between px-5 md:px-8 h-[60px] max-w-screen-xl mx-auto">

        {/* ── Logo ── */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2.5 group flex-shrink-0"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-accent-purple to-accent-cyan p-[1.5px]">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-dark-bg">
              <BrainCircuit className="h-[18px] w-[18px] brain-neon" />
            </div>
            <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-tr from-accent-purple to-accent-cyan opacity-25 blur-md" />
          </div>
          <span className="font-display text-base font-bold tracking-tight text-white hidden sm:block">
            Social<span className="bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">Pro</span>
          </span>
        </button>

        {/* ── Desktop nav — segmented container with animated active pill ── */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl border border-white/[0.05] bg-white/[0.02]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-colors duration-200 ${
                  active ? 'text-white' : 'text-white/45 hover:text-white/80'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    transition={spring}
                    className="absolute inset-0 rounded-xl bg-accent-purple/15 border border-accent-purple/25 shadow-[0_0_16px_rgba(139,92,246,0.12)]"
                  />
                )}
                <Icon className={`relative z-10 h-3.5 w-3.5 flex-shrink-0 transition-colors ${active ? 'text-accent-purple' : ''}`} />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── Right section ── */}
        <div className="flex items-center gap-2.5">
          {/* Plan badge */}
          {planName && (
            <span className="hidden lg:inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-2.5 py-1.5 rounded-full bg-accent-purple/[0.08] border border-accent-purple/20 text-accent-purple tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-purple shadow-[0_0_6px_rgba(139,92,246,0.6)]" />
              {planName}
            </span>
          )}

          {/* Divider */}
          <span className="hidden lg:block h-6 w-px bg-white/[0.07]" />

          {/* Profile button */}
          <motion.button
            onClick={() => router.push('/app/account')}
            className="hidden sm:flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full border border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.04] transition-all group"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={spring}
            title="Minha conta"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Avatar" className="h-8 w-8 rounded-full border border-accent-purple/30 object-cover flex-shrink-0" />
            ) : (
              <div className="h-8 w-8 rounded-full border border-accent-purple/30 bg-accent-purple/10 flex items-center justify-center flex-shrink-0">
                <UserCircle className="h-[18px] w-[18px] text-accent-purple" />
              </div>
            )}
            <div className="text-left leading-tight hidden lg:block">
              <p className="text-[12.5px] font-semibold text-white group-hover:text-accent-cyan transition-colors truncate max-w-[120px]">
                {brandName || 'Meu perfil'}
              </p>
              {brandHandle && (
                <p className="text-[10.5px] text-white/40 truncate max-w-[120px]">{brandHandle}</p>
              )}
            </div>
          </motion.button>

          {/* Logout */}
          <button
            onClick={() => router.push('/')}
            title="Sair"
            className="p-2 rounded-xl text-white/30 hover:text-rose-400 hover:bg-rose-500/8 transition-all border border-transparent"
          >
            <LogOut className="h-4 w-4" />
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            {mobileOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease }}
            className="md:hidden border-t border-white/[0.06] px-5 py-3 space-y-1 overflow-hidden"
            style={{ background: 'rgba(7,8,12,0.96)' }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-accent-purple/15 border border-accent-purple/25 text-white'
                      : 'text-white/40 hover:text-white border border-transparent hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-accent-purple' : ''}`} />{item.label}
                </Link>
              );
            })}
            {/* Mobile profile + logout */}
            <div className="pt-2 mt-2 border-t border-white/[0.06] flex items-center justify-between">
              <button onClick={() => { setMobileOpen(false); router.push('/app/account'); }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white transition-colors">
                <UserCircle className="h-4 w-4 text-accent-purple" />
                {brandName || 'Meu perfil'}
              </button>
              {planName && (
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-accent-purple/[0.08] border border-accent-purple/20 text-accent-purple tracking-wider">
                  {planName}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

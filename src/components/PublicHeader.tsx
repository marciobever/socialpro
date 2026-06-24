"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { BrainCircuit, ArrowRight } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';

const spring = { type: 'spring' as const, stiffness: 380, damping: 28 };

/**
 * Single canonical marketing header — used on the landing, pricing and login
 * pages so the public site has one consistent top bar.
 */
export function PublicHeader() {
  const router = useRouter();
  const t = useTranslations('landing');

  return (
    <header className="sticky top-0 z-50 w-full px-6 py-3.5">
      <div className="mx-auto max-w-7xl">
        <div className="glass-panel rounded-2xl px-6 py-3.5 flex items-center justify-between shadow-2xl">

          {/* Logo */}
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

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-dark-muted">
            <Link href="/#como-funciona" className="text-dark-muted hover:text-white transition-colors">{t('navHowItWorks')}</Link>
            <Link href="/#features" className="text-dark-muted hover:text-white transition-colors">{t('navFeatures')}</Link>
            <Link href="/pricing" className="text-dark-muted hover:text-white transition-colors">{t('navPricing')}</Link>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-semibold text-dark-muted hover:text-white transition-colors hidden sm:block">
              {t('navSignIn')}
            </Link>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={spring}>
              <Link href="/login" className="relative group overflow-hidden inline-flex items-center gap-1.5 rounded-xl bg-white px-5 py-2 text-xs font-bold text-black border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-accent-purple to-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <span className="relative z-10 group-hover:text-white transition-colors duration-200 flex items-center gap-1.5">
                  {t('navGetStarted')}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
}

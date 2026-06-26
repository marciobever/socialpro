"use client";
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const LABELS: Record<string, { short: string; full: string; flag: string }> = {
  pt: { short: 'PT', full: 'Português', flag: '🇧🇷' },
  en: { short: 'EN', full: 'English',    flag: '🇺🇸' },
  es: { short: 'ES', full: 'Español',    flag: '🇪🇸' },
};

/**
 * Locale picker for the public header. Keeps the current path and swaps the
 * locale segment via next-intl navigation (localePrefix: 'as-needed').
 */
export function LanguageSwitcher() {
  const locale   = useLocale();
  const pathname = usePathname();
  const router   = useRouter();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const switchTo = (next: string) => {
    setOpen(false);
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  };

  const current = LABELS[locale] ?? LABELS.pt;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-2.5 py-2 text-xs font-semibold text-dark-muted hover:text-white hover:border-white/[0.16] transition-all"
        title="Idioma / Language"
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{current.short}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 mt-2 w-44 rounded-2xl border border-white/[0.08] bg-dark-bg/95 backdrop-blur-xl p-1.5 shadow-2xl z-50"
          >
            {routing.locales.map((l) => {
              const meta   = LABELS[l] ?? { short: l.toUpperCase(), full: l, flag: '🌐' };
              const active = l === locale;
              return (
                <button
                  key={l}
                  onClick={() => switchTo(l)}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                    active ? 'text-white bg-white/[0.05]' : 'text-dark-muted hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{meta.flag}</span>
                    {meta.full}
                  </span>
                  {active && <Check className="h-3.5 w-3.5 text-accent-purple" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

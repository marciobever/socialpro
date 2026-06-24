"use client";
import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Info, AlertTriangle, Loader2 } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'loading';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  desc?: string;
  duration: number;
}

// ── Module-level store (callable from anywhere, no provider needed) ───────────
let listeners: Array<(t: ToastItem[]) => void> = [];
let items: ToastItem[] = [];
let counter = 0;

function emit() { listeners.forEach(l => l([...items])); }

function remove(id: number) {
  items = items.filter(t => t.id !== id);
  emit();
}

function push(type: ToastType, message: string, desc?: string, duration = 3200): number {
  const id = ++counter;
  items = [...items, { id, type, message, desc, duration }];
  emit();
  if (duration > 0) setTimeout(() => remove(id), duration);
  return id;
}

export const toast = {
  success: (message: string, desc?: string) => push('success', message, desc),
  error:   (message: string, desc?: string) => push('error', message, desc, 4800),
  info:    (message: string, desc?: string) => push('info', message, desc),
  loading: (message: string, desc?: string) => push('loading', message, desc, 0),
  dismiss: (id: number) => remove(id),
};

const STYLES: Record<ToastType, { icon: React.ReactNode; ring: string; iconWrap: string }> = {
  success: { icon: <Check className="h-3.5 w-3.5" />,          ring: 'border-emerald-500/25', iconWrap: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  error:   { icon: <AlertTriangle className="h-3.5 w-3.5" />,  ring: 'border-rose-500/25',    iconWrap: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  info:    { icon: <Info className="h-3.5 w-3.5" />,           ring: 'border-accent-cyan/25', iconWrap: 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30' },
  loading: { icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, ring: 'border-accent-purple/25', iconWrap: 'bg-accent-purple/15 text-accent-purple border-accent-purple/30' },
};

export function Toaster() {
  const [list, setList] = React.useState<ToastItem[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    listeners.push(setList);
    return () => { listeners = listeners.filter(l => l !== setList); };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 pointer-events-none max-w-[calc(100vw-2.5rem)]">
      <AnimatePresence initial={false}>
        {list.map(t => {
          const s = STYLES[t.type];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className={`pointer-events-auto flex items-start gap-3 w-[320px] max-w-full rounded-2xl border ${s.ring} px-4 py-3 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.7)] glass-panel-heavy`}
            >
              <span className={`flex-shrink-0 h-7 w-7 rounded-xl border flex items-center justify-center ${s.iconWrap}`}>
                {s.icon}
              </span>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-[12.5px] font-bold text-white leading-snug">{t.message}</p>
                {t.desc && <p className="text-[11px] text-white/50 leading-snug mt-0.5">{t.desc}</p>}
              </div>
              <button
                onClick={() => remove(t.id)}
                className="flex-shrink-0 text-white/30 hover:text-white transition-colors mt-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body,
  );
}

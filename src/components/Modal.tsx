"use client";
import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  iconClass?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Consistent premium modal primitive: portal, backdrop blur, ESC to close,
 * scroll-lock, focus on open, spring entrance. Header (icon/title/desc),
 * body and footer slots keep every dialog visually aligned.
 */
export function Modal({ open, onClose, title, description, icon, iconClass, children, footer, size = 'sm' }: ModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = setTimeout(() => panelRef.current?.focus(), 30);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      clearTimeout(focusTimer);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.24, ease }}
            className={`relative w-full ${widths[size]} rounded-3xl border border-white/[0.09] glass-panel-heavy shadow-[0_32px_80px_-16px_rgba(0,0,0,0.85)] overflow-hidden outline-none`}
          >
            <button onClick={onClose} aria-label="Fechar" className="absolute top-4 right-4 z-10 text-white/30 hover:text-white transition-colors">
              <X className="h-[18px] w-[18px]" />
            </button>

            {(title || icon || description) && (
              <div className="p-6 pb-0 space-y-3">
                {icon && (
                  <div className={`h-11 w-11 rounded-2xl flex items-center justify-center border ${iconClass ?? 'bg-accent-purple/10 border-accent-purple/20 text-accent-purple'}`}>
                    {icon}
                  </div>
                )}
                {title && <h2 className="font-display text-lg font-bold text-white leading-tight pr-8">{title}</h2>}
                {description && <p className="text-[13px] text-white/50 leading-relaxed">{description}</p>}
              </div>
            )}

            {children && <div className="p-6">{children}</div>}
            {footer && <div className="px-6 pb-6 pt-0 flex items-center gap-2.5">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ── Confirmation dialog ───────────────────────────────────────────────────────
export function ConfirmDialog({
  open, onClose, onConfirm, title, description,
  confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger,
}: {
  open: boolean; onClose: () => void; onConfirm: () => void;
  title: string; description?: string; confirmLabel?: string; cancelLabel?: string; danger?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      icon={<AlertTriangle className="h-5 w-5" />}
      iconClass={danger ? 'bg-rose-500/10 border-rose-500/25 text-rose-400' : 'bg-amber-500/10 border-amber-500/25 text-amber-400'}
      footer={
        <>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold border border-white/[0.10] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all cursor-pointer ${
              danger
                ? 'bg-rose-500 hover:bg-rose-600 shadow-[0_4px_20px_rgba(244,63,94,0.35)]'
                : 'bg-gradient-to-r from-accent-purple to-accent-cyan shadow-[0_4px_20px_rgba(139,92,246,0.35)]'
            }`}
          >
            {confirmLabel}
          </button>
        </>
      }
    />
  );
}

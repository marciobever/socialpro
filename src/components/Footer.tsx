"use client";
import React from 'react';
import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';

const LINKS = {
  produto: [
    { label: 'Estúdio de Criação', href: '/app/dashboard' },
    { label: 'Histórico',          href: '/app/history'   },
    { label: 'Planos e Preços',    href: '/pricing'       },
    { label: 'Brand Kit',          href: '/app/brand'     },
  ],
  legal: [
    { label: 'Política de Privacidade', href: '/privacy'       },
    { label: 'Termos de Uso',           href: '/terms'         },
    { label: 'Exclusão de Dados',       href: '/data-deletion' },
  ],
  suporte: [
    { label: 'contato@socialpro.ai',       href: 'mailto:contato@socialpro.ai' },
    { label: 'Instagram',                  href: 'https://instagram.com/socialpro.ai' },
  ],
};

export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-[#0f1117] relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-accent-purple to-accent-cyan p-[1px]">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0f1117]">
                <BrainCircuit className="h-4.5 w-4.5 text-accent-cyan" />
              </div>
              <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-tr from-accent-purple to-accent-cyan opacity-30 blur-md" />
            </div>
            <span className="font-display text-base font-bold text-white tracking-tight">
              Social<span className="bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">Pro</span>
            </span>
          </div>
          <p className="text-xs text-dark-muted leading-relaxed max-w-[200px]">
            Criação de carrosséis para Instagram com inteligência artificial. Do briefing à publicação.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-semibold">Todos os sistemas operacionais</span>
          </div>
        </div>

        {/* Produto */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-dark-muted">Produto</h4>
          <ul className="space-y-2.5">
            {LINKS.produto.map(l => (
              <li key={l.href}>
                <Link href={l.href} className="text-xs text-dark-muted hover:text-white transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-dark-muted">Legal</h4>
          <ul className="space-y-2.5">
            {LINKS.legal.map(l => (
              <li key={l.href}>
                <Link href={l.href} className="text-xs text-dark-muted hover:text-white transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Suporte */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-dark-muted">Contato</h4>
          <ul className="space-y-2.5">
            {LINKS.suporte.map(l => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-dark-muted hover:text-white transition-colors">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-dark-muted">
            © {new Date().getFullYear()} SocialPro AI Inc. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy"       className="text-[10px] text-dark-muted hover:text-white transition-colors">Privacidade</Link>
            <Link href="/terms"         className="text-[10px] text-dark-muted hover:text-white transition-colors">Termos</Link>
            <Link href="/data-deletion" className="text-[10px] text-dark-muted hover:text-white transition-colors">Exclusão de Dados</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

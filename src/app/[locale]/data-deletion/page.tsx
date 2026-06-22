"use client";
import React from 'react';
import { PublicHeader } from '@/components/PublicHeader';
import { Footer } from '@/components/Footer';
import { Trash2, Mail, Settings, Clock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

const DELETED_ITEMS = [
  'Perfil de usuário (nome, e-mail, foto, handle)',
  'Brand Kit e configurações de conta',
  'Histórico de carrosséis gerados',
  'Tokens de acesso ao Facebook/Instagram',
  'Imagens armazenadas no Supabase Storage',
];

const KEPT_ITEMS = [
  { item: 'Registros financeiros', reason: 'Obrigação legal fiscal — 5 anos', icon: AlertCircle },
];

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-red-500/6 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent-purple/6 blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern grid-mask pointer-events-none -z-10" />

      <PublicHeader showBack backLabel="Voltar" backHref="/" />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-6 py-12 space-y-8">

        {/* Hero */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 mx-auto">
            <Trash2 className="h-3.5 w-3.5" />
            Exclusão de Dados
          </div>
          <h1 className="font-display text-4xl font-extrabold text-white tracking-tight">
            Controle total<br />
            <span className="bg-gradient-to-r from-red-400 to-accent-purple bg-clip-text text-transparent">
              sobre seus dados
            </span>
          </h1>
          <p className="text-sm text-dark-muted max-w-lg mx-auto leading-relaxed">
            Você pode solicitar a exclusão completa das suas informações a qualquer momento, sem burocracia.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span className="font-semibold">Exigência da Meta (Facebook/Instagram) — LGPD compliant</span>
          </div>
        </div>

        {/* Timeline badge */}
        <div className="flex items-center gap-4 p-5 glass-panel rounded-2xl border border-amber-500/20 bg-amber-500/5">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex-shrink-0">
            <Clock className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Prazo de conclusão: até 30 dias corridos</p>
            <p className="text-xs text-dark-muted mt-0.5">Você receberá confirmação por e-mail. Backups removidos em até 90 dias.</p>
          </div>
        </div>

        {/* Methods */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Como solicitar a exclusão</h2>
          <div className="space-y-4">

            {/* Email */}
            <div className="glass-panel rounded-2xl border border-white/5 p-5 flex gap-4 hover:border-white/10 transition-colors">
              <div className="p-3 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex-shrink-0 h-fit">
                <Mail className="h-5 w-5 text-accent-purple" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Opção 1 — Por e-mail</h3>
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-accent-purple/15 border border-accent-purple/30 text-accent-purple tracking-wider">Recomendado</span>
                </div>
                <p className="text-xs text-dark-muted leading-relaxed">
                  Envie para <strong className="text-white">privacidade@socialpro.ai</strong> com o assunto <strong className="text-white">"EXCLUSÃO DE DADOS"</strong> incluindo seu e-mail cadastrado e nome completo.
                </p>
                <a href="mailto:privacidade@socialpro.ai?subject=EXCLUSÃO DE DADOS"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan hover:shadow-[0_0_12px_rgba(139,92,246,0.4)] transition-all mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  Enviar e-mail agora
                </a>
              </div>
            </div>

            {/* Account */}
            <div className="glass-panel rounded-2xl border border-white/5 p-5 flex gap-4 hover:border-white/10 transition-colors">
              <div className="p-3 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex-shrink-0 h-fit">
                <Settings className="h-5 w-5 text-accent-cyan" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white">Opção 2 — Pela sua conta</h3>
                <p className="text-xs text-dark-muted leading-relaxed">
                  Se você ainda tem acesso à conta, acesse <strong className="text-white">Minha Conta</strong> no dashboard e solicite a exclusão pelo e-mail de suporte. O processo inicia imediatamente.
                </p>
              </div>
            </div>

            {/* Meta */}
            <div className="glass-panel rounded-2xl border border-white/5 p-5 flex gap-4 hover:border-white/10 transition-colors">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex-shrink-0 h-fit">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white">Opção 3 — Via Meta/Facebook</h3>
                <p className="text-xs text-dark-muted leading-relaxed">
                  Acesse <strong className="text-white">Configurações do Facebook → Apps e Sites → SocialPro → Remover</strong>. Isso revoga o acesso e dispara nossa rotina de exclusão automaticamente.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What gets deleted/kept */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-400" /> O que é excluído
            </h3>
            <div className="space-y-2">
              {DELETED_ITEMS.map(item => (
                <div key={item} className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                  <Trash2 className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-dark-muted">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-400" /> O que mantemos
            </h3>
            <div className="space-y-2">
              {KEPT_ITEMS.map(({ item, reason, icon: Icon }) => (
                <div key={item} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <Icon className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-white">{item}</p>
                    <p className="text-[10px] text-dark-muted">{reason}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <Clock className="h-3.5 w-3.5 text-dark-muted flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-white">Backups criptografados</p>
                  <p className="text-[10px] text-dark-muted">Removidos em até 90 dias</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="glass-panel rounded-2xl border border-accent-purple/20 bg-accent-purple/5 p-6 text-center space-y-3">
          <ShieldCheck className="h-6 w-6 text-accent-purple mx-auto" />
          <p className="text-sm font-bold text-white">Ainda com dúvidas?</p>
          <p className="text-xs text-dark-muted">Respondemos em até 5 dias úteis.</p>
          <a href="mailto:privacidade@socialpro.ai"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan hover:shadow-[0_0_16px_rgba(139,92,246,0.4)] transition-all">
            <Mail className="h-4 w-4" />
            privacidade@socialpro.ai
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}

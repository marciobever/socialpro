"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useAppContext } from '@/context/AppContext';
import {
  UserCircle, CreditCard, Zap, CheckCircle2, AlertCircle,
  Loader2, ExternalLink, ChevronRight, Palette, LogOut, RefreshCw,
} from 'lucide-react';

const PLAN_LABELS: Record<string, string> = {
  free:   'Free',
  intro:  'Intro (1º mês)',
  pro:    'Pro',
  agency: 'Agency',
};
const PLAN_LIMITS: Record<string, number> = { free: 0, intro: 5, pro: 15, agency: 60 };
const PLAN_PRICES: Record<string, string> = { free: 'Grátis', intro: 'R$14,99/mês', pro: 'R$29,99/mês', agency: 'R$79,99/mês' };

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active:    { label: 'Ativo',       cls: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
    trialing:  { label: 'Trial',       cls: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
    past_due:  { label: 'Vencido',     cls: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
    canceled:  { label: 'Cancelado',   cls: 'bg-red-500/10 border-red-500/30 text-red-400' },
    free:      { label: 'Sem plano',   cls: 'bg-white/5 border-white/10 text-dark-muted' },
  };
  const s = map[status] ?? map['free'];
  return (
    <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border tracking-wider ${s.cls}`}>
      {s.label}
    </span>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { subscription, loadSubscription, brandKit, upgradeModalOpen, setUpgradeModalOpen } = useAppContext();

  const [loadingPortal,   setLoadingPortal]   = useState(false);
  const [refreshing,      setRefreshing]       = useState(false);
  const [portalError,     setPortalError]      = useState('');

  const used      = subscription?.carousels_used  ?? 0;
  const limit     = subscription?.carousel_limit  ?? 0;
  const remaining = Math.max(limit - used, 0);
  const pct       = limit > 0 ? Math.min((used / limit) * 100, 100) : 100;
  const planId    = subscription?.plan_id ?? 'free';
  const isActive  = subscription?.status === 'active' || subscription?.status === 'trialing';
  const isWarning = isActive && remaining > 0 && remaining <= 3;
  const isEmpty   = !isActive;

  const barColor = isEmpty || remaining === 0
    ? 'bg-red-500'
    : isWarning
      ? 'bg-gradient-to-r from-amber-400 to-orange-400'
      : 'bg-gradient-to-r from-accent-purple to-accent-cyan';

  const periodEnd = subscription?.period_end
    ? new Date(subscription.period_end).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSubscription();
    setRefreshing(false);
  };

  const handlePortal = async () => {
    setLoadingPortal(true);
    setPortalError('');
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err) {
      setPortalError(err instanceof Error ? err.message : 'Erro ao abrir portal.');
    } finally {
      setLoadingPortal(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] py-8 px-4 md:px-8 max-w-3xl mx-auto space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-text">Minha Conta</h1>
          <p className="text-sm text-dark-muted mt-0.5">Plano, uso e informações de pagamento</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dark-border text-xs text-dark-muted hover:text-dark-text hover:bg-white/5 transition-all disabled:opacity-50">
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Profile card */}
      <div className="glass-panel rounded-2xl border border-dark-border p-5 flex items-center gap-5">
        {brandKit.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={brandKit.avatarUrl} alt="Avatar"
            className="h-16 w-16 rounded-full object-cover border-2 border-accent-purple/40 flex-shrink-0" />
        ) : (
          <div className="h-16 w-16 rounded-full bg-accent-purple/10 border-2 border-accent-purple/20 flex items-center justify-center flex-shrink-0">
            <UserCircle className="h-8 w-8 text-accent-purple" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-dark-text truncate">{brandKit.brandName || 'Sem nome'}</h2>
          <p className="text-sm text-dark-muted truncate">{brandKit.brandHandle || '—'}</p>
          <p className="text-xs text-dark-muted mt-0.5 truncate">{session?.user?.email}</p>
        </div>
        <button onClick={() => router.push('/app/brand')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dark-border text-xs font-semibold text-dark-muted hover:text-accent-cyan hover:border-accent-cyan/30 transition-all flex-shrink-0">
          <Palette className="h-3.5 w-3.5" />
          Editar Perfil
        </button>
      </div>

      {/* Plan card */}
      <div className="glass-panel rounded-2xl border border-dark-border p-5 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent-purple/10 border border-accent-purple/20">
              <CreditCard className="h-5 w-5 text-accent-purple" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-dark-text">Plano atual</h3>
              <p className="text-xs text-dark-muted mt-0.5">
                {PLAN_PRICES[planId] ?? '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-bold text-dark-text">{PLAN_LABELS[planId] ?? planId}</span>
            <StatusBadge status={subscription?.status ?? 'free'} />
          </div>
        </div>

        {/* Billing period */}
        {periodEnd && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5">
            {subscription?.status === 'past_due' ? (
              <AlertCircle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
            )}
            <p className="text-xs text-dark-muted">
              {subscription?.status === 'past_due'
                ? `Pagamento pendente — venceu em ${periodEnd}`
                : `Próxima renovação em ${periodEnd}`}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {isActive ? (
            <button onClick={handlePortal} disabled={loadingPortal}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dark-border text-sm font-semibold text-dark-muted hover:text-dark-text hover:border-white/20 hover:bg-white/5 transition-all disabled:opacity-50">
              {loadingPortal ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              Gerenciar assinatura
            </button>
          ) : (
            <button onClick={() => setUpgradeModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan hover:shadow-[0_0_16px_rgba(139,92,246,0.4)] transition-all">
              <Zap className="h-4 w-4" />
              Assinar um plano
            </button>
          )}
          {isActive && planId !== 'agency' && (
            <button onClick={() => setUpgradeModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan hover:shadow-[0_0_16px_rgba(139,92,246,0.4)] transition-all">
              <Zap className="h-4 w-4" />
              Fazer upgrade
            </button>
          )}
        </div>
        {portalError && (
          <p className="text-[11px] text-red-400">⚠ {portalError}</p>
        )}
      </div>

      {/* Usage card */}
      <div className={`glass-panel rounded-2xl border p-5 space-y-4 ${
        isEmpty || remaining === 0 ? 'border-red-500/30' : isWarning ? 'border-amber-500/30' : 'border-dark-border'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20">
            <Zap className="h-5 w-5 text-accent-cyan" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-dark-text">Uso este mês</h3>
            <p className="text-xs text-dark-muted mt-0.5">Carrosséis gerados no ciclo atual</p>
          </div>
          <div className="ml-auto text-right">
            <span className={`text-2xl font-black tabular-nums ${
              remaining === 0 ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-white'
            }`}>{remaining}</span>
            <p className="text-[9px] text-dark-muted">restantes</p>
          </div>
        </div>

        {/* Bar */}
        <div className="space-y-2">
          <div className="h-3 w-full rounded-full bg-dark-border overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${barColor}`}
              style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-dark-muted">
            <span>{used} utilizados</span>
            <span>limite: {limit === 0 ? '—' : limit} / mês</span>
          </div>
        </div>

        {/* Breakdown */}
        {isActive && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Utilizados', value: used, color: 'text-accent-purple' },
              { label: 'Restantes',  value: remaining, color: remaining === 0 ? 'text-red-400' : 'text-emerald-400' },
              { label: 'Limite mensal', value: limit || '—', color: 'text-dark-text' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
                <p className={`text-xl font-black ${color}`}>{value}</p>
                <p className="text-[9px] text-dark-muted mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {isEmpty && (
          <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-300">
              Sem plano ativo. Assine para gerar carrosséis com IA.
            </p>
          </div>
        )}

        {remaining === 0 && isActive && (
          <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-300">
              Limite mensal atingido. Faça upgrade para continuar gerando.
            </p>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="glass-panel rounded-2xl border border-dark-border divide-y divide-dark-border">
        {[
          { label: 'Estúdio de criação',    icon: Zap,         href: '/app/dashboard' },
          { label: 'Histórico de carrosséis', icon: CheckCircle2, href: '/app/history'  },
          { label: 'Brand Kit',             icon: Palette,     href: '/app/brand'     },
        ].map(({ label, icon: Icon, href }) => (
          <button key={href} onClick={() => router.push(href)}
            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.03] transition-colors group">
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-dark-muted group-hover:text-accent-cyan transition-colors" />
              <span className="text-sm font-semibold text-dark-muted group-hover:text-dark-text transition-colors">{label}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-dark-muted" />
          </button>
        ))}
        <button onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-red-500/5 transition-colors group">
          <div className="flex items-center gap-3">
            <LogOut className="h-4 w-4 text-dark-muted group-hover:text-red-400 transition-colors" />
            <span className="text-sm font-semibold text-dark-muted group-hover:text-red-400 transition-colors">Sair da conta</span>
          </div>
          <ChevronRight className="h-4 w-4 text-dark-muted" />
        </button>
      </div>

    </div>
  );
}

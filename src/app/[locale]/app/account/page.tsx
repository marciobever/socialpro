"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useAppContext } from '@/context/AppContext';
import {
  UserCircle, CreditCard, Zap, CheckCircle2, AlertCircle,
  Loader2, ExternalLink, ChevronRight, Palette, LogOut, RefreshCw,
  Link2, Link2Off, Check, ChevronDown,
} from 'lucide-react';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}

interface IgAccount { instagram_account_id: string; instagram_username: string; facebook_page_name: string; }
interface MetaStatus {
  connected: boolean; instagramId: string | null; instagramName: string | null;
  pageName: string | null; availableAccounts?: IgAccount[];
}

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

  // Social connections — Instagram
  const [metaStatus,       setMetaStatus]       = useState<MetaStatus | null>(null);
  const [metaLoading,      setMetaLoading]      = useState(true);
  const [disconnecting,    setDisconnecting]    = useState(false);
  const [metaError,        setMetaError]        = useState('');
  const [showAccountList,  setShowAccountList]  = useState(false);
  const [switchingAccount, setSwitchingAccount] = useState(false);

  // Social connections — LinkedIn
  const [linkedinStatus,      setLinkedinStatus]      = useState<{ connected: boolean; name: string | null } | null>(null);
  const [linkedinLoading,     setLinkedinLoading]     = useState(true);
  const [linkedinDisconnecting, setLinkedinDisconnecting] = useState(false);

  // Social connections — X/Twitter
  const [twitterStatus,      setTwitterStatus]      = useState<{ connected: boolean; username: string | null } | null>(null);
  const [twitterLoading,     setTwitterLoading]     = useState(true);
  const [twitterDisconnecting, setTwitterDisconnecting] = useState(false);

  useEffect(() => {
    // Handle OAuth callback params
    const params = new URLSearchParams(window.location.search);
    if (params.get('meta_error')) {
      const msgs: Record<string, string> = {
        denied: 'Permissão negada.', invalid_state: 'Sessão expirada. Tente novamente.',
        token_exchange: 'Erro ao obter token.', server_error: 'Erro interno.',
        missing_config: 'App não configurado.',
      };
      setMetaError(msgs[params.get('meta_error')!] ?? 'Erro desconhecido.');
      window.history.replaceState({}, '', '/app/account');
    }
    if (params.get('meta_connected')) window.history.replaceState({}, '', '/app/account');

    // Load connection status — all platforms in parallel
    fetch('/api/meta/status')
      .then(r => r.json()).then((d: MetaStatus) => setMetaStatus(d))
      .catch(() => setMetaStatus({ connected: false, instagramId: null, instagramName: null, pageName: null }))
      .finally(() => setMetaLoading(false));

    fetch('/api/linkedin/status')
      .then(r => r.json()).then(d => setLinkedinStatus(d))
      .catch(() => setLinkedinStatus({ connected: false, name: null }))
      .finally(() => setLinkedinLoading(false));

    fetch('/api/twitter/status')
      .then(r => r.json()).then(d => setTwitterStatus(d))
      .catch(() => setTwitterStatus({ connected: false, username: null }))
      .finally(() => setTwitterLoading(false));
  }, []);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    await fetch('/api/meta/status', { method: 'DELETE' });
    setMetaStatus({ connected: false, instagramId: null, instagramName: null, pageName: null });
    setDisconnecting(false);
  };

  const handleSwitchAccount = async (account: IgAccount) => {
    setSwitchingAccount(true);
    setShowAccountList(false);
    const res = await fetch('/api/meta/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instagramAccountId: account.instagram_account_id }),
    });
    if (res.ok) {
      setMetaStatus(prev => prev ? { ...prev,
        instagramId: account.instagram_account_id,
        instagramName: account.instagram_username,
        pageName: account.facebook_page_name,
      } : prev);
    }
    setSwitchingAccount(false);
  };

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

      {/* Connected accounts */}
      <div className="glass-panel rounded-2xl border border-dark-border p-5 space-y-4">
        <h3 className="text-sm font-bold text-dark-text">Contas Conectadas</h3>

        {metaError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />{metaError}
          </div>
        )}

        {/* Google */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-dark-border/30 border border-dark-border">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <div>
              <p className="text-xs font-semibold text-dark-text">Google</p>
              <p className="text-[10px] text-dark-muted">{session?.user?.email ?? '—'}</p>
            </div>
          </div>
          {session?.user && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
              <Check className="h-3 w-3" /> Ativo
            </span>
          )}
        </div>

        {/* Instagram */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-dark-border/30 border border-dark-border">
            <div className="flex items-center gap-3">
              <InstagramIcon className="h-5 w-5 text-pink-400" />
              <div>
                <p className="text-xs font-semibold text-dark-text">Instagram</p>
                <p className="text-[10px] text-dark-muted">
                  {metaLoading ? 'Verificando...'
                    : metaStatus?.connected ? `@${metaStatus.instagramName ?? 'conectado'}`
                    : 'Não conectado'}
                </p>
              </div>
            </div>
            {metaLoading ? <Loader2 className="h-4 w-4 animate-spin text-dark-muted" />
              : metaStatus?.connected
                ? <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg"><Check className="h-3 w-3" /> Ativo</span>
                : <span className="text-[10px] text-dark-muted">—</span>}
          </div>

          {/* Account switcher */}
          {metaStatus?.connected && (metaStatus.availableAccounts?.length ?? 0) > 1 && (
            <div className="relative">
              <button onClick={() => setShowAccountList(!showAccountList)} disabled={switchingAccount}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-dark-border/20 border border-dark-border text-[11px] font-semibold text-dark-muted hover:text-dark-text hover:border-accent-purple/30 transition-all disabled:opacity-50">
                <span>{switchingAccount ? 'Trocando...' : `Conta ativa: @${metaStatus.instagramName}`}</span>
                {switchingAccount ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAccountList ? 'rotate-180' : ''}`} />}
              </button>
              {showAccountList && (
                <div className="absolute top-full left-0 right-0 mt-1 z-20 glass-panel rounded-xl border border-dark-border shadow-xl overflow-hidden">
                  {metaStatus.availableAccounts!.map(account => (
                    <button key={account.instagram_account_id} onClick={() => handleSwitchAccount(account)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors ${account.instagram_account_id === metaStatus.instagramId ? 'bg-accent-purple/10' : ''}`}>
                      <InstagramIcon className="h-4 w-4 text-pink-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-dark-text truncate">@{account.instagram_username}</p>
                        <p className="text-[9px] text-dark-muted truncate">{account.facebook_page_name}</p>
                      </div>
                      {account.instagram_account_id === metaStatus.instagramId && <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {!metaLoading && (metaStatus?.connected ? (
            <button onClick={handleDisconnect} disabled={disconnecting}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border border-dark-border text-dark-muted hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-50">
              {disconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2Off className="h-3.5 w-3.5" />}
              Desconectar Instagram
            </button>
          ) : (
            <a href="/api/meta/connect"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-[0_0_16px_rgba(236,72,153,0.3)] transition-all">
              <Link2 className="h-3.5 w-3.5" /> Conectar Instagram
            </a>
          ))}
          <p className="text-[10px] text-dark-muted">Requer conta Business ou Creator vinculada a uma Página do Facebook.</p>
        </div>

        {/* LinkedIn */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-dark-border/30 border border-dark-border">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-[#0077b5]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <div>
                <p className="text-xs font-semibold text-dark-text">LinkedIn</p>
                <p className="text-[10px] text-dark-muted">
                  {linkedinLoading ? 'Verificando...' : linkedinStatus?.connected ? linkedinStatus.name ?? 'Conectado' : 'Não conectado'}
                </p>
              </div>
            </div>
            {linkedinLoading ? <Loader2 className="h-4 w-4 animate-spin text-dark-muted" />
              : linkedinStatus?.connected
                ? <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg"><Check className="h-3 w-3" /> Ativo</span>
                : <span className="text-[10px] text-dark-muted">—</span>}
          </div>
          {!linkedinLoading && (linkedinStatus?.connected ? (
            <button onClick={async () => { setLinkedinDisconnecting(true); await fetch('/api/linkedin/status', { method: 'DELETE' }); setLinkedinStatus({ connected: false, name: null }); setLinkedinDisconnecting(false); }}
              disabled={linkedinDisconnecting}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border border-dark-border text-dark-muted hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-50">
              {linkedinDisconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2Off className="h-3.5 w-3.5" />}
              Desconectar LinkedIn
            </button>
          ) : (
            <a href="/api/linkedin/connect"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0077b5] hover:bg-[#006097] hover:shadow-[0_0_16px_rgba(0,119,181,0.3)] transition-all">
              <Link2 className="h-3.5 w-3.5" /> Conectar LinkedIn
            </a>
          ))}
        </div>

        {/* X / Twitter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-dark-border/30 border border-dark-border">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <div>
                <p className="text-xs font-semibold text-dark-text">X / Twitter</p>
                <p className="text-[10px] text-dark-muted">
                  {twitterLoading ? 'Verificando...' : twitterStatus?.connected ? `@${twitterStatus.username}` : 'Não conectado'}
                </p>
              </div>
            </div>
            {twitterLoading ? <Loader2 className="h-4 w-4 animate-spin text-dark-muted" />
              : twitterStatus?.connected
                ? <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg"><Check className="h-3 w-3" /> Ativo</span>
                : <span className="text-[10px] text-dark-muted">—</span>}
          </div>
          {!twitterLoading && (twitterStatus?.connected ? (
            <button onClick={async () => { setTwitterDisconnecting(true); await fetch('/api/twitter/status', { method: 'DELETE' }); setTwitterStatus({ connected: false, username: null }); setTwitterDisconnecting(false); }}
              disabled={twitterDisconnecting}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border border-dark-border text-dark-muted hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-50">
              {twitterDisconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2Off className="h-3.5 w-3.5" />}
              Desconectar X
            </button>
          ) : (
            <a href="/api/twitter/connect"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-black border border-white/10 hover:bg-white/5 hover:shadow-[0_0_16px_rgba(255,255,255,0.1)] transition-all">
              <Link2 className="h-3.5 w-3.5" /> Conectar X / Twitter
            </a>
          ))}
          <p className="text-[10px] text-dark-muted">Requer plano Basic da API do X (twitter.com/i/api-dashboard).</p>
        </div>
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

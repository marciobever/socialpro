"use client";
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useAppContext } from '@/context/AppContext';
import { toast } from '@/components/Toast';
import { motion } from 'framer-motion';
import {
  UserCircle, CreditCard, Zap, CheckCircle2, AlertCircle,
  Loader2, ExternalLink, ChevronRight, Palette, LogOut, RefreshCw,
  Link2, Link2Off, Check, ChevronDown, Save, X as XIcon, Pencil,
} from 'lucide-react';

// Helper: initials avatar
function InitialsAvatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    ? name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?';
  return (
    <div className={`flex items-center justify-center rounded-2xl bg-gradient-to-tr from-accent-purple to-accent-cyan flex-shrink-0 shadow-lg ${className}`}>
      <span className="text-white font-bold select-none" style={{ fontSize: initials.length > 1 ? '1.4rem' : '1.7rem' }}>{initials}</span>
    </div>
  );
}

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

const spring = { type: 'spring' as const, stiffness: 400, damping: 30 };

function StatusBadge({ status, t }: { status: string; t: any }) {
  const map: Record<string, { label: string; cls: string }> = {
    active:    { label: t('statusActive'),       cls: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.08)]' },
    trialing:  { label: t('statusTrialing'),     cls: 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.08)]' },
    past_due:  { label: t('statusPastDue'),      cls: 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.08)]' },
    canceled:  { label: t('statusCanceled'),     cls: 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.08)]' },
    free:      { label: t('statusFree'),         cls: 'bg-white/5 border-white/10 text-dark-muted' },
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
  const t = useTranslations('account');
  const { data: session } = useSession();
  const { subscription, loadSubscription, brandKit, setBrandKit, setUpgradeModalOpen } = useAppContext();

  const [loadingPortal,   setLoadingPortal]   = useState(false);
  const [refreshing,      setRefreshing]       = useState(false);
  const [portalError,     setPortalError]      = useState('');

  // Profile editing
  const [editingProfile,  setEditingProfile]  = useState(false);
  const [editName,        setEditName]        = useState('');
  const [editHandle,      setEditHandle]      = useState('');
  const [editBio,         setEditBio]         = useState('');
  const [savingProfile,   setSavingProfile]   = useState(false);

  // Social connections — Instagram
  const [metaStatus,       setMetaStatus]       = useState<MetaStatus | null>(null);
  const [metaLoading,      setMetaLoading]      = useState(true);
  const [disconnecting,    setDisconnecting]    = useState(false);
  const [showAccountList,  setShowAccountList]  = useState(false);
  const [switchingAccount, setSwitchingAccount] = useState(false);

  // Social connections — LinkedIn
  const [linkedinStatus,      setLinkedinStatus]      = useState<{ connected: boolean; name: string | null } | null>(null);
  const [linkedinLoading,     setLinkedinLoading]     = useState(true);
  const [linkedinDisconnecting, setLinkedinDisconnecting] = useState(false);

  // Social connections — Facebook (Pages)
  const [facebookStatus,      setFacebookStatus]      = useState<{ connected: boolean; pageName: string | null } | null>(null);
  const [facebookLoading,     setFacebookLoading]     = useState(true);
  const [facebookDisconnecting, setFacebookDisconnecting] = useState(false);

  // Social connections — Pinterest
  const [pinterestStatus,      setPinterestStatus]      = useState<{ connected: boolean; username: string | null } | null>(null);
  const [pinterestLoading,     setPinterestLoading]     = useState(true);
  const [pinterestDisconnecting, setPinterestDisconnecting] = useState(false);

  const startEditProfile = () => {
    setEditName(brandKit.brandName);
    setEditHandle(brandKit.brandHandle);
    setEditBio(brandKit.aiBio);
    setEditingProfile(true);
  };

  const cancelEditProfile = () => setEditingProfile(false);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: editName,
          brandHandle: editHandle,
          aiBio: editBio,
          avatarUrl: brandKit.avatarUrl, // preserve existing avatar
        }),
      });
      setBrandKit(prev => ({ ...prev, brandName: editName, brandHandle: editHandle, aiBio: editBio }));
      setEditingProfile(false);
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    // Handle OAuth callback params
    const params        = new URLSearchParams(window.location.search);
    const metaErrorCode = params.get('meta_error');
    const justConnected = params.get('meta_connected');
    if (metaErrorCode || justConnected) window.history.replaceState({}, '', '/app/account');

    if (metaErrorCode) {
      const msgs: Record<string, string> = {
        denied: 'Você negou a permissão no Facebook. Tente novamente e aceite o acesso à Página e ao Instagram.',
        invalid_state: 'Sessão de conexão expirada. Clique em "Conectar Instagram" de novo.',
        token_exchange: 'O Facebook não retornou um token válido. Tente novamente.',
        server_error: 'Erro interno ao salvar a conexão. Tente novamente em instantes.',
        missing_config: 'App do Meta não configurado no servidor.',
      };
      toast.error('Falha ao conectar Instagram', msgs[metaErrorCode] ?? 'Erro desconhecido.');
    }

    // Load connection status — all platforms in parallel
    fetch('/api/meta/status')
      .then(r => r.json())
      .then((d: MetaStatus) => {
        setMetaStatus(d);
        if (justConnected && d.connected) {
          toast.success(
            'Instagram conectado com sucesso',
            `@${d.instagramName} — via Página "${d.pageName}"`,
          );
        }
      })
      .catch(() => setMetaStatus({ connected: false, instagramId: null, instagramName: null, pageName: null }))
      .finally(() => setMetaLoading(false));

    fetch('/api/linkedin/status')
      .then(r => r.json()).then(d => setLinkedinStatus(d))
      .catch(() => setLinkedinStatus({ connected: false, name: null }))
      .finally(() => setLinkedinLoading(false));

    fetch('/api/facebook/status')
      .then(r => r.json()).then(d => setFacebookStatus(d))
      .catch(() => setFacebookStatus({ connected: false, pageName: null }))
      .finally(() => setFacebookLoading(false));

    fetch('/api/pinterest/status')
      .then(r => r.json()).then(d => setPinterestStatus(d))
      .catch(() => setPinterestStatus({ connected: false, username: null }))
      .finally(() => setPinterestLoading(false));
  }, []);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    await fetch('/api/meta/status', { method: 'DELETE' });
    setMetaStatus({ connected: false, instagramId: null, instagramName: null, pageName: null });
    toast.info('Instagram desconectado');
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
      toast.success('Conta ativa alterada', `Agora publicando em @${account.instagram_username}`);
    } else {
      toast.error('Não foi possível trocar de conta', 'Tente novamente em instantes.');
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
    ? 'bg-rose-500'
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
    <div className="min-h-[calc(100vh-64px)] py-8 px-4 md:px-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-text">{t('title')}</h1>
          <p className="text-sm text-dark-muted mt-0.5">{t('subtitle')}</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs text-dark-muted hover:text-white hover:border-white/[0.16] hover:bg-white/[0.05] transition-all disabled:opacity-50 cursor-pointer">
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {t('refresh')}
        </button>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
        {/* Tile 1: Profile card (span 4) */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={spring}
          className="md:col-span-4 bg-[#181b25]/40 border border-white/[0.08] hover:border-white/[0.14] rounded-3xl p-6 flex flex-col gap-5 relative overflow-hidden backdrop-blur-xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-accent-purple/[0.01] to-accent-cyan/[0.01] pointer-events-none" />

          {/* Avatar + name row */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {brandKit.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brandKit.avatarUrl} alt={brandKit.brandName || 'Avatar'}
                className="h-16 w-16 rounded-2xl object-cover border-2 border-accent-purple/30 flex-shrink-0 shadow-lg shadow-black/30" />
            ) : (
              <InitialsAvatar name={brandKit.brandName || session?.user?.name || '?'} className="h-16 w-16" />
            )}

            <div className="flex-1 min-w-0 text-center sm:text-left">
              {editingProfile ? (
                <div className="space-y-2">
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Nome"
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-1.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-accent-purple/40 transition-colors"
                  />
                  <input
                    value={editHandle}
                    onChange={e => setEditHandle(e.target.value)}
                    placeholder="@handle"
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-1.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-accent-purple/40 transition-colors"
                  />
                  <textarea
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    placeholder="Bio..."
                    rows={2}
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/25 focus:outline-none focus:border-accent-purple/40 transition-colors resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <button onClick={saveProfile} disabled={savingProfile}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan text-xs font-bold text-white disabled:opacity-50 cursor-pointer">
                      {savingProfile ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                      Salvar
                    </button>
                    <button onClick={cancelEditProfile}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] text-xs font-semibold text-white/50 hover:text-white transition-colors cursor-pointer">
                      <XIcon className="h-3 w-3" /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-white truncate">{brandKit.brandName || '—'}</h2>
                  <p className="text-sm text-accent-cyan font-medium truncate mt-0.5">{brandKit.brandHandle || '—'}</p>
                  {brandKit.aiBio && <p className="text-xs text-white/40 mt-1 line-clamp-2 leading-relaxed">{brandKit.aiBio}</p>}
                  <p className="text-xs text-white/30 mt-1 truncate">{session?.user?.email}</p>
                </>
              )}
            </div>

            {/* Edit / Brand Kit buttons */}
            {!editingProfile && (
              <div className="flex flex-col gap-2 flex-shrink-0 w-full sm:w-auto">
                <button onClick={startEditProfile}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-xs font-semibold text-white/60 hover:text-white hover:border-white/20 hover:bg-white/[0.06] transition-all cursor-pointer justify-center">
                  <Pencil className="h-3.5 w-3.5 text-accent-cyan" />
                  Editar dados
                </button>
                <button onClick={() => router.push('/app/brand')}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-xs font-semibold text-white/60 hover:text-white hover:border-white/20 hover:bg-white/[0.06] transition-all cursor-pointer justify-center">
                  <Palette className="h-3.5 w-3.5 text-accent-purple" />
                  {t('editProfile')}
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tile 2: Quick Links / Actions (span 2) */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={spring}
          className="md:col-span-2 bg-[#181b25]/40 border border-white/[0.08] hover:border-white/[0.14] rounded-3xl p-5 flex flex-col justify-between gap-4 relative overflow-hidden backdrop-blur-xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-accent-purple/[0.01] to-accent-cyan/[0.01] pointer-events-none" />
          <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.16em] px-0.5">{t('quickLinks')}</h3>
          <div className="space-y-1">
            {[
              { label: t('linkStudio'),    href: '/app/dashboard', icon: Zap },
              { label: t('linkHistory'),   href: '/app/history',  icon: CheckCircle2 },
              { label: t('linkBrandKit'),  href: '/app/brand',    icon: Palette },
            ].map(({ label, href, icon: Icon }) => (
              <button key={href} onClick={() => router.push(href)}
                className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-white/5 transition-colors group cursor-pointer">
                <span className="flex items-center gap-2.5 text-xs font-semibold text-white/55 group-hover:text-white transition-colors">
                  <Icon className="h-3.5 w-3.5 text-white/30 group-hover:text-accent-cyan transition-colors" />
                  {label}
                </span>
                <ChevronRight className="h-3 w-3 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
            <button onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-rose-500/10 transition-colors group cursor-pointer">
              <span className="flex items-center gap-2.5 text-xs font-semibold text-rose-400 group-hover:text-rose-300 transition-colors">
                <LogOut className="h-3.5 w-3.5 text-rose-400/60 group-hover:text-rose-400 transition-colors" />
                {t('signOut')}
              </span>
              <ChevronRight className="h-3 w-3 text-rose-400/40 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </motion.div>

        {/* Tile 3: Plan details (span 3) */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={spring}
          className="md:col-span-3 bg-[#181b25]/40 border border-white/[0.08] hover:border-white/[0.14] rounded-3xl p-6 flex flex-col justify-between gap-5 relative overflow-hidden backdrop-blur-xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-accent-purple/[0.01] to-accent-cyan/[0.01] pointer-events-none" />
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent-purple/10 border border-accent-purple/20">
                  <CreditCard className="h-5 w-5 text-accent-purple" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.16em]">{t('currentPlan')}</h3>
                  <p className="text-base font-bold text-white mt-1">
                    {t(`plan_${planId}` as any)}
                  </p>
                  <p className="text-xs text-white/45 font-medium mt-0.5">
                    {t(`price_${planId}` as any)}
                  </p>
                </div>
              </div>
              <StatusBadge status={subscription?.status ?? 'free'} t={t} />
            </div>

            {/* Billing period */}
            {periodEnd && (
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                {subscription?.status === 'past_due' ? (
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                )}
                <p className="text-[11px] text-white/50 leading-normal">
                  {subscription?.status === 'past_due'
                    ? t('pastDueAt', { date: periodEnd ?? '' })
                    : t('renewalAt', { date: periodEnd ?? '' })}
                </p>
              </div>
            )}
          </div>

          <div className="pt-2">
            {isActive ? (
              <button onClick={handlePortal} disabled={loadingPortal}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs font-bold text-white hover:text-white hover:border-white/20 hover:bg-white/[0.06] transition-all disabled:opacity-50 cursor-pointer">
                {loadingPortal ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5 text-accent-cyan" />}
                {t('manageSubscription')}
              </button>
            ) : (
              <button onClick={() => setUpgradeModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan hover:shadow-[0_0_16px_rgba(139,92,246,0.4)] transition-all cursor-pointer">
                <Zap className="h-3.5 w-3.5" />
                {t('subscribePlan')}
              </button>
            )}
            {isActive && planId !== 'agency' && (
              <button onClick={() => setUpgradeModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan hover:shadow-[0_0_16px_rgba(139,92,246,0.4)] transition-all cursor-pointer mt-2">
                <Zap className="h-3.5 w-3.5" />
                {t('upgradePlan')}
              </button>
            )}
            {portalError && (
              <p className="text-[10px] text-rose-400 mt-2 text-center">⚠ {portalError}</p>
            )}
          </div>
        </motion.div>

        {/* Tile 4: Usage stats (span 3) */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={spring}
          className={`md:col-span-3 bg-[#181b25]/40 border rounded-3xl p-6 flex flex-col justify-between gap-5 relative overflow-hidden backdrop-blur-xl transition-all duration-300 ${
            isEmpty || remaining === 0 ? 'border-rose-500/30' : isWarning ? 'border-amber-500/30' : 'border-white/[0.08] hover:border-white/[0.14]'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-accent-purple/[0.01] to-accent-cyan/[0.01] pointer-events-none" />
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20">
                <Zap className="h-5 w-5 text-accent-cyan" />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.16em]">{t('usageMonth')}</h3>
                <p className="text-[11px] text-white/40 mt-0.5 leading-normal">{t('usageSub')}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-3xl font-black tabular-nums leading-none ${
                remaining === 0 ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-white'
              }`}>{remaining}</span>
              <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider mt-0.5">{t('remaining')}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-2.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between text-[10px] font-semibold text-white/40">
              <span>{used} {t('usedLabel')}</span>
              <span>{t('limitMonth', { limit: limit === 0 ? '—' : limit })}</span>
            </div>
          </div>

          <div className="min-h-[42px] flex items-center">
            {isEmpty && (
              <div className="w-full rounded-xl bg-amber-500/5 border border-amber-500/15 p-2.5 flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                <p className="text-[10px] text-amber-300/80 leading-normal">
                  {t('noActivePlanDesc')}
                </p>
              </div>
            )}

            {remaining === 0 && isActive && (
              <div className="w-full rounded-xl bg-red-500/5 border border-red-500/15 p-2.5 flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-rose-400 flex-shrink-0" />
                <p className="text-[10px] text-rose-300/80 leading-normal">
                  {t('limitReachedDesc')}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Section divider (span 6) */}
        <div className="col-span-full pt-4 flex items-center gap-3">
          <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.16em] whitespace-nowrap">{t('connectedAccounts')}</h3>
          <div className="h-px bg-white/[0.06] w-full" />
        </div>

        {/* Tile 5: Instagram connection (span 2) */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={spring}
          className="md:col-span-2 bg-[#181b25]/40 border border-white/[0.08] hover:border-white/[0.14] rounded-3xl p-5 flex flex-col justify-between gap-4 relative backdrop-blur-xl transition-all duration-300"
        >
          <div className="absolute inset-0 rounded-3xl overflow-hidden bg-gradient-to-tr from-accent-purple/[0.01] to-accent-cyan/[0.01] pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/20">
                <InstagramIcon className="h-5 w-5 text-pink-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white">Instagram</p>
                <p className="text-[10.5px] text-white/45 truncate mt-0.5">
                  {metaLoading ? t('verifying')
                    : metaStatus?.connected ? `@${metaStatus.instagramName}`
                    : t('notConnected')}
                </p>
              </div>
            </div>
            {!metaLoading && metaStatus?.connected && (
              <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full tracking-wider">
                {t('active')}
              </span>
            )}
          </div>

          {metaStatus?.connected && (metaStatus.availableAccounts?.length ?? 0) > 1 && (
            <div className="relative">
              <button onClick={() => setShowAccountList(!showAccountList)} disabled={switchingAccount}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[10.5px] font-semibold text-white/55 hover:text-white hover:border-accent-purple/30 transition-all disabled:opacity-50 cursor-pointer">
                <span className="truncate">{switchingAccount ? t('switching') : t('activeAccount', { username: metaStatus.instagramName ?? '' })}</span>
                {switchingAccount ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <ChevronDown className={`h-3.5 w-3.5 transition-transform flex-shrink-0 ${showAccountList ? 'rotate-180' : ''}`} />}
              </button>
              {showAccountList && (
                <div className="absolute bottom-full left-0 right-0 mb-1.5 z-20 glass-panel rounded-2xl border border-white/[0.08] bg-dark-bg/95 backdrop-blur-xl shadow-2xl overflow-hidden p-1">
                  {metaStatus.availableAccounts!.map(account => (
                    <button key={account.instagram_account_id} onClick={() => handleSwitchAccount(account)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-white/5 transition-colors cursor-pointer ${account.instagram_account_id === metaStatus.instagramId ? 'bg-accent-purple/10 text-white' : 'text-white/55'}`}>
                      <InstagramIcon className="h-3.5 w-3.5 text-pink-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold truncate">@{account.instagram_username}</p>
                        <p className="text-[9px] text-white/40 truncate">{account.facebook_page_name}</p>
                      </div>
                      {account.instagram_account_id === metaStatus.instagramId && <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2 pt-2">
            {!metaLoading && (metaStatus?.connected ? (
              <button onClick={handleDisconnect} disabled={disconnecting}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border border-white/[0.08] bg-white/[0.02] text-white/55 hover:text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/5 transition-all disabled:opacity-50 cursor-pointer">
                {disconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2Off className="h-3.5 w-3.5" />}
                {t('disconnectIg')}
              </button>
            ) : (
              <a href="/api/meta/connect"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-[0_0_16px_rgba(236,72,153,0.3)] transition-all text-center cursor-pointer">
                <Link2 className="h-3.5 w-3.5" /> {t('connectIg')}
              </a>
            ))}
            <p className="text-[9px] text-white/30 leading-normal mt-1">{t('igRequirement')}</p>
          </div>
        </motion.div>

        {/* Tile 6: LinkedIn connection (span 2) */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={spring}
          className="md:col-span-2 bg-[#181b25]/40 border border-white/[0.08] hover:border-white/[0.14] rounded-3xl p-5 flex flex-col justify-between gap-4 relative overflow-hidden backdrop-blur-xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-accent-purple/[0.01] to-accent-cyan/[0.01] pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <svg className="h-5 w-5 text-[#0077b5]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white">LinkedIn</p>
                <p className="text-[10.5px] text-white/45 truncate mt-0.5">
                  {linkedinLoading ? t('verifying')
                    : linkedinStatus?.connected ? linkedinStatus.name
                    : t('notConnected')}
                </p>
              </div>
            </div>
            {!linkedinLoading && linkedinStatus?.connected && (
              <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full tracking-wider">
                {t('active')}
              </span>
            )}
          </div>

          <div className="space-y-2 pt-2">
            {!linkedinLoading && (linkedinStatus?.connected ? (
              <button onClick={async () => { setLinkedinDisconnecting(true); await fetch('/api/linkedin/status', { method: 'DELETE' }); setLinkedinStatus({ connected: false, name: null }); setLinkedinDisconnecting(false); }}
                disabled={linkedinDisconnecting}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border border-white/[0.08] bg-white/[0.02] text-white/55 hover:text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/5 transition-all disabled:opacity-50 cursor-pointer">
                {linkedinDisconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2Off className="h-3.5 w-3.5" />}
                {t('disconnectLinkedin')}
              </button>
            ) : (
              <a href="/api/linkedin/connect"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0077b5] hover:bg-[#006097] hover:shadow-[0_0_16px_rgba(0,119,181,0.3)] transition-all text-center cursor-pointer">
                <Link2 className="h-3.5 w-3.5" /> {t('connectLinkedin')}
              </a>
            ))}
            <div className="h-[22px]" />
          </div>
        </motion.div>

        {/* Tile 7: Facebook connection */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={spring}
          className="md:col-span-1 bg-[#181b25]/40 border border-white/[0.08] hover:border-white/[0.14] rounded-3xl p-5 flex flex-col justify-between gap-4 relative overflow-hidden backdrop-blur-xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/[0.03] to-blue-400/[0.03] pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/20">
                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white">Facebook (Página)</p>
                <p className="text-[10.5px] text-white/45 truncate mt-0.5">
                  {facebookLoading ? t('verifying')
                    : facebookStatus?.connected ? `${facebookStatus.pageName}`
                    : t('notConnected')}
                </p>
              </div>
            </div>
            {!facebookLoading && facebookStatus?.connected && (
              <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full tracking-wider">
                {t('active')}
              </span>
            )}
          </div>

          <div className="space-y-2 pt-2">
            {!facebookLoading && (facebookStatus?.connected ? (
              <button onClick={async () => { setFacebookDisconnecting(true); await fetch('/api/facebook/status', { method: 'DELETE' }); setFacebookStatus({ connected: false, pageName: null }); setFacebookDisconnecting(false); }}
                disabled={facebookDisconnecting}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border border-white/[0.08] bg-white/[0.02] text-white/55 hover:text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/5 transition-all disabled:opacity-50 cursor-pointer">
                {facebookDisconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2Off className="h-3.5 w-3.5" />}
                Desconectar
              </button>
            ) : (
              <a href="/api/facebook/connect"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166FE5] transition-all text-center cursor-pointer">
                <Link2 className="h-3.5 w-3.5" /> Conectar Página
              </a>
            ))}
          </div>
        </motion.div>

        {/* Tile 8: Pinterest connection */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={spring}
          className="md:col-span-1 bg-[#181b25]/40 border border-white/[0.08] hover:border-white/[0.14] rounded-3xl p-5 flex flex-col justify-between gap-4 relative overflow-hidden backdrop-blur-xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[#E60023]/[0.03] to-red-400/[0.03] pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-[#E60023]/10 border border-[#E60023]/20">
                <svg className="h-5 w-5 text-[#E60023]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.41 2.967 7.41 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.624 0 12.017 0z"/>
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white">Pinterest</p>
                <p className="text-[10.5px] text-white/45 truncate mt-0.5">
                  {pinterestLoading ? t('verifying')
                    : pinterestStatus?.connected ? `@${pinterestStatus.username}`
                    : t('notConnected')}
                </p>
              </div>
            </div>
            {!pinterestLoading && pinterestStatus?.connected && (
              <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full tracking-wider">
                {t('active')}
              </span>
            )}
          </div>

          <div className="space-y-2 pt-2">
            {!pinterestLoading && (pinterestStatus?.connected ? (
              <button onClick={async () => { setPinterestDisconnecting(true); await fetch('/api/pinterest/status', { method: 'DELETE' }); setPinterestStatus({ connected: false, username: null }); setPinterestDisconnecting(false); }}
                disabled={pinterestDisconnecting}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border border-white/[0.08] bg-white/[0.02] text-white/55 hover:text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/5 transition-all disabled:opacity-50 cursor-pointer">
                {pinterestDisconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2Off className="h-3.5 w-3.5" />}
                Desconectar
              </button>
            ) : (
              <a href="/api/pinterest/connect"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-[#E60023] hover:bg-[#bd001c] transition-all text-center cursor-pointer">
                <Link2 className="h-3.5 w-3.5" /> Conectar Pinterest
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

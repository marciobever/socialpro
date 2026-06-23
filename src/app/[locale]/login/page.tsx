"use client";
import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { BrainCircuit, KeyRound, Mail, ArrowRight, Loader2, Sparkles, Check } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Footer } from '@/components/Footer';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  );
}

const PLAN_INFO: Record<string, { name: string; price: string; color: string; features: string[] }> = {
  pro: {
    name: 'Pro Creator',
    price: 'USD$29/mês',
    color: 'from-accent-purple to-accent-cyan',
    features: ['25 carrosséis/mês com IA', 'Imagens geradas por IA', 'Publicação no Instagram'],
  },
  agency: {
    name: 'Agency Scale',
    price: 'USD$79/mês',
    color: 'from-accent-orange to-accent-pink',
    features: ['60 carrosséis/mês com IA', 'Brand Kits ilimitados', 'Gerente de conta dedicado'],
  },
};

function LoginForm() {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [loading, setLoading]           = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [fbLoading, setFbLoading]       = useState(false);
  const [error, setError]               = useState('');

  const router       = useRouter();
  const searchParams = useSearchParams();
  const { setPlanName } = useAppContext();
  const t = useTranslations('login');

  const planQuery = searchParams.get('plan') || 'starter';
  const planInfo  = PLAN_INFO[planQuery];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setError(t('errors.fillAllFields')); return; }
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) { setError(t('errors.invalidCredentials')); setLoading(false); return; }
      const names: Record<string, string> = { starter: 'Starter Creator', pro: 'Pro Creator', agency: 'Agency Scale' };
      setPlanName(names[planQuery] ?? 'Starter Creator');
      router.push('/app/dashboard');
    } catch {
      setError(t('errors.connectionError'));
      setLoading(false);
    }
  };

  const handleGoogleLogin  = async () => { setGoogleLoading(true);  await signIn('google',   { callbackUrl: '/app/dashboard' }); };
  const handleFacebookLogin = async () => { setFbLoading(true);     await signIn('facebook', { callbackUrl: '/app/dashboard' }); };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-accent-purple/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-accent-cyan/10 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern grid-mask pointer-events-none -z-10" />

      {/* Minimal header */}
      <header className="w-full px-4 md:px-6 pt-5 relative z-50">
        <div className="max-w-7xl mx-auto">
          <div className="glass-panel rounded-2xl px-5 py-3.5 flex items-center justify-between border border-white/5">
            <button onClick={() => router.push('/')} className="flex items-center gap-2.5 group">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-accent-purple to-accent-cyan p-[1px]">
                <div className="flex h-full w-full items-center justify-center rounded-[9px] bg-dark-bg">
                  <BrainCircuit className="h-4 w-4 text-accent-cyan" />
                </div>
              </div>
              <span className="font-display text-sm font-bold text-white">
                Social<span className="bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">Pro</span>
              </span>
            </button>
            <button onClick={() => router.push('/pricing')}
              className="text-xs text-dark-muted hover:text-white transition-colors font-semibold">
              Ver planos →
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[420px] space-y-6">

          {/* Plan banner */}
          {planInfo && (
            <div className={`rounded-2xl p-4 bg-gradient-to-r ${planInfo.color} bg-opacity-10 border border-white/10 space-y-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-white" />
                  <span className="text-xs font-bold text-white">{planInfo.name} — {planInfo.price}</span>
                </div>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/15 text-white tracking-wider">
                  Selecionado
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {planInfo.features.map(f => (
                  <div key={f} className="flex items-center gap-1.5 text-[10px] text-white/80">
                    <Check className="h-3 w-3 text-white" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Card */}
          <div className="glass-panel rounded-3xl p-8 shadow-2xl space-y-6 border border-white/5 bg-[#0d0f17]/80">

            {/* Brand */}
            <div className="text-center space-y-1.5">
              <h1 className="text-xl font-bold text-white">
                {planInfo ? 'Crie sua conta' : 'Bem-vindo de volta'}
              </h1>
              <p className="text-xs text-dark-muted">{t('tagline')}</p>
            </div>

            {/* OAuth */}
            <div className="space-y-2.5">
              <button onClick={handleGoogleLogin} disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-semibold text-white transition-all disabled:opacity-50">
                {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon className="h-4 w-4" />}
                {t('continueWithGoogle')}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-[11px] text-dark-muted font-medium">{t('orWithEmail')}</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {error && (
              <p className="text-xs text-accent-pink font-semibold bg-accent-pink/10 border border-accent-pink/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-dark-muted flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {t('email')}
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="interactive-input" placeholder={t('emailPlaceholder')} disabled={loading} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-dark-muted flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5" /> {t('password')}
                </label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="interactive-input" placeholder={t('passwordPlaceholder')} disabled={loading} />
              </div>
              <button type="submit" disabled={loading || googleLoading || fbLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan shadow-[0_0_16px_rgba(139,92,246,0.3)] hover:shadow-[0_0_24px_rgba(139,92,246,0.5)] transition-all disabled:opacity-50">
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin" />{t('signingIn')}</>
                  : <>{t('signIn')} <ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>

            <p className="text-center text-[10px] text-dark-muted leading-relaxed">
              Ao entrar, você concorda com nossos{' '}
              <a href="/terms" target="_blank" className="text-accent-cyan hover:underline">Termos de Uso</a>{' '}
              e{' '}
              <a href="/privacy" target="_blank" className="text-accent-cyan hover:underline">Política de Privacidade</a>.
            </p>
          </div>

          <p className="text-center text-xs text-dark-muted">
            Não tem conta?{' '}
            <button onClick={() => router.push('/pricing')} className="text-accent-cyan font-semibold hover:underline">
              Ver planos →
            </button>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

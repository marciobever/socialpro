"use client";
import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { BrainCircuit, KeyRound, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function LoginForm() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]       = useState('');

  const router       = useRouter();
  const searchParams = useSearchParams();
  const { setPlanName } = useAppContext();

  const planQuery = searchParams.get('plan') || 'starter';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setError('Preencha todos os campos.'); return; }
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError('E-mail ou senha inválidos.');
        setLoading(false);
        return;
      }
      const names: Record<string, string> = { starter: 'Starter Creator', pro: 'Pro Creator', agency: 'Agency Scale' };
      setPlanName(names[planQuery] ?? 'Starter Creator');
      router.push('/app/dashboard');
    } catch {
      setError('Erro ao conectar. Tente novamente.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    await signIn('google', { callbackUrl: '/app/dashboard' });
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text relative flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent-purple/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent-cyan/10 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern grid-mask pointer-events-none -z-10" />

      <div className="w-full max-w-[400px] relative z-10 space-y-6">

        {/* Brand */}
        <div className="flex flex-col items-center space-y-2 cursor-pointer" onClick={() => router.push('/')}>
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent-purple to-accent-cyan p-[1px]">
            <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-dark-bg">
              <BrainCircuit className="h-6 w-6 brain-neon" />
            </div>
            <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-tr from-accent-purple to-accent-cyan opacity-40 blur-md" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Social<span className="bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">Pro</span>
          </h2>
          <p className="text-xs text-dark-muted">Entre na sua conta para começar</p>
        </div>

        <div className="glass-panel rounded-3xl p-8 shadow-2xl space-y-5 border border-white/5 bg-[#0d0f17]/70">

          {/* Google button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-dark-border bg-white/5 hover:bg-white/10 text-sm font-semibold text-dark-text transition-all disabled:opacity-50"
          >
            {googleLoading
              ? <Loader2 className="h-4 w-4 animate-spin text-dark-muted" />
              : <GoogleIcon className="h-4 w-4" />}
            Continuar com Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-dark-border" />
            <span className="text-[11px] text-dark-muted font-medium">ou entre com e-mail</span>
            <div className="flex-1 h-px bg-dark-border" />
          </div>

          {error && (
            <p className="text-xs text-accent-pink font-semibold bg-accent-pink/10 border border-accent-pink/20 rounded-xl p-3">
              {error}
            </p>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-dark-muted flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="interactive-input"
                placeholder="nome@email.com"
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-dark-muted flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5" /> Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="interactive-input"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan shadow-[0_0_16px_rgba(139,92,246,0.3)] hover:shadow-[0_0_24px_rgba(139,92,246,0.5)] transition-all disabled:opacity-50"
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" />Entrando...</>
                : <>Entrar no Estúdio <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          {planQuery !== 'starter' && (
            <p className="text-[10px] text-accent-cyan text-center font-semibold">
              Plano selecionado: {planQuery.toUpperCase()}
            </p>
          )}
        </div>
      </div>
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

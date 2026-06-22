"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useSession } from 'next-auth/react';
import { Palette, User, Check, Globe, Link2, Link2Off, Loader2, AlertCircle, Upload, X } from 'lucide-react';

interface MetaStatus {
  connected: boolean;
  instagramId:   string | null;
  instagramName: string | null;
  pageName:      string | null;
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}

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

// Resize an image File to max 200×200 px and return as data URL
function resizeImage(file: File, maxSize = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function BrandKitPage() {
  const { brandKit, setBrandKit } = useAppContext();
  const { data: session } = useSession();

  const [name,   setName]   = useState(brandKit.brandName);
  const [handle, setHandle] = useState(brandKit.brandHandle);
  const [avatar, setAvatar] = useState(brandKit.avatarUrl);
  const [bio,    setBio]    = useState(brandKit.aiBio);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [metaStatus,    setMetaStatus]    = useState<MetaStatus | null>(null);
  const [metaLoading,   setMetaLoading]   = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [metaError,     setMetaError]     = useState('');

  // Sync form when context loads from DB (runs once after initial fetch)
  const synced = useRef(false);
  useEffect(() => {
    if (!synced.current && (brandKit.brandName || brandKit.brandHandle || brandKit.avatarUrl || brandKit.aiBio)) {
      synced.current = true;
      setName(brandKit.brandName);
      setHandle(brandKit.brandHandle);
      setAvatar(brandKit.avatarUrl);
      setBio(brandKit.aiBio);
    }
  }, [brandKit]);

  // Read URL params for Meta OAuth result
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('meta_error')) {
      const msgs: Record<string, string> = {
        denied:        'Permissão negada pelo usuário.',
        invalid_state: 'Sessão expirada. Tente novamente.',
        token_exchange:'Erro ao obter token. Verifique o Meta App.',
        server_error:  'Erro interno. Tente novamente.',
        missing_config:'META_APP_ID/SECRET não configurados.',
      };
      setMetaError(msgs[params.get('meta_error')!] ?? 'Erro desconhecido.');
      window.history.replaceState({}, '', '/app/brand');
    }
    if (params.get('meta_connected')) {
      window.history.replaceState({}, '', '/app/brand');
    }
  }, []);

  // Fetch Meta connection status
  useEffect(() => {
    fetch('/api/meta/status')
      .then(r => r.json())
      .then((d: MetaStatus) => {
        setMetaStatus(d);
        // Auto-fill handle from connected Instagram
        if (d?.connected && d.instagramName) {
          const igHandle = `@${d.instagramName}`;
          setHandle(igHandle);
        }
      })
      .catch(() => setMetaStatus({ connected: false, instagramId: null, instagramName: null, pageName: null }))
      .finally(() => setMetaLoading(false));
  }, []);

  const handleDisconnectMeta = async () => {
    setDisconnecting(true);
    await fetch('/api/meta/status', { method: 'DELETE' });
    setMetaStatus({ connected: false, instagramId: null, instagramName: null, pageName: null });
    setDisconnecting(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const dataUrl = await resizeImage(file);
      setAvatar(dataUrl);
    } catch {
      // ignore — keep current avatar
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandName: name, brandHandle: handle, aiBio: bio, avatarUrl: avatar }),
      });
      if (!res.ok) throw new Error('Falha ao salvar');
      const { avatarUrl: savedUrl } = await res.json();
      const finalAvatar = savedUrl || avatar;
      setAvatar(finalAvatar);
      // Update context state (no extra DB call — already saved above)
      setBrandKit({ brandName: name, brandHandle: handle, avatarUrl: finalAvatar, aiBio: bio });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // keep form state as-is
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 space-y-8 max-w-4xl mx-auto py-4 animate-fade-in">

      {/* Header */}
      <div className="space-y-1">
        <span className="text-[10px] tracking-widest font-extrabold text-accent-purple uppercase">Brand Visual Kit</span>
        <h2 className="text-2xl font-bold text-white tracking-tight">Seu Brand Kit</h2>
        <p className="text-sm text-dark-muted">Identidade da marca, contexto de IA e conexões com redes sociais</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left — brand form */}
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6 glass-panel rounded-2xl p-6 border border-dark-border">
          <div className="flex items-center gap-2 pb-4 border-b border-dark-border">
            <div className="p-2 bg-accent-purple/10 border border-accent-purple/20 text-accent-purple rounded-xl">
              <User className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Perfil de Criador</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-dark-muted">Nome de exibição</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="interactive-input" placeholder="Ex: Seu Nome" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-dark-muted">@ Handle / Instagram</label>
              <input type="text" value={handle} onChange={e => setHandle(e.target.value)} className="interactive-input" placeholder="@seu.usuario" />
              {metaStatus?.connected && metaStatus.instagramName && (
                <p className="text-[10px] text-emerald-400">Preenchido automaticamente do Instagram conectado</p>
              )}
            </div>
          </div>

          {/* Avatar upload */}
          <div className="space-y-3">
            <label className="text-[11px] font-semibold text-dark-muted block">Foto de Perfil</label>
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div className="relative flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatar}
                  alt="Avatar preview"
                  className="h-16 w-16 rounded-full object-cover border-2 border-accent-purple"
                />
                {uploading && (
                  <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-accent-purple/30 bg-accent-purple/10 text-accent-purple hover:bg-accent-purple/20 transition-all disabled:opacity-50"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? 'Carregando...' : 'Enviar foto'}
                </button>
                <button
                  type="button"
                  onClick={() => setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-dark-border text-dark-muted hover:text-white hover:border-white/20 transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                  Remover foto
                </button>
              </div>

              {/* URL input fallback */}
              <div className="flex-1 min-w-0">
                <label className="text-[10px] text-dark-muted block mb-1">Ou cole uma URL de imagem</label>
                <input
                  type="url"
                  value={avatar.startsWith('data:') ? '' : avatar}
                  onChange={e => e.target.value && setAvatar(e.target.value)}
                  className="interactive-input text-[11px]"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 pb-4 border-b border-dark-border">
            <label className="text-[11px] font-semibold text-dark-muted block">Contexto da IA (Bio)</label>
            <p className="text-[10px] text-dark-muted leading-relaxed">A IA usa esse texto para personalizar todas as legendas e carrosséis.</p>
            <textarea value={bio} onChange={e => setBio(e.target.value)} className="interactive-input h-28 resize-none py-3"
              placeholder="Ex: Sou estrategista de conteúdo para startups SaaS..." />
          </div>

          <div className="flex justify-between items-center">
            {saved ? (
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                <Check className="h-3.5 w-3.5" /> Salvo!
              </span>
            ) : <div />}
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan hover:shadow-[0_0_16px_rgba(139,92,246,0.4)] transition-all disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>

        {/* Right — preview + connections */}
        <div className="space-y-4">

          {/* Profile preview */}
          <div className="glass-panel rounded-2xl p-5 border border-dark-border text-center space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-dark-border text-left">
              <div className="p-2 bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan rounded-xl">
                <Palette className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Preview</h3>
            </div>
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatar} alt="avatar" className="h-16 w-16 rounded-full object-cover border-2 border-accent-purple mx-auto" />
              <span className="absolute bottom-0 right-0 p-1 rounded-full bg-emerald-500 border-2 border-[#090a0f]">
                <Globe className="h-2.5 w-2.5 text-white" />
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{name || 'Nenhum Nome'}</h4>
              <p className="text-xs text-dark-muted">{handle || '@username'}</p>
            </div>
          </div>

          {/* Connected accounts */}
          <div className="glass-panel rounded-2xl p-5 border border-dark-border space-y-4">
            <h3 className="text-sm font-bold text-white">Contas Conectadas</h3>

            {/* Google */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-dark-border/30 border border-dark-border">
              <div className="flex items-center gap-3">
                <GoogleIcon className="h-5 w-5" />
                <div>
                  <p className="text-xs font-semibold text-dark-text">Google</p>
                  <p className="text-[10px] text-dark-muted">
                    {session?.user?.email ?? 'Não conectado'}
                  </p>
                </div>
              </div>
              {session?.user ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                  <Check className="h-3 w-3" /> Ativo
                </span>
              ) : (
                <span className="text-[10px] text-dark-muted">—</span>
              )}
            </div>

            {/* Instagram / Meta */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-dark-border/30 border border-dark-border">
                <div className="flex items-center gap-3">
                  <InstagramIcon className="h-5 w-5 text-pink-400" />
                  <div>
                    <p className="text-xs font-semibold text-dark-text">Instagram</p>
                    <p className="text-[10px] text-dark-muted">
                      {metaLoading
                        ? 'Verificando...'
                        : metaStatus?.connected
                          ? `@${metaStatus.instagramName ?? metaStatus.pageName ?? 'conectado'}`
                          : 'Não conectado'}
                    </p>
                  </div>
                </div>
                {metaLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-dark-muted" />
                ) : metaStatus?.connected ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                    <Check className="h-3 w-3" /> Ativo
                  </span>
                ) : (
                  <span className="text-[10px] text-dark-muted">—</span>
                )}
              </div>

              {metaError && (
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] text-red-400">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  {metaError}
                </div>
              )}

              {!metaLoading && (
                metaStatus?.connected ? (
                  <button onClick={handleDisconnectMeta} disabled={disconnecting}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border border-dark-border text-dark-muted hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-50">
                    {disconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2Off className="h-3.5 w-3.5" />}
                    Desconectar Instagram
                  </button>
                ) : (
                  <a href="/api/meta/connect"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-[0_0_16px_rgba(236,72,153,0.3)] transition-all">
                    <Link2 className="h-3.5 w-3.5" />
                    Conectar Instagram
                  </a>
                )
              )}

              <p className="text-[10px] text-dark-muted leading-relaxed">
                Necessário uma conta Business ou Creator no Instagram vinculada a uma Página do Facebook.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

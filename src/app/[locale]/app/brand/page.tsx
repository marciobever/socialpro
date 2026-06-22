"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { Palette, User, Check, Globe, Loader2, AlertCircle, Upload, X } from 'lucide-react';

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
        canvas.width = w; canvas.height = h;
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
  const router = useRouter();
  const { brandKit, setBrandKit } = useAppContext();

  const [name,      setName]      = useState(brandKit.brandName);
  const [handle,    setHandle]    = useState(brandKit.brandHandle);
  const [avatar,    setAvatar]    = useState(brandKit.avatarUrl);
  const [bio,       setBio]       = useState(brandKit.aiBio);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [saveError, setSaveError] = useState('');
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form when context loads from DB (runs once)
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const dataUrl = await resizeImage(file);
      setAvatar(dataUrl);
    } catch { /* ignore */ }
    finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandName: name, brandHandle: handle, aiBio: bio, avatarUrl: avatar }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Falha ao salvar');
      const finalAvatar = json?.avatarUrl || avatar;
      setAvatar(finalAvatar);
      setBrandKit({ brandName: name, brandHandle: handle, avatarUrl: finalAvatar, aiBio: bio });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 space-y-8 max-w-4xl mx-auto py-4 animate-fade-in">

      {/* Header */}
      <div className="space-y-1">
        <span className="text-[10px] tracking-widest font-extrabold text-accent-purple uppercase">Identidade Visual</span>
        <h2 className="text-2xl font-bold text-dark-text tracking-tight">Brand Kit</h2>
        <p className="text-sm text-dark-muted">Nome, foto e contexto de IA da sua marca</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Form */}
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6 glass-panel rounded-2xl p-6 border border-dark-border">
          <div className="flex items-center gap-2 pb-4 border-b border-dark-border">
            <div className="p-2 bg-accent-purple/10 border border-accent-purple/20 text-accent-purple rounded-xl">
              <User className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-dark-text">Perfil de Criador</h3>
          </div>

          {/* Name + Handle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-dark-muted">Nome de exibição</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="interactive-input" placeholder="Ex: Festa Mágica IA" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-dark-muted">@ Handle / Instagram</label>
              <input type="text" value={handle} onChange={e => setHandle(e.target.value)}
                className="interactive-input" placeholder="@seu.usuario" />
              <p className="text-[10px] text-dark-muted">
                Mude a conta conectada em{' '}
                <button type="button" onClick={() => router.push('/app/account')}
                  className="text-accent-cyan hover:underline">Conta →</button>
              </p>
            </div>
          </div>

          {/* Avatar */}
          <div className="space-y-3">
            <label className="text-[11px] font-semibold text-dark-muted block">Foto de Perfil</label>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100'}
                  alt="Avatar" className="h-16 w-16 rounded-full object-cover border-2 border-accent-purple" />
                {uploading && (
                  <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-accent-purple/30 bg-accent-purple/10 text-accent-purple hover:bg-accent-purple/20 transition-all disabled:opacity-50">
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? 'Carregando...' : 'Enviar foto'}
                </button>
                <button type="button" onClick={() => setAvatar('')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-dark-border text-dark-muted hover:text-white hover:border-white/20 transition-all">
                  <X className="h-3.5 w-3.5" /> Remover
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-[10px] text-dark-muted block mb-1">Ou cole uma URL</label>
                <input type="url" value={avatar.startsWith('data:') ? '' : avatar}
                  onChange={e => e.target.value && setAvatar(e.target.value)}
                  className="interactive-input text-[11px]" placeholder="https://..." />
              </div>
            </div>
          </div>

          {/* AI Bio */}
          <div className="space-y-2 pb-4 border-b border-dark-border">
            <label className="text-[11px] font-semibold text-dark-muted block">Contexto da IA (Bio)</label>
            <p className="text-[10px] text-dark-muted leading-relaxed">A IA usa esse texto para personalizar legendas e carrosséis com a sua voz.</p>
            <textarea value={bio} onChange={e => setBio(e.target.value)}
              className="interactive-input h-28 resize-none py-3"
              placeholder="Ex: Sou especialista em festas infantis e ajudo famílias a criarem momentos mágicos..." />
          </div>

          {/* Save */}
          <div className="flex justify-between items-center">
            {saved ? (
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                <Check className="h-3.5 w-3.5" /> Salvo!
              </span>
            ) : saveError ? (
              <span className="flex items-center gap-1.5 text-[11px] text-red-400 font-semibold">
                <AlertCircle className="h-3.5 w-3.5" /> {saveError}
              </span>
            ) : <div />}
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan hover:shadow-[0_0_16px_rgba(139,92,246,0.4)] transition-all disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>

        {/* Preview */}
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-dark-border text-center space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-dark-border text-left">
              <div className="p-2 bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan rounded-xl">
                <Palette className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-dark-text">Preview</h3>
            </div>
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100'}
                alt="avatar" className="h-16 w-16 rounded-full object-cover border-2 border-accent-purple mx-auto" />
              <span className="absolute bottom-0 right-0 p-1 rounded-full bg-emerald-500 border-2 border-[#090a0f]">
                <Globe className="h-2.5 w-2.5 text-white" />
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-dark-text">{name || 'Nenhum Nome'}</h4>
              <p className="text-xs text-dark-muted">{handle || '@username'}</p>
            </div>
            {bio && (
              <p className="text-[10px] text-dark-muted leading-relaxed italic text-left border-t border-dark-border pt-3">
                {bio.slice(0, 120)}{bio.length > 120 ? '...' : ''}
              </p>
            )}
          </div>

          {/* Link to account for connections */}
          <button onClick={() => router.push('/app/account')}
            className="w-full glass-panel rounded-2xl border border-dark-border p-4 flex items-center gap-3 hover:border-accent-purple/30 hover:bg-white/[0.02] transition-all group text-left">
            <div className="p-2 bg-accent-purple/10 border border-accent-purple/20 rounded-xl">
              <svg className="h-4 w-4 text-accent-purple" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-dark-text group-hover:text-accent-cyan transition-colors">Contas Conectadas</p>
              <p className="text-[10px] text-dark-muted">Gerenciar Instagram e Google em Conta →</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

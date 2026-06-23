"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { BrainCircuit, ArrowRight, Upload, Sparkles, Link2, Check, Loader2 } from 'lucide-react';

const STEPS = [
  {
    id: 'name',
    emoji: '👋',
    title: 'Bem-vindo ao SocialPro!',
    subtitle: 'Primeiro, como você quer ser identificado na plataforma?',
    tip: 'Isso aparece nos carrosséis e na barra de navegação.',
  },
  {
    id: 'bio',
    emoji: '🧠',
    title: 'Me conte sobre sua marca',
    subtitle: 'Isso ajuda a IA a criar conteúdo com a sua voz — seja criador, agência ou empresa.',
    tip: 'Quanto mais específico, melhor o resultado da IA.',
  },
  {
    id: 'photo',
    emoji: '📸',
    title: 'Adicione uma foto de perfil',
    subtitle: 'Ela aparece como watermark nos seus carrosséis.',
    tip: 'Pode pular agora e adicionar depois em Brand Kit.',
  },
  {
    id: 'done',
    emoji: '🚀',
    title: 'Tudo certo! Vamos criar!',
    subtitle: 'Seu perfil está configurado. Agora é hora de gerar seu primeiro carrossel viral.',
    tip: 'Você pode conectar o Instagram mais tarde em Conta.',
  },
];

function resizeImage(file: File, maxSize = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function OnboardingPage() {
  const router = useRouter();
  const { setBrandKit } = useAppContext();

  const [step,     setStep]     = useState(0);
  const [name,     setName]     = useState('');
  const [handle,   setHandle]   = useState('');
  const [bio,      setBio]      = useState('');
  const [avatar,   setAvatar]   = useState('');
  const [saving,   setSaving]   = useState(false);
  const [uploading,setUploading]= useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { setAvatar(await resizeImage(file)); } catch { /* ignore */ }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const canAdvance = () => {
    if (step === 0) return name.trim().length > 0 && handle.trim().length > 0;
    if (step === 1) return bio.trim().length > 20;
    return true;
  };

  const handleNext = async () => {
    if (!canAdvance()) return;
    if (isLast) {
      setSaving(true);
      try {
        const finalHandle = handle.startsWith('@') ? handle : `@${handle}`;
        await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brandName: name, brandHandle: finalHandle, aiBio: bio, avatarUrl: avatar }),
        });
        setBrandKit({ brandName: name, brandHandle: finalHandle, avatarUrl: avatar, aiBio: bio });
        router.push('/app/dashboard');
      } finally { setSaving(false); }
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-accent-purple/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-accent-cyan/10 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern grid-mask pointer-events-none -z-10" />

      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-accent-purple to-accent-cyan p-[1px]">
          <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-dark-bg">
            <BrainCircuit className="h-5 w-5 text-accent-cyan" />
          </div>
        </div>
        <span className="font-display text-lg font-bold text-white">
          Social<span className="bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">Pro</span>
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((_, i) => (
          <div key={i} className={`rounded-full transition-all duration-500 ${
            i === step ? 'w-8 h-2 bg-accent-purple' :
            i < step   ? 'w-2 h-2 bg-accent-purple/50' :
                         'w-2 h-2 bg-dark-border'
          }`} />
        ))}
      </div>

      {/* Card */}
      <div className="w-full max-w-lg glass-panel rounded-3xl border border-dark-border p-8 space-y-6 shadow-2xl animate-fade-in">

        {/* Emoji + title */}
        <div className="text-center space-y-3">
          <span className="text-5xl">{current.emoji}</span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{current.title}</h1>
          <p className="text-sm text-dark-muted leading-relaxed">{current.subtitle}</p>
        </div>

        {/* Step content */}
        {step === 0 && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-dark-muted">Seu nome ou nome da marca *</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handle && handleNext()}
                autoFocus className="interactive-input text-sm" placeholder="Ex: Festa Mágica IA"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-dark-muted">@ Instagram / Handle *</label>
              <input
                type="text" value={handle} onChange={e => setHandle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && name && handleNext()}
                className="interactive-input text-sm" placeholder="@festamagicaia"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-dark-muted">Contexto para a IA *</label>
              <textarea
                value={bio} onChange={e => setBio(e.target.value)}
                autoFocus rows={5} className="interactive-input resize-none text-sm py-3"
                placeholder="Ex: Sou especialista em festas infantis. Ajudo famílias a criar momentos mágicos com kits de decoração acessíveis e criativas. Meu tom é alegre, caloroso e inspirador."
              />
              <p className="text-[10px] text-dark-muted">Mínimo 20 caracteres. {bio.length}/20</p>
            </div>
            <div className="p-3 rounded-xl bg-accent-purple/5 border border-accent-purple/20 flex items-start gap-2">
              <Sparkles className="h-3.5 w-3.5 text-accent-purple flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-accent-purple leading-relaxed">
                Quanto mais específico, mais personalizado será cada carrossel gerado pela IA.
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            <div className="flex flex-col items-center gap-4">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="Avatar" className="h-24 w-24 rounded-full object-cover border-4 border-accent-purple/40" />
              ) : (
                <div className="h-24 w-24 rounded-full bg-dark-border/60 border-2 border-dashed border-dark-border flex items-center justify-center">
                  <Upload className="h-8 w-8 text-dark-muted" />
                </div>
              )}
              <button
                type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-accent-purple/30 bg-accent-purple/10 text-accent-purple text-sm font-bold hover:bg-accent-purple/20 transition-all disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {avatar ? 'Trocar foto' : 'Escolher foto'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            {/* Preview */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100'}
                alt="Avatar" className="h-14 w-14 rounded-full object-cover border-2 border-accent-purple/30"
              />
              <div>
                <p className="text-sm font-bold text-white">{name}</p>
                <p className="text-xs text-dark-muted">{handle.startsWith('@') ? handle : `@${handle}`}</p>
                <p className="text-[10px] text-dark-muted mt-1 line-clamp-1 italic">{bio}</p>
              </div>
            </div>

            {/* Quick tips */}
            <div className="space-y-2">
              {[
                { icon: Sparkles, color: 'text-accent-purple', text: 'Digite um tema e clique "Gerar carrossel"' },
                { icon: BrainCircuit, color: 'text-accent-cyan', text: 'A IA gera texto + imagens automaticamente' },
                { icon: Link2, color: 'text-pink-400', text: 'Publique direto no Instagram com 1 clique' },
              ].map(({ icon: Icon, color, text }, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="p-1.5 rounded-lg bg-white/5 flex-shrink-0">
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                  </div>
                  <span className="text-xs text-dark-muted">{text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tip */}
        <p className="text-[10px] text-dark-muted text-center italic">{current.tip}</p>

        {/* Actions */}
        <div className="flex gap-3">
          {step === 2 && (
            <button onClick={handleNext} className="flex-1 py-3 rounded-xl text-sm font-semibold border border-dark-border text-dark-muted hover:text-white transition-all">
              Pular por agora
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canAdvance() || saving}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 ${
              step === 2 ? 'w-auto px-6' : 'flex-1'
            } bg-gradient-to-r from-accent-purple to-accent-cyan hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]`}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> :
             isLast  ? <><Check className="h-4 w-4" /> Entrar no Estúdio</> :
                       <>Próximo <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>

      {/* Step counter */}
      <p className="mt-6 text-[10px] text-dark-muted">Passo {step + 1} de {STEPS.length}</p>
    </div>
  );
}

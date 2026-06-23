"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { BrainCircuit, User, Link2, Sparkles, ChevronRight, X } from 'lucide-react';

const STEPS = [
  { id: 'welcome',   icon: BrainCircuit, title: 'Bem-vindo ao SocialPro!',        desc: 'Crie carrosséis virais para Instagram com IA em segundos.' },
  { id: 'brand',     icon: User,         title: 'Configure seu perfil',            desc: 'Personalize sua marca para que a IA escreva com sua voz.' },
  { id: 'instagram', icon: Link2,         title: 'Conecte seu Instagram',           desc: 'Publique direto no Instagram sem sair do SocialPro.' },
  { id: 'generate',  icon: Sparkles,     title: 'Gere seu primeiro carrossel',     desc: 'Digite um tema e a IA cria texto e imagens automaticamente.' },
];

const ONBOARDING_KEY = 'socialpro:onboarding_done';

export function OnboardingWizard() {
  const router = useRouter();
  const { brandKit } = useAppContext();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const done = localStorage.getItem(ONBOARDING_KEY);
      if (!done) setVisible(true);
    } catch { /* ignore */ }
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(ONBOARDING_KEY, '1'); } catch { /* ignore */ }
    setVisible(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      dismiss();
    }
  };

  const handleAction = () => {
    const id = STEPS[step].id;
    if (id === 'brand') {
      router.push('/app/brand');
      dismiss();
    } else if (id === 'instagram') {
      router.push('/app/account');
      dismiss();
    } else if (id === 'generate') {
      dismiss();
    } else {
      next();
    }
  };

  if (!visible) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isProfileSet = !!(brandKit.brandName && brandKit.brandName !== 'Seu Nome');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative glass-panel rounded-3xl border border-dark-border w-full max-w-md p-6 space-y-5 shadow-2xl animate-fade-in">

        <button onClick={dismiss} className="absolute top-4 right-4 text-dark-muted hover:text-dark-text transition-colors">
          <X className="h-4 w-4" />
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${
              i === step ? 'w-6 bg-accent-purple' : i < step ? 'w-2 bg-accent-purple/40' : 'w-2 bg-dark-border'
            }`} />
          ))}
        </div>

        {/* Icon */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-accent-purple/20 to-accent-cyan/20 border border-accent-purple/20">
            <Icon className="h-6 w-6 text-accent-purple" />
          </div>
          <div>
            <h2 className="text-base font-bold text-dark-text">{current.title}</h2>
            <p className="text-xs text-dark-muted mt-0.5">{current.desc}</p>
          </div>
        </div>

        {/* Step-specific content */}
        {current.id === 'welcome' && (
          <div className="grid grid-cols-2 gap-3">
            {['Carrosséis com IA', 'Imagens geradas', 'Publicação direta', 'Analytics'].map(f => (
              <div key={f} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-dark-muted">
                <Sparkles className="h-3 w-3 text-accent-cyan flex-shrink-0" />{f}
              </div>
            ))}
          </div>
        )}

        {current.id === 'brand' && (
          <div className="p-3 rounded-xl bg-accent-purple/5 border border-accent-purple/20 text-xs text-dark-muted">
            {isProfileSet
              ? <span className="text-emerald-400">✓ Perfil configurado como <strong>{brandKit.brandName}</strong></span>
              : 'Configure nome, foto e bio para a IA personalizar seu conteúdo.'}
          </div>
        )}

        {current.id === 'instagram' && (
          <div className="p-3 rounded-xl bg-pink-500/5 border border-pink-500/20 text-xs text-dark-muted">
            Conecte sua conta Business ou Creator para publicar carrosséis com 1 clique.
          </div>
        )}

        {current.id === 'generate' && (
          <div className="p-3 rounded-xl bg-accent-cyan/5 border border-accent-cyan/20 text-xs text-dark-muted">
            Vá para o <strong className="text-white">Estúdio</strong>, escolha um tema, clique em <strong className="text-white">Gerar carrossel</strong> e assista a IA trabalhar!
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <button onClick={dismiss} className="text-xs text-dark-muted hover:text-dark-text transition-colors">
            Pular tutorial
          </button>
          <button onClick={handleAction}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan hover:shadow-[0_0_16px_rgba(139,92,246,0.4)] transition-all">
            {step === STEPS.length - 1 ? 'Começar!' : current.id === 'welcome' ? 'Próximo' : current.id === 'brand' ? 'Configurar perfil' : current.id === 'instagram' ? 'Conectar Instagram' : 'Próximo'}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

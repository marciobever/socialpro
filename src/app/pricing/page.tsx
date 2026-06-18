"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, BrainCircuit, Sparkles, HelpCircle, ArrowLeft } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  desc: string;
  features: string[];
  recommended: boolean;
  color: string;
  glowColor: string;
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter Creator',
    priceMonthly: 0,
    priceYearly: 0,
    desc: 'O essencial para começar a dar forma às suas primeiras ideias.',
    features: [
      'Geração de textos básicos',
      'Até 3 slides por carrossel',
      '1 Brand Kit salvo',
      'Preview básico de redes',
    ],
    recommended: false,
    color: 'border-white/5 bg-white/[0.01]',
    glowColor: 'group-hover:bg-white/10',
  },
  {
    id: 'pro',
    name: 'Pro Creator',
    priceMonthly: 29,
    priceYearly: 22,
    desc: 'Para criadores profissionais que querem consistência e conversão.',
    features: [
      'Criação de textos ilimitada',
      'Geração de carrosséis sem limites (até 8 slides)',
      'Tons de voz avançados da IA (🌶️, 👔, 📖, ⚡)',
      'Acesso ao Banco de Ideias Virais',
      'Calendário Editorial e Analytics Pro',
      'Suporte prioritário via Discord',
    ],
    recommended: true,
    color: 'border-accent-purple/30 bg-accent-purple/[0.03]',
    glowColor: 'bg-gradient-to-tr from-accent-purple to-accent-cyan',
  },
  {
    id: 'agency',
    name: 'Agency Scale',
    priceMonthly: 79,
    priceYearly: 62,
    desc: 'O poder máximo da IA para agências, marcas e times em crescimento.',
    features: [
      'Tudo do plano Pro Creator',
      'Brand Kits ilimitados (multi-perfis)',
      'Exportação de carrosséis em formato Figma/PDF',
      'Análises avançadas de concorrência',
      'Modelos de roteiros personalizados por IA',
      'Gerente de conta exclusivo',
    ],
    recommended: false,
    color: 'border-white/5 bg-white/[0.01]',
    glowColor: 'group-hover:bg-white/10',
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const router = useRouter();

  const handleSelectPlan = (planId: string) => {
    // Navigate to login, storing the plan in state/url so we can unlock it later
    router.push(`/login?plan=${planId}`);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text relative flex flex-col justify-between overflow-x-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent-cyan/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-accent-purple/10 blur-[150px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-grid-pattern grid-mask pointer-events-none -z-10"></div>

      {/* Header */}
      <header className="w-full px-6 py-4 relative z-50">
        <div className="mx-auto max-w-7xl">
          <div className="glass-panel rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-accent-purple to-accent-cyan p-[1px]">
                <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-dark-bg">
                  <BrainCircuit className="h-5 w-5 text-accent-cyan" />
                </div>
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-white">
                Social<span className="bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">Pro</span>
              </span>
            </div>

            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar
            </button>
          </div>
        </div>
      </header>

      {/* Pricing Container */}
      <main className="max-w-6xl w-full mx-auto px-6 py-12 space-y-12 relative z-10 flex-1 flex flex-col justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-accent-purple shadow-sm max-w-max mx-auto">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Retorno de Investimento Imediato</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Escolha o plano ideal para o seu crescimento.
          </h1>
          <p className="text-sm text-dark-muted max-w-lg mx-auto">
            Sem contratos longos. Cancele ou mude de plano a qualquer momento.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="flex items-center justify-center gap-3 pt-6">
            <span className={`text-xs font-semibold transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-dark-muted'}`}>Faturamento Mensal</span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-12 h-6 bg-white/5 border border-white/10 rounded-full p-1 transition-all"
            >
              <div 
                className={`w-4 h-4 bg-accent-cyan rounded-full shadow-md transition-all ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-semibold transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-dark-muted'}`}>Faturamento Anual</span>
              <span className="text-[9px] font-extrabold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md uppercase">Economize 20%</span>
            </div>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto w-full">
          {PLANS.map((plan) => {
            const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
            
            return (
              <div
                key={plan.id}
                className={`glass-panel rounded-3xl p-8 border flex flex-col justify-between relative group overflow-hidden transition-all duration-300 hover:-translate-y-1.5 ${
                  plan.recommended 
                    ? 'border-accent-purple bg-accent-purple/[0.03] shadow-[0_20px_50px_rgba(139,92,246,0.15)] scale-105 z-10' 
                    : 'border-white/5 bg-white/[0.01]'
                }`}
              >
                {/* Neon glow effect for recommended */}
                {plan.recommended && (
                  <div className="absolute top-0 right-10 left-10 h-[1px] bg-gradient-to-r from-transparent via-accent-purple to-transparent blur-sm"></div>
                )}

                <div className="space-y-6">
                  {/* Plan Name & Tag */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-display text-lg font-bold text-white tracking-tight">{plan.name}</h3>
                      <p className="text-[11px] text-dark-muted mt-1 leading-relaxed">{plan.desc}</p>
                    </div>
                    {plan.recommended && (
                      <span className="text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-accent-purple/20 border border-accent-purple/40 text-accent-purple tracking-wider">
                        Recomendado
                      </span>
                    )}
                  </div>

                  {/* Pricing Display */}
                  <div>
                    <div className="flex items-baseline text-white">
                      <span className="text-sm font-bold">USD$</span>
                      <span className="text-4xl font-extrabold tracking-tight font-display">{price}</span>
                      <span className="text-xs text-dark-muted ml-1 font-medium">/mês</span>
                    </div>
                    {billingCycle === 'yearly' && price > 0 && (
                      <p className="text-[9px] text-emerald-400 font-bold mt-1">Cobrado anualmente (economia de USD$ {plan.priceMonthly * 12 - plan.priceYearly * 12} /ano)</p>
                    )}
                  </div>

                  <hr className="border-white/5" />

                  {/* Feature Checklist */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-dark-muted">
                        <Check className="h-4 w-4 text-accent-cyan flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan Button */}
                <div className="pt-8">
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all relative overflow-hidden group/btn ${
                      plan.recommended
                        ? 'bg-gradient-to-r from-accent-purple to-accent-cyan text-white shadow-lg'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
                    }`}
                  >
                    <span>Começar Agora</span>
                    {/* Glowing effect inside button */}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Acordion FAQ list */}
        <div className="max-w-2xl mx-auto w-full pt-16 border-t border-white/5 space-y-6">
          <h3 className="font-display text-lg font-bold text-white text-center">Perguntas Frequentes</h3>
          <div className="space-y-4">
            {[
              { q: 'Como funciona a simulação da IA?', a: 'SocialPro utiliza um gerador determinístico inteligente em ambiente Sandbox para simular respostas otimizadas instantaneamente, sem consumir créditos de chaves externas.' },
              { q: 'Posso alterar meu plano a qualquer momento?', a: 'Sim! Você pode fazer upgrade ou downgrade de planos diretamente nas configurações do seu Brand Kit, com reajuste de cobrança proporcional.' }
            ].map((faq, i) => (
              <div key={i} className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex gap-3 text-left">
                <HelpCircle className="h-5 w-5 text-accent-purple flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">{faq.q}</h4>
                  <p className="text-[11px] text-dark-muted leading-relaxed mt-1">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-white/5 bg-[#050609] text-center text-xs text-dark-muted relative z-10">
        <p>© 2026 SocialPro. Projetado para máxima conversão estética.</p>
      </footer>
    </div>
  );
}

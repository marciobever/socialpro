"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Check, Sparkles, HelpCircle } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { PublicHeader } from '@/components/PublicHeader';
import { PricingJsonLd } from '@/components/JsonLd';

const PLAN_NAMES: Record<string, string> = {
  starter: 'Starter Creator',
  pro: 'Pro Creator',
  agency: 'Agency Scale',
};

const PLAN_CONFIGS = [
  { id: 'starter', priceMonthly: 0,  priceYearly: 0,  recommended: false, featureKeys: ['f1','f2','f3','f4'] as const },
  { id: 'pro',     priceMonthly: 29, priceYearly: 22, recommended: true,  featureKeys: ['f1','f2','f3','f4','f5','f6'] as const },
  { id: 'agency',  priceMonthly: 79, priceYearly: 62, recommended: false, featureKeys: ['f1','f2','f3','f4','f5','f6'] as const },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const router = useRouter();
  const t = useTranslations('pricing');

  const handleSelectPlan = (planId: string) => {
    router.push(`/login?plan=${planId}`);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text relative flex flex-col justify-between overflow-x-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent-cyan/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-accent-purple/10 blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern grid-mask pointer-events-none -z-10" />

      <PricingJsonLd />
      <PublicHeader showBack backLabel={t('back')} backHref="/" />

      {/* Main */}
      <main className="max-w-6xl w-full mx-auto px-6 py-12 space-y-12 relative z-10 flex-1 flex flex-col justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-accent-purple shadow-sm max-w-max mx-auto">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t('badge')}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {t('title')}
          </h1>
          <p className="text-sm text-dark-muted max-w-lg mx-auto">{t('subtitle')}</p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 pt-6">
            <span className={`text-xs font-semibold transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-dark-muted'}`}>
              {t('billingMonthly')}
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-12 h-6 bg-white/5 border border-white/10 rounded-full p-1 transition-all"
            >
              <div className={`w-4 h-4 bg-accent-cyan rounded-full shadow-md transition-all ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-semibold transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-dark-muted'}`}>
                {t('billingYearly')}
              </span>
              <span className="text-[9px] font-extrabold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md uppercase">
                {t('save20')}
              </span>
            </div>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto w-full">
          {PLAN_CONFIGS.map((plan) => {
            const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
            const ns = `plans.${plan.id}` as const;

            return (
              <div
                key={plan.id}
                className={`glass-panel rounded-3xl p-8 border flex flex-col justify-between relative group overflow-hidden transition-all duration-300 hover:-translate-y-1.5 ${
                  plan.recommended
                    ? 'border-accent-purple bg-accent-purple/[0.03] shadow-[0_20px_50px_rgba(139,92,246,0.15)] scale-105 z-10'
                    : 'border-white/5 bg-white/[0.01]'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute top-0 right-10 left-10 h-[1px] bg-gradient-to-r from-transparent via-accent-purple to-transparent blur-sm" />
                )}

                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-display text-lg font-bold text-white tracking-tight">
                        {PLAN_NAMES[plan.id]}
                      </h3>
                      <p className="text-[11px] text-dark-muted mt-1 leading-relaxed">{t(`${ns}.desc` as never)}</p>
                    </div>
                    {plan.recommended && (
                      <span className="text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-accent-purple/20 border border-accent-purple/40 text-accent-purple tracking-wider">
                        {t('recommended')}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-baseline text-white">
                      <span className="text-sm font-bold">USD$</span>
                      <span className="text-4xl font-extrabold tracking-tight font-display">{price}</span>
                      <span className="text-xs text-dark-muted ml-1 font-medium">{t('perMonth')}</span>
                    </div>
                    {billingCycle === 'yearly' && price > 0 && (
                      <p className="text-[9px] text-emerald-400 font-bold mt-1">
                        {t('billedYearly', { amount: plan.priceMonthly * 12 - plan.priceYearly * 12 })}
                      </p>
                    )}
                  </div>

                  <hr className="border-white/5" />

                  <ul className="space-y-3">
                    {plan.featureKeys.map((fk) => (
                      <li key={fk} className="flex items-start gap-2.5 text-xs text-dark-muted">
                        <Check className="h-4 w-4 text-accent-cyan flex-shrink-0 mt-0.5" />
                        <span>{t(`${ns}.${fk}` as never)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all relative overflow-hidden group/btn ${
                      plan.recommended
                        ? 'bg-gradient-to-r from-accent-purple to-accent-cyan text-white shadow-lg'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
                    }`}
                  >
                    <span>{t('cta')}</span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto w-full pt-16 border-t border-white/5 space-y-6">
          <h3 className="font-display text-lg font-bold text-white text-center">{t('faqTitle')}</h3>
          <div className="space-y-4">
            {(['1','2'] as const).map((n) => (
              <div key={n} className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex gap-3 text-left">
                <HelpCircle className="h-5 w-5 text-accent-purple flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">{t(`faq${n}q` as never)}</h4>
                  <p className="text-[11px] text-dark-muted leading-relaxed mt-1">{t(`faq${n}a` as never)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

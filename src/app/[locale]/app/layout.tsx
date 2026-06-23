"use client";
import React from 'react';
import { TopNav } from '@/components/TopNav';
import { useAppContext } from '@/context/AppContext';
import { OnboardingWizard } from '@/components/OnboardingWizard';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { brandKit, planName } = useAppContext();
  return (
    <div className="min-h-screen flex flex-col bg-dark-bg text-dark-text overflow-x-hidden">
      <div className="fixed inset-0 bg-grid-pattern grid-mask pointer-events-none -z-10 opacity-40" />
      <div className="fixed top-0 left-1/4 w-72 h-72 rounded-full bg-accent-purple/4 blur-[100px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-72 h-72 rounded-full bg-accent-cyan/4 blur-[100px] pointer-events-none -z-10" />
      <TopNav brandName={brandKit.brandName} brandHandle={brandKit.brandHandle} avatarUrl={brandKit.avatarUrl} planName={planName} />
      <OnboardingWizard />
      <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 md:px-6 py-4">
        {children}
      </main>
    </div>
  );
}

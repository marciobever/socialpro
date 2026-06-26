"use client";
import React, { useEffect } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Loader2 } from 'lucide-react';
import { TopNav } from '@/components/TopNav';
import { useAppContext } from '@/context/AppContext';

const DEFAULT_NAMES = ['', 'Seu Nome', 'Meu perfil'];

// Pages under /app that are reachable WITHOUT an active plan.
const PLAN_EXEMPT = ['/app/onboarding', '/app/account'];

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg">
      <Loader2 className="h-6 w-6 animate-spin text-accent-purple" />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { brandKit, planName, subscription, profileLoaded } = useAppContext();
  const pathname = usePathname();
  const router   = useRouter();

  const isOnboarding = pathname?.includes('/onboarding');
  const isAccount    = PLAN_EXEMPT.some(p => pathname?.includes(p));

  // Both profile and subscription must be loaded before we can decide the gate.
  const ready = profileLoaded && subscription !== null;
  const needsOnboarding = DEFAULT_NAMES.includes(brandKit.brandName);
  const hasActivePlan   = !!subscription && ['active', 'trialing'].includes(subscription.status);
  const needsPlan       = !isAccount && !needsOnboarding && !hasActivePlan;

  useEffect(() => {
    if (isOnboarding || !ready) return;
    // 1) Profile not configured → onboarding wizard (always first).
    if (needsOnboarding) { router.replace('/app/onboarding'); return; }
    // 2) Profile ok but no active plan → pricing (paid-only access).
    if (needsPlan) { router.replace('/pricing'); }
  }, [isOnboarding, ready, needsOnboarding, needsPlan, router]);

  // Onboarding renders standalone (no nav, no gate).
  if (isOnboarding) return <>{children}</>;

  // Hold the UI until we know the user is allowed — prevents the dashboard
  // (menus, panels) from flashing before the wizard / pricing redirect.
  if (!ready || needsOnboarding || needsPlan) return <FullScreenLoader />;

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg text-dark-text overflow-x-hidden">
      <div className="fixed inset-0 bg-grid-pattern grid-mask pointer-events-none -z-10 opacity-40" />
      <div className="fixed top-0 left-1/4 w-72 h-72 rounded-full bg-accent-purple/4 blur-[100px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-72 h-72 rounded-full bg-accent-cyan/4 blur-[100px] pointer-events-none -z-10" />
      <TopNav brandName={brandKit.brandName} brandHandle={brandKit.brandHandle} avatarUrl={brandKit.avatarUrl} planName={planName} />
      <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 md:px-6 py-4">
        {children}
      </main>
    </div>
  );
}

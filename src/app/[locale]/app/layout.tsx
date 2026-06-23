"use client";
import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TopNav } from '@/components/TopNav';
import { useAppContext } from '@/context/AppContext';

const DEFAULT_NAMES = ['', 'Seu Nome', 'Meu perfil'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { brandKit, planName } = useAppContext();
  const pathname = usePathname();
  const router   = useRouter();

  // Redirect new users to onboarding if profile not set
  // Wait for brandKit to load from DB before redirecting
  useEffect(() => {
    const isOnboarding = pathname?.includes('/onboarding');
    if (isOnboarding) return;

    // Only redirect after context has had time to load from DB
    // brandKit starts empty, then loads — if still empty after a tick, it's a new user
    const timer = setTimeout(() => {
      if (DEFAULT_NAMES.includes(brandKit.brandName)) {
        router.push('/app/onboarding');
      }
    }, 1500); // give DB fetch time to complete

    return () => clearTimeout(timer);
  }, [brandKit.brandName, pathname, router]);

  const isOnboarding = pathname?.includes('/onboarding');

  if (isOnboarding) {
    return <>{children}</>;
  }

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

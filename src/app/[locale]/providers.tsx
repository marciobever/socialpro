"use client";
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/Toast';
import { AppContextProvider } from '@/context/AppContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppContextProvider>{children}</AppContextProvider>
      <Toaster />
    </SessionProvider>
  );
}

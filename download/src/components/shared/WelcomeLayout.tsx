"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  const { state } = useAppContext();
  const router = useRouter();

   useEffect(() => {
    if (!state.isLoading && !state.user) {
      router.replace('/');
    }
  }, [state.isLoading, state.user, router]);


  if (state.isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
            <p className="text-muted-foreground">Cargando tu experiencia...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

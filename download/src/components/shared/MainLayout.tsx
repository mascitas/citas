"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { useAppContext } from '@/context/AppContext';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { state } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!state.isLoading && !state.user) {
      router.replace('/');
    }
  }, [state.isLoading, state.user, router]);

  if (!state.profile) {
    // This can happen briefly when a user is logged in but profile is being fetched
    // or if they need to create their profile.
    // The main layout navigator will handle redirection.
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
            <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import MainLayout from '@/components/shared/MainLayout';
import WelcomeLayout from '@/components/shared/WelcomeLayout';
import { useAppContext } from '@/context/AppContext';

export default function Layout({ children }: { children: React.ReactNode }) {
    const { state, dispatch } = useAppContext();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // If loading is finished and there's no user, redirect to login page.
        if (!state.isLoading && !state.user) {
            router.replace('/');
        }
    }, [state.isLoading, state.user, router]);
    
    // On app load, check if there's a match to redirect to for celebration
    useEffect(() => {
      if (state.redirectMatchId) {
        const match = state.matches.find(m => m.id === state.redirectMatchId);
        if (match) {
            router.replace(`/celebration/${state.redirectMatchId}`);
            dispatch({ type: 'CLEAR_REDIRECT_MATCH' });
        }
      }
    }, [state.redirectMatchId, state.matches, router, dispatch]);

    // On app load, check if there's a request waiting for final approval to show celebration
    useEffect(() => {
        if (state.pendingApprovalMatchId && state.profile) {
            const request = state.requests.find(r => r.id === state.pendingApprovalMatchId);
            // Check if the current user is the one who needs to approve
            if (request && request.from.id === state.profile.id && request.status === 'awaiting_final_approval') {
                router.replace(`/match-success/${request.id}`);
                dispatch({ type: 'CLEAR_PENDING_APPROVAL_MATCH' });
            }
        }
    }, [state.pendingApprovalMatchId, state.profile, state.requests, router, dispatch]);

    // On app load, check if there's a new pending request to show "almost match" celebration
    useEffect(() => {
        if (state.newReceivedRequestId && state.profile) {
            const request = state.requests.find(r => r.id === state.newReceivedRequestId);
            if (request && request.to.id === state.profile.id && request.status === 'pending') {
                router.replace(`/match-success/${request.id}?initial=true`);
                dispatch({ type: 'CLEAR_NEW_RECEIVED_REQUEST' });
            }
        }
    }, [state.newReceivedRequestId, state.profile, state.requests, router, dispatch]);

    // On app load, check for unread messages and redirect if necessary
    useEffect(() => {
      // Don't redirect if we are already on a page that handles notifications or is part of the flow.
      const isNotificationPage = pathname.startsWith('/chat') || pathname.startsWith('/new-message') || pathname.startsWith('/celebration');
      if (state.hasUnreadMessages && !isNotificationPage) {
        router.replace('/new-message');
      }
    }, [state.hasUnreadMessages, pathname, router]);


    // While loading, show a loading spinner.
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
    
    // If the user is logged in, but has no profile, redirect to create one
    // unless they are already on that page.
    if(state.user && !state.profile && pathname !== '/create-profile') {
        router.replace('/create-profile');
        return ( // Return a loader while redirecting
          <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
                <p className="text-muted-foreground">Redirigiendo a la creación de perfil...</p>
            </div>
          </div>
        );
    }

    // Welcome and CreateProfile use a simpler layout
    const simpleLayouts = ['/welcome', '/create-profile', '/celebration', '/match-success', '/new-message'];
    if (simpleLayouts.some(p => pathname.startsWith(p))) {
        return <WelcomeLayout>{children}</WelcomeLayout>;
    }
    
    // If user and profile exist, show the main application layout
    if(state.user && state.profile) {
        return <MainLayout>{children}</MainLayout>;
    }

    // Fallback loader, handles edge cases
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
                <p className="text-muted-foreground">Finalizando...</p>
            </div>
        </div>
    );
}

    
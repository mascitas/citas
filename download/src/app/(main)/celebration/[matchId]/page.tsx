"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, Sparkles } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export default function CelebrationPage() {
    const router = useRouter();
    const { matchId } = useParams();
    const { state } = useAppContext();

    const match = state.matches.find(m => m.id === matchId);
    const otherUser = match?.users.find(u => u.id !== state.profile?.id);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (matchId) {
              router.replace(`/chat/${matchId}`);
            }
        }, 5000); // 5 segundos de celebración

        return () => clearTimeout(timer);
    }, [matchId, router]);

    if (!otherUser) {
        return (
             <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
                    <p className="text-muted-foreground">Cargando celebración...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-background to-secondary overflow-hidden">
            <div className="text-center animate-in fade-in-50 zoom-in-95 duration-1000">
                <div className="relative inline-block">
                    {/* Corazones animados */}
                    {[...Array(15)].map((_, i) => (
                        <Heart
                            key={i}
                            className="absolute text-primary animate-pulse"
                            fill="currentColor"
                            style={{
                                top: `${Math.random() * 200 - 100}%`,
                                left: `${Math.random() * 200 - 100}%`,
                                width: `${Math.random() * 3 + 1}rem`,
                                height: `${Math.random() * 3 + 1}rem`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${Math.random() * 3 + 2}s`,
                                opacity: Math.random() * 0.6 + 0.4,
                            }}
                        />
                    ))}
                     <Sparkles className="absolute -top-5 -right-5 w-16 h-16 text-yellow-400 animate-ping" style={{ animationDuration: '2s' }} />
                     <Sparkles className="absolute -bottom-5 -left-5 w-12 h-12 text-yellow-400 animate-ping" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}/>

                    <h1 className="text-6xl font-bold font-headline text-primary z-10 relative">+citas</h1>
                </div>
                <p className="text-4xl font-semibold mt-8 text-foreground">¡Es un Match con {otherUser?.name}!</p>
                <p className="text-xl text-muted-foreground mt-2">¡Felicitaciones! Prepárense para chatear...</p>
                 <div className="w-full bg-muted-foreground/20 rounded-full h-2.5 mt-10 overflow-hidden">
                    <div className="bg-primary h-2.5 rounded-full animate-[progress_5s_ease-in-out_forwards]" style={{ width: '100%' }}></div>
                </div>
            </div>
            <style jsx>{`
                @keyframes progress {
                    from { width: 0% }
                    to { width: 100% }
                }
                .animate-pulse {
                   animation: pulse-float 4s ease-in-out infinite;
                }
                @keyframes pulse-float {
                    0% {
                        transform: scale(1) translateY(0px) rotate(0deg);
                        opacity: 0.7;
                    }
                    50% {
                        transform: scale(1.1) translateY(-20px) rotate(${Math.random() * 20 - 10}deg);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1) translateY(0px) rotate(0deg);
                        opacity: 0.7;
                    }
                }
            `}</style>
        </div>
    );
}

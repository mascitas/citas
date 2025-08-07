"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';

export default function WelcomePage() {
  const router = useRouter();
  const { state } = useAppContext();

  // Si por alguna razón el usuario llega aquí sin perfil, lo mandamos a crearlo.
  useEffect(() => {
    if (!state.isLoading && !state.profile) {
      router.replace('/create-profile');
    }
  }, [state.profile, state.isLoading, router]);


  const handleContinue = () => {
    router.push('/home');
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary">
      <Card className="w-full max-w-md shadow-2xl text-center animate-in fade-in-50 zoom-in-95 duration-500">
        <CardHeader>
           <div className="flex justify-center mb-4">
            <div className="relative">
                <Heart className="w-24 h-24 text-primary" />
                <Sparkles className="absolute -top-2 -right-2 w-10 h-10 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold font-headline text-primary">+citas</CardTitle>
          <CardDescription className="text-xl mt-2">
            ¡Bienvenido/a, {state.profile?.name}!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-3xl font-semibold leading-tight">Tu perfil está completo.</p>
            <p className="text-2xl text-muted-foreground">¡Es hora de encontrar conexiones reales!</p>
        </CardContent>
        <CardContent>
          <Button className="w-full text-lg py-6 bg-accent hover:bg-accent/90" onClick={handleContinue}>
            Empezar a ver perfiles
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

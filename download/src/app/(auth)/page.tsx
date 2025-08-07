
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Search, Send, MessageSquare, Coffee, X } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';


const HowItWorksSection = () => (
   <div className="w-full max-w-4xl text-center">
        <h2 className="text-3xl font-bold font-headline mb-4 text-foreground">¿Cómo funciona +citas?</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">Menos chat, más encuentros reales.</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-2">
                    <Search className="w-8 h-8"/>
                </div>
                <h3 className="font-bold text-lg">1. Explora Perfiles</h3>
                <p className="text-sm text-muted-foreground">Descubre gente auténtica cerca de ti.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-2">
                    <Send className="w-8 h-8"/>
                </div>
                <h3 className="font-bold text-lg">2. Envía una Solicitud</h3>
                <p className="text-sm text-muted-foreground">¿Alguien te gusta? Propón una cita directamente.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-2">
                    <MessageSquare className="w-8 h-8"/>
                </div>
                <h3 className="font-bold text-lg">3. Acepta y Chatea</h3>
                <p className="text-sm text-muted-foreground">Si aceptan, se abre un chat de 24hs para coordinar.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-2">
                    <Coffee className="w-8 h-8"/>
                </div>
                <h3 className="font-bold text-lg">4. Concreta la Cita</h3>
                <p className="text-sm text-muted-foreground">Definan los detalles y ¡listo para conocerse!</p>
            </div>
        </div>
    </div>
)

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  
  const { state, dispatch } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      toast({ variant: "destructive", title: "Email inválido", description: "Por favor, ingresa un correo electrónico válido." });
      return;
    }
     if (password.length < 6) {
      toast({ variant: "destructive", title: "Contraseña inválida", description: "La contraseña debe tener al menos 6 caracteres." });
      return;
    }
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Las contraseñas no coinciden", description: "Por favor, verifica tus contraseñas." });
      return;
    }

    // Simulate user creation and login
    const mockUser = {
      uid: 'mock_user_id_' + Date.now(),
      displayName: '', // Name will be set in create-profile
      email: email,
    };

    dispatch({
      type: 'SET_USER',
      payload: {
        user: mockUser as any,
        profile: null,
      },
    });

    toast({ title: "¡Bienvenido/a!", description: "Ahora, completa tu perfil para empezar." });
    router.push('/create-profile');
  };
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        toast({ variant: "destructive", title: "Campos incompletos", description: "Por favor, ingresa tu email y contraseña." });
        return;
    }
    
    dispatch({
      type: 'LOGIN',
      payload: { email, password },
      onError: (error) => toast({ variant: 'destructive', title: 'Error de inicio de sesión', description: error }),
      onSuccess: () => {
        toast({ title: '¡Bienvenido/a de nuevo!' });
        router.push('/home');
      }
    });
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary p-4 overflow-x-hidden">
       {/* Info Banner */}
      {showInfoBanner && (
         <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-card p-6 rounded-lg shadow-2xl border relative max-w-4xl mx-auto">
               <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setShowInfoBanner(false)}>
                    <X className="w-4 h-4"/>
                </Button>
               <HowItWorksSection />
            </div>
         </div>
      )}

      <Card className="w-full max-w-md shadow-2xl z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Heart className="w-10 h-10 text-primary" />
            <CardTitle className="text-4xl font-headline text-primary">+citas</CardTitle>
          </div>
          <CardDescription className="text-lg">Conexiones reales. ¿Empezamos?</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4 pt-4">
                      <div className="space-y-2">
                          <Label htmlFor="login-email">Email</Label>
                          <Input id="login-email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="login-password">Contraseña</Label>
                          <Input id="login-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      </div>
                      <Button type="submit" className="w-full text-lg py-6">Iniciar Sesión</Button>
                  </form>
              </TabsContent>
              <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4 pt-4">
                       <div className="space-y-2">
                          <Label htmlFor="register-email">Email</Label>
                          <Input id="register-email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="register-password">Contraseña</Label>
                          <Input id="register-password" type="password" placeholder="Crea una contraseña (mín. 6 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                          <Input id="confirm-password" type="password" placeholder="Confirma tu contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                      </div>
                      <Button type="submit" className="w-full text-lg py-6">Registrarse y Continuar</Button>
                      <p className="text-xs text-center text-muted-foreground pt-2">
                          Para pruebas, puedes iniciar sesión con los perfiles existentes como 'alejandro@email.com' o 'brenda@email.com'.
                      </p>
                  </form>
              </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
      
      <div className="mt-12">
        <HowItWorksSection />
      </div>
    </div>
  );
}

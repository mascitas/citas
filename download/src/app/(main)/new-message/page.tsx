"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MailCheck, Sparkles } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export default function NewMessagePage() {
  const router = useRouter();
  const { dispatch } = useAppContext();

  const handleContinue = () => {
    dispatch({ type: 'CLEAR_UNREAD_MESSAGES_FLAG' });
    router.push('/chat');
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary">
      <Card className="w-full max-w-md shadow-2xl text-center animate-in fade-in-50 zoom-in-95 duration-500">
        <CardHeader>
           <div className="flex justify-center mb-4">
            <div className="relative">
                <MailCheck className="w-24 h-24 text-primary" />
                <Sparkles className="absolute -top-2 -right-2 w-10 h-10 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold font-headline text-primary">¡Nuevos Mensajes!</CardTitle>
          <CardDescription className="text-xl mt-2">
            Alguien te ha respondido.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-2xl text-muted-foreground">¡La conversación continúa!</p>
        </CardContent>
        <CardContent>
          <Button className="w-full text-lg py-6 bg-accent hover:bg-accent/90" onClick={handleContinue}>
            Leer Mensajes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

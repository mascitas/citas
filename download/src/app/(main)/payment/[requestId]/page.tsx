"use client";

import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Heart, Sparkles, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MatchRequest } from '@/lib/types';

export default function PaymentPage() {
  const { requestId } = useParams();
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();
  const [request, setRequest] = useState<MatchRequest | null>(null);

  useEffect(() => {
    const foundRequest = state.requests.find(r => r.id === requestId);
    if (foundRequest) {
      setRequest(foundRequest);
    } else {
      if(!state.isLoading) {
        toast({
            variant: 'destructive',
            title: 'Solicitud no encontrada',
            description: 'La solicitud a la que intentas acceder no existe.',
        });
        router.replace('/history');
      }
    }
  }, [requestId, state.requests, router, toast, state.isLoading]);

  if (!request) {
    return <div className="flex h-screen w-full items-center justify-center">Cargando...</div>;
  }
  
  const isFinalApproval = request.status === 'awaiting_final_approval' && request.from.id === state.profile?.id;
  const otherUser = state.profile?.id === request.from.id ? request.to : request.from;

  const handlePayment = () => {
    toast({
        title: "Redirigiendo a Mercado Pago...",
        description: "Esto es una simulación. No se procesará ningún pago real."
    });
    
    // In a real app, this would redirect to the Mercado Pago checkout URL
    setTimeout(() => {
        window.open('https://www.mercadopago.com', '_blank');

        if (isFinalApproval) {
            // This is the final payment that creates the match
            dispatch({ type: 'HANDLE_REQUEST', payload: { requestId: request.id as string, status: 'accepted' } });
            // The layout will catch the redirectMatchId and navigate to the celebration page.
            router.replace('/home'); // Go to home, layout will redirect
        } else {
            // This is the first payment, waiting for the other user
            dispatch({ type: 'HANDLE_REQUEST', payload: { requestId: request.id as string, status: 'awaiting_final_approval' } });
            toast({
                title: '¡Pago Realizado!',
                description: `Se ha notificado a ${otherUser.name}.`,
            });
            router.replace('/history');
        }
    }, 1500)
  };


  return (
    <div className="p-4 sm:p-6 md:p-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
                <Heart className="w-20 h-20 text-primary" />
                <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold font-headline">¡Concreta tu Cita!</CardTitle>
          <CardDescription className="text-lg">
            Estás a un paso de conectar con <span className="font-bold text-primary">{otherUser.name}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFinalApproval && (
             <div className="mb-4 p-4 rounded-lg bg-green-100 border border-green-300 flex items-center gap-3 text-green-800">
                  <CheckCircle className="w-6 h-6"/>
                  <p className="font-medium">{otherUser.name} ya ha aceptado. ¡Este es el último paso!</p>
             </div>
          )}
          <div className="p-6 rounded-lg bg-secondary border border-primary/20 flex flex-col items-center text-center">
            <h3 className="text-2xl font-semibold">Tarifa Única</h3>
            <p className="text-5xl font-bold text-primary my-2">$3,000</p>
            <p className="text-muted-foreground">Este pago desbloquea un chat privado de 24 horas para que puedan coordinar los detalles de la cita una vez que ambos hayan aceptado.</p>
             {!isFinalApproval && (
                <p className="text-xs text-muted-foreground mt-4">Si la otra persona no acepta, se te reintegrarán los $3,000 dentro de las 72hs.</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full text-lg py-6 bg-accent hover:bg-accent/90" onClick={handlePayment}>
            <CreditCard className="w-5 h-5 mr-3" /> Pagar con Mercado Pago
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

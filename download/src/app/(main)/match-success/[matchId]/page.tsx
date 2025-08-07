
"use client";

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Heart, Sparkles, MailQuestion, Check } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';

export default function MatchSuccessPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();

    const requestId = params.matchId as string;
    const isInitialRequest = searchParams.get('initial') === 'true';

    const { state, dispatch } = useAppContext();

    useEffect(() => {
      // Clear the notification flag once the page has been viewed
      if (isInitialRequest && requestId === state.newReceivedRequestId) {
        dispatch({ type: 'CLEAR_NEW_RECEIVED_REQUEST' });
      }
      if (!isInitialRequest && requestId === state.pendingApprovalMatchId) {
        dispatch({ type: 'CLEAR_PENDING_APPROVAL_MATCH' });
      }
    }, [isInitialRequest, requestId, state.newReceivedRequestId, state.pendingApprovalMatchId, dispatch]);

    const request = state.requests.find(r => r.id === requestId);
    const otherUser = request ? (state.profile?.id === request.from.id ? request.to : request.from) : null;

    const handleContinueToPayment = () => {
        router.replace(`/payment/${requestId}`);
    };

    const handleContinueToRequests = () => {
        router.replace('/requests');
    };

    if (!otherUser || !request) {
        return (
             <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
                    <p className="text-muted-foreground">Cargando...</p>
                </div>
            </div>
        )
    }

    // This screen is now dual-purpose
    const title = isInitialRequest ? "¡Alguien quiere conectar!" : "¡Están a un paso!";
    const description = isInitialRequest 
        ? `${otherUser?.name} te ha enviado una solicitud de cita. ¿Aceptas?`
        : `${otherUser?.name} ha aceptado.`;
    const subDescription = isInitialRequest
        ? "Puedes ver los detalles en tu bandeja de solicitudes."
        : "Ahora solo faltas tú. Desbloquea el chat y concreta la cita.";
    const buttonText = isInitialRequest ? "Ver Solicitud" : "Completar el Match";
    const buttonAction = isInitialRequest ? handleContinueToRequests : handleContinueToPayment;
    const Icon = isInitialRequest ? MailQuestion : Heart;


    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-background to-secondary overflow-hidden p-4">
            <div className="text-center animate-in fade-in-50 zoom-in-95 duration-1000 bg-card p-8 rounded-2xl shadow-2xl max-w-lg w-full">
                <div className="relative inline-block mb-4">
                    <Sparkles className="absolute -top-5 -right-5 w-16 h-16 text-yellow-400 animate-ping" style={{ animationDuration: '2s' }} />
                    <Sparkles className="absolute -bottom-5 -left-5 w-12 h-12 text-yellow-400 animate-ping" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}/>
                    <Icon className="w-24 h-24 text-primary" fill={isInitialRequest ? "none" : "currentColor"}/>
                </div>
                <h1 className="text-4xl font-bold font-headline text-primary">{title}</h1>
                <p className="text-2xl font-semibold mt-4 text-foreground">{description}</p>
                <p className="text-lg text-muted-foreground mt-2">{subDescription}</p>
                 <Button onClick={buttonAction} className="w-full mt-8 text-lg py-6 bg-accent hover:bg-accent/90">
                    {buttonText}
                </Button>
            </div>
        </div>
    );
}

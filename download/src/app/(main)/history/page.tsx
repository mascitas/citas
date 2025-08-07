"use client";

import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MatchRequest } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Send, CheckCircle, XCircle, Hourglass, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const CountdownTimer = ({ expiryDate, onExpire }: { expiryDate: Date, onExpire: () => void }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [expired, setExpired] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const distance = new Date(expiryDate).getTime() - now.getTime();

            if (distance < 0) {
                clearInterval(interval);
                if(!expired) {
                    setTimeLeft('Expirado');
                    setExpired(true);
                    onExpire();
                }
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [expiryDate, expired, onExpire]);

    if(expired) return <span className="text-red-500 font-bold">Expirado</span>

    return (
       <div className="flex items-center gap-2 text-sm text-blue-600 font-mono">
            <Hourglass className="w-4 h-4 animate-spin" />
            <span>Expira en {timeLeft}</span>
        </div>
    );
};


const RequestItem = ({ request }: { request: MatchRequest }) => {
    const { state, dispatch } = useAppContext();
    const router = useRouter();
    const isSender = request.from.id === state.profile?.id;
    const otherUser = isSender ? request.to : request.from;

    const handleExpire = () => {
         // This is a visual change, the actual state change should be handled
         // when the component re-mounts or action is taken
         if(request.status === 'awaiting_final_approval') {
            dispatch({ type: 'HANDLE_REQUEST', payload: { requestId: request.id, status: 'cancelled' } });
         }
    }

    const statusMap: Record<MatchRequest['status'], {text: string, color: string, icon: React.ReactNode}> = {
        pending: {
            text: 'Pendiente',
            color: 'bg-yellow-500',
            icon: <Hourglass className="w-3 h-3" />
        },
        awaiting_final_approval: {
            text: isSender ? 'Esperando tu aprobación final' : 'Esperando aprobación del remitente',
            color: 'bg-blue-500',
            icon: <AlertCircle className="w-3 h-3" />
        },
        accepted: {
            text: 'Aceptada',
            color: 'bg-green-500',
            icon: <CheckCircle className="w-3 h-3" />
        },
        rejected: {
            text: 'Rechazada',
            color: 'bg-red-500',
            icon: <XCircle className="w-3 h-3" />
        },
        cancelled: {
            text: 'Cancelada',
            color: 'bg-gray-500',
            icon: <XCircle className="w-3 h-3" />
        },
    };

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

    const handleFinalApproval = () => {
        router.push(`/payment/${request.id}`);
    }
    
    const isExpired = request.paymentExpiresAt && new Date() > new Date(request.paymentExpiresAt);


    return (
        <div className="flex flex-col sm:flex-row items-center p-3 gap-4 rounded-lg hover:bg-secondary transition-colors">
            <Avatar className="w-12 h-12 border-2 border-primary/50">
                <AvatarImage src={otherUser.photoUrl} alt={otherUser.name} />
                <AvatarFallback>{getInitials(otherUser.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow text-center sm:text-left">
                <p className="font-semibold">{isSender ? `Tú enviaste una solicitud a ${otherUser.name}` : `${otherUser.name} te envió una solicitud`}</p>
                <p className="text-sm text-muted-foreground">{format(new Date(request.createdAt), 'PPP p', { locale: es })}</p>
                 {isSender && request.status === 'awaiting_final_approval' && !isExpired && request.paymentExpiresAt && (
                    <CountdownTimer expiryDate={new Date(request.paymentExpiresAt)} onExpire={handleExpire} />
                )}
            </div>
            <div className="flex items-center gap-2">
                 <Badge variant="outline" className={`flex items-center gap-1.5 border-none text-white ${statusMap[request.status].color}`}>
                    {statusMap[request.status].icon}
                    {statusMap[request.status].text}
                </Badge>
                {isSender && request.status === 'awaiting_final_approval' && !isExpired && (
                    <Button size="sm" onClick={handleFinalApproval}>Aprobar y Pagar</Button>
                )}
            </div>
        </div>
    )
}

export default function HistoryPage() {
    const { state } = useAppContext();
    const myId = state.profile?.id;

    const sentRequests = state.requests.filter(r => r.from.id === myId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const receivedRequests = state.requests.filter(r => r.to.id === myId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const completedMatches = state.matches;

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold font-headline">Tu Historial</h1>
                <p className="text-muted-foreground">Un resumen de todas tus conexiones y solicitudes.</p>
            </div>
            <Tabs defaultValue="matches" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="matches">Matches</TabsTrigger>
                    <TabsTrigger value="sent">Enviadas</TabsTrigger>
                    <TabsTrigger value="received">Recibidas</TabsTrigger>
                </TabsList>
                <TabsContent value="matches">
                    <Card>
                        <CardHeader><CardTitle>Matches Activos y Pasados</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {completedMatches.length > 0 ? completedMatches.map(match => {
                                const otherUser = match.users.find(u => u.id !== myId)!;
                                const isExpired = new Date() > new Date(match.chatExpiresAt);
                                return (
                                <Link href={`/chat/${match.id}`} key={match.id}>
                                <div className="flex items-center p-3 gap-4 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                                    <Avatar className="w-12 h-12 border-2 border-green-500">
                                        <AvatarImage src={otherUser.photoUrl} alt={otherUser.name} />
                                        <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow">
                                        <p className="font-semibold">Chat con {otherUser.name}</p>
                                        <p className="text-sm text-muted-foreground">Match el {format(new Date(match.createdAt), 'PPP', { locale: es })}</p>
                                    </div>
                                    <Badge variant={isExpired ? "destructive" : "default"}>{isExpired ? "Expirado" : "Activo"}</Badge>
                                </div>
                                </Link>
                                )
                            }) : <p className="text-muted-foreground text-center p-8">Aún no hay matches. ¡Acepta una solicitud para empezar a chatear!</p>}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="sent">
                    <Card>
                        <CardHeader><CardTitle>Solicitudes Enviadas</CardTitle></CardHeader>
                        <CardContent className="space-y-1">
                            {sentRequests.length > 0 ? sentRequests.map(req => <RequestItem key={req.id} request={req} />) : <p className="text-muted-foreground text-center p-8">Aún no has enviado ninguna solicitud. <Link href="/home" className="text-primary underline">Busca perfiles</Link> para encontrar un match!</p>}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="received">
                    <Card>
                        <CardHeader><CardTitle>Solicitudes Recibidas</CardTitle></CardHeader>
                        <CardContent className="space-y-1">
                            {receivedRequests.length > 0 ? receivedRequests.map(req => <RequestItem key={req.id} request={req} />) : <p className="text-muted-foreground text-center p-8">Nadie te ha enviado una solicitud todavía. ¡Paciencia!</p>}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

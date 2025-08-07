"use client";

import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Check, X, HeartCrack, Eye } from 'lucide-react';
import { MatchRequest } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function RequestsPage() {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();

  const myUserId = state.profile?.id;
  const receivedRequests = state.requests.filter(req => req.to.id === myUserId && req.status === 'pending');

  const handleAccept = (request: MatchRequest) => {
    toast({
        title: "Confirmación requerida",
        description: `Para conectar con ${request.from.name}, se requiere una tarifa de $3,000 para desbloquear el chat.`
    });
    router.push(`/payment/${request.id}`);
  }

  const handleReject = (request: MatchRequest) => {
    dispatch({ type: 'HANDLE_REQUEST', payload: { requestId: request.id, status: 'rejected' } });
    toast({
        variant: 'destructive',
        title: 'Solicitud Rechazada',
        description: `Has rechazado la solicitud de ${request.from.name}.`
    });
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Chispas Entrantes</h1>
        <p className="text-muted-foreground">Estas personas quieren conectar contigo. ¿Cuál es tu siguiente movida?</p>
      </div>
      
      {receivedRequests.length > 0 ? (
        <div className="space-y-4">
          {receivedRequests.map(req => (
            <Card key={req.id} className="flex flex-col sm:flex-row items-center p-4 gap-4 shadow-md">
              <Avatar className="w-20 h-20 border-2 border-primary">
                <AvatarImage src={req.from.photoUrl} />
                <AvatarFallback>{getInitials(req.from.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow text-center sm:text-left">
                <CardTitle className="text-xl">{req.from.name}</CardTitle>
                <p className="text-muted-foreground line-clamp-2">{req.from.bio}</p>
              </div>
              <CardFooter className="p-0 flex flex-wrap justify-center sm:justify-end gap-2">
                <Link href={`/profile/${req.from.id}`} passHref>
                    <Button variant="outline">
                        <Eye className="w-4 h-4 mr-2" /> Ver Perfil
                    </Button>
                </Link>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <X className="w-4 h-4 mr-2" /> Rechazar
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro/a?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esto rechazará permanentemente la solicitud de {req.from.name}. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleReject(req)} variant="destructive">Confirmar Rechazo</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <Button className="bg-accent hover:bg-accent/90" onClick={() => handleAccept(req)}>
                  <Check className="w-4 h-4 mr-2" /> Aceptar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 flex flex-col items-center">
            <HeartCrack className="w-24 h-24 text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-semibold">Sin Solicitudes Pendientes</h2>
            <p className="text-muted-foreground max-w-md">No tienes ninguna solicitud de cita entrante en este momento. ¡Mantén tu perfil actualizado para atraer más chispas!</p>
        </div>
      )}
    </div>
  );
}

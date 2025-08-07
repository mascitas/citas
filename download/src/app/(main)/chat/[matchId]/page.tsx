
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, FormEvent } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Message, UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Timer, Check, CheckCheck, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const CountdownTimer = ({ expiryDate }: { expiryDate: Date }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [expired, setExpired] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const distance = new Date(expiryDate).getTime() - now.getTime();

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft('El chat expiró');
                setExpired(true);
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [expiryDate]);

    return (
        <div className={cn("flex items-center gap-2 font-mono text-sm", expired ? "text-red-500" : "text-muted-foreground")}>
            <Timer className="w-4 h-4" />
            <span>{timeLeft}</span>
        </div>
    );
};


export default function ChatPage() {
    const { matchId } = useParams();
    const router = useRouter();
    const { state, dispatch } = useAppContext();
    const { toast } = useToast();
    
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
    const match = state.matches.find(m => m.id === matchId);
    const chatHistory = state.chats[matchId as string] || [];
    
    useEffect(() => {
        if (!state.isLoading && !match) {
            toast({ variant: 'destructive', title: 'Match no encontrado', description: 'Este chat no existe.' });
            router.replace('/chat');
        }
    }, [match, router, toast, state.isLoading]);

    useEffect(() => {
        // Mark messages as read when component mounts and on new messages
        if (matchId) {
            dispatch({ type: 'MARK_CHAT_AS_READ', payload: { matchId: matchId as string } });
        }
    }, [chatHistory.length, matchId, dispatch]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    if (state.isLoading || !match) return null;

    const currentUser = state.profile;
    const otherUser = match.users.find(u => u.id !== currentUser?.id);
    if (!currentUser || !otherUser) return null;

    const isExpired = new Date() > new Date(match.chatExpiresAt);

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!message.trim() || isSending || isExpired) return;

        setIsSending(true);

        const userMessage: Message = {
            id: `msg_${Date.now()}`,
            senderId: currentUser.id,
            text: message,
            timestamp: new Date(),
            read: false,
        };
        
        dispatch({ type: 'ADD_MESSAGE', payload: { matchId: match.id, message: userMessage } });
        setMessage('');
        setIsSending(false);
    };


    return (
        <div className="flex flex-col h-screen p-4">
            <header className="flex items-center gap-4 p-4 border-b bg-card">
                <Avatar className="w-12 h-12 border-2 border-primary">
                    <AvatarImage src={otherUser.photoUrl} />
                    <AvatarFallback>{getInitials(otherUser.name)}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-xl font-bold">{otherUser.name}</h2>
                    <CountdownTimer expiryDate={new Date(match.chatExpiresAt)} />
                </div>
            </header>

            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
                 <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/80 my-4 text-secondary-foreground">
                    <Shield className="w-8 h-8 text-primary flex-shrink-0" />
                    <div>
                        <h4 className="font-bold">¡Bienvenido al chat!</h4>
                        <p className="text-sm">Estás a punto de coordinar tu próxima cita. Consejo de seguridad: Reúnanse en un lugar público y avísale a un amigo dónde estarás. ¡Disfruta!</p>
                    </div>
                </div>
                {chatHistory.map((msg, index) => {
                    const lastMessage = index === chatHistory.length - 1;
                    return (
                    <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === currentUser.id ? "justify-end" : "justify-start")}>
                         {msg.senderId !== currentUser.id && (
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={otherUser.photoUrl} />
                                <AvatarFallback>{getInitials(otherUser.name)}</AvatarFallback>
                            </Avatar>
                        )}
                        <div className={cn("max-w-xs md:max-w-md p-3 rounded-2xl", msg.senderId === currentUser.id ? "bg-primary text-primary-foreground rounded-br-none" : "bg-secondary text-secondary-foreground rounded-bl-none")}>
                            <p>{msg.text}</p>
                            <div className="flex items-center justify-end gap-1.5 mt-1">
                                <p className="text-xs opacity-70">{formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true, locale: es })}</p>
                                {msg.senderId === currentUser.id && (
                                    msg.read ? <CheckCheck className="w-4 h-4 text-blue-300" /> : <Check className="w-4 h-4" />
                                )}
                            </div>
                        </div>
                        {msg.senderId === currentUser.id && (
                             <Avatar className="w-8 h-8">
                                <AvatarImage src={currentUser.photoUrl} />
                                <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                )})}
            </div>
            
            <footer className="p-4 border-t bg-card">
                 {isExpired ? (
                    <div className="text-center text-red-500 font-semibold">
                        Este chat ha expirado.
                    </div>
                ) : (
                    <form className="flex items-center gap-2" onSubmit={handleSendMessage}>
                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Escribe tu mensaje..."
                            className="flex-1"
                            disabled={isSending}
                        />
                        <Button type="submit" size="icon" disabled={isSending || !message.trim()}>
                            <Send className="w-5 h-5" />
                        </Button>
                    </form>
                )}
            </footer>
        </div>
    );
}

"use client";

import { useAppContext } from '@/context/AppContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageSquare, Check, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { UserProfile } from '@/lib/types';


const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

const ChatListItem = ({ match, otherUser }: { match: any; otherUser: UserProfile }) => {
    const { state } = useAppContext();
    const lastMessage = state.chats[match.id]?.[state.chats[match.id].length - 1];
    const isUnread = lastMessage && lastMessage.senderId !== state.profile?.id && !lastMessage.read;

    const ReadStatusIcon = () => {
        if (!lastMessage || lastMessage.senderId !== state.profile?.id) return null;
        return lastMessage.read ? <CheckCheck className="w-4 h-4 text-blue-500" /> : <Check className="w-4 h-4 text-muted-foreground" />;
    };

    return (
        <Link href={`/chat/${match.id}`} className="block">
            <div className={cn(
                "flex items-center p-4 gap-4 rounded-lg transition-colors cursor-pointer",
                 isUnread ? "bg-primary/10 hover:bg-primary/20" : "hover:bg-secondary"
            )}>
                <Avatar className="w-16 h-16 border-2 border-primary/50">
                    <AvatarImage src={otherUser.photoUrl} alt={otherUser.name} />
                    <AvatarFallback>{getInitials(otherUser.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow overflow-hidden">
                    <div className="flex justify-between items-center">
                        <p className="font-bold text-lg truncate">{otherUser.name}</p>
                        {lastMessage && (
                            <p className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(lastMessage.timestamp), { locale: es, addSuffix: true })}
                            </p>
                        )}
                    </div>
                    <div className="flex justify-between items-center">
                         <p className={cn("text-sm truncate", isUnread ? "text-primary font-bold" : "text-muted-foreground")}>
                            {lastMessage ? `${lastMessage.senderId === state.profile?.id ? "Tú: " : ""}${lastMessage.text}` : "Inicia la conversación"}
                         </p>
                         <div className="flex items-center gap-1">
                            <ReadStatusIcon />
                            {isUnread && <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>}
                         </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default function ChatsListPage() {
    const { state } = useAppContext();
    const myId = state.profile?.id;

    const activeChats = useMemo(() => {
        return state.matches
            .filter(match => new Date(match.chatExpiresAt) > new Date())
            .sort((a,b) => {
                const lastMessageA = state.chats[a.id]?.[state.chats[a.id].length - 1];
                const lastMessageB = state.chats[b.id]?.[state.chats[b.id].length - 1];
                const timeA = lastMessageA ? new Date(lastMessageA.timestamp).getTime() : new Date(a.createdAt).getTime();
                const timeB = lastMessageB ? new Date(lastMessageB.timestamp).getTime() : new Date(b.createdAt).getTime();
                return timeB - timeA;
            });
    }, [state.matches, state.chats]);

    if (!myId) return null;

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold font-headline">Tus Chats</h1>
                <p className="text-muted-foreground">Conversaciones activas. ¡No dejes pasar la oportunidad!</p>
            </div>
             <Card>
                <CardContent className="p-2 space-y-1">
                    {activeChats.length > 0 ? (
                        activeChats.map(match => {
                             const otherUser = match.users.find(u => u.id !== myId)!;
                             return <ChatListItem key={match.id} match={match} otherUser={otherUser} />
                        })
                    ) : (
                         <div className="text-center py-20 flex flex-col items-center">
                            <MessageSquare className="w-24 h-24 text-muted-foreground/50 mb-4" />
                            <h2 className="text-2xl font-semibold">Sin Chats Activos</h2>
                            <p className="text-muted-foreground max-w-md">Cuando aceptes una solicitud y se complete el match, tus conversaciones aparecerán aquí.</p>
                        </div>
                    )}
                </CardContent>
             </Card>
        </div>
    );
}
    
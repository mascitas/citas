"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, MessageSquare, User, LogOut, History, Edit, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppContext } from '@/context/AppContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

const navItems = [
  { href: '/home', icon: Home, label: 'Inicio' },
  { href: '/requests', icon: Heart, label: 'Solicitudes' },
  { href: '/chat', icon: MessageSquare, label: 'Chats' },
  { href: '/history', icon: History, label: 'Historial' },
  { href: '/purchase', icon: Sparkles, label: 'Citas Tokens' },
  { href: '/profile', icon: User, label: 'Perfil' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { state, dispatch } = useAppContext();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
  
  const pendingRequestsCount = state.requests.filter(
    r => (r.to.id === state.profile?.id && r.status === 'pending') ||
         (r.from.id === state.profile?.id && r.status === 'awaiting_final_approval' && (!r.paymentExpiresAt || new Date() < new Date(r.paymentExpiresAt)))
  ).length;

  const unreadChatsCount = useMemo(() => {
    if (!state.profile) return 0;
    
    return Object.entries(state.chats).reduce((count, [matchId, messages]) => {
      const match = state.matches.find(m => m.id === matchId);
      if (!match) return count;

      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.senderId !== state.profile.id && !lastMessage.read) {
        return count + 1;
      }
      return count;
    }, 0);
  }, [state.chats, state.matches, state.profile]);


  const getNotificationCount = (label: string) => {
    if (label === 'Solicitudes') return pendingRequestsCount;
    if (label === 'Chats') return unreadChatsCount;
    return 0;
  }
  
  return (
    <TooltipProvider>
      <aside className="flex flex-col w-64 p-4 bg-card border-r border-border">
        <div className="flex items-center gap-2 mb-8">
          <Heart className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-primary font-headline">+citas</h1>
        </div>
        
        <div className="flex flex-col items-center gap-2 mb-8">
            <Avatar className="w-24 h-24 border-2 border-primary">
                <AvatarImage src={state.profile?.photoUrl} alt={state.profile?.name} />
                <AvatarFallback className="text-3xl bg-secondary">{state.profile ? getInitials(state.profile.name) : 'DS'}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{state.profile?.name}</h2>
             <Link href="/profile/edit" passHref>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Edit className="w-4 h-4 mr-2"/>
                    Editar Perfil
                </Button>
            </Link>
        </div>


        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => {
            const notificationCount = getNotificationCount(item.label);
            const isChatPage = item.href === '/chat' && pathname.startsWith('/chat');
            const isActive = isChatPage || pathname.startsWith(item.href) && !isChatPage;

            return (
            <Link key={item.href} href={item.href} passHref>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className="justify-start w-full text-base relative"
              >
                  <item.icon className={cn("w-5 h-5 mr-3 transition-colors", notificationCount > 0 && "text-primary animate-pulse")} />
                  <span>{item.label}</span>
                   {notificationCount > 0 && (
                     <div className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                       {notificationCount}
                     </div>
                  )}
              </Button>
            </Link>
            )
          })}
        </nav>
        
        <div className="flex flex-col gap-4 mt-auto">
          <div className="p-4 rounded-lg bg-secondary/50 border border-primary/20 text-center">
            <p className="text-sm text-muted-foreground">Citas Tokens</p>
            <p className="text-4xl font-bold text-primary">{state.tokens}</p>
            <Link href="/purchase" passHref>
                <Button size="sm" className="w-full mt-2">Comprar más</Button>
            </Link>
          </div>
          <Button
            variant="ghost"
            className="justify-start w-full text-base text-muted-foreground"
            onClick={() => dispatch({ type: 'LOGOUT' })}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
    
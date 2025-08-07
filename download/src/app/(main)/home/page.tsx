
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { UserProfile } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, SlidersHorizontal, X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { differenceInDays } from 'date-fns';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';


const getAge = (dob: Date) => {
    const today = new Date();
    let age = today.getFullYear() - new Date(dob).getFullYear();
    const m = today.getMonth() - new Date(dob).getMonth();
    if (m < 0 || (m === 0 && today.getDate() < new Date(dob).getDate())) {
        age--;
    }
    return age;
}

const ProfileCard = ({ profile, onSendRequest, isRequestDisabled }: { profile: UserProfile; onSendRequest: (profile: UserProfile) => void; isRequestDisabled: boolean; }) => {
  const { state } = useAppContext();
  const router = useRouter();
  
  const handleSendRequest = () => {
    onSendRequest(profile);
  }
  
  const isDisabled = isRequestDisabled || state.tokens < 1;
  const buttonText = isRequestDisabled ? "Ya enviaste una solicitud" : "Enviar Solicitud de Cita";

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col group">
        <Carousel className="w-full">
            <CarouselContent>
                {profile.photos.map((photo, index) => (
                    <CarouselItem key={index}>
                      <Link href={`/profile/${profile.id}`} className="block">
                        <div className="relative h-96 w-full">
                          <Image src={photo} alt={`${profile.name} - foto ${index + 1}`} layout="fill" objectFit="cover" data-ai-hint="person portrait" />
                        </div>
                      </Link>
                    </CarouselItem>
                ))}
            </CarouselContent>
             {profile.photos.length > 1 && (
                <>
                    <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                    <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                </>
            )}
        </Carousel>
         <div className="flex flex-col flex-grow">
            <CardContent className="p-4 flex-grow">
              <CardTitle className="text-xl font-bold font-headline group-hover:text-primary">{profile.name}, {getAge(profile.dob)}</CardTitle>
              <p className="text-sm text-muted-foreground">{profile.location}</p>
              <p className="mt-2 text-foreground/80 text-sm line-clamp-2">{profile.bio}</p>
            </CardContent>
        </div>
      <CardFooter className="p-4 bg-secondary/30 mt-auto flex flex-col gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full" disabled={isDisabled}>
              <Heart className="w-4 h-4 mr-2" /> {buttonText}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Solicitud de Cita</AlertDialogTitle>
              <AlertDialogDescription>
                Esto usará 1 Cita Token. ¿Estás seguro de que quieres enviar una solicitud a {profile.name}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleSendRequest} className="bg-accent hover:bg-accent/90">Confirmar y Enviar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button variant="outline" className="w-full" onClick={() => router.push(`/profile/${profile.id}`)}>
            <Eye className="w-4 h-4 mr-2" />
            Ver Perfil
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function HomePage() {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    ageRange: [18, 100],
    preference: 'all',
    location: '',
  });

  const handleSendRequest = (toProfile: UserProfile) => {
    if (state.profile) {
      dispatch({
        type: 'SEND_REQUEST',
        payload: { from: state.profile, to: toProfile },
      });
      toast({
        title: "¡Solicitud Enviada!",
        description: `Tu solicitud de cita para ${toProfile.name} está en camino.`,
      });
    }
  };

  const checkPreference = (currentUser: UserProfile, potentialMatch: UserProfile): boolean => {
    if (currentUser.id === potentialMatch.id) return false;

    const userLikes = (p: UserProfile) => {
        if(p.preference === 'hetero') return p.gender === 'male' ? ['female'] : ['male'];
        if(p.preference === 'homo') return p.gender === 'male' ? ['male'] : ['female'];
        if(p.preference === 'bi') return ['male', 'female', 'other'];
        return [];
    }
    
    const currentUserLikes = userLikes(currentUser);
    const potentialMatchLikes = userLikes(potentialMatch);

    return currentUserLikes.includes(potentialMatch.gender) && potentialMatchLikes.includes(currentUser.gender);
  }
  
  const availableLocations = useMemo(() => {
    const locations = state.profiles.map(p => p.location.split(',')[0].trim());
    return [...new Set(locations)];
  }, [state.profiles]);

  const filteredProfiles = useMemo(() => {
    if (!state.profile) return [];
    
    // First, find all users that this user has already matched with.
    const matchedUserIds = new Set(
        state.matches
            .filter(match => match.users.some(user => user.id === state.profile?.id))
            .flatMap(match => match.users.map(user => user.id))
    );

    return state.profiles.filter(p => {
      if (p.id === state.profile?.id) return false;
  
      const isPreferenceMatch = checkPreference(state.profile as UserProfile, p);
      if (!isPreferenceMatch) return false;
  
      // Hide profile if an active match already exists
      if(matchedUserIds.has(p.id)) return false;
      
      const age = getAge(p.dob);
      if (age < filters.ageRange[0] || age > filters.ageRange[1]) {
        return false;
      }
      if (filters.preference !== 'all' && p.preference !== filters.preference) {
        return false;
      }
      if (filters.location && !p.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [state.profile, state.profiles, state.matches, filters]);
  
  const requestCooldownMap = useMemo(() => {
    const map = new Map<string, boolean>();
    if (!state.profile) return map;

    state.requests.forEach(req => {
      // Check if the current user sent this request to a specific person
      if (req.from.id === state.profile?.id) {
        const toProfileId = req.to.id;

        if (req.status === 'pending' || req.status === 'accepted' || req.status === 'awaiting_final_approval') {
          map.set(toProfileId, true); // Disable if pending, accepted, or waiting
        } else if (req.status === 'rejected' || req.status === 'cancelled') {
          const daysSince = differenceInDays(new Date(), new Date(req.createdAt));
          if (daysSince < 7) {
            map.set(toProfileId, true); // Disable if rejected/cancelled within the last 7 days
          }
        }
      }
    });

    return map;
  }, [state.requests, state.profile]);


  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Chispas Cerca de Ti</h1>
        <p className="text-muted-foreground">Perfiles que coinciden con tus preferencias. ¿Listo/a para dar el primer paso?</p>
      </div>

       <Collapsible className="mb-6 bg-card p-4 rounded-lg border">
          <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Filtros de Búsqueda</h3>
              <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Mostrar/Ocultar Filtros
                  </Button>
              </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Age Range Filter */}
                  <div className="space-y-2">
                      <Label>Rango de Edad: {filters.ageRange[0]} - {filters.ageRange[1]}</Label>
                      <Slider
                          value={filters.ageRange}
                          onValueChange={(value) => setFilters(f => ({ ...f, ageRange: value }))}
                          min={18}
                          max={100}
                          step={1}
                      />
                  </div>
                  {/* Preference Filter */}
                  <div className="space-y-2">
                      <Label>Preferencia Sexual</Label>
                      <Select value={filters.preference} onValueChange={(value) => setFilters(f => ({...f, preference: value}))}>
                          <SelectTrigger>
                              <SelectValue placeholder="Todas" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="all">Todas</SelectItem>
                              <SelectItem value="hetero">Heterosexual</SelectItem>
                              <SelectItem value="homo">Homosexual</SelectItem>
                              <SelectItem value="bi">Bisexual</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                   {/* Location Filter */}
                  <div className="space-y-2">
                      <Label>Ubicación (Ciudad)</Label>
                      <Input 
                        placeholder="Escribe una ciudad..."
                        value={filters.location}
                        onChange={(e) => setFilters(f => ({...f, location: e.target.value}))}
                      />
                  </div>
              </div>
          </CollapsibleContent>
      </Collapsible>


      {state.profile && state.tokens < 1 && (
        <div className="mb-6 p-4 rounded-lg bg-secondary border border-primary/20 text-primary font-medium">
          ¡Te quedaste sin Citas Tokens! <Link href="/purchase" className="font-bold underline hover:text-primary/80 transition-colors">Compra más</Link> para enviar solicitudes.
        </div>
      )}

      {filteredProfiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProfiles.map((profile) => (
            <ProfileCard 
              key={profile.id} 
              profile={profile} 
              onSendRequest={handleSendRequest}
              isRequestDisabled={requestCooldownMap.get(profile.id) || false} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
            <h2 className="text-2xl font-semibold">No hay perfiles nuevos por ahora</h2>
            <p className="text-muted-foreground">Vuelve más tarde o intenta ajustar tus filtros.</p>
        </div>
      )}
    </div>
  );
}

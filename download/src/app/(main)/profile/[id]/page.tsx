"use client";

import { useParams } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Cake, MapPin, Heart, Users } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function PublicProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const { state } = useAppContext();
    const profile = state.profiles.find(p => p.id === id);
    const [mainPhoto, setMainPhoto] = useState(profile?.photos[0]);

    if (state.isLoading) {
        return (
             <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
                 <h2 className="text-2xl font-semibold">Perfil no encontrado</h2>
                 <p className="text-muted-foreground">El perfil que buscas no existe o no está disponible.</p>
                 <Button onClick={() => router.back()} className="mt-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                 </Button>
            </div>
        )
    }
    
    if(!mainPhoto) setMainPhoto(profile.photos[0]);

    const getAge = (dob: Date) => new Date().getFullYear() - new Date(dob).getFullYear();
    const preferenceMap = {
        hetero: 'Heterosexual',
        homo: 'Homosexual',
        bi: 'Bisexual'
    }
    const genderMap = {
        male: 'Masculino',
        female: 'Femenino',
        other: 'Otro'
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 flex justify-center min-h-[calc(100vh-80px)] bg-secondary/50">
            <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8">
                 <Button variant="outline" size="icon" className="absolute top-6 left-6 z-10 bg-background/50 hover:bg-background" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                
                {/* Photo Gallery */}
                <div className="w-full md:w-1/2 flex flex-col gap-4">
                    <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-lg">
                        <Image src={mainPhoto || profile.photos[0]} alt={profile.name} layout="fill" objectFit="cover" className="transition-transform duration-300 ease-in-out hover:scale-105" data-ai-hint="person portrait"/>
                    </div>
                    {profile.photos.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                            {profile.photos.map((photo, index) => (
                                <div key={index} className={cn("relative aspect-square w-full rounded-lg overflow-hidden cursor-pointer border-2 transition-all", mainPhoto === photo ? "border-primary scale-105" : "border-transparent hover:border-primary/50")} onClick={() => setMainPhoto(photo)}>
                                    <Image src={photo} alt={`${profile.name} thumbnail ${index + 1}`} layout="fill" objectFit="cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Profile Info */}
                <div className="w-full md:w-1/2">
                    <Card className="shadow-xl">
                         <CardHeader className="p-6">
                             <div>
                                <CardTitle className="text-4xl font-bold font-headline">{profile.name}, {getAge(profile.dob)}</CardTitle>
                                 <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span>{profile.location}</span>
                                </div>
                             </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                             <div>
                                <h3 className="text-lg font-semibold text-primary mb-2">Sobre mí</h3>
                                <CardDescription className="text-base whitespace-pre-wrap break-words max-w-prose">
                                    {profile.bio}
                                </CardDescription>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                                    <Cake className="w-6 h-6 text-primary" />
                                    <div>
                                        <p className="font-semibold">Nacimiento</p>
                                        <p className="text-sm text-muted-foreground">{format(new Date(profile.dob), 'd MMMM, yyyy', { locale: es })}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                                    <User className="w-6 h-6 text-primary" />
                                    <div>
                                        <p className="font-semibold">Género</p>
                                        <p className="text-sm text-muted-foreground capitalize">{genderMap[profile.gender]}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                                    <Heart className="w-6 h-6 text-primary" />
                                    <div>
                                        <p className="font-semibold">Preferencia</p>
                                        <p className="text-sm text-muted-foreground">{preferenceMap[profile.preference]}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

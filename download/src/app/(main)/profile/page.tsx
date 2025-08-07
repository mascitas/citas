"use client";

import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit, User, Cake, MapPin, Heart, Users } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ProfilePage() {
    const { state } = useAppContext();
    const { profile } = state;

    if (!profile) {
        return <div>Loading profile...</div>;
    }

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
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
        <div className="p-4 sm:p-6 md:p-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
            <Card className="w-full max-w-2xl shadow-2xl relative">
                <Link href="/profile/edit" passHref>
                    <Button variant="outline" size="icon" className="absolute top-4 right-4">
                        <Edit className="w-4 h-4" />
                    </Button>
                </Link>
                <CardHeader className="items-center text-center p-6">
                    <Avatar className="w-40 h-40 border-4 border-primary shadow-lg">
                        <AvatarImage src={profile.photoUrl} alt={profile.name} />
                        <AvatarFallback className="text-5xl">{getInitials(profile.name)}</AvatarFallback>
                    </Avatar>
                    <div className="mt-4">
                      <CardTitle className="text-4xl font-bold font-headline">{profile.name}</CardTitle>
                      <CardDescription className="text-lg whitespace-pre-wrap break-words mt-2 max-w-prose">
                        {profile.bio}
                      </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-lg">
                    <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                        <Cake className="w-8 h-8 text-primary" />
                        <div>
                            <p className="font-semibold">{format(new Date(profile.dob), 'd MMMM, yyyy', { locale: es })}</p>
                            <p className="text-sm text-muted-foreground">{getAge(profile.dob)} años</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                        <MapPin className="w-8 h-8 text-primary" />
                        <div>
                            <p className="font-semibold">{profile.location}</p>
                            <p className="text-sm text-muted-foreground">Ubicación</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                        <User className="w-8 h-8 text-primary" />
                        <div>
                            <p className="font-semibold capitalize">{genderMap[profile.gender]}</p>
                            <p className="text-sm text-muted-foreground">Género</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                        <Heart className="w-8 h-8 text-primary" />
                        <div>
                            <p className="font-semibold">{preferenceMap[profile.preference]}</p>
                            <p className="text-sm text-muted-foreground">Preferencia</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

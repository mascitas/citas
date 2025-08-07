"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Heart, Calendar as CalendarIcon, Upload, LocateFixed, Mail, Trash2 } from 'lucide-react';
import { es } from 'date-fns/locale';

import { useAppContext } from '@/context/AppContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, parse, isValid } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';


const profileFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  email: z.string().email("Por favor, ingresa un correo electrónico válido."),
  dob: z.date({ required_error: "La fecha de nacimiento es obligatoria." }),
  gender: z.enum(['male', 'female', 'other'], { required_error: "Por favor, selecciona un género." }),
  preference: z.enum(['hetero', 'homo', 'bi'], { required_error: "Por favor, selecciona una preferencia." }),
  location: z.string().min(2, "La ubicación es obligatoria."),
  bio: z.string().max(3000, "La biografía no debe exceder los 3000 caracteres.").optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function CreateProfilePage() {
  const { state, dispatch } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<string[]>(['https://placehold.co/600x800.png']);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [dobText, setDobText] = useState("");

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: state.user?.displayName || "",
      email: state.user?.email || "",
      location: "",
      bio: ""
    },
  });

  // Redirect if user is not logged in or already has a profile
  useEffect(() => {
    if (!state.isLoading) {
      if (!state.user) {
        router.replace('/');
      }
      if (state.profile) {
        router.replace('/home');
      }
    }
  }, [state.isLoading, state.user, state.profile, router]);
  
  const handleGeolocation = async () => {
    if (!navigator.geolocation) {
      toast({ variant: "destructive", description: "La geolocalización no es soportada por tu navegador." });
      return;
    }
    setIsLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const { latitude, longitude } = position.coords;
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await response.json();
      const location = `${data.address.city || data.address.town || data.address.village}, ${data.address.country}`;
      form.setValue('location', location);
    } catch (error) {
       toast({ variant: "destructive", description: "No se pudo obtener tu ubicación. Por favor, asegúrate de tener los permisos activados." });
    } finally {
        setIsLocating(false);
    }
  };


  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && photos.length < 4) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto = reader.result as string;
        // If it's the first photo and it's a placeholder, replace it. Otherwise, add.
        if (photos.length === 1 && photos[0].startsWith('https://placehold.co')) {
            setPhotos([newPhoto]);
        } else {
            setPhotos(prev => [...prev, newPhoto]);
        }
      };
      reader.readAsDataURL(file);
    } else if (photos.length >= 4) {
        toast({ variant: 'destructive', description: 'Puedes subir un máximo de 4 fotos.'})
    }
  };

  const removePhoto = (index: number) => {
    if (photos.length > 1) {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    } else {
        // Don't allow removing the last photo, maybe replace with placeholder
        setPhotos(['https://placehold.co/600x800.png']);
    }
  }


  const onSubmit = (data: ProfileFormValues) => {
    const age = new Date().getFullYear() - data.dob.getFullYear();
    if(age < 18) {
      toast({
        variant: "destructive",
        title: "Error de registro",
        description: "Debes tener al menos 18 años para unirte.",
      });
      return;
    }
    if (!state.user) {
        toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para crear un perfil.'});
        return;
    }
    
    // Use the UID from the logged-in user context
    const userId = state.user.uid;

    dispatch({
      type: 'UPDATE_PROFILE',
      payload: {
        id: userId,
        photoUrl: photos[0],
        photos: photos,
        ...data,
        bio: data.bio || '', // Ensure bio is not undefined
        email: data.email, // Make sure email is included
        tokens: 3, // Newly created profiles start with 3 tokens
      },
    });
    router.push('/welcome');
  };
  
    const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters
        let formattedInput = '';

        if (input.length > 0) {
            formattedInput = input.slice(0, 2);
        }
        if (input.length > 2) {
            formattedInput += '/' + input.slice(2, 4);
        }
        if (input.length > 4) {
            formattedInput += '/' + input.slice(4, 8);
        }

        setDobText(formattedInput);

        // Parse the date from text and update the form state if valid
        if (formattedInput.length === 10) {
            const parsedDate = parse(formattedInput, 'dd/MM/yyyy', new Date());
            if (isValid(parsedDate)) {
                form.setValue('dob', parsedDate, { shouldValidate: true });
            }
        }
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            form.setValue('dob', date, { shouldValidate: true });
            setDobText(format(date, 'dd/MM/yyyy'));
        }
    };
  
  if (state.isLoading || !state.user || state.profile) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
                <p className="text-muted-foreground">Cargando...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Heart className="w-10 h-10 text-primary" />
            <CardTitle className="text-4xl font-headline text-primary">+citas</CardTitle>
          </div>
          <CardDescription className="text-lg">¡Casi listo! Completa tu perfil para empezar a conectar.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                  <FormLabel>Fotos (principal y 3 adicionales)</FormLabel>
                   <div className="grid grid-cols-2 gap-4">
                        {photos.map((photo, index) => (
                            <div key={index} className="relative group">
                                <Image src={photo} alt={`Foto de perfil ${index + 1}`} width={200} height={266} className="rounded-lg object-cover aspect-[3/4]" />
                                <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removePhoto(index)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                         {photos.length < 4 && (
                            <div className="flex items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer aspect-[3/4]" onClick={() => fileInputRef.current?.click()}>
                                <div className="text-center">
                                    <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground mt-2">Subir Foto</p>
                                </div>
                            </div>
                        )}
                   </div>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" ref={fileInputRef} />
              </div>

              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="Tu Nombre" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              
               <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="tu@email.com" {...field} disabled={!!state.user?.email} /></FormControl><FormMessage /></FormItem>
              )} />
              
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Fecha de Nacimiento</FormLabel>
                        <div className="flex gap-2 items-center">
                            <Input
                                placeholder="DD/MM/AAAA"
                                value={dobText}
                                onChange={handleDobChange}
                                maxLength={10}
                            />
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button type="button" variant="outline" size="icon">
                                        <CalendarIcon className="w-4 h-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={handleDateSelect}
                                        disabled={(date) =>
                                            date > new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                        locale={es}
                                        captionLayout="dropdown-nav"
                                        fromYear={new Date().getFullYear() - 100}
                                        toYear={new Date().getFullYear() - 18}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
              />


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem><FormLabel>Género</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona tu género" /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="male">Masculino</SelectItem><SelectItem value="female">Femenino</SelectItem><SelectItem value="other">Otro</SelectItem></SelectContent>
                  </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="preference" render={({ field }) => (
                  <FormItem><FormLabel>Preferencia</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona tu preferencia" /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="hetero">Heterosexual</SelectItem><SelectItem value="homo">Homosexual</SelectItem><SelectItem value="bi">Bisexual</SelectItem></SelectContent>
                  </Select><FormMessage /></FormItem>
                )} />
              </div>
              
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                   <div className="flex gap-2 items-center">
                    <Input placeholder="Ciudad, País" {...field} />
                     <Button type="button" variant="outline" size="icon" onClick={handleGeolocation} disabled={isLocating}>
                      <LocateFixed className={cn("w-4 h-4", isLocating && "animate-spin")} />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="bio" render={({ field }) => (
                <FormItem><FormLabel>Biografía</FormLabel><FormControl><Textarea placeholder="Un poco sobre ti..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6">
                Guardar Perfil y Empezar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

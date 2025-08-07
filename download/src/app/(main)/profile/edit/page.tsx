"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Calendar as CalendarIcon, Upload, Save, User, Shield, Trash2 } from 'lucide-react';
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { format, parse, isValid } from "date-fns";

import { useAppContext } from '@/context/AppContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

const profileFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  dob: z.date({ required_error: "La fecha de nacimiento es obligatoria." }),
  gender: z.enum(['male', 'female', 'other'], { required_error: "Por favor, selecciona un género." }),
  preference: z.enum(['hetero', 'homo', 'bi'], { required_error: "Por favor, selecciona una preferencia." }),
  location: z.string().min(2, "La ubicación es obligatoria."),
  bio: z.string().max(3000, "La biografía no debe exceder los 3000 caracteres.").optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es obligatoria."),
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres."),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;


export default function EditProfilePage() {
  const { state, dispatch } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dobText, setDobText] = useState("");

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  useEffect(() => {
    if (state.profile) {
      const dob = new Date(state.profile.dob);
      profileForm.reset({
        name: state.profile.name,
        dob: dob,
        gender: state.profile.gender,
        preference: state.profile.preference,
        location: state.profile.location,
        bio: state.profile.bio,
      });
      setPhotos(state.profile.photos);
      if (isValid(dob)) {
          setDobText(format(dob, 'dd/MM/yyyy'));
      }
    } else {
        router.replace('/');
    }
  }, [state.profile, profileForm, router]);


  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && photos.length < 4) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result as string]);
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
        toast({ variant: 'destructive', description: 'Debes tener al menos una foto.'})
    }
  }


  const onProfileSubmit = (data: ProfileFormValues) => {
    if(!state.profile) return;
    
    dispatch({
      type: 'UPDATE_PROFILE',
      payload: {
        ...state.profile,
        photoUrl: photos[0],
        photos: photos,
        ...data,
      },
    });
    toast({
        title: "¡Perfil Actualizado!",
        description: "Tus cambios han sido guardados exitosamente.",
    });
    router.push('/profile');
  };
  
  const onPasswordSubmit = (data: PasswordFormValues) => {
    // This is a simulation, so we just show a success message
    toast({
        title: "¡Contraseña Cambiada!",
        description: "Tu contraseña ha sido actualizada (simulación).",
    });
    passwordForm.reset();
  }

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

      if (formattedInput.length === 10) {
          const parsedDate = parse(formattedInput, 'dd/MM/yyyy', new Date());
          if (isValid(parsedDate)) {
              profileForm.setValue('dob', parsedDate, { shouldValidate: true });
          } else {
              profileForm.setError("dob", { type: "manual", message: "Fecha inválida." });
          }
      }
  };

  const handleDateSelect = (date: Date | undefined) => {
      if (date) {
          profileForm.setValue('dob', date, { shouldValidate: true });
          setDobText(format(date, 'dd/MM/yyyy'));
      }
  };

  if(!state.profile) return null;

  return (
    <div className="p-4 sm:p-6 md:p-8 flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Configuración de la Cuenta</CardTitle>
          <CardDescription>Gestiona tu perfil y tu configuración de seguridad.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" /> Perfil</TabsTrigger>
                <TabsTrigger value="security"><Shield className="mr-2 h-4 w-4" /> Seguridad</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="mt-6">
                 <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                       <div className="space-y-4">
                            <FormLabel>Fotos (principal y 3 adicionales)</FormLabel>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {photos.map((photo, index) => (
                                    <div key={index} className="relative group">
                                        <Image src={photo} alt={`Foto de perfil ${index + 1}`} width={200} height={266} className="rounded-lg object-cover aspect-[3/4]" />
                                        <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removePhoto(index)}>
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
                            <FormDescription>La primera foto será tu foto de perfil principal.</FormDescription>
                        </div>


                      <FormField control={profileForm.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="Tu Nombre" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      
                       <FormField
                        control={profileForm.control}
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
                        <FormField control={profileForm.control} name="gender" render={({ field }) => (
                          <FormItem><FormLabel>Género</FormLabel><Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecciona tu género" /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="male">Masculino</SelectItem><SelectItem value="female">Femenino</SelectItem><SelectItem value="other">Otro</SelectItem></SelectContent>
                          </Select><FormMessage /></FormItem>
                        )} />
                        <FormField control={profileForm.control} name="preference" render={({ field }) => (
                          <FormItem><FormLabel>Preferencia</FormLabel><Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecciona tu preferencia" /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="hetero">Heterosexual</SelectItem><SelectItem value="homo">Homosexual</SelectItem><SelectItem value="bi">Bisexual</SelectItem></SelectContent>
                          </Select><FormMessage /></FormItem>
                        )} />
                      </div>
                      
                      <FormField control={profileForm.control} name="location" render={({ field }) => (
                        <FormItem><FormLabel>Ubicación</FormLabel><FormControl><Input placeholder="Ciudad, País" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={profileForm.control} name="bio" render={({ field }) => (
                        <FormItem><FormLabel>Biografía</FormLabel><FormControl><Textarea placeholder="Un poco sobre ti..." {...field} /></FormControl><FormMessage /></FormItem>
                      )} />

                      <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6">
                        <Save className="w-5 h-5 mr-2" /> Guardar Cambios
                      </Button>
                    </form>
                  </Form>
              </TabsContent>
              <TabsContent value="security" className="mt-6">
                 <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                       <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                        <FormItem><FormLabel>Contraseña Actual</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                        <FormItem><FormLabel>Nueva Contraseña</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                        <FormItem><FormLabel>Confirmar Nueva Contraseña</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                       <Button type="submit" className="w-full text-lg py-6">
                        <Shield className="w-5 h-5 mr-2" /> Cambiar Contraseña
                      </Button>
                    </form>
                 </Form>
              </TabsContent>
            </Tabs>

        </CardContent>
      </Card>
    </div>
  );
}

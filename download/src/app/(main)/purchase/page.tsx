"use client";

import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Zap, CheckCircle, Share2, Gift } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

const packages = [
  { tokens: 3, price: 500, label: "Paquete Básico" },
  { tokens: 9, price: 1000, label: "Paquete Popular" },
  { tokens: 25, price: 2000, label: "Paquete Premium" },
]

const REFERRAL_GOAL = 5;

export default function PurchasePage() {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState(packages[1]);
  const router = useRouter();

  const referralCount = state.profile?.referralCount ?? 0;

  const handleShare = async () => {
    const url = `${window.location.protocol}//${window.location.host}/`;
    const shareData = {
      title: '+citas',
      text: '¡Únete a +citas y encuentra conexiones reales! Menos chat, más encuentros.',
      url: url,
    }

    let shared = false;

    // --- Primary Method: Native Share API ---
    if (navigator.share) {
        try {
            await navigator.share(shareData);
            toast({ title: '¡Gracias por compartir!' });
            shared = true;
        } catch (error) {
            // Ignore AbortError which is triggered when the user closes the share dialog
            if (error instanceof DOMException && error.name === 'AbortError') {
                // User cancelled, do nothing.
            } else {
                console.error('Navigator.share error:', error);
            }
        }
    }

    // --- Fallback Method: Clipboard API ---
    if (!shared && navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(shareData.url);
            toast({ title: '¡Enlace copiado!', description: 'Has copiado el enlace para compartir.' });
            shared = true;
        } catch (error) {
            console.error('Clipboard API error:', error);
        }
    }
    
    // --- Final Fallback: Always increment count ---
    // This ensures that even if both APIs fail (e.g., due to browser restrictions),
    // the user is still rewarded for the attempt, avoiding a frustrating experience.
    if (!shared) {
        toast({ title: '¡Gracias por intentar compartir!', description: 'Hemos registrado tu intento.' });
    }

    dispatch({ type: 'INCREMENT_REFERRAL_COUNT' });
  };


  const handleMercadoPago = () => {
    toast({
        title: "Redirigiendo a Mercado Pago...",
        description: "Esto es una simulación. No se procesará ningún pago real."
    });
    setTimeout(() => {
        window.open('https://www.mercadopago.com', '_blank');
        dispatch({ type: 'PURCHASE_TOKENS', payload: selectedPackage.tokens });
        toast({
            title: '¡Compra Exitosa!',
            description: `${selectedPackage.tokens} Citas Tokens han sido añadidos a tu cuenta.`,
        });
    }, 1500)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Zap className="w-16 h-16 text-primary animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline">¡Consigue más Citas Tokens!</CardTitle>
          <CardDescription className="text-lg">
            Compra Citas Tokens para poder enviar más solicitudes de citas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map(pkg => (
              <div 
                key={pkg.tokens}
                className={cn(
                  "p-6 rounded-lg border-2 flex flex-col items-center cursor-pointer transition-all relative",
                  selectedPackage.tokens === pkg.tokens ? "border-primary bg-primary/10 shadow-lg" : "border-border hover:border-primary/50"
                )}
                onClick={() => setSelectedPackage(pkg)}
              >
                 {selectedPackage.tokens === pkg.tokens && <CheckCircle className="w-6 h-6 text-primary absolute -top-3 -right-3 bg-background rounded-full" />}
                <h3 className="text-xl font-semibold">{pkg.label}</h3>
                <p className="text-4xl font-bold text-primary my-2">{pkg.tokens}</p>
                <p className="text-muted-foreground mb-2">Citas Tokens</p>
                <p className="text-2xl font-semibold">${pkg.price}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-lg">Tu balance actual:</p>
            <p className="text-6xl font-extrabold text-primary">{state.tokens}</p>
            <p className="text-muted-foreground">Tokens</p>
          </div>

          <Separator className="my-8" />
          
           <div className="text-center">
                <h3 className="text-2xl font-bold font-headline">¡O Gana Tokens Gratis!</h3>
                <p className="text-muted-foreground mt-2">Comparte la aplicación con tus amigos. ¡Cada 5 compartidos, te regalamos 1 Cita Token!</p>
                <Card className="mt-4 p-6 bg-secondary/50">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <Gift className="w-8 h-8 text-primary"/>
                        <p className="text-2xl font-bold">Progreso: {referralCount}/{REFERRAL_GOAL}</p>
                    </div>
                    <Progress value={(referralCount / REFERRAL_GOAL) * 100} className="w-full" />
                    <Button className="w-full mt-6 text-lg py-6" onClick={handleShare}>
                        <Share2 className="w-5 h-5 mr-3" /> Compartir Enlace
                    </Button>
                </Card>
           </div>
        </CardContent>
        <CardFooter className="flex-col gap-4 pt-6">
            <Button className="w-full text-lg py-6 bg-accent hover:bg-accent/90" onClick={handleMercadoPago}>
              <CreditCard className="w-5 h-5 mr-3" /> Pagar ${selectedPackage.price} con Mercado Pago
            </Button>
            <p className="text-xs text-muted-foreground">Serás redirigido a la pasarela de pago de Mercado Pago.</p>
        </CardFooter>
      </Card>
    </div>
  );
}

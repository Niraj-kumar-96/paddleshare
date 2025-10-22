
'use client';

import { createPaymentIntent } from '@/ai/flows/create-payment-intent';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useMemoFirebase } from '@/firebase/provider';
import { STRIPE_PUBLISHABLE_KEY } from '@/app/config';
import { useToast } from '@/hooks/use-toast';
import { Ride } from '@/types/ride';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { ArrowLeft, Loader } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

function CheckoutForm({ ride }: { ride: Ride }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !firestore || !user) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message || 'An unexpected error occurred.');
      setIsLoading(false);
      return;
    }

    const { clientSecret, paymentIntentId } = await createPaymentIntent({
      bookingId: 'temp', // This will be replaced by the actual bookingId after creation
      amount: ride.fare * 1, // Assuming 1 seat for now
    });
    
    if(!clientSecret){
        setErrorMessage('Could not create payment intent. Please try again.');
        setIsLoading(false);
        return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/bookings`,
      },
      redirect: 'if_required', 
    });

    if (error) {
      setErrorMessage(error.message || 'An unexpected error occurred.');
    } else {
      const batch = writeBatch(firestore);

      const bookingRef = doc(collection(firestore, 'bookings'));
      batch.set(bookingRef, {
        rideId: ride.id,
        passengerId: user.uid,
        bookingTime: serverTimestamp(),
        numberOfSeats: 1,
        status: 'confirmed',
        paymentStatus: 'paid',
      });
      
      const rideRef = doc(firestore, 'rides', ride.id);
      batch.update(rideRef, {
        availableSeats: ride.availableSeats - 1,
        passengers: [...(ride.passengers || []), user.uid],
      });
      
      await batch.commit();

      toast({
        title: 'Payment Successful!',
        description: 'Your ride is confirmed. Enjoy the trip!',
      });
      router.push('/dashboard/bookings');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
        <PaymentElement />
        <Button disabled={isLoading || !stripe || !elements} className="w-full mt-6" size="lg">
            {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? 'Processing...' : `Pay $${(ride.fare * 1).toFixed(2)}`}
        </Button>
        {errorMessage && <div className="mt-4 text-sm text-destructive">{errorMessage}</div>}
    </form>
  );
}

function CheckoutPageContent() {
  const params = useParams();
  const rideId = params.bookingId as string; // It's actually rideId
  const firestore = useFirestore();
  
  const [options, setOptions] = useState<StripeElementsOptions | null>(null);

  const rideRef = useMemoFirebase(() => {
    if (!firestore || !rideId) return null;
    return doc(firestore, 'rides', rideId);
  }, [firestore, rideId]);
  const { data: ride, isLoading: isLoadingRide } = useDoc<Ride>(rideRef);

  useEffect(() => {
    if (ride) {
        createPaymentIntent({ 
            bookingId: 'temp', 
            amount: ride.fare * 1 
        }).then(({ clientSecret }) => {
            setOptions({
                clientSecret,
                appearance: { theme: 'stripe' },
            });
        }).catch(error => {
            console.error("Error creating payment intent:", error);
        });
    }
  }, [ride]);
  
  const isLoading = isLoadingRide;

  if (isLoading) {
    return (
        <div className="max-w-md mx-auto">
            <Skeleton className="h-8 w-48 mb-4" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-full mt-4" />
                </CardContent>
            </Card>
        </div>
    )
  }

  if (!ride) {
    return <p>Ride not found.</p>
  }
  
  if (ride.availableSeats < 1) {
      return (
          <div className="max-w-md mx-auto text-center">
              <Card>
                  <CardHeader>
                      <CardTitle>Ride is Full</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p>This ride is no longer available.</p>
                       <Button asChild className="mt-4">
                           <Link href="/search">Find another ride</Link>
                       </Button>
                  </CardContent>
              </Card>
          </div>
      )
  }

  return (
    <div className="max-w-md mx-auto">
        <Link href={`/search`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Search
        </Link>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Complete Your Booking</CardTitle>
                <CardDescription>Securely pay for your ride from {ride.origin} to {ride.destination}.</CardDescription>
            </CardHeader>
            <CardContent>
                {options && stripePromise && (
                    <Elements stripe={stripePromise} options={options}>
                        <CheckoutForm ride={ride}/>
                    </Elements>
                )}
                {!options && <div className="flex justify-center p-8"><Loader className="animate-spin" /></div>}
            </CardContent>
        </Card>
    </div>
  );
}

export default function CheckoutPage() {
    return (
        <ProtectedRoute>
            <div className="container py-12">
                <CheckoutPageContent />
            </div>
        </ProtectedRoute>
    )
}

    

'use client';

import { createPaymentIntent } from '@/ai/flows/create-payment-intent';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc, useFirestore } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useMemoFirebase } from '@/firebase/provider';
import { STRIPE_PUBLISHABLE_KEY } from '@/app/config';
import { useToast } from '@/hooks/use-toast';
import { Booking } from '@/types/booking';
import { Ride } from '@/types/ride';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { doc } from 'firebase/firestore';
import { ArrowLeft, Loader } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ booking, ride }: { booking: Booking; ride: Ride }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
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
    
    // Create the PaymentIntent and obtain clientSecret
    const { clientSecret } = await createPaymentIntent({
      bookingId: booking.id,
      amount: ride.fare * booking.numberOfSeats,
    });


    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/bookings`,
      },
      redirect: 'if_required', // Important to handle success manually
    });

    if (error) {
      setErrorMessage(error.message || 'An unexpected error occurred.');
    } else {
      // Payment successful
      if (firestore) {
        const bookingRef = doc(firestore, 'bookings', booking.id);
        updateDocumentNonBlocking(bookingRef, { paymentStatus: 'paid' });
      }
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
            {isLoading ? 'Processing...' : `Pay $${(ride.fare * booking.numberOfSeats).toFixed(2)}`}
        </Button>
        {errorMessage && <div className="mt-4 text-sm text-destructive">{errorMessage}</div>}
    </form>
  );
}

function CheckoutPageContent() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  const firestore = useFirestore();
  
  const [options, setOptions] = useState<StripeElementsOptions | null>(null);

  const bookingRef = useMemoFirebase(() => {
    if (!firestore || !bookingId) return null;
    return doc(firestore, 'bookings', bookingId);
  }, [firestore, bookingId]);
  const { data: booking, isLoading: isLoadingBooking } = useDoc<Booking>(bookingRef);

  const rideRef = useMemoFirebase(() => {
    if (!firestore || !booking) return null;
    return doc(firestore, 'rides', booking.rideId);
  }, [firestore, booking]);
  const { data: ride, isLoading: isLoadingRide } = useDoc<Ride>(rideRef);

  useEffect(() => {
    if (booking && ride) {
        createPaymentIntent({ 
            bookingId: booking.id, 
            amount: ride.fare * booking.numberOfSeats 
        }).then(({ clientSecret }) => {
            setOptions({
                clientSecret,
                appearance: { theme: 'stripe' },
            });
        });
    }
  }, [booking, ride]);
  
  const isLoading = isLoadingBooking || isLoadingRide;

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

  if (!booking || !ride) {
    return <p>Booking not found.</p>
  }

  return (
    <div className="max-w-md mx-auto">
        <Link href="/dashboard/bookings" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Bookings
        </Link>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Complete Your Payment</CardTitle>
                <CardDescription>Securely pay for your ride from {ride.origin} to {ride.destination}.</CardDescription>
            </CardHeader>
            <CardContent>
                {options && (
                    <Elements stripe={stripePromise} options={options}>
                        <CheckoutForm booking={booking} ride={ride}/>
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

'use client';

import { createPaymentIntent } from '@/ai/flows/create-payment-intent';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { STRIPE_PUBLISHABLE_KEY } from '@/app/config';
import { useToast } from '@/hooks/use-toast';
import { Ride } from '@/types/ride';
import { Booking } from '@/types/booking';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { doc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { ArrowLeft, Loader, WalletCards } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

function CheckoutForm({ booking, ride }: { booking: Booking, ride: Ride }) {
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
      setErrorMessage('Services are not ready. Please try again.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message || 'An unexpected error occurred while preparing your payment.');
      setIsLoading(false);
      return;
    }
    
    const { clientSecret } = await createPaymentIntent({
      bookingId: booking.id,
      amount: ride.fare * booking.numberOfSeats,
    });
    
    if(!clientSecret){
        setErrorMessage('Could not create payment intent. Please try again.');
        setIsLoading(false);
        return;
    }

    const { error: confirmationError, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/bookings`,
      },
      redirect: 'if_required', 
    });

    if (confirmationError) {
      setErrorMessage(confirmationError.message || 'An unexpected error occurred during payment confirmation.');
      setIsLoading(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      try {
        const bookingRef = doc(firestore, 'bookings', booking.id);
        await runTransaction(firestore, async (transaction) => {
            transaction.update(bookingRef, {
                paymentStatus: 'paid',
                updatedAt: serverTimestamp()
            });
        });
        
        toast({
          title: 'Payment Successful!',
          description: 'Your ride is confirmed. Enjoy the trip!',
        });
        router.push('/dashboard/bookings');

      } catch (e: any) {
        console.error("Transaction failed: ", e);
        setErrorMessage(e.toString() || 'Failed to update booking status. Please contact support. Your payment may need to be refunded.');
        toast({
            variant: "destructive",
            title: "Booking Update Failed",
            description: e.toString() || 'Could not finalize your booking after payment. Contacting support.'
        })
      }
    } else {
        setErrorMessage(`Payment status: ${paymentIntent?.status}. Please try again.`);
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
  const [options, setOptions] = useState<StripeElementsOptions | null>(null);

  const { data: booking, isLoading: isLoadingBooking } = useDoc<Booking>(bookingId ? `bookings/${bookingId}` : null);
  const { data: ride, isLoading: isLoadingRide } = useDoc<Ride>(booking ? `rides/${booking.rideId}` : null);

  useEffect(() => {
    if (booking && ride && ride.fare > 0 && booking.status === 'confirmed' && booking.paymentStatus === 'pending') {
        createPaymentIntent({ 
            bookingId: booking.id, 
            amount: ride.fare * booking.numberOfSeats 
        }).then(({ clientSecret }) => {
            setOptions({
                clientSecret,
                appearance: { theme: 'stripe' },
            });
        }).catch(error => {
            console.error("Error creating payment intent:", error);
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
    return (
        <div className="text-center">
            <p>Booking or Ride not found.</p>
             <Button asChild variant="link" className="mt-4">
                <Link href="/dashboard/bookings">Go to My Trips</Link>
            </Button>
        </div>
    );
  }
  
  if (booking.status !== 'confirmed' || booking.paymentStatus !== 'pending') {
      return (
          <div className="max-w-md mx-auto text-center">
              <Card>
                  <CardHeader>
                      <CardTitle>Invalid Booking State</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p>This booking cannot be paid for at this time. It might be pending, already paid, or cancelled.</p>
                       <Button asChild className="mt-4">
                           <Link href="/dashboard/bookings">Go to My Trips</Link>
                       </Button>
                  </CardContent>
              </Card>
          </div>
      )
  }

  return (
    <div className="max-w-md mx-auto">
        <Link href={`/dashboard/bookings`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to My Trips
        </Link>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Complete Your Booking</CardTitle>
                <CardDescription>Securely pay for your ride from {ride.origin} to {ride.destination}.</CardDescription>
            </CardHeader>
            <CardContent>
                {options && stripePromise ? (
                    <Elements stripe={stripePromise} options={options}>
                        <CheckoutForm booking={booking} ride={ride} />
                    </Elements>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 gap-4">
                    <WalletCards className="w-8 h-8 text-muted-foreground" />
                    <p className="text-muted-foreground">Initializing secure payment...</p>
                  </div>
                )}
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

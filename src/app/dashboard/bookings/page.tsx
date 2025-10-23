"use client";

import { useCollection, useFirestore, useUser } from "@/firebase";
import { Booking } from "@/types/booking";
import { collection, query, where, doc, getDocs, orderBy, deleteDoc, updateDoc, runTransaction } from "firebase/firestore";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Ride } from "@/types/ride";
import { useDoc } from "@/firebase/firestore/use-doc";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare, Star, CreditCard, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";


function BookingItem({ booking }: { booking: Booking }) {
    const firestore = useFirestore();
    const [hasReviewed, setHasReviewed] = useState(true);
    const { user } = useUser();
    const { toast } = useToast();

    const { data: ride, isLoading } = useDoc<Ride>(booking ? `rides/${booking.rideId}` : null);

    useEffect(() => {
        const checkReview = async () => {
            if (!firestore || !user || !ride) return;
            
            const reviewsQuery = query(
                collection(firestore, "reviews"),
                where("rideId", "==", ride.id),
                where("reviewerId", "==", user.uid)
            );
            const reviewSnapshot = await getDocs(reviewsQuery);
            setHasReviewed(!reviewSnapshot.empty);
        };
        
        if(ride && user) {
            checkReview();
        }

    }, [firestore, user, ride]);

    const handleCancelBooking = async () => {
        if (!firestore || !ride) return;

        const bookingRef = doc(firestore, 'bookings', booking.id);
        const rideRef = doc(firestore, 'rides', ride.id);
        
        try {
            await runTransaction(firestore, async (transaction) => {
                const rideDoc = await transaction.get(rideRef);
                if (!rideDoc.exists()) {
                    throw new Error("This ride no longer exists.");
                }

                const currentRideData = rideDoc.data() as Ride;

                // If the booking was confirmed, add the seats back to the ride.
                if (booking.status === 'confirmed') {
                    transaction.update(rideRef, {
                        availableSeats: currentRideData.availableSeats + booking.numberOfSeats
                    });
                }
                 // Always update the booking status to 'cancelled'
                transaction.update(bookingRef, { status: 'cancelled' });
            });

            toast({
                title: "Booking Cancelled",
                description: "Your booking has been successfully cancelled."
            });

        } catch (error: any) {
            console.error("Cancellation Error: ", error);
            toast({
                variant: 'destructive',
                title: 'Cancellation Failed',
                description: error.message || "Could not cancel your booking. Please try again."
            })
        }
    }

    const isRidePast = ride ? new Date(ride.departureTime) < new Date() : false;
    const canCancel = !isRidePast && (booking.status === 'confirmed' || booking.status === 'pending');
    const totalFare = ride ? (ride.fare * booking.numberOfSeats).toFixed(2) : '0.00';

    return (
        <Card className="bg-card/80 flex flex-col">
            <CardContent className="p-4 flex-1">
                {isLoading && (
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex justify-between items-center mt-2">
                           <Skeleton className="h-5 w-1/4" />
                           <Skeleton className="h-5 w-1/4" />
                        </div>
                    </div>
                )}
                {ride && (
                    <div>
                        <div className="flex justify-between items-start">
                            <p className="font-bold text-lg">{ride.origin} to {ride.destination}</p>
                             <Badge 
                                variant={booking.status === 'confirmed' ? 'default' : (booking.status === 'cancelled' || booking.status === 'declined' ? 'destructive' : 'secondary')} 
                                className="capitalize"
                            >
                                {booking.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            On: {new Date(ride.departureTime).toLocaleDateString()} at {new Date(ride.departureTime).toLocaleTimeString()}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                            <p>Seats Booked: <span className="font-semibold">{booking.numberOfSeats}</span></p>
                            <p className="font-semibold">${totalFare}</p>
                        </div>
                    </div>
                )}
            </CardContent>
             {ride && (
                <CardFooter className="p-4 border-t flex flex-col gap-2">
                     {booking.status === 'pending' && !isRidePast && (
                        <>
                            <p className="text-sm text-muted-foreground text-center w-full">Waiting for driver approval...</p>
                            {canCancel &&
                                <Button variant="destructive" className="w-full" onClick={handleCancelBooking}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Request
                                </Button>
                            }
                        </>
                     )}

                     {booking.status === 'confirmed' && booking.paymentStatus === 'pending' && !isRidePast && (
                        <div className="w-full grid gap-2">
                            <Button asChild className="w-full">
                                <Link href={`/dashboard/checkout/${booking.id}`}>
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Proceed to Payment
                                </Link>
                            </Button>
                             {canCancel &&
                                <Button variant="destructive" className="w-full" onClick={handleCancelBooking}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Booking
                                </Button>
                            }
                        </div>
                     )}

                     {booking.status === 'confirmed' && booking.paymentStatus === 'paid' && !isRidePast && (
                        <>
                             <Button asChild className="w-full">
                                <Link href={`/dashboard/bookings/${booking.id}`}>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    View Chat
                                </Link>
                            </Button>
                        </>
                     )}

                    {isRidePast && booking.paymentStatus === 'paid' && !hasReviewed && (
                        <Button asChild variant="outline" className="w-full">
                            <Link href={`/dashboard/review/${booking.id}`}>
                                <Star className="mr-2 h-4 w-4" />
                                Leave a Review
                            </Link>
                        </Button>
                    )}
                </CardFooter>
            )}
        </Card>
    );
}

function BookingSkeleton() {
    return (
        <Card className="bg-card/80">
            <CardContent className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between items-center mt-2">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-5 w-1/4" />
                </div>
            </CardContent>
             <CardFooter className="p-4 border-t">
                 <Skeleton className="h-10 w-full" />
             </CardFooter>
        </Card>
    );
}


export default function BookingsPage() {
    const { user } = useUser();
    
    const { data: passengerBookings, isLoading } = useCollection<Booking>(
        user ? 'bookings' : null,
        user ? where("passengerId", "==", user?.uid ?? ' ') : undefined, 
        user ? orderBy("bookingTime", "desc") : undefined
    );

    return (
        <div>
            <h1 className="text-3xl font-headline font-bold mb-2">My Trips</h1>
            <p className="text-muted-foreground mb-8">All the trips you have booked as a passenger.</p>

            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {[...Array(3)].map((_, i) => <BookingSkeleton key={i} />)}
                </div>
            )}
            
            {!isLoading && (!passengerBookings || passengerBookings.length === 0) && (
                <div className="text-center py-12 border rounded-lg bg-card/10">
                    <h3 className="mt-4 text-lg font-medium">No trips booked yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Find a ride and start your journey!</p>
                    <Button asChild className="mt-6">
                        <Link href="/search">Find a Ride</Link>
                    </Button>
                </div>
            )}

            {passengerBookings && passengerBookings.length > 0 && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {passengerBookings.map(booking => (
                        <BookingItem key={booking.id} booking={booking} />
                    ))}
                </div>
            )}
        </div>
    );
}

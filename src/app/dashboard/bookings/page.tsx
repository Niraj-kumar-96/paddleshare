
"use client";

import { useCollection, useFirestore, useUser } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { Booking } from "@/types/booking";
import { collection, query, where, doc, getDocs, orderBy } from "firebase/firestore";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Ride } from "@/types/ride";
import { useDoc } from "@/firebase/firestore/use-doc";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare, Star, CreditCard, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";


function BookingItem({ booking }: { booking: Booking }) {
    const firestore = useFirestore();
    const [hasReviewed, setHasReviewed] = useState(true);
    const { user } = useUser();

    const rideRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, "rides", booking.rideId);
    }, [firestore, booking.rideId]);

    const { data: ride, isLoading } = useDoc<Ride>(rideRef);

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

    }, [firestore, user, ride, booking.id]);


    const isRidePast = ride ? new Date(ride.departureTime) < new Date() : false;

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
                             <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'declined' ? 'destructive' : 'secondary'} className="capitalize">{booking.status}</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            On: {new Date(ride.departureTime).toLocaleDateString()} at {new Date(ride.departureTime).toLocaleTimeString()}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                            <p>Seats Booked: <span className="font-semibold">{booking.numberOfSeats}</span></p>
                            <p className="font-semibold">${ride.fare * booking.numberOfSeats}</p>
                        </div>
                    </div>
                )}
            </CardContent>
             {ride && booking.status === 'confirmed' && (
                <CardFooter className="p-4 border-t flex flex-col gap-2">
                     {booking.paymentStatus === 'pending' && !isRidePast && (
                        <Button asChild className="w-full">
                            <Link href={`/dashboard/checkout/${booking.id}`}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Pay Now
                            </Link>
                        </Button>
                     )}
                     {booking.paymentStatus === 'paid' && (
                        <>
                             <Button asChild className="w-full">
                                <Link href={`/dashboard/bookings/${booking.id}`}>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    View Chat
                                </Link>
                            </Button>
                            {isRidePast && !hasReviewed && (
                                <Button asChild variant="outline" className="w-full">
                                    <Link href={`/dashboard/review/${booking.id}`}>
                                        <Star className="mr-2 h-4 w-4" />
                                        Leave a Review
                                    </Link>
                                </Button>
                            )}
                        </>
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
    const firestore = useFirestore();

    const passengerBookingsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, "bookings"), where("passengerId", "==", user.uid), orderBy("bookingTime", "desc"));
    }, [firestore, user]);

    const { data: passengerBookings, isLoading } = useCollection<Booking>(passengerBookingsQuery);

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
                <p>You have not booked any trips yet.</p>
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

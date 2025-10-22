
"use client";

import { useCollection, useFirestore, useUser } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { Booking } from "@/types/booking";
import { collection, query, where } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Ride } from "@/types/ride";
import { useDoc } from "@/firebase/firestore/use-doc";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

function BookingItem({ booking }: { booking: Booking }) {
    const firestore = useFirestore();
    const rideRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, "rides", booking.rideId);
    }, [firestore, booking.rideId]);

    const { data: ride, isLoading } = useDoc<Ride>(rideRef);

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
                        <p className="font-bold text-lg">{ride.origin} to {ride.destination}</p>
                        <p className="text-muted-foreground text-sm">
                            On: {new Date(ride.departureTime).toLocaleDateString()} at {new Date(ride.departureTime).toLocaleTimeString()}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                            <p>Seats Booked: <span className="font-semibold">{booking.numberOfSeats}</span></p>
                            <p className="capitalize">Status: <span className="font-semibold">{booking.status}</span></p>
                        </div>
                    </div>
                )}
            </CardContent>
             {ride && (
                <div className="p-4 border-t">
                     <Button asChild className="w-full">
                        <Link href={`/dashboard/bookings/${booking.id}`}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            View Chat
                        </Link>
                    </Button>
                </div>
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
        </Card>
    );
}


export default function BookingsPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const passengerBookingsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, "bookings"), where("passengerId", "==", user.uid));
    }, [firestore, user]);

    const { data: passengerBookings, isLoading } = useCollection<Booking>(passengerBookingsQuery);

    return (
        <div>
            <h1 className="text-3xl font-headline font-bold mb-2">My Bookings</h1>
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

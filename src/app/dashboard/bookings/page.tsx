
"use client";

import { useCollection, useFirestore, useUser } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { Booking } from "@/types/booking";
import { collection, query, where } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ride } from "@/types/ride";
import { useDoc } from "@/firebase/firestore/use-doc";
import { doc } from "firebase/firestore";
import { Loader } from "lucide-react";

function BookingItem({ booking }: { booking: Booking }) {
    const firestore = useFirestore();
    const rideRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, "rides", booking.rideId);
    }, [firestore, booking.rideId]);

    const { data: ride, isLoading } = useDoc<Ride>(rideRef);

    return (
        <Card className="bg-card/80">
            <CardContent className="p-4">
                {isLoading && <Loader className="animate-spin" />}
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
                <div className="flex justify-center">
                    <Loader className="animate-spin" />
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

'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { Ride } from "@/types/ride";
import { Booking } from "@/types/booking";

export default function DashboardPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const driverRidesQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, "rides"), where("driverId", "==", user.uid));
    }, [firestore, user]);

    const passengerBookingsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, "bookings"), where("passengerId", "==", user.uid));
    }, [firestore, user]);

    const { data: driverRides } = useCollection<Ride>(driverRidesQuery);
    const { data: passengerBookings } = useCollection<Booking>(passengerBookingsQuery);

    const totalEarnings = useMemoFirebase(() => {
        // This is a placeholder calculation. In a real app, you'd likely want to
        // sum fares from completed rides where bookings were confirmed.
        return driverRides?.reduce((acc, ride) => acc + ride.fare, 0) || 0;
    }, [driverRides]);
    

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-headline font-bold">Welcome, {user?.displayName || 'User'}!</h1>
                    <p className="text-muted-foreground">Here's what's happening with your rides.</p>
                </div>
                <Button asChild>
                    <Link href="/offer-ride">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Offer New Ride
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Rides</CardTitle>
                        <CardDescription>As a driver</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{driverRides?.length || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Trips</CardTitle>
                        <CardDescription>As a passenger</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{passengerBookings?.length || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Earnings</CardTitle>
                        <CardDescription>This month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">${totalEarnings.toFixed(2)}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>My Offered Rides</CardTitle>
                        <CardDescription>Rides you are currently offering.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {driverRides && driverRides.length > 0 ? (
                            <ul className="space-y-4">
                                {driverRides.slice(0, 5).map(ride => (
                                    <li key={ride.id} className="border-b pb-2">
                                        <p className="font-semibold">{ride.origin} to {ride.destination}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(ride.departureTime).toLocaleString()}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>You have not offered any rides yet.</p>
                        )}
                        <Button variant="outline" asChild className="mt-4">
                            <Link href="/dashboard/rides">View All My Rides</Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>My Booked Trips</CardTitle>
                        <CardDescription>Your upcoming trips as a passenger.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {passengerBookings && passengerBookings.length > 0 ? (
                             <ul className="space-y-4">
                                {passengerBookings.slice(0, 5).map(booking => (
                                    <li key={booking.id} className="border-b pb-2">
                                        <p className="font-semibold">Booking for ride ID: {booking.rideId.substring(0,6)}...</p>
                                        <p className="text-sm text-muted-foreground">Seats: {booking.numberOfSeats}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>You have not booked any trips yet.</p>
                        )}
                         <Button variant="outline" asChild className="mt-4">
                            <Link href="/dashboard/bookings">View All My Bookings</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

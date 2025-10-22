'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { Ride } from "@/types/ride";
import { Booking } from "@/types/booking";

function RideList({ rides }: { rides: Ride[] | null }) {
    if (!rides || rides.length === 0) {
        return <p>No rides found.</p>;
    }
    return (
        <ul>
            {rides.map(ride => (
                <li key={ride.id} className="border-b py-2">
                    <p className="font-semibold">{ride.origin} to {ride.destination}</p>
                    <p className="text-sm text-muted-foreground">
                        {new Date(ride.departureTime).toLocaleString()}
                    </p>
                </li>
            ))}
        </ul>
    );
}

function BookingList({ bookings }: { bookings: Booking[] | null }) {
    if (!bookings || bookings.length === 0) {
        return <p>No bookings found.</p>;
    }
    return (
        <ul>
            {bookings.map(booking => (
                <li key={booking.id} className="border-b py-2">
                    <p>Booking for ride {booking.rideId}</p>
                    <p className="text-sm text-muted-foreground">Seats: {booking.numberOfSeats}</p>
                </li>
            ))}
        </ul>
    );
}

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

            <Tabs defaultValue="as-driver">
                <TabsList>
                    <TabsTrigger value="as-driver">My Offered Rides</TabsTrigger>
                    <TabsTrigger value="as-passenger">My Booked Trips</TabsTrigger>
                </TabsList>
                <TabsContent value="as-driver">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Rides You're Driving</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RideList rides={driverRides} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="as-passenger">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Trips You've Booked</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <BookingList bookings={passengerBookings} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

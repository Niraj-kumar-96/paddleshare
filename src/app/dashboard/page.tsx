'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { query, where } from "firebase/firestore";
import { useMemo } from "react";
import { Ride } from "@/types/ride";
import { Booking } from "@/types/booking";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
    const { user } = useUser();

    const driverRidesQuery = useMemo(() => {
        if (!user) return null;
        return { path: "rides", constraints: [where("driverId", "==", user.uid)] };
    }, [user]);

    const passengerBookingsQuery = useMemo(() => {
        if (!user) return null;
        return { path: "bookings", constraints: [where("passengerId", "==", user.uid)] };
    }, [user]);

    const { data: driverRides, isLoading: isLoadingRides } = useCollection<Ride>(
        driverRidesQuery?.path,
        driverRidesQuery?.constraints
    );
    const { data: passengerBookings, isLoading: isLoadingBookings } = useCollection<Booking>(
        passengerBookingsQuery?.path,
        passengerBookingsQuery?.constraints
    );

    const totalEarnings = useMemo(() => {
        return driverRides?.reduce((acc, ride) => acc + ride.fare, 0) || 0;
    }, [driverRides]);
    
    const isLoading = isLoadingRides || isLoadingBookings;

    const StatsSkeleton = () => (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-3/5" />
                    <Skeleton className="h-4 w-2/5" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-1/4" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-3/5" />
                    <Skeleton className="h-4 w-2/5" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-1/4" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-3/5" />
                    <Skeleton className="h-4 w-2/5" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-1/4" />
                </CardContent>
            </Card>
        </div>
    );

    const ListSkeleton = () => (
        <ul className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <li key={i} className="border-b pb-2 space-y-2">
                    <Skeleton className="h-5 w-4/5" />
                    <Skeleton className="h-4 w-1/2" />
                </li>
            ))}
        </ul>
    );


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

            {isLoading ? <StatsSkeleton /> : (
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
            )}


            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>My Offered Rides</CardTitle>
                        <CardDescription>Rides you are currently offering.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <ListSkeleton /> : (
                            driverRides && driverRides.length > 0 ? (
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
                            )
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
                        {isLoading ? <ListSkeleton /> : (
                             passengerBookings && passengerBookings.length > 0 ? (
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
                            )
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

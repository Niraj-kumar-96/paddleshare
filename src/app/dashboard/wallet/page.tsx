"use client";

import { useCollection, useUser } from "@/firebase";
import { query, where } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ride } from "@/types/ride";
import { Booking } from "@/types/booking";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMemo } from "react";

function WalletSkeleton() {
    return (
        <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-1/3" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                         <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-1/3" />
                    </CardContent>
                </Card>
            </div>
            <Card>
                 <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function WalletPage() {
    const { user } = useUser();

    const { data: rides, isLoading: isLoadingRides } = useCollection<Ride>(
        user ? "rides" : null,
        user ? where("driverId", "==", user.uid) : undefined
    );

    const rideIds = useMemo(() => rides?.map(r => r.id) || [], [rides]);

    const { data: bookings, isLoading: isLoadingBookings } = useCollection<Booking>(
        rideIds.length > 0 ? "bookings" : null,
        rideIds.length > 0 ? where("rideId", "in", rideIds) : undefined,
        rideIds.length > 0 ? where("paymentStatus", "==", "paid") : undefined
    );

    const { totalEarnings, totalSeatsSold, paidRides } = useMemo(() => {
        if (!bookings || !rides) return { totalEarnings: 0, totalSeatsSold: 0, paidRides: [] };

        const earnings = bookings.reduce((acc, booking) => {
            const ride = rides.find(r => r.id === booking.rideId);
            return acc + (ride ? ride.fare * booking.numberOfSeats : 0);
        }, 0);
        
        const seatsSold = bookings.reduce((acc, booking) => acc + booking.numberOfSeats, 0);

        const rideMap = new Map(rides.map(r => [r.id, r]));
        const ridesWithPaidBookings = bookings.map(booking => {
            return {
                ...rideMap.get(booking.rideId)!,
                booking
            };
        }).filter(Boolean);


        return { totalEarnings: earnings, totalSeatsSold: seatsSold, paidRides: ridesWithPaidBookings };

    }, [bookings, rides]);

    const isLoading = isLoadingRides || (rideIds.length > 0 && isLoadingBookings);

    if (isLoading) {
        return <WalletSkeleton />;
    }

    return (
        <div>
            <h1 className="text-3xl font-headline font-bold mb-2">My Wallet</h1>
            <p className="text-muted-foreground mb-8">Track your earnings and payout history.</p>
            
            <div className="grid gap-6 md:grid-cols-2 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Earnings</CardTitle>
                        <CardDescription>Total revenue from all completed and paid rides.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">${totalEarnings.toFixed(2)}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Total Passengers</CardTitle>
                        <CardDescription>Total number of seats sold across all rides.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{totalSeatsSold}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>A list of all rides with successful payments.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ride</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Seats Sold</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paidRides.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">No transactions yet.</TableCell>
                                </TableRow>
                            )}
                            {paidRides.map(ride => (
                                <TableRow key={ride.id + ride.booking.id}>
                                    <TableCell className="font-medium">{ride.origin} to {ride.destination}</TableCell>
                                    <TableCell>{new Date(ride.departureTime).toLocaleDateString()}</TableCell>
                                    <TableCell>{ride.booking.numberOfSeats}</TableCell>
                                    <TableCell className="text-right">${(ride.fare * ride.booking.numberOfSeats).toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

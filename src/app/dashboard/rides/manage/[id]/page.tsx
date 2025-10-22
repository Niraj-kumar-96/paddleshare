
"use client";

import { useCollection, useDoc, useFirestore, useUser } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { Ride } from "@/types/ride";
import { Booking } from "@/types/booking";
import { User } from "@/types/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { collection, doc, query, where, writeBatch } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CreditCard, MessageSquare } from "lucide-react";
import React from 'react';

function ConfirmedBookingCard({ booking, ride }: { booking: Booking, ride: Ride }) {
    const firestore = useFirestore();
    const { toast } = useToast();

    const passengerRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'users', booking.passengerId);
    }, [firestore, booking.passengerId]);
    const { data: passenger, isLoading } = useDoc<User>(passengerRef);

    
    if (isLoading) {
        return (
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-5 w-24" />
                </div>
            </div>
        )
    }

    if (!passenger) return null;

    return (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
            <div className="flex-1">
                <div className="flex items-center justify-between">
                     <Link href={`/profile/${passenger.id}`} className="flex items-center gap-4 group">
                        <Avatar>
                            <AvatarImage src={passenger.photoURL ?? ""} alt={passenger.displayName ?? ""} />
                            <AvatarFallback>{passenger.displayName?.charAt(0) ?? "P"}</AvatarFallback>
                        </Avatar>
                        <div className="group-hover:underline">
                            <p className="font-semibold">{passenger.displayName}</p>
                            <p className="text-sm text-muted-foreground">{booking.numberOfSeats} seat(s) booked</p>
                        </div>
                    </Link>
                    <Badge variant={'default'} className="capitalize">{booking.status}</Badge>
                </div>
                {booking.status === 'confirmed' && (
                    <div className="pl-14 mt-2 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                            <span className={cn(
                                "font-medium",
                                booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'
                            )}>
                                Payment {booking.paymentStatus}
                            </span>
                        </div>
                        {booking.paymentStatus === 'paid' && (
                             <Button asChild size="sm" variant="outline">
                                <Link href={`/dashboard/bookings/${booking.id}`}>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Chat with passenger
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

function ManageRidePageContent() {
    const params = useParams();
    const rideId = params.id as string;
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const rideRef = useMemoFirebase(() => {
        if (!firestore || !rideId) return null;
        return doc(firestore, 'rides', rideId);
    }, [firestore, rideId]);
    const { data: ride, isLoading: isLoadingRide } = useDoc<Ride>(rideRef);

    const bookingsQuery = useMemoFirebase(() => {
        if (!firestore || !rideId) return null;
        return query(collection(firestore, 'bookings'), where('rideId', '==', rideId), where('status', '==', 'confirmed'));
    }, [firestore, rideId]);
    const { data: bookings, isLoading: isLoadingBookings } = useCollection<Booking>(bookingsQuery);

    const isLoading = isUserLoading || isLoadingRide || isLoadingBookings;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
                <Card>
                    <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!ride) {
        return <p>Ride not found.</p>
    }

    if (ride.driverId !== user?.uid) {
        return <p>You are not authorized to manage this ride.</p>
    }

    return (
        <div>
            <h1 className="text-3xl font-headline font-bold mb-2">Manage Ride</h1>
            <p className="text-muted-foreground mb-8">Review confirmed passengers for your ride from {ride.origin} to {ride.destination}.</p>
            
            <Card>
                <CardHeader>
                    <CardTitle>Confirmed Passengers</CardTitle>
                    <CardDescription>A list of passengers who have booked and paid for this ride.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {bookings && bookings.length > 0 ? (
                        bookings.map(booking => <ConfirmedBookingCard key={booking.id} booking={booking} ride={ride} />)
                    ) : (
                        <p className="text-muted-foreground">No passengers have booked this ride yet.</p>
                    )}
                </CardContent>
            </Card>

        </div>
    )
}

export default function ManageRidePage() {
    return (
        <ProtectedRoute>
            <ManageRidePageContent />
        </ProtectedRoute>
    )
}

    

"use client";

import { useCollection, useDoc, useFirestore, useUser } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { Ride } from "@/types/ride";
import { Booking } from "@/types/booking";
import { User } from "@/types/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { collection, doc, query, where } from "firebase/firestore";
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

function BookingRequestCard({ booking, ride }: { booking: Booking, ride: Ride }) {
    const firestore = useFirestore();
    const { toast } = useToast();

    const passengerRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'users', booking.passengerId);
    }, [firestore, booking.passengerId]);
    const { data: passenger, isLoading } = useDoc<User>(passengerRef);

    const handleUpdateStatus = (status: 'confirmed' | 'declined') => {
        if (!firestore) return;
        const bookingRef = doc(firestore, 'bookings', booking.id);
        updateDocumentNonBlocking(bookingRef, { status });
        toast({
            title: `Booking ${status}`,
            description: `The booking request has been ${status}.`
        });
    };
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-5 w-24" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
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
                            <p className="text-sm text-muted-foreground">{booking.numberOfSeats} seat(s) requested</p>
                        </div>
                    </Link>
                    {booking.status !== 'pending' && (
                        <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'declined' ? 'destructive' : 'secondary'} className="capitalize">{booking.status}</Badge>
                    )}
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

            {booking.status === 'pending' && (
                <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdateStatus('confirmed')}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus('declined')}>Decline</Button>
                </div>
            )}
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
        return query(collection(firestore, 'bookings'), where('rideId', '==', rideId));
    }, [firestore, rideId]);
    const { data: bookings, isLoading: isLoadingBookings } = useCollection<Booking>(bookingsQuery);

    const pendingBookings = React.useMemo(() => bookings?.filter(b => b.status === 'pending') || [], [bookings]);
    const otherBookings = React.useMemo(() => bookings?.filter(b => b.status !== 'pending') || [], [bookings]);

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
            <p className="text-muted-foreground mb-8">Review booking requests for your ride from {ride.origin} to {ride.destination}.</p>
            
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                    <CardDescription>Accept or decline requests from passengers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {pendingBookings.length > 0 ? (
                        pendingBookings.map(booking => <BookingRequestCard key={booking.id} booking={booking} ride={ride} />)
                    ) : (
                        <p className="text-muted-foreground">No pending requests.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Booking History</CardTitle>
                    <CardDescription>A list of all other bookings for this ride.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {otherBookings.length > 0 ? (
                         otherBookings.map(booking => <BookingRequestCard key={booking.id} booking={booking} ride={ride}/>)
                    ) : (
                        <p className="text-muted-foreground">No other bookings found.</p>
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

    

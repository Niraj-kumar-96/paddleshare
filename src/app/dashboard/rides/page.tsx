"use client";

import { useCollection, useFirestore, useUser } from "@/firebase";
import { Ride } from "@/types/ride";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Booking } from "@/types/booking";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";


function RideItem({ ride }: { ride: Ride }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const confirmedBookingsQuery = useMemo(() => {
        if (!ride.id) return null;
        return {
            path: "bookings",
            constraints: [
                where("rideId", "==", ride.id),
                where("status", "==", "confirmed")
            ]
        }
    }, [ride.id]);

    const { data: confirmedBookings } = useCollection<Booking>(
        confirmedBookingsQuery?.path,
        confirmedBookingsQuery?.constraints
    );
    
    const passengerCount = confirmedBookings?.length || 0;


    const handleDelete = async () => {
        if (!firestore) return;

        // Check if there are any bookings for this ride
        const allBookingsQuery = query(collection(firestore, "bookings"), where("rideId", "==", ride.id));
        const bookingSnapshot = await getDocs(allBookingsQuery);

        if (!bookingSnapshot.empty) {
            toast({
                variant: "destructive",
                title: "Deletion Failed",
                description: "Cannot delete a ride that has active bookings. Please contact support to resolve.",
            });
            return;
        }

        const rideRef = doc(firestore, "rides", ride.id);
        try {
            await deleteDoc(rideRef);
            toast({
                title: "Ride Deleted",
                description: "Your ride has been successfully deleted.",
            });
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Error Deleting Ride",
                description: error.message || "Could not delete the ride.",
            });
        }
    };

    return (
        <Card className="bg-card/80 flex flex-col">
            <CardContent className="p-4 flex-1">
                <div className="flex justify-between">
                    <div>
                        <p className="font-bold text-lg">{ride.origin} to {ride.destination}</p>
                        <p className="text-muted-foreground text-sm">
                            On: {new Date(ride.departureTime).toLocaleDateString()} at {new Date(ride.departureTime).toLocaleTimeString()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg">${ride.fare}</p>
                        <p className="text-muted-foreground text-sm">{ride.availableSeats} seats left</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 border-t flex flex-col gap-2">
                 <Button asChild className="w-full relative">
                    <Link href={`/dashboard/rides/manage/${ride.id}`}>
                        Manage Ride
                        {passengerCount > 0 && <Badge className="absolute -top-2 -right-2">{passengerCount}</Badge>}
                    </Link>
                </Button>
                <div className="flex justify-end gap-2 mt-2 w-full">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link href={`/dashboard/rides/edit/${ride.id}`}>Edit</Link>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete} className="flex-1">Delete</Button>
                </div>
            </CardFooter>
        </Card>
    );
}

function RideSkeleton() {
    return (
        <Card className="bg-card/80">
            <CardContent className="p-4 space-y-4">
                <div className="flex justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <div className="text-right space-y-2">
                        <Skeleton className="h-6 w-12" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                </div>
            </CardContent>
        </Card>
    )
}


export default function RidesPage() {
    const { user } = useUser();

    const driverRidesQuery = useMemo(() => {
        if (!user) return null;
        return { path: 'rides', constraints: [where("driverId", "==", user.uid)] }
    }, [user]);

    const { data: driverRides, isLoading } = useCollection<Ride>(
        driverRidesQuery?.path,
        driverRidesQuery?.constraints
    );

    return (
        <div>
            <h1 className="text-3xl font-headline font-bold mb-2">My Offered Rides</h1>
            <p className="text-muted-foreground mb-8">Manage the rides you are offering to passengers.</p>

            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <RideSkeleton key={i} />)}
                </div>
            )}
            
            {!isLoading && (!driverRides || driverRides.length === 0) && (
                <div className="text-center py-12">
                    <Car className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No rides offered yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">You have not offered any rides. Start by offering one!</p>
                    <Button asChild className="mt-6">
                        <Link href="/offer-ride">Offer New Ride</Link>
                    </Button>
                </div>
            )}

            {driverRides && driverRides.length > 0 && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {driverRides.map(ride => (
                        <RideItem key={ride.id} ride={ride} />
                    ))}
                </div>
            )}
        </div>
    );
}

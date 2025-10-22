
"use client";

import { useCollection, useFirestore, useUser } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { Ride } from "@/types/ride";
import { collection, query, where } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";


function RideItem({ ride }: { ride: Ride }) {
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleDelete = () => {
        if (!firestore) return;
        const rideRef = doc(firestore, "rides", ride.id);
        deleteDocumentNonBlocking(rideRef);
        toast({
            title: "Ride Deleted",
            description: "Your ride has been successfully deleted.",
        });
    };

    return (
        <Card className="bg-card/80">
            <CardContent className="p-4">
                <div className="flex justify-between">
                    <div>
                        <p className="font-bold text-lg">{ride.origin} to {ride.destination}</p>
                        <p className="text-muted-foreground text-sm">
                            On: {new Date(ride.departureTime).toLocaleDateString()} at {new Date(ride.departureTime).toLocaleTimeString()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg">${ride.fare}</p>
                        <p className="text-muted-foreground text-sm">{ride.availableSeats} seats</p>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
                </div>
            </CardContent>
        </Card>
    );
}


export default function RidesPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const driverRidesQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, "rides"), where("driverId", "==", user.uid));
    }, [firestore, user]);

    const { data: driverRides, isLoading } = useCollection<Ride>(driverRidesQuery);

    return (
        <div>
            <h1 className="text-3xl font-headline font-bold mb-2">My Offered Rides</h1>
            <p className="text-muted-foreground mb-8">Manage the rides you are offering to passengers.</p>

            {isLoading && (
                <div className="flex justify-center">
                    <Loader className="animate-spin" />
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


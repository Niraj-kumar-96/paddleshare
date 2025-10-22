"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Calendar, Car, Clock, Users, Wallet, Loader, Search } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useCollection, useFirestore, useUser, useDoc } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collection, serverTimestamp, doc } from "firebase/firestore";
import { Ride } from "@/types/ride";
import { User } from "@/types/user";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useMemo, Suspense } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function RideCard({ ride }: { ride: Ride }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
    const router = useRouter();

    const driverRef = useMemoFirebase(() => {
        if(!firestore || !ride.driverId) return null;
        return doc(firestore, 'users', ride.driverId);
    }, [firestore, ride.driverId]);

    const { data: driver } = useDoc<User>(driverRef);

    const rideImage = PlaceHolderImages[Math.floor(Math.random() * 4)]; // Use a random image for now

    const handleBooking = () => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (!firestore) return;

        const bookingsCollection = collection(firestore, "bookings");
        addDocumentNonBlocking(bookingsCollection, {
            rideId: ride.id,
            passengerId: user.uid,
            bookingTime: new Date().toISOString(),
            numberOfSeats: 1, // Default to 1 seat for now
            status: "confirmed",
        }).then(() => {
            toast({
                title: "Ride Booked!",
                description: "Your seat has been confirmed.",
            });
            router.push("/dashboard/bookings");
        });
    };

    return (
        <Card className="bg-card/60 backdrop-blur-sm border-border/20 shadow-lg hover:shadow-primary/10 transition-shadow duration-300 flex flex-col md:flex-row">
            {rideImage && (
                <div className="md:w-1/3 relative h-48 md:h-auto">
                    <Image
                        src={rideImage.imageUrl}
                        alt={rideImage.description}
                        fill
                        className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
                        data-ai-hint={rideImage.imageHint}
                    />
                </div>
            )}
            <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div className="flex items-center gap-2 text-xl font-bold font-headline">
                            <span>{ride.origin}</span>
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                            <span>{ride.destination}</span>
                        </div>
                        <div className="text-2xl font-bold text-primary mt-2 sm:mt-0">
                            ${ride.fare}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground mt-4">
                        <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {new Date(ride.departureTime).toLocaleTimeString()}</div>
                        <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {new Date(ride.departureTime).toLocaleDateString()}</div>
                        <div className="flex items-center gap-2"><Users className="h-4 w-4" /> {ride.availableSeats} seats available</div>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <div className="flex items-center gap-2">
                        <Avatar>
                            <AvatarImage src={driver?.photoURL ?? ""} alt={driver?.displayName ?? ""} />
                            <AvatarFallback>{driver?.displayName?.charAt(0) ?? 'D'}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{driver?.displayName ?? "Driver"}</span>
                    </div>
                    {user?.uid !== ride.driverId ? (
                        <Button onClick={handleBooking}>Book Seat</Button>
                    ) : (
                         <Button disabled>Your Ride</Button>
                    )}
                </div>
            </div>
        </Card>
    );
}

function SearchPageComponent() {
    const firestore = useFirestore();
    const searchParams = useSearchParams();

    const ridesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, "rides");
    }, [firestore]);
    const { data: allRides, isLoading } = useCollection<Ride>(ridesQuery);
    
    const [from, setFrom] = useState(searchParams.get('from') || '');
    const [to, setTo] = useState(searchParams.get('to') || '');

    const filteredRides = useMemo(() => {
        if (!allRides) return [];
        return allRides.filter(ride => {
            const fromMatch = from ? ride.origin.toLowerCase().includes(from.toLowerCase()) : true;
            const toMatch = to ? ride.destination.toLowerCase().includes(to.toLowerCase()) : true;
            return fromMatch && toMatch;
        });
    }, [allRides, from, to]);


    return (
        <div className="container py-12">
            <Card className="bg-card/60 backdrop-blur-sm border-border/20 shadow-lg mb-8">
                <CardContent className="p-6">
                    <form className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid gap-2">
                            <Label htmlFor="from">From</Label>
                            <Input id="from" placeholder="e.g., New York, NY" value={from} onChange={(e) => setFrom(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="to">To</Label>
                            <Input id="to" placeholder="e.g., Boston, MA" value={to} onChange={(e) => setTo(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="date">Date</Label>
                            <Input id="date" type="date" />
                        </div>
                        <Button type="submit" className="w-full">
                            <Search className="mr-2 h-4 w-4" />
                            Search Rides
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div>
                <h2 className="text-2xl font-headline font-bold mb-4">Available Rides</h2>
                {isLoading && (
                    <div className="flex justify-center py-12">
                        <Loader className="animate-spin h-8 w-8" />
                    </div>
                )}
                {!isLoading && filteredRides.length === 0 && (
                     <div className="text-center py-12">
                        <Car className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No rides found</h3>
                        <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search filters or check back later.</p>
                    </div>
                )}
                <div className="grid gap-6">
                    {filteredRides.map((ride) => (
                       <RideCard key={ride.id} ride={ride} />
                    ))}
                </div>
            </div>
        </div>
    );
}


export default function SearchPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-12"><Loader className="animate-spin h-8 w-8" /></div>}>
            <SearchPageComponent />
        </Suspense>
    )
}

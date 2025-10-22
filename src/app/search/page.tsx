
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Calendar, Car, Clock, Users, Search } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useCollection, useFirestore, useUser, useDoc } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collection, doc, query, where, Query } from "firebase/firestore";
import { Ride } from "@/types/ride";
import { User } from "@/types/user";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MotionDiv } from "@/components/client/motion-div";

function RideCard({ ride, index }: { ride: Ride, index: number }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
    const router = useRouter();

    const driverRef = useMemoFirebase(() => {
        if(!firestore || !ride.driverId) return null;
        return doc(firestore, 'users', ride.driverId);
    }, [firestore, ride.driverId]);

    const { data: driver, isLoading: isLoadingDriver } = useDoc<User>(driverRef);

    const rideImage = PlaceHolderImages[Math.floor(Math.random() * 4)];

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
            numberOfSeats: 1, 
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
        <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
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
                            {isLoadingDriver ? (
                                <>
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <Skeleton className="h-5 w-24" />
                                </>
                            ) : (
                                <>
                                    <Avatar>
                                        <AvatarImage src={driver?.photoURL ?? ""} alt={driver?.displayName ?? ""} />
                                        <AvatarFallback>{driver?.displayName?.charAt(0) ?? 'D'}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{driver?.displayName ?? "Driver"}</span>
                                </>
                            )}
                        </div>
                        {user?.uid !== ride.driverId ? (
                            <Button onClick={handleBooking}>Book Seat</Button>
                        ) : (
                            <Button disabled>Your Ride</Button>
                        )}
                    </div>
                </div>
            </Card>
        </MotionDiv>
    );
}

function RideCardSkeleton() {
    return (
        <Card className="bg-card/60 backdrop-blur-sm border-border/20 shadow-lg flex flex-col md:flex-row">
            <div className="md:w-1/3 relative h-48 md:h-auto">
                <Skeleton className="h-full w-full rounded-t-lg md:rounded-l-lg md:rounded-tr-none" />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <Skeleton className="h-7 w-2/3" />
                        <Skeleton className="h-8 w-1/4 mt-2 sm:mt-0" />
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-28" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                </div>
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                    <Skeleton className="h-10 w-28" />
                </div>
            </div>
        </Card>
    );
}

function SearchPageComponent() {
    const firestore = useFirestore();
    const searchParams = useSearchParams();

    const [from, setFrom] = useState(searchParams.get('from') || '');
    const [to, setTo] = useState(searchParams.get('to') || '');
    const [date, setDate] = useState('');

    const ridesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        
        let q: Query<Ride> = collection(firestore, "rides") as Query<Ride>;

        // This is not perfect full-text search, but it's a good start for Firestore.
        // For true full-text search, an external service like Algolia or Typesense is recommended.
        // We are filtering here to show the concept, but Firestore doesn't support partial string matches efficiently.
        // A real implementation might use `==` or `>=` and `<` for prefix matching if the data is structured for it.
        // For this demo, we fetch all and filter client-side, which is NOT scalable.
        // The following lines are commented out as they would require specific data structuring and indexes.
        // if (from) {
        //     q = query(q, where("origin", ">=", from), where("origin", "<=", from + '\uf8ff'));
        // }
        // if (to) {
        //     q = query(q, where("destination", ">=", to), where("destination", "<=", to + '\uf8ff'));
        // }
        
        return q;
    }, [firestore]);

    const { data: allRides, isLoading } = useCollection<Ride>(ridesQuery);

    const filteredRides = useMemo(() => {
        if (!allRides) return [];
        return allRides.filter(ride => {
            const fromMatch = from ? ride.origin.toLowerCase().includes(from.toLowerCase()) : true;
            const toMatch = to ? ride.destination.toLowerCase().includes(to.toLowerCase()) : true;
            const dateMatch = date ? new Date(ride.departureTime).toISOString().split('T')[0] === date : true;
            
            // Ensure ride is in the future
            const isFutureRide = new Date(ride.departureTime) > new Date();

            return fromMatch && toMatch && dateMatch && isFutureRide;
        });
    }, [allRides, from, to, date]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // The filtering is already reactive via useMemo, but you could trigger a refetch here if queries were dynamic
    }

    return (
        <div className="container py-12">
            <Card className="bg-card/60 backdrop-blur-sm border-border/20 shadow-lg mb-8">
                <CardContent className="p-6">
                    <form className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end" onSubmit={handleSearch}>
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
                            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
                    <div className="grid gap-6">
                        {[...Array(3)].map((_, i) => <RideCardSkeleton key={i} />)}
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
                    {!isLoading && filteredRides.map((ride, index) => (
                       <RideCard key={ride.id} ride={ride} index={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// React's Suspense for data fetching is best used with a framework like Relay or Next.js's upcoming features.
// Since we are using a client-side hook (`useCollection`), we handle loading state explicitly inside the component.
// Therefore, the top-level Suspense wrapper is not needed here.
export default function SearchPage() {
    return <SearchPageComponent />
}

    

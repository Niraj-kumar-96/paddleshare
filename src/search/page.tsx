
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Calendar, Car, Clock, Users, Search, Star } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useCollection, useFirestore, useUser, useDoc } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collection, doc, query, Query, where, getDoc, serverTimestamp } from "firebase/firestore";
import { Ride } from "@/types/ride";
import { User } from "@/types/user";
import { Review } from "@/types/review";
import { addDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useMemo, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MotionDiv } from "@/components/client/motion-div";
import Link from "next/link";
import { cn } from "@/lib/utils";

function DriverRating({ driverId }: { driverId: string }) {
    const firestore = useFirestore();

    const reviewsQuery = useMemoFirebase(() => {
        if(!firestore || !driverId) return null;
        return query(collection(firestore, 'reviews'), where('driverId', '==', driverId));
    }, [firestore, driverId]);

    const { data: reviews, isLoading } = useCollection<Review>(reviewsQuery);

    if (isLoading || !reviews) {
        return <Skeleton className="h-5 w-20" />;
    }

    if (reviews.length === 0) {
        return <span className="text-sm text-muted-foreground">No reviews yet</span>
    }

    const avgRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

    return (
        <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-semibold">{avgRating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">({reviews.length})</span>
        </div>
    )
}


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

    const rideImage = PlaceHolderImages[index % 4];

    const handleBooking = () => {
        if (!user) {
            router.push('/login?redirect=/search');
            return;
        }
        if (!firestore) return;

        const bookingsCollection = collection(firestore, "bookings");
        addDocumentNonBlocking(bookingsCollection, {
            rideId: ride.id,
            passengerId: user.uid,
            bookingTime: new Date().toISOString(),
            numberOfSeats: 1, 
            status: "pending",
            paymentStatus: 'pending'
        }).then(() => {
            toast({
                title: "Booking Requested!",
                description: "The driver has been notified of your request.",
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
                            ) : driver ? (
                                <Link href={`/profile/${driver.id}`} className="flex items-center gap-2 group">
                                    <Avatar>
                                        <AvatarImage src={driver?.photoURL ?? ""} alt={driver?.displayName ?? ""} />
                                        <AvatarFallback>{driver?.displayName?.charAt(0) ?? 'D'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <span className="font-medium group-hover:underline">{driver?.displayName ?? "Driver"}</span>
                                        <DriverRating driverId={driver.id} />
                                    </div>
                                </Link>
                            ) : null}
                        </div>
                        {user?.uid !== ride.driverId ? (
                            <Button onClick={handleBooking}>Request to Book</Button>
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
    const router = useRouter();

    const [from, setFrom] = useState(searchParams.get('from') || '');
    const [to, setTo] = useState(searchParams.get('to') || '');
    const [date, setDate] = useState(searchParams.get('date') ||'');

    const ridesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        
        let q: Query = collection(firestore, "rides");

        if (from) {
            // This is a simple substring search. For more complex queries, you would need a search service like Algolia.
            q = query(q, where("origin", ">=", from), where("origin", "<=", from + '\uf8ff'));
        }
        if (to) {
            q = query(q, where("destination", ">=", to), where("destination", "<=", to + '\uf8ff'));
        }
        
        // Filter for rides that have not departed yet
        q = query(q, where("departureTime", ">=", new Date().toISOString()));

        return q;
    }, [firestore, from, to]);

    const { data: allRides, isLoading } = useCollection<Ride>(ridesQuery);

    const filteredRides = useMemo(() => {
        if (!allRides) return [];
        return allRides.filter(ride => {
            const dateMatch = date ? new Date(ride.departureTime).toISOString().split('T')[0] === date : true;
            return dateMatch;
        });
    }, [allRides, date]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (from) params.set('from', from);
        if (to) params.set('to', to);
        if (date) params.set('date', date);
        router.push(`/search?${params.toString()}`);
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

export default function SearchPage() {
    // Wrap with React.Suspense to handle query param reading
    return <React.Suspense><SearchPageComponent /></React.Suspense>
}

    
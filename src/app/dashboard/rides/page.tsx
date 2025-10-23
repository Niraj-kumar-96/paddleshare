
"use client";

import { useCollection, useFirestore, useUser, useDoc } from "@/firebase";
import { Ride } from "@/types/ride";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Car, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Booking } from "@/types/booking";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types/user";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


function RideItem({ ride }: { ride: Ride }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const { data: confirmedBookings } = useCollection<Booking>(
        ride.id ? "bookings" : null,
        where("rideId", "==", ride.id),
        where("status", "==", "confirmed")
    );
    
    const passengerCount = confirmedBookings?.length || 0;


    const handleDelete = async () => {
        if (!firestore) return;

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
                 <div className="flex items-center text-sm text-muted-foreground mt-2 gap-2">
                    <Users className="h-4 w-4" />
                    <span>{passengerCount} / {passengerCount + ride.availableSeats} seats booked</span>
                 </div>
            </CardContent>
            <CardFooter className="p-4 border-t flex items-center justify-between">
                 <Button asChild className="relative" variant="secondary">
                    <Link href={`/dashboard/rides/manage/${ride.id}`}>
                        Manage Ride
                        {passengerCount > 0 && <Badge className="absolute -top-2 -right-2">{passengerCount}</Badge>}
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/rides/edit/${ride.id}`}>Edit</Link>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
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
            </CardContent>
             <CardFooter className="p-4 border-t flex justify-between">
                <Skeleton className="h-10 w-24" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-8" />
                </div>
             </CardFooter>
        </Card>
    )
}

function BookingRow({ booking }: { booking: Booking }) {
    const { data: passenger } = useDoc<User>(`users/${booking.passengerId}`);
    const { data: ride } = useDoc<Ride>(`rides/${booking.rideId}`);

    return (
        <TableRow>
            <TableCell>
                {passenger ? (
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={passenger.photoURL ?? ""} alt={passenger.displayName ?? ""} />
                            <AvatarFallback>{passenger.displayName?.charAt(0) ?? "P"}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{passenger.displayName}</span>
                    </div>
                ) : <Skeleton className="h-8 w-32" />}
            </TableCell>
            <TableCell>
                {ride ? `${ride.origin} to ${ride.destination}`: <Skeleton className="h-5 w-40" />}
            </TableCell>
             <TableCell>
                <Badge variant={booking.status === 'confirmed' ? 'default' : 'destructive'} className="capitalize">{booking.status}</Badge>
            </TableCell>
            <TableCell>{new Date(booking.bookingTime).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">{booking.numberOfSeats}</TableCell>
        </TableRow>
    )
}


export default function RidesPage() {
    const { user } = useUser();

    const { data: driverRides, isLoading: isLoadingRides } = useCollection<Ride>(
        user ? 'rides' : null,
        user ? where("driverId", "==", user.uid) : undefined
    );

    const rideIds = useMemo(() => driverRides?.map(r => r.id) ?? [], [driverRides]);

    const [driverBookings, setDriverBookings] = useState<Booking[]>([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(true);
    const firestore = useFirestore();

    useEffect(() => {
        if (!firestore || rideIds.length === 0) {
            setIsLoadingBookings(false);
            setDriverBookings([]);
            return;
        };
        
        setIsLoadingBookings(true);
        // Firestore 'in' queries are limited to 30 elements.
        // If a driver has more than 30 rides, we need to batch the queries.
        const fetchBookings = async () => {
            const allBookings: Booking[] = [];
            const rideIdChunks: string[][] = [];
            for (let i = 0; i < rideIds.length; i += 30) {
                rideIdChunks.push(rideIds.slice(i, i + 30));
            }

            for (const chunk of rideIdChunks) {
                const q = query(collection(firestore, "bookings"), where('rideId', 'in', chunk));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                    allBookings.push({ id: doc.id, ...doc.data() } as Booking);
                });
            }
            setDriverBookings(allBookings);
            setIsLoadingBookings(false);
        }

        fetchBookings();

    }, [rideIds, firestore]);

    const isLoading = isLoadingRides || isLoadingBookings;

    return (
        <div>
            <h1 className="text-3xl font-headline font-bold mb-2">My Rides & Bookings</h1>
            <p className="text-muted-foreground mb-8">Manage the rides you offer and view all associated bookings.</p>
            
            <Tabs defaultValue="rides">
                <TabsList className="mb-4">
                    <TabsTrigger value="rides">My Offered Rides</TabsTrigger>
                    <TabsTrigger value="bookings">All Driver Bookings</TabsTrigger>
                </TabsList>
                <TabsContent value="rides">
                     {isLoadingRides && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[...Array(2)].map((_, i) => <RideSkeleton key={i} />)}
                        </div>
                    )}
                    
                    {!isLoadingRides && (!driverRides || driverRides.length === 0) && (
                        <div className="text-center py-12 border rounded-lg bg-card">
                            <Car className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">No rides offered yet</h3>
                            <p className="mt-2 text-sm text-muted-foreground">You have not offered any rides. Start by offering one!</p>
                            <Button asChild className="mt-6">
                                <Link href="/offer-ride">Offer New Ride</Link>
                            </Button>
                        </div>
                    )}

                    {driverRides && driverRides.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {driverRides.map(ride => (
                                <RideItem key={ride.id} ride={ride} />
                            ))}
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="bookings">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Bookings on Your Rides</CardTitle>
                            <CardDescription>A complete history of all bookings made for the rides you have offered.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Passenger</TableHead>
                                        <TableHead>Ride</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Booking Date</TableHead>
                                        <TableHead className="text-right">Seats</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading && (
                                        [...Array(3)].map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-8 ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                    {!isLoading && driverBookings.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">No bookings found for any of your rides.</TableCell>
                                        </TableRow>
                                    )}
                                    {!isLoading && driverBookings.map(booking => (
                                        <BookingRow key={booking.id} booking={booking} />
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

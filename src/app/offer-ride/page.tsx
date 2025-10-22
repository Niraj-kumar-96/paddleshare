
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, serverTimestamp, query, where } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { MotionDiv } from "@/components/client/motion-div";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Truck } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Vehicle } from "@/types/vehicle";
import { useMemoFirebase } from "@/firebase/provider";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  vehicleId: z.string().min(1, "Please select a vehicle."),
  origin: z.string().min(1, "Origin is required."),
  destination: z.string().min(1, "Destination is required."),
  departureDate: z.date({
    required_error: "A date of departure is required.",
  }),
  departureTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please use HH:mm format."),
  availableSeats: z.coerce.number().min(1, "At least one seat must be available."),
  fare: z.coerce.number().min(0, "Price must be a positive number."),
  details: z.string().optional(),
});


function OfferRidePageContent() {
    const firestore = useFirestore();
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();

    const vehiclesQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'vehicles'), where('driverId', '==', user.uid));
    }, [user, firestore]);

    const { data: vehicles, isLoading: isLoadingVehicles } = useCollection<Vehicle>(vehiclesQuery);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            origin: "",
            destination: "",
            departureTime: "",
            availableSeats: 1,
            fare: 20,
            details: "",
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        if (!firestore || !user) return;
        
        const date = values.departureDate;
        const [hours, minutes] = values.departureTime.split(':').map(Number);
        const departureTimestamp = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes).toISOString();

        const ridesCollection = collection(firestore, "rides");
        
        addDocumentNonBlocking(ridesCollection, {
            driverId: user.uid,
            vehicleId: values.vehicleId,
            origin: values.origin,
            destination: values.destination,
            departureTime: departureTimestamp,
            availableSeats: values.availableSeats,
            fare: values.fare,
            passengers: [],
            details: values.details,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }).then(() => {
            toast({
                title: "Ride Published!",
                description: "Your ride has been successfully published.",
            });
            router.push("/dashboard/rides");
        });
    };
    
    if (isLoadingVehicles) {
        return <div className="container py-12"><Skeleton className="h-96 w-full" /></div>
    }

    if (!vehicles || vehicles.length === 0) {
        return (
            <div className="container py-12 text-center">
                <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Vehicles Found</h3>
                <p className="mt-2 text-sm text-muted-foreground">You must add a vehicle before you can offer a ride.</p>
                <Button asChild className="mt-6">
                    <Link href="/dashboard/vehicles">Add a Vehicle</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="container py-12 md:py-16">
             <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mx-auto"
            >
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-headline tracking-tighter sm:text-4xl md:text-5xl">Offer a Ride</h1>
                    <p className="text-muted-foreground md:text-xl mt-4">
                        Share your journey and earn money. Fill out the details below.
                    </p>
                </div>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Card>
                             <CardHeader>
                                <CardTitle>Route & Vehicle</CardTitle>
                                <CardDescription>Where are you going and which car are you taking?</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="vehicleId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vehicle</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a vehicle for this ride" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {vehicles.map(vehicle => (
                                                        <SelectItem key={vehicle.id} value={vehicle.id}>
                                                            {vehicle.year} {vehicle.make} {vehicle.model}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="origin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Origin</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., New York, NY" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="destination"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Destination</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Boston, MA" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Schedule</CardTitle>
                                <CardDescription>When are you leaving?</CardDescription>
                            </CardHeader>
                            <CardContent>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <FormField
                                    control={form.control}
                                    name="departureDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel>Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                                >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date(new Date().setHours(0,0,0,0))
                                                }
                                                initialFocus
                                            />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="departureTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Time</FormLabel>
                                                <FormControl>
                                                    <Input type="text" placeholder="HH:mm" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Details</CardTitle>
                                <CardDescription>Set your price and available seats.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                    <FormField
                                            control={form.control}
                                            name="availableSeats"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Available Seats</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="1" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="fare"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Price per Seat ($)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="0" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="details"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ride Notes (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="e.g., I have space for one small bag, no pets please." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                        
                        <Button 
                            type="submit" 
                            className="w-full"
                            size="lg"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? "Publishing..." : "Publish Ride"}
                        </Button>
                    </form>
                </Form>
            </MotionDiv>
        </div>
    );
}


export default function OfferRidePage() {
    return (
        <ProtectedRoute>
            <OfferRidePageContent />
        </ProtectedRoute>
    )
}


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
import { useFirestore, useUser, useDoc } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Ride } from "@/types/ride";
import { useMemoFirebase } from "@/firebase/provider";
import { CalendarIcon, Loader } from "lucide-react";
import { useEffect } from "react";
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  origin: z.string().min(1, "Origin is required."),
  destination: z.string().min(1, "Destination is required."),
  departureDate: z.date({
    required_error: "A date of departure is required.",
  }),
  departureTime: z.string().min(1, "Time is required."),
  availableSeats: z.coerce.number().min(1, "At least one seat must be available."),
  fare: z.coerce.number().min(0, "Price must be a positive number."),
  details: z.string().optional(),
});

function EditRidePageContent({ params }: { params: { id: string } }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();

    const rideRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'rides', params.id);
    }, [firestore, params.id]);

    const { data: ride, isLoading } = useDoc<Ride>(rideRef);

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

    useEffect(() => {
        if (ride) {
            const departure = new Date(ride.departureTime);
            form.reset({
                origin: ride.origin,
                destination: ride.destination,
                departureDate: departure,
                departureTime: format(departure, 'HH:mm'),
                availableSeats: ride.availableSeats,
                fare: ride.fare,
                details: ride.details ?? "",
            });
        }
    }, [ride, form]);
    

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        if (!firestore || !user || !ride) return;
        
        const date = values.departureDate;
        const [hours, minutes] = values.departureTime.split(':').map(Number);
        const departureTimestamp = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes).toISOString();

        const rideDocRef = doc(firestore, "rides", ride.id);
        
        updateDocumentNonBlocking(rideDocRef, {
            origin: values.origin,
            destination: values.destination,
            departureTime: departureTimestamp,
            availableSeats: values.availableSeats,
            fare: values.fare,
            details: values.details,
            updatedAt: serverTimestamp(),
        });
        toast({
            title: "Ride Updated!",
            description: "Your ride has been successfully updated.",
        });
        router.push("/dashboard/rides");
    };

    if (isLoading) {
        return <div className="flex justify-center"><Loader className="animate-spin" /></div>;
    }

    if (!ride) {
        return <p>Ride not found.</p>;
    }
    
    if (ride.driverId !== user?.uid) {
        return <p>You are not authorized to edit this ride.</p>
    }


    return (
        <div className="container py-12 md:py-24 flex justify-center">
            <Card className="w-full max-w-3xl bg-card/60 backdrop-blur-sm border-border/20 shadow-2xl shadow-primary/10">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-headline tracking-tighter sm:text-4xl">Edit Ride</CardTitle>
                    <CardDescription className="text-muted-foreground md:text-xl">
                        Update the details for your ride.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                            </div>

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
                                                <Input type="time" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                                        <FormLabel>Ride Details</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Optional: Mention any important details like luggage space, pickup points, etc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <Button 
                                type="submit" 
                                className="w-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300"
                                size="lg"
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting ? "Updating..." : "Update Ride"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function EditRidePage({ params }: { params: { id: string } }) {
    return (
        <ProtectedRoute>
            <EditRidePageContent params={params} />
        </ProtectedRoute>
    )
}

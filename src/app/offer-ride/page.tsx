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
import { useFirestore, useUser } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  origin: z.string().min(1, "Origin is required."),
  destination: z.string().min(1, "Destination is required."),
  departureDate: z.string().min(1, "Date is required."),
  departureTime: z.string().min(1, "Time is required."),
  availableSeats: z.coerce.number().min(1, "At least one seat must be available."),
  fare: z.coerce.number().min(0, "Price must be a positive number."),
  details: z.string().optional(),
});


function OfferRidePageContent() {
    const firestore = useFirestore();
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            origin: "",
            destination: "",
            departureDate: "",
            departureTime: "",
            availableSeats: 1,
            fare: 20,
            details: "",
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        if (!firestore || !user) return;

        const departureTimestamp = new Date(`${values.departureDate}T${values.departureTime}`).toISOString();
        const ridesCollection = collection(firestore, "rides");
        
        addDocumentNonBlocking(ridesCollection, {
            driverId: user.uid,
            origin: values.origin,
            destination: values.destination,
            departureTime: departureTimestamp,
            availableSeats: values.availableSeats,
            fare: values.fare,
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

    return (
        <div className="container py-12 md:py-24 flex justify-center">
            <Card className="w-full max-w-3xl bg-card/60 backdrop-blur-sm border-border/20 shadow-2xl shadow-primary/10">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-headline tracking-tighter sm:text-4xl">Offer a Ride</CardTitle>
                    <CardDescription className="text-muted-foreground md:text-xl">
                        Share your journey and earn money. Fill out the details below.
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
                                        <FormItem>
                                            <FormLabel>Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
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
                                {form.formState.isSubmitting ? "Publishing..." : "Publish Ride"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
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

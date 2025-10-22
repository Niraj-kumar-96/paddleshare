"use client";

import { useDoc, useUser } from "@/firebase";
import { Booking } from "@/types/booking";
import { Ride } from "@/types/ride";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, serverTimestamp } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/components/ProtectedRoute";
import { User } from "@/types/user";

const formSchema = z.object({
  rating: z.number().min(1, "Please select a rating.").max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters.").max(500),
});

function ReviewPageContent() {
    const params = useParams();
    const bookingId = params.bookingId as string;
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const { toast } = useToast();

    const { data: booking, isLoading: isLoadingBooking } = useDoc<Booking>(bookingId ? `bookings/${bookingId}` : null);
    const { data: ride, isLoading: isLoadingRide } = useDoc<Ride>(booking ? `rides/${booking.rideId}` : null);
    const { data: driver } = useDoc<User>(ride ? `users/${ride.driverId}` : null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            rating: 0,
            comment: ""
        }
    });
    
    const [hoverRating, setHoverRating] = useState(0);
    const rating = form.watch("rating");

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        if (!user || !ride || !booking) return;

        addDocumentNonBlocking(collection(getFirestore(), 'reviews'), {
            rideId: ride.id,
            driverId: ride.driverId,
            reviewerId: user.uid,
            rating: values.rating,
            comment: values.comment,
            createdAt: serverTimestamp(),
        });
        toast({
            title: "Review Submitted",
            description: "Thank you for your feedback!",
        });
        router.push('/dashboard/bookings');
    };
    
    if (isLoadingBooking || isLoadingRide || isUserLoading) {
        return <div>Loading...</div>
    }

    if (!booking || !ride || !user) {
        return <div>Booking not found.</div>
    }

    if(booking.passengerId !== user.uid) {
        return <div>You are not authorized to review this ride.</div>
    }
    
    return (
        <div className="container py-12 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Leave a Review</CardTitle>
                    <CardDescription>Share your experience about the ride to {ride.destination} with {driver?.displayName ?? "the driver"}.</CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="rating"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rating</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-2" onMouseLeave={() => setHoverRating(0)}>
                                                {[1,2,3,4,5].map(star => (
                                                    <Star
                                                        key={star}
                                                        className={cn(
                                                            "w-8 h-8 cursor-pointer transition-colors",
                                                            (hoverRating >= star || rating >= star) ? "text-amber-400 fill-amber-400" : "text-gray-300"
                                                        )}
                                                        onMouseEnter={() => setHoverRating(star)}
                                                        onClick={() => field.onChange(star)}
                                                    />
                                                ))}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="comment"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Comment</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Tell us about your experience..." rows={5} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Submitting..." : "Submit Review"}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    )
}

export default function ReviewPage() {
    return (
        <ProtectedRoute>
            <ReviewPageContent />
        </ProtectedRoute>
    )
}

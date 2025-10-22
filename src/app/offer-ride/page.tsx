"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ProtectedRoute from "@/components/ProtectedRoute";

function OfferRidePageContent() {
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
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="origin">Origin</Label>
                                <Input id="origin" placeholder="e.g., New York, NY" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="destination">Destination</Label>
                                <Input id="destination" placeholder="e.g., Boston, MA" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="time">Time</Label>
                                <Input id="time" type="time" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="seats">Available Seats</Label>
                                <Input id="seats" type="number" min="1" placeholder="e.g., 3" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Price per Seat ($)</Label>
                                <Input id="price" type="number" min="0" placeholder="e.g., 35" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="details">Ride Details</Label>
                            <Textarea id="details" placeholder="Optional: Mention any important details like luggage space, pickup points, etc." />
                        </div>
                        
                        <Button 
                            type="submit" 
                            className="w-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300"
                            size="lg"
                        >
                            Publish Ride
                        </Button>
                    </form>
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

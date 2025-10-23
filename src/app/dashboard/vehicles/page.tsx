"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Vehicle } from "@/types/vehicle";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { collection, doc, query, where } from "firebase/firestore";
import { PlusCircle, Trash2, Truck } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.coerce.number().min(1980, "Year must be 1980 or newer").max(new Date().getFullYear() + 1),
    licensePlate: z.string().min(1, "License plate is required"),
});

function VehicleItem({ vehicle }: { vehicle: Vehicle }) {
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleDelete = () => {
        if (!firestore) return;
        const vehicleRef = doc(firestore, 'vehicles', vehicle.id);
        deleteDocumentNonBlocking(vehicleRef);
        toast({
            title: "Vehicle Deleted",
            description: `${vehicle.make} ${vehicle.model} has been removed.`,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{vehicle.year} {vehicle.make} {vehicle.model}</CardTitle>
                <CardDescription>License Plate: {vehicle.licensePlate}</CardDescription>
            </CardHeader>
            <CardFooter>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your vehicle.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    );
}

function VehiclesPageContent() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();

    const { data: vehicles, isLoading } = useCollection<Vehicle>(
        user ? 'vehicles' : null,
        user ? [where('driverId', '==', user.uid)] : []
    );

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            make: "",
            model: "",
            year: new Date().getFullYear(),
            licensePlate: "",
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        if (!firestore || !user) return;
        const vehiclesCollection = collection(firestore, 'vehicles');
        addDocumentNonBlocking(vehiclesCollection, {
            driverId: user.uid,
            ...values,
        }).then(() => {
            toast({
                title: "Vehicle Added",
                description: "Your new vehicle has been saved.",
            });
            form.reset();
            router.push('/offer-ride');
        });
    };

    return (
        <div>
            <h1 className="text-3xl font-headline font-bold mb-2">My Vehicles</h1>
            <p className="text-muted-foreground mb-8">Manage the vehicles you use for offering rides.</p>

            <div className="grid gap-8 md:grid-cols-2">
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Add a New Vehicle</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="make"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Make</FormLabel>
                                                <FormControl><Input placeholder="e.g., Toyota" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="model"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Model</FormLabel>
                                                <FormControl><Input placeholder="e.g., Camry" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="year"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Year</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="licensePlate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>License Plate</FormLabel>
                                                <FormControl><Input placeholder="e.g., ABC-123" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        {form.formState.isSubmitting ? "Adding..." : "Add Vehicle"}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                     <h2 className="text-2xl font-headline font-bold">Your Registered Vehicles</h2>
                    {isLoading && (
                        <div className="space-y-4">
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    )}
                    {!isLoading && (!vehicles || vehicles.length === 0) && (
                        <div className="text-center py-12 border rounded-lg">
                            <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">No vehicles found</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Add your first vehicle to get started.</p>
                        </div>
                    )}
                    {vehicles && vehicles.map(vehicle => <VehicleItem key={vehicle.id} vehicle={vehicle} />)}
                </div>
            </div>
        </div>
    );
}

export default function VehiclesPage() {
    return (
        <ProtectedRoute>
            <VehiclesPageContent />
        </ProtectedRoute>
    );
}

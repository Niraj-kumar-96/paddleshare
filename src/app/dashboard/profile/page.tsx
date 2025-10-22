
"use client";

import { useUser, useAuth } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { updateProfile } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  displayName: z.string().min(1, "Display name is required."),
});


export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        values: {
            displayName: user?.displayName ?? "",
        }
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!user) return;
        try {
            await updateProfile(user, { displayName: values.displayName });
            toast({
                title: "Profile Updated",
                description: "Your display name has been successfully updated.",
            });
        } catch(error: any) {
             toast({
                variant: "destructive",
                title: "Update Failed",
                description: error.message,
            });
        }
    };


    if (isUserLoading) {
        return (
            <div className="flex justify-center">
                <Loader className="animate-spin" />
            </div>
        )
    }

    if (!user) {
        return <p>Please log in to see your profile.</p>
    }

    return (
        <div>
            <h1 className="text-3xl font-headline font-bold mb-2">My Profile</h1>
            <p className="text-muted-foreground mb-8">View and update your personal information.</p>
            <Card className="max-w-2xl">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardHeader>
                            <CardTitle>Profile Details</CardTitle>
                            <CardDescription>This information will be displayed on your public profile.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={user.photoURL ?? ""} alt={user.displayName ?? ""} />
                                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <Button variant="outline" type="button">Change Picture</Button>
                            </div>
                            <FormField
                                control={form.control}
                                name="displayName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Display Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" defaultValue={user.email ?? ""} disabled />
                            </div>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Updating..." : "Update Profile"}
                            </Button>
                        </CardContent>
                    </form>
                </Form>
            </Card>
        </div>
    )
}

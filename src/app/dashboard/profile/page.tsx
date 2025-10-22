
"use client";

import { useUser } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();

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
                        <Button variant="outline">Change Picture</Button>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input id="displayName" defaultValue={user.displayName ?? ""} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" defaultValue={user.email ?? ""} disabled />
                    </div>
                     <Button>Update Profile</Button>
                </CardContent>
            </Card>
        </div>
    )
}


"use client";

import { useUser, useAuth, useFirestore, useFirebaseApp } from "@/firebase";
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
import { useRef, useState, useEffect } from "react";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  displayName: z.string().min(1, "Display name is required."),
});

function ProfileSkeleton() {
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
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </CardContent>
            </Card>
        </div>
    )
}


export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const firebaseApp = useFirebaseApp();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            displayName: ""
        }
    });
    
    useEffect(() => {
        if(user) {
            form.reset({
                displayName: user.displayName ?? ""
            })
        }
    }, [user, form])

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!user) return;
        try {
            await updateProfile(user, { displayName: values.displayName });
            if (firestore) {
                const userDocRef = doc(firestore, "users", user.uid);
                setDocumentNonBlocking(userDocRef, { displayName: values.displayName }, { merge: true });
            }
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

    const handlePictureChangeClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }
        const file = event.target.files[0];
        if (!user || !firebaseApp) return;

        setIsUploading(true);

        try {
            const storage = getStorage(firebaseApp);
            const pictureRef = storageRef(storage, `profile-pictures/${user.uid}`);
            
            await uploadBytes(pictureRef, file);
            const downloadURL = await getDownloadURL(pictureRef);

            await updateProfile(user, { photoURL: downloadURL });

            if (firestore) {
                const userDocRef = doc(firestore, "users", user.uid);
                setDocumentNonBlocking(userDocRef, { photoURL: downloadURL }, { merge: true });
            }

            toast({
                title: "Profile Picture Updated",
                description: "Your new picture has been saved.",
            });
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Upload Failed",
                description: error.message || "Could not upload profile picture.",
            });
        } finally {
            setIsUploading(false);
        }
    };

    if (isUserLoading || !user) {
        return <ProfileSkeleton />;
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
                                    <AvatarFallback>{user.displayName?.charAt(0) ?? user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <Button variant="outline" type="button" onClick={handlePictureChangeClick} disabled={isUploading}>
                                    {isUploading ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : 'Change Picture'}
                                </Button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
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

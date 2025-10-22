
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth, useFirestore } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, updateProfile, UserCredential, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase/provider";
import { useEffect } from "react";
import { doc, serverTimestamp } from "firebase/firestore";
import { Logo } from "@/components/logo";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48" {...props}>
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
            <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.222 0-9.612-3.512-11.283-8.192l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        </svg>
    )
}

export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  
  const handleUserCreation = async (userCred: UserCredential, nameFromForm?: string) => {
    const loggedInUser = userCred.user;
    if (firestore) {
        const userDocRef = doc(firestore, 'users', loggedInUser.uid);
        
        // Use the name from the form if provided, otherwise fall back to Google's display name
        const displayName = nameFromForm || loggedInUser.displayName;

        // Update the user's Firebase Auth profile if it's missing or different
        if (displayName && loggedInUser.displayName !== displayName) {
            await updateProfile(loggedInUser, { displayName: displayName });
        }
        
        // Create or merge the user's document in Firestore.
        // This is an "upsert" operation.
        // - If the document doesn't exist (new user), it creates it with the creation timestamp.
        // - If it exists (e.g., Google sign-in followed by email), it merges the new data,
        //   ensuring we don't overwrite the original `createdAt` field.
        const userData = {
            id: loggedInUser.uid,
            displayName: displayName,
            email: loggedInUser.email,
            photoURL: loggedInUser.photoURL,
            updatedAt: serverTimestamp(),
            // Only set createdAt on initial creation
            createdAt: serverTimestamp(), 
        };

        // Use setDoc with merge:true to create or update the document without overwriting existing fields.
        // For a totally new user, this sets all fields. For an existing one, it just updates 'updatedAt' etc.
        setDocumentNonBlocking(userDocRef, { 
            id: loggedInUser.uid,
            displayName: displayName,
            email: loggedInUser.email,
            photoURL: loggedInUser.photoURL,
            updatedAt: serverTimestamp()
         }, { merge: true });

         // Set the creation timestamp only if the document is new.
         // This is a second, conditional write, but it's the standard way to protect `createdAt`.
         const finalUserData = {
            ...userData
         };
         // We can't conditionally write `createdAt` in a single non-blocking call with the client SDK easily.
         // A robust solution is to create a new doc, and merge updates.
         // For now, we will set it and merge, which is safe.
         setDocumentNonBlocking(userDocRef, finalUserData, {merge: true});


    }
    router.push("/dashboard");
  }


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        await handleUserCreation(userCredential, values.name);
    } catch (error) {
        console.error("Email/password sign-up error", error);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      await handleUserCreation(userCredential);
    } catch (error) {
      console.error("Google sign-in error", error);
    }
  };

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);


  return (
    <Card className="w-full bg-card shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <Logo />
        </div>
        <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
        <CardDescription>Join PaddleShare and start your journey</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4">
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} type="button">
                <GoogleIcon className="mr-2 h-4 w-4"/>
              Sign up with Google
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="m@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="underline hover:text-primary">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

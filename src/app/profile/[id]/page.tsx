"use client";

import { useCollection, useDoc } from "@/firebase";
import { User } from "@/types/user";
import { Review } from "@/types/review";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { Timestamp, where } from "firebase/firestore";


function ReviewCard({ review }: { review: Review }) {
    const { data: reviewer } = useDoc<User>(`users/${review.reviewerId}`);

    const getReviewDate = () => {
        if (!review.createdAt) return '';
        // Firestore Timestamps can be either an object or a string from the server.
        if (review.createdAt instanceof Timestamp) {
            return review.createdAt.toDate().toLocaleDateString();
        }
        return new Date(review.createdAt).toLocaleDateString();
    }
    
    return (
        <div className="border-b py-4">
            <div className="flex items-center gap-4">
                <Avatar>
                    <AvatarImage src={reviewer?.photoURL ?? ""} />
                    <AvatarFallback>{reviewer?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{reviewer?.displayName ?? "Anonymous"}</p>
                     <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={cn(
                                "w-4 h-4",
                                i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"
                            )} />
                        ))}
                    </div>
                </div>
            </div>
            <p className="text-muted-foreground mt-3">{review.comment}</p>
            <p className="text-xs text-muted-foreground/70 mt-2">{getReviewDate()}</p>
        </div>
    )
}

function ProfilePageContent() {
    const params = useParams();
    const userId = params.id as string;

    const { data: user, isLoading: isLoadingUser } = useDoc<User>(userId ? `users/${userId}` : null);

    const { data: reviews, isLoading: isLoadingReviews } = useCollection<Review>(
        userId ? 'reviews' : null,
        userId ? where('driverId', '==', userId) : undefined
    );

    const avgRating = useMemo(() => {
        if (!reviews || reviews.length === 0) return 0;
        return reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
    }, [reviews]);
    
    const getUserJoinDate = () => {
        if (!user?.createdAt) return '';
        if (user.createdAt instanceof Timestamp) {
            return user.createdAt.toDate().toLocaleDateString();
        }
        return new Date(user.createdAt).toLocaleDateString();
    }

    if (isLoadingUser) {
        return (
            <div className="container py-12 max-w-4xl mx-auto">
                 <div className="flex items-center gap-6 mb-8">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

    if (!user) {
        return <div className="container py-12">User not found.</div>
    }

    return (
        <div className="container py-12 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
                <Avatar className="h-24 w-24 text-4xl">
                    <AvatarImage src={user.photoURL ?? ""} />
                    <AvatarFallback>{user.displayName?.charAt(0) ?? user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-3xl font-bold font-headline">{user.displayName}</h1>
                    <p className="text-muted-foreground">Member since {getUserJoinDate()}</p>
                    {reviews && reviews.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                            <span className="text-xl font-bold">{avgRating.toFixed(1)}</span>
                            <span className="text-muted-foreground">({reviews.length} reviews)</span>
                        </div>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Reviews as a Driver</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingReviews && <p>Loading reviews...</p>}
                    {!isLoadingReviews && (!reviews || reviews.length === 0) && (
                        <p className="text-muted-foreground">This driver has not received any reviews yet.</p>
                    )}
                    {reviews && reviews.length > 0 && (
                        <div className="space-y-4">
                            {reviews.map(review => (
                                <ReviewCard key={review.id} review={review} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default function ProfilePage() {
    return <ProfilePageContent />;
}

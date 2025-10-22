
"use client";

import { useCollection, useDoc, useFirestore, useUser } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useMemoFirebase } from "@/firebase/provider";
import { Booking } from "@/types/booking";
import { Message } from "@/types/message";
import { Ride } from "@/types/ride";
import { User } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { collection, doc, orderBy, query, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";


function ChatMessage({ message, sender }: { message: Message, sender?: User | null }) {
    const { user } = useUser();
    const isCurrentUser = message.senderId === user?.uid;
    
    const timestamp = message.timestamp ? new Date(message.timestamp) : new Date();
    
    return (
         <div className={cn("flex items-end gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
            {!isCurrentUser && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={sender?.photoURL ?? ""} />
                    <AvatarFallback>{sender?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                </Avatar>
            )}
            <div className={cn(
                "max-w-xs md:max-w-md lg:max-w-lg rounded-xl px-4 py-2",
                isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
                <p className="text-sm">{message.text}</p>
                 <p className="text-xs mt-1 text-right opacity-70">
                    {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
         </div>
    )
}

function ChatPageContent() {
    const params = useParams();
    const bookingId = params.id as string;
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const bookingRef = useMemoFirebase(() => {
        if (!firestore || !bookingId) return null;
        return doc(firestore, 'bookings', bookingId);
    }, [firestore, bookingId]);
    const { data: booking, isLoading: isLoadingBooking } = useDoc<Booking>(bookingRef);

    const rideRef = useMemoFirebase(() => {
        if(!firestore || !booking?.rideId) return null;
        return doc(firestore, 'rides', booking.rideId);
    }, [firestore, booking]);
    const { data: ride, isLoading: isLoadingRide } = useDoc<Ride>(rideRef);
    
    // Authorization check before fetching other data
    const isUserInvolved = user?.uid === booking?.passengerId || user?.uid === ride?.driverId;
    
    const otherUserRef = useMemoFirebase(() => {
        if(!firestore || !ride || !user || !booking || !isUserInvolved) return null;
        const otherUserId = ride.driverId === user.uid ? booking.passengerId : ride.driverId;
        return doc(firestore, 'users', otherUserId);
    }, [firestore, ride, user, booking, isUserInvolved]);

    const { data: otherUser } = useDoc<User>(otherUserRef);

    const messagesRef = useMemoFirebase(() => {
        if (!bookingRef || !isUserInvolved) return null;
        return query(collection(bookingRef, 'messages'), orderBy('timestamp', 'asc'));
    }, [bookingRef, isUserInvolved]);

    const { data: messages, isLoading: isLoadingMessages } = useCollection<Message>(messagesRef);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !firestore || !isUserInvolved) return;
        
        addDocumentNonBlocking(collection(firestore, 'bookings', bookingId, 'messages'), {
            senderId: user.uid,
            text: newMessage,
            timestamp: serverTimestamp(),
        });
        setNewMessage("");
    }
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    const isLoading = isUserLoading || isLoadingBooking || isLoadingRide;

    if (isLoading) {
        return (
             <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
                 <Skeleton className="h-8 w-48 mb-4" />
                 <Card>
                    <CardHeader><Skeleton className="h-6 w-full" /></CardHeader>
                    <CardContent className="space-y-4 h-96">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-10 w-1/2 self-end" />
                        <Skeleton className="h-10 w-2/3" />
                    </CardContent>
                    <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                 </Card>
            </div>
        )
    }

    if (!isUserInvolved) {
        return (
            <div className="container py-12 text-center">
                <p>You are not authorized to view this chat.</p>
                <Button asChild variant="link" className="mt-4"><Link href="/dashboard">Return to Dashboard</Link></Button>
            </div>
        )
    }
    
    if (!booking || !ride) {
        return <p>Booking not found.</p>
    }

    if(booking.status !== 'confirmed' || booking.paymentStatus !== 'paid') {
        return (
            <div className="container py-12 text-center">
                <p>Chat is only available for confirmed and paid bookings.</p>
                 <Button asChild variant="link" className="mt-4"><Link href="/dashboard/bookings">Return to My Trips</Link></Button>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
             <Link href={user?.uid === ride.driverId ? `/dashboard/rides/manage/${ride.id}` : "/dashboard/bookings"} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to {user?.uid === ride.driverId ? "Manage Ride" : "My Trips"}
            </Link>
            <Card className="flex flex-col h-[calc(100vh-12rem)]">
                <CardHeader className="border-b">
                    <CardTitle>Chat for ride to {ride.destination}</CardTitle>
                    <CardDescription>Conversation with {otherUser?.displayName ?? 'user'}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                    {isLoadingMessages && <p>Loading messages...</p>}
                    {messages?.map(msg => (
                        <ChatMessage key={msg.id} message={msg} sender={otherUser} />
                    ))}
                    <div ref={messagesEndRef} />
                </CardContent>
                <CardFooter className="border-t pt-6">
                    <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                        <Input 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                        />
                        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    )
}

export default function ChatPage() {
    return (
        <ProtectedRoute>
            <ChatPageContent />
        </ProtectedRoute>
    )
};

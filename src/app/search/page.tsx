import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Calendar, Car, Clock, Users, Wallet } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const searchResults = [
    { id: 1, from: 'New York, NY', to: 'Boston, MA', price: 35, image: PlaceHolderImages.find(p => p.id === 'ride1'), seats: 2, time: '8:00 AM', driver: { name: 'Alice', avatar: PlaceHolderImages.find(p => p.id === 'avatar1') } },
    { id: 2, from: 'New York, NY', to: 'Philadelphia, PA', price: 25, image: PlaceHolderImages.find(p => p.id === 'ride2'), seats: 3, time: '9:30 AM', driver: { name: 'Bob', avatar: PlaceHolderImages.find(p => p.id === 'avatar2') } },
    { id: 3, from: 'New York, NY', to: 'Washington, DC', price: 40, image: PlaceHolderImages.find(p => p.id === 'ride3'), seats: 1, time: '11:00 AM', driver: { name: 'Charlie', avatar: PlaceHolderImages.find(p => p.id === 'avatar3') } },
];

export default function SearchPage() {
    return (
        <div className="container py-12">
            <Card className="bg-card/60 backdrop-blur-sm border-border/20 shadow-lg mb-8">
                <CardContent className="p-6">
                    <form className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="grid gap-2">
                            <Label htmlFor="from">From</Label>
                            <Input id="from" placeholder="e.g., New York, NY" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="to">To</Label>
                            <Input id="to" placeholder="e.g., Boston, MA" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="date">Date</Label>
                            <Input id="date" type="date" />
                        </div>
                        <Button type="submit" className="w-full">Search Rides</Button>
                    </form>
                </CardContent>
            </Card>

            <div>
                <h2 className="text-2xl font-headline font-bold mb-4">Available Rides</h2>
                <div className="grid gap-6">
                    {searchResults.map((ride) => (
                        <Card key={ride.id} className="bg-card/60 backdrop-blur-sm border-border/20 shadow-lg hover:shadow-primary/10 transition-shadow duration-300 flex flex-col md:flex-row">
                             {ride.image && (
                                <div className="md:w-1/3 relative h-48 md:h-auto">
                                    <Image
                                        src={ride.image.imageUrl}
                                        alt={ride.image.description}
                                        fill
                                        className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
                                        data-ai-hint={ride.image.imageHint}
                                    />
                                </div>
                             )}
                            <div className="p-6 flex-1 flex flex-col justify-between">
                               <div>
                                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <div className="flex items-center gap-2 text-xl font-bold font-headline">
                                        <span>{ride.from}</span>
                                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                        <span>{ride.to}</span>
                                    </div>
                                    <div className="text-2xl font-bold text-primary mt-2 sm:mt-0">
                                        ${ride.price}
                                    </div>
                                 </div>
                                 <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground mt-4">
                                     <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {ride.time}</div>
                                     <div className="flex items-center gap-2"><Users className="h-4 w-4" /> {ride.seats} seats available</div>
                                 </div>
                               </div>
                                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                                    <div className="flex items-center gap-2">
                                        {ride.driver.avatar && (
                                          <Image src={ride.driver.avatar.imageUrl} alt={ride.driver.name} width={40} height={40} className="rounded-full" data-ai-hint={ride.driver.avatar.imageHint} />
                                        )}
                                        <span className="font-medium">{ride.driver.name}</span>
                                    </div>
                                    <Button>Book Seat</Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

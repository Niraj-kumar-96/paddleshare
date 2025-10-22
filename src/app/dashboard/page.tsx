import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-headline font-bold">Welcome, User!</h1>
                    <p className="text-muted-foreground">Here's what's happening with your rides.</p>
                </div>
                <Button asChild>
                    <Link href="/offer-ride">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Offer New Ride
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Rides</CardTitle>
                        <CardDescription>As a driver</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">2</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Trips</CardTitle>
                        <CardDescription>As a passenger</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">1</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Earnings</CardTitle>
                        <CardDescription>This month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">$125</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="as-driver">
                <TabsList>
                    <TabsTrigger value="as-driver">My Offered Rides</TabsTrigger>
                    <TabsTrigger value="as-passenger">My Booked Trips</TabsTrigger>
                </TabsList>
                <TabsContent value="as-driver">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Rides You're Driving</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>You have an upcoming ride from New York to Boston tomorrow.</p>
                            <p className="mt-2">Another ride from New York to Philadelphia next week.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="as-passenger">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Trips You've Booked</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <p>You have an upcoming trip from Brooklyn to Queens this Friday.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

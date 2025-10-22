
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";


export default function SettingsPage() {
    const { theme } = useTheme();

    return (
        <div>
            <h1 className="text-3xl font-headline font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground mb-8">Manage your account and application settings.</p>

            <div className="grid gap-8 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>Customize the look and feel of the app.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="theme">Theme</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground capitalize">{theme}</span>
                                <ThemeToggle />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>Choose how you receive notifications.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="flex items-center justify-between">
                            <Label htmlFor="email-notifications">Email Notifications</Label>
                            <Switch id="email-notifications" defaultChecked/>
                        </div>
                         <div className="flex items-center justify-between">
                            <Label htmlFor="push-notifications">Push Notifications</Label>
                            <Switch id="push-notifications" />
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Account</CardTitle>
                        <CardDescription>Manage your account settings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive">Delete Account</Button>
                         <p className="text-xs text-muted-foreground mt-2">
                           Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


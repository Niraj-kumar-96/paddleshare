
"use client";

import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from "@/components/ui/sidebar";
import { LayoutDashboard, Car, Wallet, Settings, User, LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getAuth, signOut } from "firebase/auth";
import { useUser } from "@/firebase";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const menuItems = [
    { icon: <LayoutDashboard />, label: "Dashboard", href: "/dashboard" },
    { icon: <Car />, label: "My Rides", href: "/dashboard/rides" },
    { icon: <Wallet />, label: "Bookings", href: "/dashboard/bookings" },
    { icon: <User />, label: "Profile", href: "/dashboard/profile" },
    { icon: <Settings />, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const auth = getAuth();
    const { user } = useUser();
    const handleLogout = () => {
        signOut(auth);
    };

    return (
        <ProtectedRoute>
            <SidebarProvider>
                <Sidebar>
                    <SidebarHeader>
                        <Logo />
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.label}>
                                    <SidebarMenuButton asChild tooltip={item.label}>
                                        <Link href={item.href}>
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarContent>
                    <div className="mt-auto flex flex-col gap-2 p-2">
                         {user && (
                            <div className="flex items-center gap-2 rounded-md p-2 hover:bg-sidebar-accent">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.photoURL ?? ""} alt={user.displayName ?? ""} />
                                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col text-sm overflow-hidden">
                                    <span className="font-medium truncate">{user.displayName}</span>
                                    <span className="text-muted-foreground truncate">{user.email}</span>
                                </div>
                            </div>
                         )}
                        <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </Button>
                    </div>
                </Sidebar>
                <SidebarInset>
                    <div className="p-4 md:p-8">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </ProtectedRoute>
    );
}

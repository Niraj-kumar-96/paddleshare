"use client";

import { usePathname } from 'next/navigation';
import React from 'react';

const WithHeader = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const isDashboard = pathname.startsWith('/dashboard');

    if (isDashboard) {
        return null;
    }

    return <>{children}</>;
};

export default WithHeader;

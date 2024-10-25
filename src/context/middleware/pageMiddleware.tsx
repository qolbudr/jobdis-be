'use client';

import React, { ReactNode } from 'react';
import { useGlobal } from '../global';
import { LoaderPage } from '@/components/Loader/LoaderPage';

export const ProtectedPage = ({ children }: { children: ReactNode }): JSX.Element => {
    const auth = useGlobal()

    if (auth?.user == null) {
        location.href = '/login';
        return <LoaderPage />;
    }

    return <>{children}</>
}

export const ForceSignedIn = ({ children }: { children: ReactNode }): JSX.Element => {
    const auth = useGlobal()

    if (auth?.user != null) {
        location.href = '/dashboard';
        return <LoaderPage />;
    }

    return <>{children}</>
}

export const RedirectDashboard = (): JSX.Element => {
    const auth = useGlobal()

    if (auth?.user != null) {
        return <LoaderPage />;
    }

    location.href = '/login';
    return <LoaderPage />
}
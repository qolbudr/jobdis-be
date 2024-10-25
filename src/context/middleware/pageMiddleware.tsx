'use client';

import React, { ReactNode } from 'react';
import { useGlobal } from '../global';
import { Loader } from '@/components/Loader/Loader';

export const ProtectedPage = ({ children }: { children: ReactNode }): JSX.Element => {
    const auth = useGlobal()

    if (auth?.user == null) {
        location.href = '/login';
        return <Loader />;
    }

    return <>{children}</>
}

export const ForceSignedIn = ({ children }: { children: ReactNode }): JSX.Element => {
    const auth = useGlobal()

    if (auth?.user != null) {
        location.href = '/dashboard';
        return <Loader />;
    }

    return <>{children}</>
}

export const RedirectDashboard = (): JSX.Element => {
    const auth = useGlobal()

    if (auth?.user != null) {
        return <Loader />;
    }

    location.href = '/login';
    return <Loader />
}
'use client';

import { LoaderPage } from "@/components/Loader/LoaderPage";
import { Exception } from "@/types/exception";
import { LoginResponse } from "@/types/login-response";
import { User } from "@/types/user";
import { ApiMethod, apiV1 } from "@/utils/api";
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useEffect, useState } from "react";

type GolbalContext = {
    user?: User,
    login: ({ email, password }: { email: string, password: string }) => Promise<User | undefined>,
    logout: () => void,
    setUser: Dispatch<SetStateAction<User | undefined>>,
}

const Context = createContext<GolbalContext | null>(null);

export const useGlobal = () => {
    return useContext(Context);
}

export const GlobalProvider = ({ children }: { children: ReactNode }): JSX.Element => {
    const [user, setUser] = useState<User>()

    const login = async ({ email, password }: { email: string, password: string }): Promise<User | undefined> => {
        try {
            const response = await apiV1<LoginResponse>({ url: '/api/auth/login', method: ApiMethod.POST, body: { 'email': email, 'password': password } })

            if (response?.user?.role == "user" || response?.user?.role == "consultant") throw { title: 'Failed to login', message: 'Invalid email or password', code: 401 };
            localStorage.setItem('user', JSON.stringify({ ...response?.user, token: response?.token }));
            setUser(response?.user);
            return response?.user;
        }
        catch (e) {
            console.log(e);
            throw e as Exception;
        }
    }

    const logout = (): void => {
        setUser(undefined);
        localStorage.clear();
        location.href = '/login';
    }

    return <><Context.Provider value={{ user: user, login: login, logout: logout, setUser: setUser }}>{children}</Context.Provider></>
}

export const AuthState = ({ children }: { children: ReactNode }): JSX.Element => {
    const auth = useGlobal()
    const [isLoading, setLoading] = useState(true)

    useEffect(() => {
        const user = localStorage.getItem('user');

        if (user) auth?.setUser(JSON.parse(user!));
        else localStorage.clear();

        setLoading(false);
    }, [])

    if (isLoading) return <><LoaderPage /></>

    return <>{children}</>;
}
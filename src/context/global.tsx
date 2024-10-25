'use client';

import { AuthRepository } from "@/repository/auth/auth_repository";
import { User } from "@/types/user";
import { Loader } from "@/components/Loader/Loader";
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
            const response = await AuthRepository.login({ email: email, password: password })

            localStorage.setItem('user', JSON.stringify(response?.user));

            setUser(response?.user);
            return response?.user;
        }
        catch (e) {
            throw e;
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

    if (isLoading) return <><Loader /></>

    return <>{children}</>;
}
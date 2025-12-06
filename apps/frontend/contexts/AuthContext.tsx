"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    address?: string;
    phoneNumber?: string;
    bio?: string;
    avatarUrl?: string;
    balance: number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isLoading: boolean;
}

interface RegisterData {
    email: string;
    password: string;
    name: string;
    address?: string;
    phoneNumber?: string;
    bio?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    // Load user from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Login failed");
            }

            const data = await response.json();

            setToken(data.access_token);
            setUser(data.user);

            localStorage.setItem("token", data.access_token);
            localStorage.setItem("user", JSON.stringify(data.user));

            router.push("/dashboard");
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const response = await fetch(`${apiUrl}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Registration failed");
            }

            const result = await response.json();

            setToken(result.access_token);
            setUser(result.user);

            localStorage.setItem("token", result.access_token);
            localStorage.setItem("user", JSON.stringify(result.user));

            router.push("/dashboard");
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    const refreshUser = async () => {
        if (!token || !user) return;

        try {
            console.log("🔄 Refreshing user data for ID:", user.id);
            const response = await fetch(`${apiUrl}/api/users/${user.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const updatedUser = await response.json();
                console.log("✅ User refreshed:", {
                    id: updatedUser.id,
                    name: updatedUser.name,
                    balance: updatedUser.balance,
                    balanceType: typeof updatedUser.balance,
                });
                console.log(
                    "Old balance:",
                    user.balance,
                    "New balance:",
                    updatedUser.balance
                );
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
            } else {
                console.error(
                    "❌ Failed to refresh user, status:",
                    response.status
                );
            }
        } catch (error) {
            console.error("Failed to refresh user:", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                register,
                logout,
                refreshUser,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

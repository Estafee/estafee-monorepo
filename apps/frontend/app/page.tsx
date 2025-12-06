"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface HealthResponse {
    status: string;
    message: string;
    timestamp: string;
    service: string;
    version: string;
}

interface FeaturedItem {
    id: string;
    title: string;
    pricePerDay: number;
    images: string[];
    condition: string;
    owner: {
        name: string;
        address?: string;
    };
}

export default function Home() {
    const [health, setHealth] = useState<HealthResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const apiUrl =
                    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
                const response = await fetch(`${apiUrl}/api/health`);
                if (!response.ok) {
                    throw new Error("Failed to fetch health status");
                }
                const data = await response.json();
                setHealth(data);
                setError(null);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Connection failed"
                );
            } finally {
                setLoading(false);
            }
        };

        const fetchFeaturedItems = async () => {
            try {
                const apiUrl =
                    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
                const response = await fetch(`${apiUrl}/api/items`);
                if (response.ok) {
                    const data = await response.json();
                    // Get first 6 available items
                    const available = data
                        .filter((item: FeaturedItem) => item.images?.length > 0)
                        .slice(0, 6);
                    setFeaturedItems(available);
                }
            } catch (err) {
                console.error("Failed to fetch items:", err);
            }
        };

        fetchHealth();
        fetchFeaturedItems();
    }, []);

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
                        Rent. Share. Save.
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                        Discover amazing items to rent from your community. From
                        cameras to camping gear, find everything you need.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/explore"
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-lg"
                        >
                            Explore Items
                        </Link>
                        <Link
                            href="/dashboard"
                            className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 dark:border-gray-700 text-lg"
                        >
                            List Your Item
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 px-4 bg-white/50 dark:bg-gray-800/50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
                        Why Choose ESTAFEE?
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                                <svg
                                    className="w-8 h-8 text-blue-600 dark:text-blue-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Save Money
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Rent items instead of buying them. Perfect for
                                one-time needs or occasional use.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                                <svg
                                    className="w-8 h-8 text-green-600 dark:text-green-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Secure Transactions
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Safe and secure rental process with verified
                                users and protected payments.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                                <svg
                                    className="w-8 h-8 text-purple-600 dark:text-purple-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Community Driven
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Connect with people in your area and build a
                                sharing economy together.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Items */}
            {featuredItems.length > 0 && (
                <section className="py-16 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                                Featured Items
                            </h2>
                            <Link
                                href="/explore"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold flex items-center gap-2"
                            >
                                View All
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                                    />
                                </svg>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredItems.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/items/${item.id}`}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
                                >
                                    <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                                        <img
                                            src={item.images[0]}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <span className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white">
                                            {item.condition}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                                            {item.title}
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                    Rp
                                                    {item.pricePerDay.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    per day
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            by {item.owner.name}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* System Status Footer - Minimized */}
            <footer className="py-8 px-4 bg-white/30 dark:bg-gray-800/30">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center gap-2 text-sm">
                        {loading ? (
                            <>
                                <div className="h-2 w-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                <span className="text-gray-600 dark:text-gray-400">
                                    System Status: Checking...
                                </span>
                            </>
                        ) : error ? (
                            <>
                                <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                                <span className="text-gray-600 dark:text-gray-400">
                                    System Status: Offline
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-gray-600 dark:text-gray-400">
                                    System Status: Online
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";

interface HealthResponse {
    status: string;
    message: string;
    timestamp: string;
    service: string;
    version: string;
}

export default function Home() {
    const [health, setHealth] = useState<HealthResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
                const response = await fetch(
                    `${apiUrl}/api/health`
                );
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

        fetchHealth();
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-16 pb-16">
            <main className="flex flex-col items-center justify-center px-6 py-12 text-center">
                {/* Coming Soon Message */}
                <div className="mb-12 max-w-2xl">
                    <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                        Coming Soon
                    </h1>
                </div>

                {/* Backend Connection Status */}
                <div className="w-full max-w-md">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                System Status
                            </h3>
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-gray-500">
                                        Checking...
                                    </span>
                                </div>
                            ) : error ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                                    <span className="text-xs text-red-500">
                                        Offline
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-green-500">
                                        Online
                                    </span>
                                </div>
                            )}
                        </div>

                        {loading && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Connecting to backend...
                            </div>
                        )}

                        {error && (
                            <div className="text-sm text-red-500">
                                Backend connection failed. Please ensure the
                                backend is running on port 3001.
                            </div>
                        )}

                        {health && (
                            <div className="space-y-2 text-left text-sm">
                                {/* <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Service:</span>
                                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                                        {health.service}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                        {health.status}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Version:</span>
                                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                                        {health.version}
                                    </span>
                                </div> */}
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-xs text-gray-500 dark:text-gray-500">
                                        Last checked:{" "}
                                        {new Date(
                                            health.timestamp
                                        ).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Item {
    id: string;
    title: string;
    description: string;
    pricePerDay: number;
    images: string[];
    condition: string;
    isAvailable: boolean;
    owner: {
        id: string;
        name: string;
        address?: string;
    };
}

export default function ExplorePage() {
    const [items, setItems] = useState<Item[]>([]);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [conditionFilter, setConditionFilter] = useState("ALL");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    useEffect(() => {
        fetchItems();
    }, []);

    useEffect(() => {
        filterItems();
    }, [items, searchQuery, conditionFilter]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}/api/items`);

            if (!response.ok) {
                throw new Error("Failed to fetch items");
            }

            const data = await response.json();
            // Only show available items
            const availableItems = data.filter(
                (item: Item) => item.isAvailable
            );
            setItems(availableItems);
            setError(null);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load items"
            );
            console.error("Error fetching items:", err);
        } finally {
            setLoading(false);
        }
    };

    const filterItems = () => {
        let filtered = items;

        // Search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(
                (item) =>
                    item.title
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    item.description
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
            );
        }

        // Condition filter
        if (conditionFilter !== "ALL") {
            filtered = filtered.filter(
                (item) => item.condition === conditionFilter
            );
        }

        setFilteredItems(filtered);
    };

    const getImageUrl = (images: string[]) => {
        if (images && images.length > 0) {
            return images[0];
        }
        return "/placeholder-item.jpg"; // You can add a placeholder image
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-24 px-4 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Explore Items
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Browse available items for rent
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Search
                            </label>
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* Condition Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Condition
                            </label>
                            <select
                                value={conditionFilter}
                                onChange={(e) =>
                                    setConditionFilter(e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="ALL">All Conditions</option>
                                <option value="NEW">New</option>
                                <option value="GOOD">Good</option>
                                <option value="FAIR">Fair</option>
                                <option value="POOR">Poor</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-gray-600 dark:text-gray-400">
                        Found {filteredItems.length}{" "}
                        {filteredItems.length === 1 ? "item" : "items"}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                {/* Items Grid */}
                {filteredItems.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            {searchQuery || conditionFilter !== "ALL"
                                ? "No items found matching your filters"
                                : "No items available at the moment"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredItems.map((item) => (
                            <Link
                                key={item.id}
                                href={`/items/${item.id}`}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
                            >
                                {/* Image */}
                                <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                    {item.images && item.images.length > 0 ? (
                                        <img
                                            src={getImageUrl(item.images)}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                                            <svg
                                                className="w-16 h-16"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Condition Badge */}
                                    <div className="absolute top-2 right-2">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                item.condition === "NEW"
                                                    ? "bg-green-500 text-white"
                                                    : item.condition === "GOOD"
                                                    ? "bg-blue-500 text-white"
                                                    : item.condition === "FAIR"
                                                    ? "bg-yellow-500 text-white"
                                                    : "bg-orange-500 text-white"
                                            }`}
                                        >
                                            {item.condition}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                                        {item.title}
                                    </h3>

                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                                        {item.description}
                                    </p>

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

                                    {/* Owner Info */}
                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Owner:{" "}
                                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                                {item.owner.name}
                                            </span>
                                        </p>
                                        {item.owner.address && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                📍 {item.owner.address}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

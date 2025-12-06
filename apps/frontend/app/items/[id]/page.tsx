"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

interface ItemDetail {
    id: string;
    title: string;
    description: string;
    pricePerDay: number;
    stock: number;
    condition: string;
    images: string[];
    securityDeposit: number;
    isAvailable: boolean;
    ownerId: string;
    owner: {
        id: string;
        name: string;
        avatarUrl: string;
        address: string;
    };
}

export default function ItemDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [item, setItem] = useState<ItemDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState<string>("");

    // Modal states
    const [showBorrowModal, setShowBorrowModal] = useState(false);
    const [borrowing, setBorrowing] = useState(false);
    const [borrowError, setBorrowError] = useState<string | null>(null);
    const [rentalDays, setRentalDays] = useState(1);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const apiUrl =
                    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
                const res = await fetch(`${apiUrl}/api/items/${params.id}`);
                if (!res.ok) throw new Error("Barang tidak ditemukan");
                const data = await res.json();

                setItem(data);
                if (data.images && data.images.length > 0) {
                    setActiveImage(data.images[0]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) fetchItem();
    }, [params.id]);

    useEffect(() => {
        // Auto-calculate end date when start date or rental days change
        if (startDate && rentalDays > 0) {
            const start = new Date(startDate);
            const end = new Date(start);
            end.setDate(end.getDate() + rentalDays);
            setEndDate(end.toISOString().split("T")[0]);
        }
    }, [startDate, rentalDays]);

    const handleBorrowClick = () => {
        if (!user) {
            router.push("/login");
            return;
        }

        if (item && user.id === item.ownerId) {
            toast.error("You cannot borrow your own item!");
            return;
        }

        // Set default start date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setStartDate(tomorrow.toISOString().split("T")[0]);

        setShowBorrowModal(true);
        setBorrowError(null);
    };

    const handleBorrowConfirm = async () => {
        if (!user || !item) return;

        if (!startDate || !endDate) {
            setBorrowError("Please select start and end dates");
            return;
        }

        setBorrowing(true);
        setBorrowError(null);

        try {
            const apiUrl =
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

            const totalPrice = Number(item.pricePerDay) * rentalDays;
            const totalDeposit = Number(item.securityDeposit || 0);

            const response = await fetch(`${apiUrl}/api/rentals`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    lendeeId: user.id,
                    lenderId: item.ownerId,
                    itemIds: [item.id],
                    startDate,
                    endDate,
                    totalPrice,
                    totalDeposit,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(
                    error.message || "Failed to create rental request"
                );
            }

            const rental = await response.json();

            // Show success toast
            toast.success(
                `🎉 Rental request created successfully! The owner will review your request.`,
                { duration: 5000 }
            );

            setShowBorrowModal(false);

            // Refresh item data
            window.location.reload();
        } catch (err) {
            setBorrowError(
                err instanceof Error
                    ? err.message
                    : "Failed to create rental request"
            );
        } finally {
            setBorrowing(false);
        }
    };

    const getTotalPrice = () => {
        if (!item) return 0;
        return Number(item.pricePerDay) * rentalDays;
    };

    const getTotalWithDeposit = () => {
        if (!item) return 0;
        return Number(getTotalPrice()) + Number(item.securityDeposit || 0);
    };

    if (loading)
        return <div className="min-h-screen pt-32 text-center">Loading...</div>;
    if (!item)
        return (
            <div className="min-h-screen pt-32 text-center">
                Barang tidak ditemukan.
            </div>
        );

    return (
        <>
            {/* Borrow Modal */}
            {showBorrowModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Rent {item.title}
                            </h2>
                            <button
                                onClick={() => setShowBorrowModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        {borrowError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                {borrowError}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Start Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                    min={new Date().toISOString().split("T")[0]}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            {/* Rental Days */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Number of Days
                                </label>
                                <input
                                    type="number"
                                    value={rentalDays}
                                    onChange={(e) =>
                                        setRentalDays(
                                            Math.max(
                                                1,
                                                parseInt(e.target.value) || 1
                                            )
                                        )
                                    }
                                    min="1"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            {/* End Date (Auto-calculated) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    readOnly
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                                />
                            </div>

                            {/* Price Breakdown */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Price per day
                                    </span>
                                    <span className="text-gray-900 dark:text-white font-medium">
                                        Rp {item.pricePerDay.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Duration
                                    </span>
                                    <span className="text-gray-900 dark:text-white font-medium">
                                        {rentalDays}{" "}
                                        {rentalDays === 1 ? "day" : "days"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Subtotal
                                    </span>
                                    <span className="text-gray-900 dark:text-white font-medium">
                                        Rp {getTotalPrice().toLocaleString()}
                                    </span>
                                </div>
                                {item.securityDeposit > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Security Deposit
                                        </span>
                                        <span className="text-gray-900 dark:text-white font-medium">
                                            Rp{" "}
                                            {item.securityDeposit.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-900 dark:text-white font-bold">
                                            Total
                                        </span>
                                        <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                                            Rp{" "}
                                            {getTotalWithDeposit().toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Simulated Payment Notice */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
                                    <svg
                                        className="w-5 h-5 flex-shrink-0 mt-0.5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span>
                                        This is a simulated payment. No actual
                                        transaction will occur. The item owner
                                        will receive your rental request.
                                    </span>
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowBorrowModal(false)}
                                    disabled={borrowing}
                                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBorrowConfirm}
                                    disabled={
                                        borrowing || !startDate || !endDate
                                    }
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {borrowing
                                        ? "Processing..."
                                        : "Confirm Rental"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-white pt-28 pb-12">
                <div className="container mx-auto px-6 max-w-7xl">
                    {/* Breadcrumb Simple */}
                    <div className="text-sm text-gray-500 mb-6 flex gap-2">
                        <Link href="/" className="hover:text-indigo-600">
                            Home
                        </Link>
                        <span>/</span>
                        <span className="font-semibold text-gray-900 truncate max-w-[200px]">
                            {item.title}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* KOLOM KIRI: Galeri Foto (Mirip Tokped) */}
                        <div className="lg:col-span-5">
                            <div className="sticky top-28">
                                {/* Gambar Utama */}
                                <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4 border border-gray-100 relative group">
                                    {activeImage ? (
                                        <img
                                            src={activeImage}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnail List */}
                                {item.images && item.images.length > 0 && (
                                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                        {item.images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() =>
                                                    setActiveImage(img)
                                                }
                                                className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                                                    activeImage === img
                                                        ? "border-indigo-600 opacity-100"
                                                        : "border-transparent opacity-60 hover:opacity-100"
                                                }`}
                                            >
                                                <img
                                                    src={img}
                                                    alt="thumb"
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* KOLOM TENGAH: Info Produk */}
                        <div className="lg:col-span-4">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-snug">
                                {item.title}
                            </h1>

                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-3xl font-bold text-gray-900">
                                    Rp{" "}
                                    {item.pricePerDay.toLocaleString("id-ID")}{" "}
                                    <span className="text-sm font-normal text-gray-500">
                                        / hari
                                    </span>
                                </span>
                            </div>

                            <div className="border-t border-b border-gray-100 py-4 mb-6">
                                <h3 className="font-bold text-indigo-600 mb-2">
                                    Detail Produk
                                </h3>
                                <div className="text-sm text-gray-600 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            Kondisi
                                        </span>
                                        <span
                                            className={`font-medium ${
                                                item.condition === "GOOD"
                                                    ? "text-green-600"
                                                    : "text-yellow-600"
                                            }`}
                                        >
                                            {item.condition === "GOOD"
                                                ? "Bagus"
                                                : item.condition}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            Stok Tersedia
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            {item.stock} unit
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="font-bold text-gray-900 mb-3">
                                    Deskripsi
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                    {item.description}
                                </p>
                            </div>

                            {/* Info Penjual */}
                            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                    {item.owner.avatarUrl ? (
                                        <img
                                            src={item.owner.avatarUrl}
                                            alt="Seller"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">
                                            {item.owner.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <Link
                                        href={`/users/${item.owner.id}`}
                                        className="font-bold text-gray-900 hover:text-indigo-600 transition-colors"
                                    >
                                        {item.owner.name}
                                    </Link>
                                    <div className="flex items-center text-xs text-gray-500 mt-1 gap-1">
                                        <svg
                                            className="w-3 h-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                        {item.owner.address ||
                                            "Lokasi tidak diketahui"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* KOLOM KANAN: Box Sewa (Sticky) */}
                        <div className="lg:col-span-3">
                            <div className="sticky top-28 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4">
                                    Atur Sewa
                                </h3>

                                {!item.isAvailable && (
                                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-sm text-yellow-800 font-medium">
                                            ⚠️ Currently unavailable
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1">
                                            Harga sewa per hari
                                        </p>
                                        <p className="font-bold text-gray-900">
                                            Rp{" "}
                                            {item.pricePerDay.toLocaleString(
                                                "id-ID"
                                            )}
                                        </p>
                                    </div>

                                    {item.securityDeposit > 0 && (
                                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                            <p className="text-xs text-blue-600 mb-1">
                                                Deposit Keamanan
                                            </p>
                                            <p className="font-bold text-blue-900">
                                                Rp{" "}
                                                {item.securityDeposit.toLocaleString(
                                                    "id-ID"
                                                )}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-2 flex-col">
                                        <button
                                            onClick={handleBorrowClick}
                                            disabled={
                                                !item.isAvailable ||
                                                Boolean(user &&
                                                    user.id === item.ownerId)
                                            }
                                            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
                                        >
                                            {!user
                                                ? "Login to Rent"
                                                : user.id === item.ownerId
                                                ? "Your Item"
                                                : !item.isAvailable
                                                ? "Unavailable"
                                                : "Sewa Sekarang"}
                                        </button>
                                        <Link
                                            href={`/users/${item.owner.id}`}
                                            className="w-full bg-white text-gray-700 font-bold py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all text-center"
                                        >
                                            Lihat Profil Penjual
                                        </Link>
                                    </div>

                                    <div className="text-xs text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
                                        <svg
                                            className="w-3 h-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                            />
                                        </svg>
                                        Transaksi Aman & Terpercaya
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Tipe data untuk Item agar TypeScript tidak bingung
interface Item {
    id: string;
    title: string;
    description: string;
    pricePerDay: number;
    stock: number;
    condition: string;
    images: string[];
    isAvailable: boolean;
}

export default function DashboardPage() {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();

    // Tab navigation: 'profile' | 'add_item' | 'manage_items'
    const [activeTab, setActiveTab] = useState<
        "profile" | "add_item" | "manage_items"
    >("manage_items");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{
        text: string;
        type: "success" | "error";
    } | null>(null);

    // State Data User
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        bio: "",
        address: "",
        phoneNumber: "",
        avatarUrl: "",
    });

    // State List Barang User (Untuk Tab Kelola Barang)
    const [userItems, setUserItems] = useState<Item[]>([]);

    // State Form Barang (Dipakai untuk Tambah & Edit)
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [itemForm, setItemForm] = useState({
        title: "",
        description: "",
        pricePerDay: 0,
        condition: "GOOD",
        images: "",
        stock: 1,
    });

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    // --- 1. FETCH DATA (Load User & Items) ---
    const fetchUserData = async () => {
        if (!user) return;

        try {
            const apiUrl =
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const res = await fetch(`${apiUrl}/api/users/${user.id}`);

            if (!res.ok) throw new Error("Gagal load data user.");

            const data = await res.json();

            // Set Profil
            setProfileData({
                name: data.name || "",
                email: data.email || "",
                bio: data.bio || "",
                address: data.address || "",
                phoneNumber: data.phoneNumber || "",
                avatarUrl: data.avatarUrl || "",
            });

            // Set Barang Milik User
            if (data.items && Array.isArray(data.items)) {
                setUserItems(data.items);
            }
        } catch (err) {
            console.error("Error Fetching Data:", err);
            setMessage({
                text: "Gagal memuat data. Pastikan Server nyala & ID User benar.",
                type: "error",
            });
        }
    };

    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, [user]);

    // --- 2. HANDLER UPDATE PROFIL ---
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setMessage(null);

        try {
            const apiUrl =
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const res = await fetch(`${apiUrl}/api/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profileData),
            });

            if (!res.ok) throw new Error("Gagal update profile");
            setMessage({
                text: "Profile berhasil diperbarui!",
                type: "success",
            });
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Unknown error";
            setMessage({ text: `Gagal: ${errorMessage}`, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    // --- 3. HANDLER SAVE ITEM (CREATE / UPDATE) ---
    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setMessage(null);

        try {
            const apiUrl =
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

            // Siapkan payload
            const payload = {
                ...itemForm,
                pricePerDay: Number(itemForm.pricePerDay),
                stock: Number(itemForm.stock),
                images: itemForm.images
                    .split(",")
                    .map((url: string) => url.trim())
                    .filter((url: string) => url !== ""),
                ownerId: user.id,
            };

            let res;
            if (editingItemId) {
                // MODE UPDATE
                res = await fetch(`${apiUrl}/api/items/${editingItemId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            } else {
                // MODE CREATE
                res = await fetch(`${apiUrl}/api/items`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Gagal menyimpan barang");
            }

            setMessage({
                text: editingItemId
                    ? "Barang berhasil diupdate!"
                    : "Barang berhasil ditambahkan!",
                type: "success",
            });

            // Reset Form & Refresh Data
            resetItemForm();
            fetchUserData();

            // Jika mode tambah baru, pindah ke tab list agar user lihat hasilnya
            if (!editingItemId) setActiveTab("manage_items");
        } catch (err) {
            console.error("Error Save Item:", err);
            const errorMessage =
                err instanceof Error ? err.message : "Unknown error";
            setMessage({ text: `Gagal: ${errorMessage}`, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    // --- 4. HANDLER DELETE ITEM ---
    const handleDeleteItem = async (itemId: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus barang ini?")) return;

        setLoading(true);
        try {
            const apiUrl =
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const res = await fetch(`${apiUrl}/api/items/${itemId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Gagal menghapus barang");

            setMessage({ text: "Barang berhasil dihapus.", type: "success" });
            fetchUserData();
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Unknown error";
            setMessage({ text: `Gagal hapus: ${errorMessage}`, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    // --- 5. HELPER FUNCTIONS ---

    // Klik tombol Edit di List -> Isi form & Pindah tab
    const handleEditClick = (item: Item) => {
        setEditingItemId(item.id);
        setItemForm({
            title: item.title,
            description: item.description,
            pricePerDay: Number(item.pricePerDay),
            stock: item.stock,
            condition: item.condition,
            images: item.images.join(", "),
        });
        setActiveTab("add_item");
        setMessage(null);
    };

    // Reset form ke kondisi awal (Tambah Baru)
    const resetItemForm = () => {
        setEditingItemId(null);
        setItemForm({
            title: "",
            description: "",
            pricePerDay: 0,
            condition: "GOOD",
            images: "",
            stock: 1,
        });
    };

    // Klik tombol batal edit
    const handleCancelEdit = () => {
        resetItemForm();
        setActiveTab("manage_items");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12">
            <div className="container mx-auto px-6 max-w-6xl">
                {/* Header Dashboard */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Dashboard Pengguna
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Kelola profil, tambah produk, dan atur stok barangmu.
                    </p>
                </div>

                {/* Notifikasi / Alert */}
                {message && (
                    <div
                        className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                            message.type === "success"
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                    >
                        <span className="text-xl">
                            {message.type === "success" ? "✅" : "⚠️"}
                        </span>
                        {message.text}
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* SIDEBAR NAVIGATION */}
                    <div className="w-full md:w-1/4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center sticky top-24">
                        {/* Foto Profil */}
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-50 shadow-md mb-4 bg-gray-100 flex items-center justify-center">
                            {profileData.avatarUrl ? (
                                <img
                                    src={profileData.avatarUrl}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-3xl font-bold text-gray-300">
                                    {profileData.name
                                        ? profileData.name
                                              .charAt(0)
                                              .toUpperCase()
                                        : "U"}
                                </span>
                            )}
                        </div>

                        <h2 className="text-lg font-bold text-gray-900 text-center leading-tight mb-1">
                            {profileData.name || "Nama Pengguna"}
                        </h2>
                        <p className="text-xs text-gray-500 mb-6 text-center break-all px-2">
                            {profileData.email || "Loading..."}
                        </p>

                        {/* Menu Buttons */}
                        <div className="w-full space-y-2">
                            <button
                                onClick={() => {
                                    setActiveTab("manage_items");
                                    resetItemForm();
                                }}
                                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 ${
                                    activeTab === "manage_items"
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                📦 Kelola Barang
                            </button>

                            <button
                                onClick={() => {
                                    setActiveTab("add_item");
                                    resetItemForm();
                                }}
                                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 ${
                                    activeTab === "add_item"
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                ➕ Tambah Barang
                            </button>

                            <button
                                onClick={() => {
                                    setActiveTab("profile");
                                    resetItemForm();
                                }}
                                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 ${
                                    activeTab === "profile"
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                ✏️ Edit Profil
                            </button>

                            <div className="border-t border-gray-100 my-2 pt-2">
                                {user && (
                                    <a
                                        href={`/users/${user.id}`}
                                        target="_blank"
                                        className="w-full text-left px-4 py-3 rounded-xl font-medium text-gray-500 hover:bg-gray-50 transition-all duration-200 flex items-center gap-3"
                                    >
                                        👀 Lihat Profil Publik
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="w-full md:w-3/4">
                        {/* TAB 1: KELOLA BARANG (LIST) */}
                        {activeTab === "manage_items" && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-fade-in-up min-h-[500px]">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                    <h3 className="text-xl font-bold text-gray-800">
                                        Barang Saya ({userItems.length})
                                    </h3>
                                    <button
                                        onClick={() => setActiveTab("add_item")}
                                        className="text-sm bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-100 transition-colors"
                                    >
                                        + Tambah Baru
                                    </button>
                                </div>

                                {userItems.length === 0 ? (
                                    <div className="text-center py-20 flex flex-col items-center">
                                        <div className="bg-gray-50 p-4 rounded-full mb-4">
                                            <span className="text-4xl">📦</span>
                                        </div>
                                        <p className="text-gray-500 text-lg mb-2">
                                            Belum ada barang yang disewakan.
                                        </p>
                                        <p className="text-gray-400 text-sm">
                                            Mulailah dengan menambahkan barang
                                            pertamamu.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {userItems.map((item: Item) => (
                                            <div
                                                key={item.id}
                                                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col"
                                            >
                                                <div className="h-48 bg-gray-200 relative">
                                                    {item.images &&
                                                    item.images.length > 0 ? (
                                                        <img
                                                            src={item.images[0]}
                                                            alt={item.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            No Image
                                                        </div>
                                                    )}
                                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm">
                                                        Stok: {item.stock}
                                                    </div>
                                                </div>

                                                <div className="p-4 flex flex-col grow">
                                                    <h4 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">
                                                        {item.title}
                                                    </h4>
                                                    <p className="text-gray-500 text-sm line-clamp-2 mb-3 grow">
                                                        {item.description}
                                                    </p>
                                                    <p className="text-indigo-600 font-bold mb-4">
                                                        Rp{" "}
                                                        {Number(
                                                            item.pricePerDay
                                                        ).toLocaleString(
                                                            "id-ID"
                                                        )}
                                                        /hari
                                                    </p>

                                                    <div className="flex gap-2 mt-auto">
                                                        <button
                                                            onClick={() =>
                                                                handleEditClick(
                                                                    item
                                                                )
                                                            }
                                                            className="flex-1 bg-yellow-50 text-yellow-700 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-100 transition-colors border border-yellow-200"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteItem(
                                                                    item.id
                                                                )
                                                            }
                                                            className="flex-1 bg-red-50 text-red-700 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors border border-red-200"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 2: TAMBAH / EDIT BARANG (FORM) */}
                        {activeTab === "add_item" && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-fade-in-up">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                    <h3 className="text-xl font-bold text-gray-800">
                                        {editingItemId
                                            ? "Edit Barang"
                                            : "Tambah Barang Baru"}
                                    </h3>
                                    {editingItemId && (
                                        <button
                                            onClick={handleCancelEdit}
                                            className="text-sm text-red-500 hover:text-red-700 font-medium"
                                        >
                                            Batal Edit
                                        </button>
                                    )}
                                </div>

                                <form
                                    onSubmit={handleSaveItem}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">
                                            Nama Barang
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={itemForm.title}
                                            onChange={(e) =>
                                                setItemForm({
                                                    ...itemForm,
                                                    title: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                            placeholder="Contoh: Kamera DSLR Canon 600D"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">
                                            Deskripsi Detail
                                        </label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={itemForm.description}
                                            onChange={(e) =>
                                                setItemForm({
                                                    ...itemForm,
                                                    description: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none"
                                            placeholder="Jelaskan spesifikasi, kelengkapan, dan kondisi barang..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">
                                                Harga (Rp/Hari)
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                value={itemForm.pricePerDay}
                                                onChange={(e) =>
                                                    setItemForm({
                                                        ...itemForm,
                                                        pricePerDay: Number(
                                                            e.target.value
                                                        ),
                                                    })
                                                }
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">
                                                Stok
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                value={itemForm.stock}
                                                onChange={(e) =>
                                                    setItemForm({
                                                        ...itemForm,
                                                        stock: Number(
                                                            e.target.value
                                                        ),
                                                    })
                                                }
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">
                                                Kondisi
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={itemForm.condition}
                                                    onChange={(e) =>
                                                        setItemForm({
                                                            ...itemForm,
                                                            condition:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none appearance-none"
                                                >
                                                    <option value="GOOD">
                                                        Bagus (Good)
                                                    </option>
                                                    <option value="FAIR">
                                                        Layak (Fair)
                                                    </option>
                                                    <option value="POOR">
                                                        Kurang (Poor)
                                                    </option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                                                    ▼
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">
                                            URL Gambar (Pisahkan dengan koma)
                                        </label>
                                        <input
                                            type="text"
                                            value={itemForm.images}
                                            onChange={(e) =>
                                                setItemForm({
                                                    ...itemForm,
                                                    images: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                            placeholder="https://gambar1.jpg, https://gambar2.jpg"
                                        />
                                    </div>

                                    <div className="pt-4 flex justify-end gap-3">
                                        {editingItemId && (
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                className="px-6 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-all"
                                            >
                                                Batal
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-indigo-200"
                                        >
                                            {loading
                                                ? "Menyimpan..."
                                                : editingItemId
                                                ? "Update Barang"
                                                : "Simpan Barang"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* TAB 3: EDIT PROFIL */}
                        {activeTab === "profile" && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-fade-in-up">
                                <h3 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">
                                    Informasi Pribadi
                                </h3>

                                <form
                                    onSubmit={handleUpdateProfile}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">
                                                Nama Lengkap
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.name}
                                                onChange={(e) =>
                                                    setProfileData({
                                                        ...profileData,
                                                        name: e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">
                                                Nomor Telepon
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.phoneNumber}
                                                onChange={(e) =>
                                                    setProfileData({
                                                        ...profileData,
                                                        phoneNumber:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            readOnly
                                            className="w-full px-4 py-3 rounded-xl bg-gray-100 border-gray-200 border text-gray-500 cursor-not-allowed outline-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">
                                            Bio Toko / Profil
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={profileData.bio}
                                            onChange={(e) =>
                                                setProfileData({
                                                    ...profileData,
                                                    bio: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">
                                            Alamat Lengkap
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={profileData.address}
                                            onChange={(e) =>
                                                setProfileData({
                                                    ...profileData,
                                                    address: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">
                                            Avatar URL
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.avatarUrl}
                                            onChange={(e) =>
                                                setProfileData({
                                                    ...profileData,
                                                    avatarUrl: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 border text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                        />
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-gray-200"
                                        >
                                            {loading
                                                ? "Menyimpan..."
                                                : "Simpan Profil"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

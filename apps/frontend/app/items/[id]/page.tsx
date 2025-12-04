"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface ItemDetail {
  id: string;
  title: string;
  description: string;
  pricePerDay: number;
  stock: number;
  condition: string;
  images: string[];
  owner: {
    id: string;
    name: string;
    avatarUrl: string;
    address: string; // Digunakan sebagai lokasi
  };
}

export default function ItemDetailPage() {
  const params = useParams();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${apiUrl}/api/items/${params.id}`);
        if (!res.ok) throw new Error("Barang tidak ditemukan");
        const data = await res.json();
        
        setItem(data);
        // Set gambar pertama sebagai default active image
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

  if (loading) return <div className="min-h-screen pt-32 text-center">Loading...</div>;
  if (!item) return <div className="min-h-screen pt-32 text-center">Barang tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-white pt-28 pb-12">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Breadcrumb Simple */}
        <div className="text-sm text-gray-500 mb-6 flex gap-2">
          <Link href="/" className="hover:text-indigo-600">Home</Link>
          <span>/</span>
          <span className="font-semibold text-gray-900 truncate max-w-[200px]">{item.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* KOLOM KIRI: Galeri Foto (Mirip Tokped) */}
          <div className="lg:col-span-5">
            <div className="sticky top-28">
              {/* Gambar Utama */}
              <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4 border border-gray-100 relative group">
                {activeImage ? (
                  <img src={activeImage} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
              </div>

              {/* Thumbnail List */}
              {item.images && item.images.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {item.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImage === img ? "border-indigo-600 opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* KOLOM TENGAH: Info Produk */}
          <div className="lg:col-span-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-snug">{item.title}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-gray-900">
                Rp {item.pricePerDay.toLocaleString("id-ID")} <span className="text-sm font-normal text-gray-500">/ hari</span>
              </span>
            </div>

            <div className="border-t border-b border-gray-100 py-4 mb-6">
              <h3 className="font-bold text-indigo-600 mb-2">Detail Produk</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Kondisi</span>
                  <span className={`font-medium ${item.condition === 'GOOD' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {item.condition === 'GOOD' ? 'Bagus' : item.condition}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Stok Tersedia</span>
                  <span className="font-medium text-gray-900">{item.stock} unit</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-bold text-gray-900 mb-3">Deskripsi</h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>

            {/* Info Penjual */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {item.owner.avatarUrl ? (
                  <img src={item.owner.avatarUrl} alt="Seller" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">
                    {item.owner.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <Link href={`/users/${item.owner.id}`} className="font-bold text-gray-900 hover:text-indigo-600 transition-colors">
                  {item.owner.name}
                </Link>
                <div className="flex items-center text-xs text-gray-500 mt-1 gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {item.owner.address || "Lokasi tidak diketahui"}
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: Box Sewa (Sticky) */}
          <div className="lg:col-span-3">
            <div className="sticky top-28 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Atur Sewa</h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                   <p className="text-xs text-gray-500 mb-1">Total harga sewa 1 hari</p>
                   <p className="font-bold text-gray-900">Rp {item.pricePerDay.toLocaleString("id-ID")}</p>
                </div>

                <div className="flex gap-2 flex-col">
                  <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95">
                    Sewa Sekarang
                  </button>
                  <button className="w-full bg-white text-gray-700 font-bold py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all">
                    Chat Penjual
                  </button>
                </div>

                <div className="text-xs text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Transaksi Aman & Terpercaya
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
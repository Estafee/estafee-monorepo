"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link"; // 👈 Import Link

interface Item {
  id: string;
  title: string;
  description: string;
  pricePerDay: number;
  condition: string;
  images: string[];
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  address?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  items: Item[];
}

export default function UserProfilePage() {
  const params = useParams(); // Ambil ID dari URL (users/[id])
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${apiUrl}/api/users/${params.id}`);
        
        if (!res.ok) throw new Error("User tidak ditemukan");
        
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchUser();
  }, [params.id]);

  if (loading) return <div className="min-h-screen pt-32 text-center">Loading...</div>;
  
  if (!user) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <h1 className="text-2xl font-bold text-gray-800">User tidak ditemukan</h1>
        <p className="text-gray-500">Mungkin link yang kamu akses salah atau user sudah dihapus.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12">
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* Header Profil */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-50 shadow-md bg-gray-100 flex-shrink-0">
             {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-300">
                   {user.name.charAt(0).toUpperCase()}
                </div>
              )}
          </div>

          {/* Info User */}
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
            
            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-gray-500 mb-4">
               {user.address && (
                 <div className="flex items-center gap-1">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                   {user.address}
                 </div>
               )}
               {user.email && (
                 <div className="flex items-center gap-1">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                   {user.email}
                 </div>
               )}
            </div>

            <p className="text-gray-600 leading-relaxed max-w-2xl">
              {user.bio || "Belum ada bio."}
            </p>
          </div>

          <div className="flex-shrink-0">
             <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
               Chat Penjual
             </button>
          </div>
        </div>

        {/* List Barang */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6 border-l-4 border-indigo-600 pl-4">
            Barang yang Disewakan ({user.items.length})
          </h2>

          {user.items.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-400">User ini belum menyewakan barang apapun.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.items.map((item) => (
                // 👇 WRAPPER LINK AGAR BISA DIKLIK
                <Link href={`/items/${item.id}`} key={item.id} className="group block h-full">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                    
                    {/* Gambar Produk */}
                    <div className="h-48 bg-gray-100 relative overflow-hidden">
                      {item.images && item.images.length > 0 ? (
                        <img 
                          src={item.images[0]} 
                          alt={item.title} 
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                      )}
                      
                      {/* Badge Kondisi */}
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm">
                        {item.condition}
                      </div>
                    </div>

                    {/* Detail Produk */}
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="font-bold text-gray-900 mb-1 truncate group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">
                        {item.description}
                      </p>
                      
                      <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                         <div>
                           <p className="text-xs text-gray-400">Harga Sewa</p>
                           <span className="font-bold text-indigo-600 text-lg">
                             Rp {Number(item.pricePerDay).toLocaleString('id-ID')}
                           </span>
                           <span className="text-xs text-gray-400"> /hari</span>
                         </div>
                         <span className="text-indigo-600 bg-indigo-50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                         </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
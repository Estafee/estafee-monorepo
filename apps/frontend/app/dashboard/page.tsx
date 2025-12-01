'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.name}!</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="space-y-6">
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-gray-900">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p className="text-gray-900 capitalize">{user.role}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Balance</p>
                  <p className="text-gray-900">Rp {user.balance.toLocaleString('id-ID')}</p>
                </div>
                {user.phoneNumber && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone Number</p>
                    <p className="text-gray-900">{user.phoneNumber}</p>
                  </div>
                )}
                {user.address && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-gray-900">{user.address}</p>
                  </div>
                )}
              </div>
              {user.bio && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">Bio</p>
                  <p className="text-gray-900">{user.bio}</p>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  Browse Items
                </button>
                <button className="p-4 border-2 border-green-600 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                  My Rentals
                </button>
                <button className="p-4 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                  List an Item
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

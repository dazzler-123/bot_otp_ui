'use client';

import { useEffect, useState } from 'react';
import { getStoredUser, signOut } from '../lib/auth';
import { connectSocket, disconnectSocket } from '../lib/socket';
import OTPFeed from './OTPFeed';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getStoredUser();
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(storedUser);
      // Connect Socket.io
      connectSocket(token);
    } else {
      setUser(null);
    }
    setLoading(false);

    return () => {
      disconnectSocket();
    };
  }, []);

  const handleSignOut = () => {
    signOut();
    disconnectSocket();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                OTP Sync Dashboard
              </h1>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="w-full py-6 px-4 sm:px-6 lg:px-8">
        {user.isAdmin && (
          <div className="w-full">
            <OTPFeed />
          </div>
        )}
      </main>
    </div>
  );
}


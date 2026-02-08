'use client';

import { useEffect, useState } from 'react';
import { getStoredUser } from '../src/lib/auth';
import Login from '../src/components/Login';
import Dashboard from '../src/components/Dashboard';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return user ? <Dashboard /> : <Login />;
}

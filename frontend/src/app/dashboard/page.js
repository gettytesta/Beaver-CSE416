'use client';

import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/current-user`, {
          credentials: 'include',
        });

        const data = await res.json();
        console.log('🐛 Received from backend:', data);

        // Trust the backend response
        if (res.ok && data && data.user) {
          setUser(data.user);
        } else {
          console.warn('⚠️ User not found in response');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="text-center mt-20">
        <h1 className="text-2xl font-bold text-red-500">Not logged in</h1>
        <p className="mt-4 text-gray-600">
          Please go back to the landing page and log in.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center mt-20">
      <h1 className="text-4xl font-bold text-gray-900">
        Welcome {user.name || user.username || 'Guest'}!
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Plan your financial future with confidence. Create, analyze, and optimize scenarios to achieve your long-term goals.
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Logged in as: {user.email || 'guest'}
      </p>
    </div>
  );
}
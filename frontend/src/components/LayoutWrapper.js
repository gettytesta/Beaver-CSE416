'use client';

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  const [user, setUser] = useState(null);
  const [checkedSession, setCheckedSession] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/current-user`, {
          credentials: "include",
        });

        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to load session:", err);
        setUser(null);
      } finally {
        setCheckedSession(true);
      }
    };

    fetchSession(); // ✅ always fetch, even on landing page
  }, [pathname]);

  if (!checkedSession) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  if (isLandingPage) {
    return <>{children}</>; // no layout
  }

  return (
    <div className="flex">
      <Sidebar user={user} />
      <div className="flex-1 ml-60">
        <Navbar user={user} />
        <div className="px">{children}</div>
      </div>
    </div>
  );
}
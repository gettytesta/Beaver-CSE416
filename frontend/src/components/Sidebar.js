"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  NotebookPen,
  ChartLine,
  TrendingUpDown,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [checkedSession, setCheckedSession] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/current-user`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setCheckedSession(true);
      }
    };

    fetchUser();
  }, []);

  if (!checkedSession) {
    return null; // or a loading skeleton if you want
  }

  const isGuest = !user.email;

  return (
    <aside className="fixed w-60 h-screen bg-gray-100 p-5 shadow-md">
      <h1 className="text-xl font-bold text-gray-700 mb-6">Title of APP</h1>

      <nav className="flex flex-col space-y-1">
        <SidebarItem
          href="/dashboard"
          icon={LayoutDashboard}
          text="Dashboard"
          active={pathname === "/dashboard"}
        />
        <SidebarItem
          href="/scenarios"
          icon={NotebookPen}
          text="Scenarios"
          active={pathname === "/scenarios"}
        />
        <SidebarItem
          href="/simulations"
          icon={ChartLine}
          text="Simulations"
          active={pathname === "/simulations"}
        />
        <SidebarItem
          href="/exploration"
          icon={TrendingUpDown}
          text="Scenario Exploration"
          active={pathname === "/exploration"}
        />

        {/* Show settings only if user is logged in */}
        {!isGuest && (
          <SidebarItem
            href="/settings"
            icon={Settings}
            text="Settings"
            active={pathname === "/settings"}
          />
        )}
      </nav>
    </aside>
  );
}

const SidebarItem = ({ href, icon: Icon, text, active }) => {
  return (
    <Link
      href={href}
      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all group ${
        active
          ? "bg-gray-200 text-[#5A6ACF] font-semibold"
          : "hover:bg-gray-200 text-[#273240] font-normal"
      }`}
    >
      <Icon
        className={`w-5 h-5 transition ${
          active ? "text-[#5A6ACF]" : "text-[#A6ABC8] group-hover:text-[#5A6ACF]"
        }`}
      />
      <span className="text-base">{text}</span>
    </Link>
  );
};
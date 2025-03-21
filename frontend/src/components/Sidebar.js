"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, NotebookPen, ChartLine, TrendingUpDown, Settings } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname(); 

  return (
    <aside className="fixed w-60 h-screen bg-gray-100 p-5 shadow-md">
      <h1 className="text-xl font-bold text-gray-700 mb-6">Title of APP</h1>
      <nav className="space-y-3">
        <SidebarItem href="/dashboard" icon={LayoutDashboard} text="Dashboard" active={pathname === "/dashboard"} />
        <SidebarItem href="/scenarios" icon={NotebookPen} text="Scenarios" active={pathname === "/scenarios"} />
        <SidebarItem href="/simulations" icon={ChartLine} text="Simulations" active={pathname === "/simulations"} />
        <SidebarItem href="/exploration" icon={TrendingUpDown} text="Scenario Exploration" active={pathname === "/exploration"} />
        <SidebarItem href="/settings" icon={Settings} text="Settings" active={pathname === "/settings"} />
      </nav>
    </aside>
  );
}


const SidebarItem = ({ href, icon: Icon, text, active }) => {
  return (
    <Link
      href={href}
      className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
        active
          ? "bg-gray-200 text-[#5A6ACF] font-semibold"
          : "hover:bg-gray-200 text-[#273240] font-normal"
      }`}
    >
      <Icon className={`w-6 h-6 ${active ? "text-[#707FDD]" : "text-[#A6ABC8]"}`} /> 
      <span className="text-base">{text}</span> 
    </Link>
  );
};
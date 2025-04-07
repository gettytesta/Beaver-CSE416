"use client";


// TP: ChatGPT. Prompt: "How can I build a sidebar in Next.js that highlights the current active page 
// I want the active tab to be bold and change color when clicked."
// ChatGPT helped with the structure for conditionally rendering the Settings tab and with the dynamic 
// class logic to style active sidebar items. I customized the layout using Tailwind CSS and integrated icons and routing manually.

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  NotebookPen,
  ChartLine,
  TrendingUpDown,
  Settings,
} from "lucide-react";
import { useUser } from "@/context/UserContext"; 

function Sidebar() {
  const pathname = usePathname(); //current route
  const { user, checkedSession } = useUser(); //Access user session state

  //Wait for session check to complete
  if (!checkedSession) {
    return null; 
  }

  const isGuest = !user?.email; //Guests = NoEmail probably change LATERRRRRRRRRRRR TODO

  return (
    <aside className="fixed w-60 h-screen bg-gray-100 p-5 shadow-md">

      {/* App title or branding */}
      <h1 className="text-xl font-bold text-gray-700 mb-6">Title of APP</h1>

      {/* Navigation menu */}
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

        {/* Settings only visible to authenticated users maybe change */}
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

//Reusable sidebar link component with dynamic styles
const SidebarItem = ({ href, icon: Icon, text, active }) => {
  return (
    <Link
      href={href}
      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all group ${
        active
          ? "bg-gray-200 text-[#5A6ACF] font-semibold" //Active tab styling
          : "hover:bg-gray-200 text-[#273240] font-normal" //Inactive styling with hover effect
      }`}
    >
      <Icon
        className={`w-5 h-5 transition ${
          active
            ? "text-[#5A6ACF]" // Active icon color
            : "text-[#A6ABC8] group-hover:text-[#5A6ACF]" //Inactive icon with hover transition
        }`}
      />
      <span className="text-base">{text}</span>
    </Link>
  );
};

export default Sidebar;
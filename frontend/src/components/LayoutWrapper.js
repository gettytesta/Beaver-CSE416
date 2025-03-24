"use client";

import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Sidebar from "@/components/Sidebar"; 
import Navbar from "@/components/Navbar";  

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const { checkedSession } = useUser();

  if (!checkedSession) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-60">
        <Navbar />
        <div className="px">{children}</div>
      </div>
    </div>
  );
}
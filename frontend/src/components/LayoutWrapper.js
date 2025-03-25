"use client";

import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Sidebar from "@/components/Sidebar"; 
import Navbar from "@/components/Navbar";  

export default function LayoutWrapper({ children }) {
  const pathname = usePathname(); //Get the current route
  const isLandingPage = pathname === "/"; 
  const { checkedSession } = useUser(); //Ensure session check is completed

  //Wait until the session check is done before rendering layout
  if (!checkedSession) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  //On the landing page, don’t show the sidebar or navbar
  if (isLandingPage) {
    return <>{children}</>;
  }

  //For all other pages, wrap content with sidebar and navbar
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
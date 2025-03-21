"use client";
import { usePathname } from "next/navigation";
import { Search, Sun, Bell, File, User } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname(); 

  console.log("Current Path:", pathname); 

  //What page we on
  const pageTitle =
    pathname === "/scenarios" ? "Scenario Dashboard" : "Dashboard";

  return (
    <header className="fixed top-0 left-60 right-0 bg-white shadow h-16 flex items-center px-6 z-50">

      <h1 className="text-3xl font-bold text-gray-800">{pageTitle}</h1>

      <div className="flex-1 ml-60"></div>

      {/* Search Bar */}
      <div className="relative flex items-center bg-gray-100 px-3 py-1 rounded-lg w-56 ml-10">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          className="ml-2 bg-transparent outline-none text-gray-700 w-full"
        />
      </div>
      {/* Icons */}
      <div className="flex items-center space-x-6 ml-12">
        <Sun className="w-6 h-6 text-gray-500 cursor-pointer" />
        <Bell className="w-6 h-6 text-gray-500 cursor-pointer" />
        <File className="w-6 h-6 text-gray-500 cursor-pointer" />
      </div>

      <div className="flex-1 max-w-[55px]"></div>

      {/* Profile Picture */}
      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
        <User className="w-6 h-6 text-gray-700" />
      </div>

      {/* Account Name */}
      <div className="ml-3 text-gray-700 font-medium flex items-center">
        Account Name <span className="ml-1">▼</span>
      </div>
    </header>
  );
}
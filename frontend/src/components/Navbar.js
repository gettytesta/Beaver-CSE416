"use client";

import { usePathname } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import {
  Search,
  Sun,
  Bell,
  File,
  User,
  ChevronDown,
} from "lucide-react";
import { useUser } from "@/context/UserContext"; // ✅ Import the context

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useUser(); // ✅ Grab user from context

  const pageTitle =
    pathname === "/scenarios"
      ? "Scenario Dashboard"
      : pathname === "/simulations"
      ? "Simulations"
      : pathname === "/exploration"
      ? "Scenario Exploration"
      : "Dashboard";

  const isLoggedIn = !!user?.email;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
        method: "GET",
        credentials: "include",
      });
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    handleLogout();
  };

  return (
    <>
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

        {/* Profile + Dropdown */}
        {isLoggedIn ? (
          <div
            className="relative flex items-center space-x-3 cursor-pointer"
            ref={dropdownRef}
          >
            <div
              className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <User className="w-6 h-6 text-white" />
            </div>

            <div
              className="text-gray-700 font-medium flex items-center"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              {user.name || user.username}
              <ChevronDown className="w-4 h-4 ml-1 text-gray-500 relative top-[2px]" />
            </div>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-50 border border-gray-200">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center ml-3 space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="text-gray-700 font-medium">Guest</div>
          </div>
        )}
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-96">
            <h2 className="text-xl font-semibold mb-4">
              You are logging out of Lifetime Financial Planner
            </h2>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
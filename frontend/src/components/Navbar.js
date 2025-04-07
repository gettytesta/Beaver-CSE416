"use client";


// TP: ChatGPT. Prompt: "Can you help me create a navigation bar for a MERN stack app using Next.js? 
// It should show different views depending on whether the user is logged in or a guest, include a dropdown for logout."
// ChatGPT helped scaffold the main structure, including conditional user rendering, dropdown state logic, 
// and logout handling. I customized the layout using Tailwind CSS, added UI elements like the search bar and action icons, 
// and built a modal to confirm logout for better user experience.


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
import { useUser } from "@/context/UserContext"; //Access user session context

export default function Navbar() {
  const pathname = usePathname(); //Get current route
  const { user } = useUser(); //Get current user from session context

  //Determine which title to display based on the route Need to fix this for when click ADD scenario btw TODO
  const pageTitle =
    pathname === "/scenarios"
      ? "Scenario Dashboard"
      : pathname === "/simulations"
      ? "Simulations"
      : pathname === "/exploration"
      ? "Scenario Exploration"
      : "Dashboard";


      //NEED TO Fix this maybe boolean ?
  const isLoggedIn = !!user?.email; 

  const [dropdownOpen, setDropdownOpen] = useState(false); //State for profile dropdown
  const [showLogoutModal, setShowLogoutModal] = useState(false); //State for logout confirmation modal

  // Detect clicks outside of dropdown (when its opened)
  const dropdownRef = useRef(null);

  //Close dropdown when clicking outside
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



  //If you click handle logout
  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
        method: "GET",
        credentials: "include", // Send cookies
      });
      window.location.href = "/"; // Redirect after logout
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
      {/* Navbar Header */}
      <header className="fixed top-0 left-60 right-0 bg-white shadow h-16 flex items-center px-6 z-50">

        {/* Dynamic Page Title */}
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

        {/* Icon Section */}
        <div className="flex items-center space-x-6 ml-12">
          <Sun className="w-6 h-6 text-gray-500 cursor-pointer" />
          <Bell className="w-6 h-6 text-gray-500 cursor-pointer" />
          <File className="w-6 h-6 text-gray-500 cursor-pointer" />
        </div>

        <div className="flex-1 max-w-[55px]"></div>

        {/* Authenticated User Dropdown */}
        {isLoggedIn ? (
          <div
            className="relative flex items-center space-x-3 cursor-pointer"
            ref={dropdownRef}
          >
            {/* Profile Circle */}
            <div
              className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <User className="w-6 h-6 text-white" />
            </div>

            {/* Username and Dropdown Arrow */}
            <div
              className="text-gray-700 font-medium flex items-center"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              {user.name || user.username}
              <ChevronDown className="w-4 h-4 ml-1 text-gray-500 relative top-[2px]" />
            </div>

            {/* Dropdown Menu */}
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
          //Guest View (no email)
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
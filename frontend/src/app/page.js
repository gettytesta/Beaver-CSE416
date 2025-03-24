"use client";

import { useRouter } from "next/navigation";

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function LandingPage() {
  const handleGuest = async () => {
    try {
      const res = await fetch(`${backendURL}/auth/guest`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();
      console.log("Guest login response:", data);

      if (res.ok && data.success) {
        // ✅ Force full page reload to include new session cookie
        window.location.href = "/dashboard";
      } else {
        alert("Guest login failed.");
      }
    } catch (error) {
      console.error("Guest login error:", error);
      alert("Something went wrong.");
    }
  };

  const handleLogin = () => {
    window.location.href = `${backendURL}/auth/google?prompt=select_account`;
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md transition-all duration-300 hover:shadow-2xl">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Welcome to Lifetime Financial Planner
        </h1>

        <button
          onClick={handleLogin}
          className="w-full mb-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Log in with Google
        </button>

        <button
          onClick={handleGuest}
          className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          Continue as Guest
        </button>
      </div>
    </main>
  );
}
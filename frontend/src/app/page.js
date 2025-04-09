"use client";


// TP: ChatGPT. Prompt: "Can you help me create a landing page? We are using the MERN stack with Next.js. 
// It should allow users to log in with Google or continue as a guest. When 'Continue as Guest' is clicked, 
// send a POST request to /auth/guest and navigate to /dashboard."
// ChatGPT generated the component layout, basic button handlers, and routing logic. 
// I customized the styling with Tailwind CSS, changed up the UI style, improved error handling, and ensured the guest login used a full page reload for cookie-based session setup.
import { useRouter } from "next/navigation";


//Get the backend URL from environment variables
const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function LandingPage() {
  const handleGuest = async () => {
    try {
      const res = await fetch(`${backendURL}/auth/guest`, {
        method: "POST",
        credentials: "include", //Ensures cookies are included in the request
      });

      const data = await res.json();
      console.log("Guest login response:", data);

      if (res.ok && data.success) {
        // Store guest session data in sessionStorage
        sessionStorage.setItem("guestSession", JSON.stringify(data.user));

        //Redirect to dashboard using full page reload to ensure session cookie is recognized
        window.location.href = "/dashboard";
      } else {
        alert("Guest login failed.");
      }
    } catch (error) {
      console.error("Guest login error:", error);
      alert("Something went wrong.");
    }
  };

  // Redirects to the Google OAuth login page on the backend
  const handleLogin = () => {
    sessionStorage.removeItem("guestSession");
    window.location.href = `${backendURL}/auth/google?prompt=select_account`;
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/*  Container you see with shadow  */}
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md transition-all duration-300 hover:shadow-2xl">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Welcome to Lifetime Financial Planner
        </h1>

        {/* Google Login Button */}
        <button
          onClick={handleLogin}
          className="w-full mb-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Log in with Google
        </button>

        {/* Guest Access Button */}
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
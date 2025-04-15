"use client";



// TP: ChatGPT. Prompt: "Can you help me connect a dashboard page to a backend in a MERN stack app using Next.js? 
// I want to fetch a list of saved scenarios from an API route like /api/scenarios using session cookies."
// ChatGPT helped with the fetch logic and how to include credentials in the request. 
// I implemented the rest of the component, including error handling, dynamic scenario counts, 
// connecting the reusable ScenarioTable component, and all layout and styling details — 
// such as spacing, padding, and button alignment using Tailwind CSS.


import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Trash2, Filter, Plus, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import ScenarioTable from "@/components/ScenarioTable";
import { useUser } from "@/context/UserContext";

export default function ScenarioDashboard() {
  const { user, checkedSession } = useUser(); // Access user session info
  const [scenarios, setScenarios] = useState([]); // List of saved scenarios
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!checkedSession) return;

    const fetchScenarios = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/scenarios`, {
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setScenarios(data.data || []);
        } else {
          console.warn("Scenarios fetch failed:", data);
          setError(data.message || "Failed to load scenarios");
        }
      } catch (err) {
        console.error("Error fetching scenarios:", err);
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchScenarios();
    }
  }, [checkedSession, user]);

  useEffect(() => {
    const showSuccess = searchParams.get("showSuccessPopup") === "true";
    if (showSuccess) {
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }
  }, [searchParams]);

  if (!checkedSession || loading) {
    return <div className="text-center mt-20 text-gray-500">Loading scenarios...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-500">{error}</div>;
  }

  return (
    <div className="w-full border-b border-gray-200 pt-16">
      {showPopup && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-lg font-semibold px-6 py-4 rounded-lg shadow-2xl z-50">
          ✅ Scenario was successfully saved! 
        </div>
      )}

      <div className="h-[78px] flex items-center justify-between px-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-semibold leading-none">Saved Scenarios:</h2>
          <span className="text-blue-600 text-md hover:underline cursor-pointer leading-none pt-2">
            {scenarios.length} {scenarios.length === 1 ? "Scenario" : "Scenarios"}
          </span>
        </div>

        <div className="flex items-center space-x-8">
          <button className="text-gray-600 hover:text-gray-900 flex items-center justify-center text-lg">
            <Trash2 className="w-6 h-6 mr-1" />
            <span className="font-semibold">Delete</span>
          </button>

          <button className="text-gray-600 hover:text-gray-900 flex items-center justify-center text-lg">
            <Filter className="w-6 h-6 mr-1" />
            <span className="font-semibold">Filters</span>
          </button>

          <Link href="/scenarios/add">
            <button className="px-5 py-3 bg-blue-500 text-white rounded-md flex items-center justify-center text-lg font-semibold hover:bg-blue-600">
              <span>Add Scenario</span>
              <Plus className="w-5 h-5 ml-1.5" />
            </button>
          </Link>
          <form className="px-5 py-3 bg-blue-800 text-white rounded-md flex items-center justify-center text-lg font-medium hover:bg-blue-900"
            onSubmit={async e => {
              let fd = new FormData();
              fd.append('file', e.target.file.files[0]);
              await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/yaml/scenario`, {
                method: 'POST',
                credentials: 'include',
                body: fd,
              });
            }}>
            <input type="file"
            name="file"
            placeholder="Import scenario"
            accept=".yaml"/>
            <button type="submit">Upload Scenario</button>
          </form>

          <button className="px-5 py-3 bg-gray-600 text-white rounded-md text-lg">
            Share
          </button>
        </div>
      </div>

      <ScenarioTable scenarios={scenarios} />
    </div>
  );
}

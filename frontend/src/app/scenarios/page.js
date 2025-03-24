"use client";

import Link from "next/link";
import { Trash2, Filter, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import ScenarioTable from "@/components/ScenarioTable";
import { useUser } from "@/context/UserContext";

export default function ScenarioDashboard() {
  const { user, checkedSession } = useUser();
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Don't try to fetch until session is confirmed
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

  if (!checkedSession || loading) {
    return <div className="text-center mt-20 text-gray-500">Loading scenarios...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-500">{error}</div>;
  }

  return (
    <div className="w-full border-b border-gray-200 pt-16">
      <div className="h-[78px] flex items-center justify-between px-6">
        {/* Title + Scenario Count */}
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-semibold leading-none">Saved Scenarios:</h2>
          <span className="text-blue-600 text-md hover:underline cursor-pointer leading-none pt-2">
            {scenarios.length} {scenarios.length === 1 ? "Scenario" : "Scenarios"}
          </span>
        </div>

        {/* Right-side actions */}
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

          <button className="px-5 py-3 bg-gray-600 text-white rounded-md text-lg">
            Share
          </button>
        </div>
      </div>

      {/* Table component */}
      <ScenarioTable scenarios={scenarios} />
    </div>
  );
}
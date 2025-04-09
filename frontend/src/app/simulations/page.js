"use client";

// TP: ChatGPT. Prompt: "Build a simulations dashboard in a MERN + Next.js app that uses saved scenarios to run simulations."
import { useEffect, useState } from "react";
import { Trash2, Filter, BarChartBig } from "lucide-react";
import { useUser } from "@/context/UserContext";
import SimulationsTable from "@/components/SimulationsTable"; // You'll build this next!

export default function SimulationsDashboard() {
  const { user, checkedSession } = useUser();
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!checkedSession || !user) return;

    const fetchScenarios = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/scenarios`, {
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setScenarios(data.data || []);
        } else {
          setError(data.message || "Failed to load scenarios");
        }
      } catch (err) {
        console.error("Error fetching scenarios:", err);
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchScenarios();
  }, [checkedSession, user]);

  if (!checkedSession || loading) {
    return <div className="text-center mt-20 text-gray-500">Loading simulations...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-500">{error}</div>;
  }

  return (
    <div className="w-full border-b border-gray-200 pt-16">
      {/* Top bar with title and action buttons */}
      <div className="h-[78px] flex items-center justify-between px-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-semibold leading-none">Scenario Simulations:</h2>
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
          <button className="px-5 py-3 bg-blue-600 text-white rounded-md flex items-center justify-center text-lg font-semibold hover:bg-blue-700">
            <BarChartBig className="w-5 h-5 mr-2" />
            View Charts
          </button>
        </div>
      </div>

      {/* Table displaying scenario list for simulations */}
      <SimulationsTable scenarios={scenarios} />
    </div>
  );
}

"use client";


// TP: ChatGPT. Prompt: "I already have a scenario table component in my MERN + Next.js app, but I'm having trouble 
// fetching scenarios properly and displaying multiple rows dynamically. Can you help fix the fetch logic and update the component?"
//
// ChatGPT helped refactor the fetch call to include session-based auth and improved how the scenario data 
// is displayed in multiple rows. I integrated those changes into the existing component, updated the filtering 
// logic, added simulation input handling, and polished the UI layout using Tailwind CSS.

import { CheckSquare, Square, ArrowDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import ManageShareModal from "./ManageShareModal";


export default function ScenarioTable({ scenarios, onUpdateShare  }) {
  const router = useRouter();
  const { checkedSession } = useUser();

  const [selected, setSelected] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const dropdownRef = useRef(null);

  const [showManageShareModal, setShowManageShareModal] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);

  const toggleSelection = () => setSelected(!selected);

  const handleFilterSelect = (option) => {
    setDropdownOpen(false);
    setFilter(option);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredScenarios = scenarios.filter((scenario) => {
    if (filter === "All") return true;
    if (filter === "Single" && !scenario.isMarriedCouple) return true;
    if (filter === "Married" && scenario.isMarriedCouple) return true;
    return false;
  });

  const handleExport = async (scenarioId) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/yaml/scenario/${scenarioId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to export YAML");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `scenario_${scenarioId}.yaml`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("YAML Export Error:", err);
      alert("Failed to export YAML");
    }
  };

  if (!checkedSession) {
    return <div className="text-center mt-20 text-gray-500">Loading scenarios...</div>;
  }

  return (
    <div className="w-full p-1 relative">
      <table className="w-full border-collapse border border-gray-200 shadow-sm rounded-lg">
        <thead className="bg-gray-100 text-gray-700 font-semibold">
          <tr className="border-b border-gray-300">
            <th className="p-4 text-left w-12 relative" ref={dropdownRef}>
              <div className="flex items-center justify-center space-x-1">
                <button onClick={toggleSelection}>
                  {selected ? (
                    <CheckSquare className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                <button onClick={() => setDropdownOpen((prev) => !prev)}>
                  <span className="text-xs text-gray-600">▼</span>
                </button>
              </div>
              {dropdownOpen && (
                <div className="absolute left-0 top-10 z-10 bg-white border border-gray-200 rounded-md shadow-lg w-36">
                  {["All", "None", "Single", "Married"].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleFilterSelect(option)}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </th>
            <th className="p-4 text-left">
              <div className="flex items-center gap-1">
                Scenario Name
                <ArrowDown className="w-4 h-4" />
              </div>
            </th>
            <th className="p-4 text-left">
              <div className="flex items-center gap-1">
                Marital Status
                <ArrowDown className="w-4 h-4" />
              </div>
            </th>
            <th className="p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                # of Investments
                <ArrowDown className="w-4 h-4" />
              </div>
            </th>
            <th className="p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                # of Events
                <ArrowDown className="w-4 h-4" />
              </div>
            </th>
            <th className="p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                Last Updated
                <ArrowDown className="w-4 h-4" />
              </div>
            </th>
            <th className="p-4 text-center">Scenario Exploration</th>
            <th className="p-4 text-center border-l border-gray-300" colSpan={2}>
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredScenarios.map((scenario) => (
            <tr key={scenario._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
              <td className="p-4 text-left">
                <button onClick={toggleSelection} className="flex items-center justify-center">
                  {selected ? (
                    <CheckSquare className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </td>

              <td className="p-4">
  <div className="flex items-center gap-2">
    <span>{scenario.name}</span>

    {scenario.sharedWith?.length > 0 && (
      <button
        onClick={() => {
          setSelectedScenario(scenario);
          setShowManageShareModal(true);
        }}
        className="text-blue-500 hover:bg-blue-100 hover:underline text-xs px-1 py-0.5 rounded"
      >
        [Sharing]
      </button>
    )}
  </div>
</td>
              <td className="p-4">{scenario.isMarriedCouple ? "Married" : "Single"}</td>
              <td className="p-4 text-center">
                {Array.isArray(scenario.investments) ? scenario.investments.length : 0}
              </td>
              <td className="p-4 text-center">
                {Array.isArray(scenario.eventSeriesSet) ? scenario.eventSeriesSet.length : 0}
              </td>
              <td className="p-4 text-center text-sm text-gray-700">
                {scenario.updatedAt
                  ? new Date(scenario.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </td>
              <td className="p-4 text-center">
                <button
                  className="px-5 py-2 bg-gray-500 text-white rounded-md text-base font-medium"
                  onClick={() => handleExport(scenario._id)}
                >
                  Export
                </button>
              </td>
              <td className="p-4 text-center" colSpan={2}>
                <div className="flex justify-center gap-6">
                  <button
                    className="px-5 py-2 bg-gray-600 text-white rounded-md text-base font-medium"
                    onClick={() => router.push(`/scenarios/edit/${scenario._id}`)}
                  >
                    Edit
                  </button>
                  <button className="px-5 py-2 bg-orange-500 text-white rounded-md text-base font-medium">
                    View
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showManageShareModal && selectedScenario && (
        <ManageShareModal
    isOpen={true}
    scenario={selectedScenario}
    onClose={() => setShowManageShareModal(false)}
    onUpdateShare={onUpdateShare} // ✅ key fix here
  />
      )}

    </div>
  );
}


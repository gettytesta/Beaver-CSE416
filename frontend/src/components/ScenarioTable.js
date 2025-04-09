"use client";


// TP: ChatGPT. Prompt: "I already have a scenario table component in my MERN + Next.js app, but I'm having trouble 
// fetching scenarios properly and displaying multiple rows dynamically. Can you help fix the fetch logic and update the component?"
//
// ChatGPT helped refactor the fetch call to include session-based auth and improved how the scenario data 
// is displayed in multiple rows. I integrated those changes into the existing component, updated the filtering 
// logic, added simulation input handling, and polished the UI layout using Tailwind CSS.


import { CheckSquare, Square, ArrowDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@/context/UserContext"; // Access session info

export default function ScenarioTable() {
  const { user, checkedSession } = useUser(); //Session and user context
  const [selected, setSelected] = useState(false); 
  const [dropdownOpen, setDropdownOpen] = useState(false); //Filter dropdown state
  const [simulations, setSimulations] = useState(5); //Default simulation count
  const [scenarios, setScenarios] = useState([]); //Scenarios fetched from backend
  const [error, setError] = useState(null); 
  const [filter, setFilter] = useState("All"); //Current filter option
  const dropdownRef = useRef(null); //Ref to detect outside click

  //Fetch scenarios once user is authenticated
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
          setError("Failed to load scenarios");
        }
      } catch (err) {
        console.error("Error fetching scenarios:", err);
        setError("Something went wrong.");
      }
    };

    fetchScenarios();
  }, [checkedSession, user]);

  const toggleSelection = () => setSelected(!selected);

  //Update number of simulations
  const handleSimChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setSimulations("");
      return;
    }

    const parsed = parseInt(value);
    if (!isNaN(parsed)) {
      setSimulations(parsed);
    }
  };

  const handleSimBlur = () => {
    if (simulations === "") {
      setSimulations(0);
    }
  };

  //Handle dropdown filter selection Still need to fix this because left side of boxes dont work they select all TODO
  const handleFilterSelect = (option) => {
    console.log("Selected Filter:", option);
    setDropdownOpen(false);
    setFilter(option);
  };

  //Close filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //Apply marital status filter to scenario list
  const filteredScenarios = scenarios.filter((scenario) => {
    if (filter === "All") return true;
    if (filter === "Single" && !scenario.isMarriedCouple) return true;
    if (filter === "Married" && scenario.isMarriedCouple) return true;
    return false;
  });

  //Error fallback UI (Basically issues fetching need to fix this but its fine for now)
  if (error) {
    return <div className="text-center mt-20 text-red-500">{error}</div>;
  }

  //Wait for session check before displaying anything
  if (!checkedSession) {
    return <div className="text-center mt-20 text-gray-500">Loading scenarios...</div>;
  }

  return (
    <div className="w-full p-1 relative">

      {/* Main scenario table */}
      <table className="w-full border-collapse border border-gray-200 shadow-sm rounded-lg">
        <thead className="bg-gray-100 text-gray-700 font-semibold">
          <tr className="border-b border-gray-300">
          
            {/* Checkbox + Dropdown column */}
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

              {/* Filter dropdown */}
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

            {/* Table headers with dummy sort arrows */}
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

        {/* Table body with scenario rows */}
        <tbody>
          {filteredScenarios.map((scenario) => (
            <tr key={scenario._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
              {/* Row checkbox */}
              <td className="p-4 text-left">
                <button onClick={toggleSelection} className="flex items-center justify-center">
                  {selected ? (
                    <CheckSquare className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </td>

              {/* Scenario details */}
              <td className="p-4">{scenario.name}</td>
              <td className="p-4">{scenario.isMarriedCouple ? "Married" : "Single"}</td>
              <td className="p-4 text-center">
                {Array.isArray(scenario.investments) ? scenario.investments.length : 0}
              </td>
              <td className="p-4 text-center">
                {Array.isArray(scenario.eventSeriesSet) ? scenario.eventSeriesSet.length : 0}
              </td>

              {/* Last Updated */}
              <td className="p-4 text-center text-sm text-gray-700">
                {scenario.updatedAt
                  ? new Date(scenario.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </td>

              {/* Scenario Exploration button */}
              <td className="p-4 text-center">
                <button className="px-5 py-2 bg-gray-500 text-white rounded-md text-base font-medium">
                  Export
                </button>
              </td>

              {/* Edit / Run buttons */}
              <td className="p-4 text-center" colSpan={2}>
                <div className="flex justify-center gap-6">
                  <button className="px-5 py-2 bg-gray-600 text-white rounded-md text-base font-medium">
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
    </div>
  );
}
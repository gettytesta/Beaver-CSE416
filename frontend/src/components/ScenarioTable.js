"use client";
import { CheckSquare, Square, ArrowDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function ScenarioTable() {
  const [selected, setSelected] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [simulations, setSimulations] = useState(5); // Accepts number or empty string
  const dropdownRef = useRef(null);

  const toggleSelection = () => setSelected(!selected);

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

  const handleFilterSelect = (option) => {
    console.log("Selected Filter:", option);
    setDropdownOpen(false);

    if (option === "All" || option === "Single" || option === "Married") {
      setSelected(true);
    } else if (option === "None") {
      setSelected(false);
    }

    //Add row-filter logic here
  };

  //Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full p-1 relative">
      <table className="w-full border-collapse border border-gray-200 shadow-sm rounded-lg">
        <thead className="bg-gray-100 text-gray-700 font-semibold">
          <tr className="border-b border-gray-300">
            {/* Select All w/ Dropdown */}
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

            {/* Rest of Header */}
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
                # of Simulations
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
          <tr className="border-b border-gray-200 hover:bg-gray-50 transition">
            <td className="p-4 text-left">
              <button onClick={toggleSelection} className="flex items-center justify-center">
                {selected ? (
                  <CheckSquare className="w-5 h-5 text-blue-500" />
                ) : (
                  <Square className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </td>
            <td className="p-4">Scenario 1</td>
            <td className="p-4">Single</td>
            <td className="p-4 text-center">2</td>
            <td className="p-4 text-center">10</td>
            <td className="p-4 text-center">
              <input
                type="number"
                min="0"
                className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm"
                value={simulations}
                onChange={handleSimChange}
                onBlur={handleSimBlur}
              />
            </td>
            <td className="p-4 text-center">
              <button className="px-5 py-2 bg-gray-500 text-white rounded-md text-base font-medium">
                Choose Parameters
              </button>
            </td>
            <td className="p-4 text-center" colSpan={2}>
              <div className="flex justify-center gap-6">
                <button className="px-5 py-2 bg-gray-600 text-white rounded-md text-base font-medium">
                  Edit
                </button>
                <button className="px-5 py-2 bg-orange-500 text-white rounded-md text-base font-medium">
                  Run
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
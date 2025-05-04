"use client";
// SimulationsTable.js
import { CheckSquare, Square } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ChartModal from "./ChartModal"; // Import the modal component
import ParameterModal from "./ParameterModal"; // Import the parameter modal component

export default function SimulationsTable({ scenarios }) {
  const [selected, setSelected] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [filter, setFilter] = useState("All");
  const [simulationCounts, setSimulationCounts] = useState({});
  const [showModal, setShowModal] = useState(false); // Modal visibility state for charts
  const [showParameterModal, setShowParameterModal] = useState(false); // Modal visibility state for parameters
  const [selectedCharts, setSelectedCharts] = useState([]); // To store selected charts
  const [selectedParameter, setSelectedParameter] = useState(null); // To store selected parameter value

  const toggleSelection = () => setSelected(!selected);

  const handleFilterSelect = (option) => {
    setDropdownOpen(false);
    setFilter(option);
  };

  // Handle simulation count change for each scenario
  const handleSimChange = (id, value) => {
    setSimulationCounts((prev) => {
      const updatedCounts = {
        ...prev,
        [id]: value,
      };
      // Log the updated simulation count for the specific scenario
      console.log(`Scenario ID: ${id}, Simulations: ${updatedCounts[id]}`);
      return updatedCounts;
    });
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

  const renderStatusBadge = (status = "Inactive") => {
    const styles = {
      Completed: "bg-emerald-100 text-emerald-800",
      "In Progress": "bg-yellow-100 text-yellow-800",
      Inactive: "bg-gray-200 text-gray-600",
    };
    const dotColors = {
      Completed: "bg-emerald-500",
      "In Progress": "bg-yellow-500",
      Inactive: "bg-gray-400",
    };

    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles["Inactive"]}`}
      >
        <span className={`w-2 h-2 rounded-full ${dotColors[status] || dotColors["Inactive"]}`} />
        {status}
      </span>
    );
  };

  // Prepare the payload (for later backend usage)
  const preparePayload = (scenarioId) => {
    const numSimulations = simulationCounts[scenarioId];
    if (!numSimulations || numSimulations <= 0) return; // Ensure positive number of simulations

    const scenario = scenarios.find((s) => s._id === scenarioId);
    
    const payload = {
      scenarioId: scenario._id,
      numSimulations: numSimulations,  // Include number of simulations the user wants
      parameters: {
        initialInvestment: scenario.initialInvestment, // Example: Scenario parameters
        interestRate: scenario.interestRate,
        inflationRate: scenario.inflationRate,
        // You can add more parameters from your scenario here
      },
      charts: selectedCharts, // Add the selected charts to the payload
    };

    console.log("Simulation Payload:", payload); // Log it for now
  };

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
            <th className="p-4 text-left">Scenario Name</th>
            <th className="p-4 text-center">Success/Failure %</th>
            <th className="p-4 text-center">Final Value</th>
            <th className="p-4 text-center">Simulations Run</th>
            <th className="p-4 text-center">Status</th>
            <th className="p-4 text-center">Choose Parameters</th>
            <th className="p-4 text-center">Pick Charts</th>
            <th className="p-4 text-center">Run</th>
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
              <td className="p-4">{scenario.name}</td>
              <td className="p-4 text-center">%</td>
              <td className="p-4 text-center">Final value</td>
              <td className="p-4 text-center">
                <input
                  type="number"
                  min="1"
                  className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
                  value={simulationCounts[scenario._id] ?? ""}
                  placeholder="5"
                  onChange={(e) => handleSimChange(scenario._id, e.target.value)}
                />
              </td>
              <td className="p-4 text-center">
                {renderStatusBadge("Inactive")}
              </td>
              <td className="p-4 text-center">
                <button
                  onClick={() => setShowParameterModal(true)} // Open the parameter modal
                  className="px-4 py-2 bg-gray-500 text-white rounded-md text-sm font-medium"
                >
                  Choose Parameters
                </button>
              </td>
              <td className="p-4 text-center">
                <button
                  className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium"
                  onClick={() => setShowModal(true)} // Open the modal when "Charts" is clicked
                >
                  Charts
                </button>
              </td>
              <td className="p-4 text-center">
                <button
                  className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium"
                  onClick={() => preparePayload(scenario._id)} // Prepare payload when "Run" is clicked
                >
                  Run
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Chart Selection */}
      <ChartModal
        showModal={showModal}
        setShowModal={setShowModal}
        selectedCharts={selectedCharts}
        setSelectedCharts={setSelectedCharts}
      />

      {/* Modal for Parameter Selection */}
      <ParameterModal
        showModal={showParameterModal}
        setShowModal={setShowParameterModal}
        setSelectedParameter={setSelectedParameter}
      />
    </div>
  );
}

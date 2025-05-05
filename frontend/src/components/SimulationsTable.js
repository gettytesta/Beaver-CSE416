"use client";
import { CheckSquare, Square } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ChartModal from "./ChartModal";
import ParameterModal from "./ParameterModal";

export default function SimulationsTable({ scenarios }) {
  const [selected, setSelected] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [filter, setFilter] = useState("All");
  const [simulationCounts, setSimulationCounts] = useState({});

  // ✅ NEW: Per-scenario state
  const [selectedParameters, setSelectedParameters] = useState({});
  const [selectedChartsByScenario, setSelectedChartsByScenario] = useState({});

  // For modals
  const [showModal, setShowModal] = useState(false);
  const [showParameterModal, setShowParameterModal] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState(null);

  const toggleSelection = () => setSelected(!selected);

  const handleFilterSelect = (option) => {
    setDropdownOpen(false);
    setFilter(option);
  };

  const handleSimChange = (id, value) => {
    setSimulationCounts((prev) => ({
      ...prev,
      [id]: value,
    }));
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

  const handleRunClick = (scenarioId) => {
    const scenario = scenarios.find((s) => s._id === scenarioId);
    const selectedParameter = selectedParameters[scenarioId];
    const selectedCharts = selectedChartsByScenario[scenarioId];

    if (!scenario || !simulationCounts[scenarioId]) {
      console.warn("Missing scenario or simulation count");
      return;
    }

    if (selectedParameter?.parameterType === "noParameters") {
      console.log("✅ Running basic simulation for:", scenario.name);

      const chartsToRun = {};

      if (selectedCharts?.lineChart !== undefined) {
        chartsToRun.lineChart = selectedCharts.lineChart;
      }

      if (selectedCharts?.shadedLineChart !== undefined) {
        chartsToRun.shadedLineChart = selectedCharts.shadedLineChart;
        chartsToRun.selectedQuantity = selectedCharts.selectedQuantity;
      }

      if (selectedCharts?.stackedBarChart !== undefined) {
        chartsToRun.stackedBarChart = selectedCharts.stackedBarChart;
        chartsToRun.selectedChartType = selectedCharts.selectedChartType;
        chartsToRun.selectedValueType = selectedCharts.selectedValueType;
        chartsToRun.aggregationThreshold = selectedCharts.aggregationThreshold;
      }

      console.log("📊 Charts selected:", chartsToRun);
      console.log("⚙️ Parameters selected:", selectedParameter);
      // TODO: Replace with real backend simulation call
      // await axios.post("/api/simulate", { scenarioId, chartsToRun, selectedParameter });
 
      // TODO: On simulation finish, store results in state and show chart modal or redirect

      alert("Simulation finished (stub). Charts ready to view (stub).");
    } else {
      console.warn("Only 'No Parameters' supported for now.");
    }
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
                  onClick={() => {
                    setActiveScenarioId(scenario._id);
                    setShowParameterModal(true);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md text-sm font-medium"
                >
                  Choose Parameters
                </button>
              </td>
              <td className="p-4 text-center">
                <button
                  className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium"
                  onClick={() => {
                    const param = selectedParameters[scenario._id];
                    if (!param) {
                      alert("Please select a parameter first.");
                    } else if (param.parameterType === "noParameters") {
                      setActiveScenarioId(scenario._id);
                      setShowModal(true);
                    } else {
                      alert(`${param.parameterType} charts coming soon`);
                    }
                  }}
                >
                  Charts
                </button>
              </td>
              <td className="p-4 text-center">
                <button
                  className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium"
                  onClick={() => handleRunClick(scenario._id)}
                >
                  Run
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Chart Modal */}
      <ChartModal
        showModal={showModal}
        setShowModal={setShowModal}
        selectedCharts={selectedChartsByScenario[activeScenarioId] || {}}
        setSelectedCharts={(newCharts) =>
          setSelectedChartsByScenario((prev) => ({
            ...prev,
            [activeScenarioId]: newCharts,
          }))
        }
      />

      {/* Parameter Modal */}
      <ParameterModal
        showModal={showParameterModal}
        setShowModal={setShowParameterModal}
        currentParameter={selectedParameters[activeScenarioId] || null}
        scenario={scenarios.find((s) => s._id === activeScenarioId)}
        setSelectedParameter={(param) =>
          setSelectedParameters((prev) => ({
            ...prev,
            [activeScenarioId]: param,
          }))
        }
      />
    </div>
  );
}

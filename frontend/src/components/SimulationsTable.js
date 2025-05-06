"use client";
import { CheckSquare, Square } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ChartModal from "./ChartModal";
import ParameterModal from "./ParameterModal";
import OneDimensionalModal from "./OneDimensionalModal";
import ParamOneModal from "./ParamOneModal";
import ParamTwoModal from "./ParamTwoModal.jsx";
import TwoDimensionalModal from "./TwoDimensionalModal";


import axios from "axios";
import { useSimulationResult } from "@/context/SimulationResultContext";
import { useRouter } from "next/navigation";

export default function SimulationsTable({ scenarios }) {
  const [selected, setSelected] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [filter, setFilter] = useState("All");
  const [simulationCounts, setSimulationCounts] = useState({});

  const [completedSimulations, setCompletedSimulations] = useState({});
  
  const [selectedParameters, setSelectedParameters] = useState({});
  const [selectedChartsByScenario, setSelectedChartsByScenario] = useState({});

  // For modals
  const [showModal, setShowModal] = useState(false);
  const [showParameterModal, setShowParameterModal] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState(null);

  const [showOneDimModal, setShowOneDimModal] = useState(false);

  const [showParam1Modal, setShowParam1Modal] = useState(false);
  const [showParam2Modal, setShowParam2Modal] = useState(false);
  const [showTwoDimModal, setShowTwoDimModal] = useState(false);


  const { setResults } = useSimulationResult();
  const router = useRouter();

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



  const handleRunClick = async (scenarioId) => {
    const scenario = scenarios.find((s) => s._id === scenarioId);
    const selectedParameter = selectedParameters[scenarioId];
    const selectedCharts = selectedChartsByScenario[scenarioId];
    const numSimulations = parseInt(simulationCounts[scenarioId]);
  
    if (!scenario || isNaN(numSimulations) || numSimulations <= 0) {
      alert("Missing or invalid scenario/simulation count.");
      return;
    }
  
    if (selectedParameter?.parameterType === "noParameters") {
      console.log("✅ Running basic simulation for:", scenario.name);
  
      const chartsToRun = {};
  
      if (selectedCharts?.lineChart) {
        chartsToRun.lineChart = true;
      }
  
      if (selectedCharts?.shadedLineChart) {
        chartsToRun.shadedLineChart = true;
        chartsToRun.selectedQuantities = selectedCharts.selectedQuantities || [];
      }
  
      if (selectedCharts?.stackedBarChart) {
        chartsToRun.stackedBarChart = true;
        chartsToRun.selectedChartTypes = selectedCharts.selectedChartType || []; // updated key
        chartsToRun.selectedValueType = selectedCharts.selectedValueType;
        chartsToRun.aggregationThreshold = selectedCharts.aggregationThreshold;
      }
  
      console.log("📊 Charts selected:", chartsToRun);
      console.log("⚙️ Parameters selected:", selectedParameter);
      console.log("🛰️ Sending simulation request with:", {
        scenarioId,
        numSimulations,
        selectedCharts,
        selectedParameter,
      });
  
      try {
        const response = await fetch(`http://localhost:5000/api/simulations/${scenarioId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            numSimulations,
            parameterType: "noParameters"
          })
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.message || "Simulation failed");
        }
  
        console.log("✅ Simulation results:", data);
        alert("Simulation finished. Ready to view charts.");

        setCompletedSimulations((prev) => ({
          ...prev,
          [scenarioId]: true,
        }));

        setResults({
          scenario,
          scenarioId,
          numSimulations,
          selectedCharts,
          selectedParameter,
          data
        });
        
  
      } catch (err) {
        console.error("❌ Error running simulation:", err);
        alert("Failed to run simulation: " + err.message);
      }
  
    } else if (selectedParameter?.parameterType === "oneDimensional") {
      console.log("📈 Running 1D parameter simulation for:", scenario.name);
    
      const oneDChartsToRun = {
        multiLineOverTime: !!selectedCharts?.multiLine,
        finalValueVsParameter: !!selectedCharts?.finalVsParam,
        selectedMetrics: [
          ...(selectedCharts?.multiLineQuantities || []),
          ...(selectedCharts?.finalValueQuantities || [])
        ]
      };
    
      console.log("📊 1D Charts selected:", oneDChartsToRun);
      console.log("⚙️ Parameters selected:", selectedParameter);
    
      try {
        const response = await fetch(`http://localhost:5000/api/simulations/${scenarioId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            numSimulations,
            parameterType: "oneDimensional",
            param1: selectedParameter
          }),
        });
    
        const data = await response.json();

        console.log(data);
    
        if (!response.ok) throw new Error(data.message || "1D Simulation failed");
    
        alert("1D simulation finished. Ready to view charts.");
        setCompletedSimulations((prev) => ({ ...prev, [scenarioId]: true }));
    
        setResults({
          scenario,
          scenarioId,
          numSimulations,
          selectedCharts: oneDChartsToRun,
          selectedParameter,
          data
        });
    
      } catch (err) {
        console.error("Error running 1D simulation:", err);
        alert("Failed to run 1D simulation: " + err.message);
      }
    } else if (selectedParameter?.parameterType === "twoDimensional") {
      console.log("📊 Running 2D parameter simulation for:", scenario.name);
    
      const twoDChartsToRun = {
        surfacePlot: !!selectedCharts?.surfacePlot,
        contourPlot: !!selectedCharts?.contourPlot,
        selectedMetrics: [
          ...(selectedCharts?.surfaceQuantities || []),
          ...(selectedCharts?.contourQuantities || [])
        ]
      };
    
      console.log("📊 2D Charts selected:", twoDChartsToRun);
    
      console.log("⚙️ Param 1:", selectedParameter?.param1);
      console.log("⚙️ Param 2:", selectedParameter?.param2);
  
      try {
        const response = await fetch(`http://localhost:5000/api/simulations/${scenarioId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            numSimulations,
            parameterType: "twoDimensional",
            param1: selectedParameter.param1,
            param2: selectedParameter.param2,
          }),
        });
  
        const data = await response.json();
  
        if (!response.ok) throw new Error(data.message || "2D Simulation failed");
  
        alert("2D simulation finished. Ready to view charts.");
  /*
        setCompletedSimulations((prev) => ({ ...prev, [scenarioId]: true }));
  
        setResults({
          scenario,
          scenarioId,
          numSimulations,
          selectedCharts: twoDChartsToRun,
          selectedParameter: {
            parameterType: "twoDimensional",
            param1: selectedParameter.param1,
            param2: selectedParameter.param2
          },
          data
        });*/
  
      } catch (err) {
        console.error("❌ Error running 2D simulation:", err);
        alert("Failed to run 2D simulation: " + err.message);
      }
  
    } else {
      alert(`Simulation type '${selectedParameter?.parameterType}' is not yet supported.`);
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
              <td className="p-4">
                {scenario.name}
                {selectedParameters[scenario._id]?.parameterType === "twoDimensional" && (
                  <div className="mt-1 flex gap-2 text-xs">
                    <button
                      className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded hover:bg-blue-200 transition"
                      onClick={() => {
                        setActiveScenarioId(scenario._id);
                        setShowParam1Modal(true);
                      }}
                    >
                      [Param 1]
                    </button>
                    <button
                      className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded hover:bg-blue-200 transition"
                      onClick={() => {
                        setActiveScenarioId(scenario._id);
                        setShowParam2Modal(true);
                      }}
                    >
                      [Param 2]
                    </button>
                  </div>
                )}

              </td>
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
                    } else if (param.parameterType === "oneDimensional") {
                      setActiveScenarioId(scenario._id);
                      setShowOneDimModal(true);
                    } 
                    else if (param.parameterType === "twoDimensional") {
                      setActiveScenarioId(scenario._id);
                      setShowTwoDimModal(true); 
                    } else {
                      alert(`${param.parameterType} charts coming soon`);
                    }
                  }}
                >
                  Charts
                </button>
              </td>
              <td className="p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium"
                    onClick={() => handleRunClick(scenario._id)}
                  >
                    Run
                  </button>

                  {completedSimulations[scenario._id] && (
                    <button
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium"
                      onClick={() => router.push("/charts")}
                    >
                      View Charts
                    </button>
                  )}
                </div>
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

      <OneDimensionalModal
        showModal={showOneDimModal}
        setShowModal={setShowOneDimModal}
        selectedCharts={selectedChartsByScenario[activeScenarioId] || {}}
        setSelectedCharts={(newCharts) =>
          setSelectedChartsByScenario((prev) => ({
            ...prev,
            [activeScenarioId]: newCharts,
          }))
        }
      />

<TwoDimensionalModal
  showModal={showTwoDimModal}
  setShowModal={setShowTwoDimModal}
  selectedCharts={selectedChartsByScenario[activeScenarioId] || {}}
  setSelectedCharts={(newCharts) =>
    setSelectedChartsByScenario((prev) => ({
      ...prev,
      [activeScenarioId]: newCharts,
    }))
  }
/>



<ParamOneModal
  showModal={showParam1Modal}
  setShowModal={setShowParam1Modal}
  scenario={scenarios.find((s) => s._id === activeScenarioId)}
  param={selectedParameters[activeScenarioId]?.param1 || null}
  setParam={(updatedParam) =>
    setSelectedParameters((prev) => ({
      ...prev,
      [activeScenarioId]: {
        ...prev[activeScenarioId],
        param1: updatedParam,
      },
    }))
  }
/>

<ParamTwoModal
  showModal={showParam2Modal}
  setShowModal={setShowParam2Modal}
  scenario={scenarios.find((s) => s._id === activeScenarioId)}
  param={selectedParameters[activeScenarioId]?.param2 || null}
  setParam={(updatedParam) =>
    setSelectedParameters((prev) => ({
      ...prev,
      [activeScenarioId]: {
        ...prev[activeScenarioId],
        param2: updatedParam,
      },
    }))
  }
/>


    </div>
  );
}

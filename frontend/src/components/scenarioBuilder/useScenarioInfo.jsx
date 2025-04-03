import { useState, useRef } from "react";

export default function useScenarioInfo() {
  const [filingStatus, setFilingStatus] = useState("single");
  const [state, setState] = useState("New York");
  const [scenarioName, setScenarioName] = useState("");
  const [retirementAges, setRetirementAges] = useState([""]);
  const [financialGoal, setFinancialGoal] = useState("");
  const [birthYears, setBirthYears] = useState([""]);
  const [showLifespanModal, setShowLifespanModal] = useState(false);
  const [lifespanTypes, setLifespanTypes] = useState(["fixed"]);
  const [lifespanValues, setLifespanValues] = useState([{ value: "" }]);

  const fileInputRef = useRef(null);
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 125 }, (_, i) => `${currentYear - i}`);

  const states = [
    "No State Taxes", "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
    "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho",
    "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
    "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska",
    "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina",
    "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
    "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia",
    "Washington", "West Virginia", "Wisconsin", "Wyoming"
  ];

  const unavailableStates = ["Wyoming", "Alaska"];
  const stateRequiresUpload = unavailableStates.includes(state);

  const handleYamlUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected YAML file:", file.name);
    }
  };

  const handleBirthYearChange = (index, value) => {
    const updated = [...birthYears];
    updated[index] = value;
    setBirthYears(updated);
  };

  const handleRetirementAgeChange = (index, value) => {
    const updated = [...retirementAges];
    updated[index] = value;
    setRetirementAges(updated);
  };

  const handleLifespanTypeChange = (index, type) => {
    const updated = [...lifespanTypes];
    updated[index] = type;
    setLifespanTypes(updated);
    const updatedValues = [...lifespanValues];
    updatedValues[index] = type === "fixed" ? { value: "" } : { mean: "", stdev: "" };
    setLifespanValues(updatedValues);
  };

  const handleLifespanValueChange = (index, key, value) => {
    const updated = [...lifespanValues];
    updated[index][key] = value;
    setLifespanValues(updated);
  };

  const handleFilingStatusChange = (status) => {
    setFilingStatus(status);
    if (status === "single") {
      setBirthYears([birthYears[0] || ""]);
      setRetirementAges([retirementAges[0] || ""]);
      setLifespanTypes([lifespanTypes[0] || "fixed"]);
      setLifespanValues([lifespanValues[0] || { value: "" }]);
    } else {
      setBirthYears([birthYears[0] || "", birthYears[1] || ""]);
      setRetirementAges([retirementAges[0] || "", retirementAges[1] || ""]);
      setLifespanTypes([lifespanTypes[0] || "fixed", lifespanTypes[1] || "fixed"]);
      setLifespanValues([
        lifespanValues[0] || { value: "" },
        lifespanValues[1] || { value: "" },
      ]);
    }
  };

  const renderYearDropdown = (label, index, placeholder) => (
    <div className="flex flex-col">
      <label className="text-sm text-gray-600 mb-1">{label}</label>
      <select
        value={birthYears[index] || ""}
        onChange={(e) => handleBirthYearChange(index, e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 w-[180px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <option value="">{placeholder}</option>
        {yearOptions.map((year) => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
    </div>
  );

  const renderRetirementAge = (label, index, placeholder) => (
    <div className="flex flex-col">
      <label className="text-sm text-gray-600 mb-1">{label}</label>
      <input
        type="number"
        min="0"
        placeholder={placeholder}
        className="border border-gray-300 rounded-md px-3 py-2 w-[180px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
        value={retirementAges[index] || ""}
        onChange={(e) => handleRetirementAgeChange(index, e.target.value)}
      />
    </div>
  );

  const renderLifespanModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-xl space-y-6">
        <h2 className="text-lg font-semibold">Life Expectancy</h2>
        {[...Array(filingStatus === "married" ? 2 : 1)].map((_, index) => (
          <div key={index} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {filingStatus === "married" && index === 1 ? "Spouse" : "User"} Life Expectancy
            </label>
            <select
              value={lifespanTypes[index] || "fixed"}
              onChange={(e) => handleLifespanTypeChange(index, e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            >
              <option value="fixed">Fixed</option>
              <option value="normal">Normal (Dist.)</option>
            </select>
            {lifespanTypes[index] === "fixed" ? (
              <input
                type="number"
                placeholder="e.g. 80"
                value={lifespanValues[index]?.value || ""}
                onChange={(e) => handleLifespanValueChange(index, "value", e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
              />
            ) : (
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Mean"
                  value={lifespanValues[index]?.mean || ""}
                  onChange={(e) => handleLifespanValueChange(index, "mean", e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-1/2"
                />
                <input
                  type="number"
                  placeholder="Stdev"
                  value={lifespanValues[index]?.stdev || ""}
                  onChange={(e) => handleLifespanValueChange(index, "stdev", e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-1/2"
                />
              </div>
            )}
          </div>
        ))}
        <div className="flex justify-end gap-3">
          <button onClick={() => setShowLifespanModal(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded">
            Cancel
          </button>
          <button onClick={() => setShowLifespanModal(false)} className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return {
    filingStatus,
    setFilingStatus,
    state,
    setState,
    scenarioName,
    setScenarioName,
    retirementAges,
    setRetirementAges,
    financialGoal,
    setFinancialGoal,
    birthYears,
    setBirthYears,
    showLifespanModal,
    setShowLifespanModal,
    lifespanTypes,
    setLifespanTypes,
    lifespanValues,
    setLifespanValues,
    fileInputRef,
    yearOptions,
    states,
    stateRequiresUpload,
    handleYamlUpload,
    handleBirthYearChange,
    handleRetirementAgeChange,
    handleLifespanTypeChange,
    handleLifespanValueChange,
    handleFilingStatusChange,
    renderYearDropdown,
    renderRetirementAge,
    renderLifespanModal
  };
}

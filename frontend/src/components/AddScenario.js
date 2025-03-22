"use client";
import { useState, useRef } from "react";

export default function AddScenario() {
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

  return (
    <div className="w-full px-4 mt-20">
      {showLifespanModal && renderLifespanModal()}

      <div className="flex justify-between items-center bg-indigo-400 text-white px-6 py-3 rounded-t-md">
        <h1 className="text-2xl font-semibold">Scenario Builder</h1>
        <span className="text-lg font-medium">
          Type: {filingStatus === "single" ? "Single" : "Married Filing Jointly"}
        </span>
      </div>

      <div className="w-full border border-gray-300 rounded-b-md p-8 bg-white space-y-8">
        {/*Filing Status Selection */}
        <div className="flex items-center">
          <label className="w-48 font-medium text-gray-700">Tax Filing Status</label>
          <div className="space-x-6">
            <label className="inline-flex items-center">
              <input type="radio" value="single" checked={filingStatus === "single"} onChange={() => {
                setFilingStatus("single");
                setBirthYears([birthYears[0] || ""]);
                setRetirementAges([retirementAges[0] || ""]);
                setLifespanTypes([lifespanTypes[0] || "fixed"]);
                setLifespanValues([lifespanValues[0] || { value: "" }]);
              }} />
              <span className="ml-2">Single</span>
            </label>
            <label className="inline-flex items-center">
              <input type="radio" value="married" checked={filingStatus === "married"} onChange={() => {
                setFilingStatus("married");
                setBirthYears([birthYears[0] || "", birthYears[1] || ""]);
                setRetirementAges([retirementAges[0] || "", retirementAges[1] || ""]);
                setLifespanTypes([lifespanTypes[0] || "fixed", lifespanTypes[1] || "fixed"]);
                setLifespanValues([
                  lifespanValues[0] || { value: "" },
                  lifespanValues[1] || { value: "" }
                ]);
              }} />
              <span className="ml-2">Married Filing Jointly</span>
            </label>
          </div>
        </div>

        {/* Retirement Info Section */}
        <div className="flex items-start">
          <label className="w-48 font-medium text-gray-700 pt-2">Retirement Info</label>
          <div className="flex flex-wrap gap-4">
            {renderYearDropdown("Date of Birth (Year Only)", 0, "Select Year")}
            {filingStatus === "married" && renderYearDropdown("Spouse DOB (Year Only)", 1, "Select Year")}
            {renderRetirementAge("Retirement Age", 0, "e.g. 65")}
            {filingStatus === "married" && renderRetirementAge("Spouse Retirement Age", 1, "e.g. 63")}
            <div className="flex flex-col justify-end">
              <button onClick={() => setShowLifespanModal(true)} className="mt-6 px-4 py-2 bg-indigo-100 border border-indigo-400 text-indigo-700 rounded hover:bg-indigo-200">
                Edit Life Expectancy
              </button>
            </div>
          </div>
        </div>

        {/* State Selection and Upload YAML Warning IF WYOMING IS PICKED */}
        <div className="flex items-start">
          <label className="w-48 font-medium text-gray-700 pt-2">State of Residence</label>
          <div className="flex flex-col">
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {stateRequiresUpload && (
              <div className="mt-4 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded-md">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <span className="flex items-center mb-2 sm:mb-0">
                    ⚠️ We don’t currently have tax data for <strong className="ml-1">{state}</strong>. Financial projections will ignore state income tax unless you upload a YAML file.
                  </span>
                  <div>
                    <input
                      type="file"
                      accept=".yaml,.yml"
                      ref={fileInputRef}
                      onChange={handleYamlUpload}
                      style={{ display: "none" }}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 sm:mt-0 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-md"
                    >
                      Upload State Tax YAML
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Financial Goals Input */}
        <div className="flex items-center">
          <label className="w-48 font-medium text-gray-700">Financial Goals</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
              $
            </span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="e.g. 100000"
              className="pl-7 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={financialGoal}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setFinancialGoal(val);
              }}
            />
          </div>
        </div>

        {/* Scenario Name Input */}
        <div className="flex items-center">
          <label className="w-48 font-medium text-gray-700">Scenario Name</label>
          <input
            type="text"
            placeholder="Name Text Field"
            className="border border-gray-300 rounded-md px-3 py-2 w-full max-w-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
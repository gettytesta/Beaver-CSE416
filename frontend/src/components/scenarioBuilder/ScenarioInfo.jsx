import React from "react";

export default function ScenarioInfo({
  filingStatus,
  onFilingStatusChange,
  birthYears,
  lifespanTypes,
  lifespanValues,
  state,
  setState,
  states,
  stateRequiresUpload,
  fileInputRef,
  handleYamlUpload,
  financialGoal,
  setFinancialGoal,
  scenarioName,
  setScenarioName,
  setShowLifespanModal,
  renderYearDropdown,
  ignoreStateTax,
  setIgnoreStateTax,
  userRetireContributionLimit,
  setUserRetireContributionLimit,
  spouseRetireContributionLimit,
  setSpouseRetireContributionLimit
}) {
  const stateName = states.find((s) => s.code === state)?.name || state;

  return (
    <>
      <div className="flex justify-between items-center bg-indigo-400 text-white px-6 py-3 rounded-t-md">
        <h1 className="text-2xl font-semibold">Scenario Builder</h1>
        <span className="text-lg font-medium">
          Type: {filingStatus === "single" ? "Single" : "Married Filing Jointly"}
        </span>
      </div>

      <div className="w-full border border-gray-300 rounded-b-md p-8 bg-white space-y-8">
        {/* Filing Status */}
        <div className="flex items-center">
          <label className="w-48 font-medium text-gray-700">Tax Filing Status</label>
          <div className="space-x-6">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="single"
                checked={filingStatus === "single"}
                onChange={() => onFilingStatusChange("single")}
              />
              <span className="ml-2">Single</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="married"
                checked={filingStatus === "married"}
                onChange={() => onFilingStatusChange("married")}
              />
              <span className="ml-2">Married Filing Jointly</span>
            </label>
          </div>
        </div>

        {/* Retirement Info */}
        <div className="flex items-start">
          <label className="w-48 font-medium text-gray-700 pt-2">Retirement Info</label>
          <div className="flex flex-wrap gap-4">
            {renderYearDropdown("Date of Birth (Year Only)", 0, "Select Year")}
            {filingStatus === "married" && renderYearDropdown("Spouse DOB (Year Only)", 1, "Select Year")}
            <div className="flex flex-col justify-end">
              <button
                onClick={() => setShowLifespanModal(true)}
                className="mt-6 px-4 py-2 bg-indigo-100 border border-indigo-400 text-indigo-700 rounded hover:bg-indigo-200"
              >
                Edit Life Expectancy
              </button>
            </div>
          </div>
        </div>

        {/* Contribution Limits - Side by Side */}
        <div className="flex items-center">
          <label className="w-48 font-medium text-gray-700">After-Tax Contribution Limit</label>
          <div className="flex gap-4">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1 ml-1">User</label>
              <input
                type="number"
                placeholder="e.g. 22000"
                className="border border-gray-300 rounded-md px-3 py-2 w-[180px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={userRetireContributionLimit}
                onChange={(e) => setUserRetireContributionLimit(e.target.value)}
              />
            </div>
          </div>
        </div>


        {/* State Selector + YAML Upload */}
        <div className="flex items-start">
          <label className="w-48 font-medium text-gray-700 pt-2">State of Residence</label>
          <div className="flex flex-col">
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {states.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>

            {stateRequiresUpload && !ignoreStateTax && (
              <div className="mt-4 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded-md">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <span className="flex items-center mb-2 sm:mb-0">
                    ⚠️ We don’t currently have tax data for <strong className="ml-1">{stateName}</strong>. Financial projections will ignore state income tax unless you upload a YAML file.
                  </span>
                  <div className="flex flex-col sm:flex-row sm:space-x-2">
                    <input
                      type="file"
                      accept=".yaml,.yml"
                      ref={fileInputRef}
                      onChange={handleYamlUpload}
                      style={{ display: "none" }}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-md"
                    >
                      Upload State Tax YAML
                    </button>
                    <button
                      onClick={() => setIgnoreStateTax(true)}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-md"
                    >
                      Ignore Warning
                    </button>
                  </div>
                </div>
              </div>
            )}

            {stateRequiresUpload && ignoreStateTax && (
              <div className="mt-4 bg-orange-100 border-l-4 border-orange-400 text-orange-700 p-4 rounded-md">
                ⚠️ You chose to ignore state tax data. Financial projections will <strong>exclude state income tax</strong>.
              </div>
            )}
          </div>
        </div>

        {/* Financial Goal */}
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

        {/* Scenario Name */}
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
    </>
  );
}

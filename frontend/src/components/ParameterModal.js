import { useState } from "react";

export default function ParameterModal({
  showModal,
  setShowModal,
  setSelectedParameter,
}) {
  const [selectedOption, setSelectedOption] = useState("");  // For selecting main parameter type
  const [selectedSubOption, setSelectedSubOption] = useState("");  // For selecting sub-parameters
  const [rangeValues, setRangeValues] = useState({
    lower: "",
    upper: "",
    step: "",
  });

  // Handle change in main parameter dropdown
  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  // Handle change in sub-parameter dropdown for 1D scenario exploration
  const handleSubOptionChange = (e) => {
    setSelectedSubOption(e.target.value);
  };

  // Handle range inputs for numeric parameters
  const handleRangeChange = (e) => {
    const { name, value } = e.target;
    setRangeValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Apply button click
  const handleApply = () => {
    if (selectedOption) {
      const parameter = {
        parameterType: selectedOption,
        subParameter: selectedSubOption,
        range: rangeValues,
      };
      setSelectedParameter(parameter);
      setShowModal(false);  // Close the modal after selection
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center ${
        showModal ? "block" : "hidden"
      }`}
    >
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-2xl font-semibold mb-4">Select Parameter for Scenario Exploration</h3>

        {/* Dropdown for selecting main parameter type */}
        <div className="mb-4">
          <label htmlFor="parameter" className="block text-sm text-gray-600 mb-2">
            Choose a parameter for scenario exploration
          </label>
          <select
            id="parameter"
            value={selectedOption}
            onChange={handleOptionChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select an option</option>
            <option value="noParameters">No Parameters</option>
            <option value="oneDimensional">One-Dimensional Scenario Exploration</option>
            <option value="twoDimensional">Two-Dimensional Scenario Exploration</option>
          </select>
        </div>

        {/* Sub-parameters for One-Dimensional Scenario Exploration */}
        {selectedOption === "oneDimensional" && (
          <div className="mb-4">
            <label htmlFor="subParameter" className="block text-sm text-gray-600 mb-2">
              Choose a sub-parameter for One-Dimensional Exploration
            </label>
            <select
              id="subParameter"
              value={selectedSubOption}
              onChange={handleSubOptionChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select a sub-parameter</option>
              <option value="rothOptimizer">Roth Conversion Optimizer (RCO)</option>
              <option value="startYearDuration">Start Year / Duration of Event Series</option>
              <option value="incomeExpenseInitial">Initial Amount of Income/Expense Event</option>
              <option value="investmentPercentage">
                Percentage of First Investment in Asset Allocation
              </option>
            </select>
          </div>
        )}

        {/* Range Inputs for Numeric Parameters (only when 1D exploration is selected) */}
        {(selectedSubOption === "startYearDuration" ||
          selectedSubOption === "incomeExpenseInitial" ||
          selectedSubOption === "investmentPercentage") && (
          <div>
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">Lower Bound</label>
              <input
                type="number"
                name="lower"
                value={rangeValues.lower}
                onChange={handleRangeChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="Enter lower bound"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">Upper Bound</label>
              <input
                type="number"
                name="upper"
                value={rangeValues.upper}
                onChange={handleRangeChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="Enter upper bound"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">Step Size</label>
              <input
                type="number"
                name="step"
                value={rangeValues.step}
                onChange={handleRangeChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="Enter step size"
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";

export default function ChartModal({ showModal, setShowModal, selectedCharts, setSelectedCharts }) {
  const [lineChartCount, setLineChartCount] = useState(0);
  const [shadedLineChartCount, setShadedLineChartCount] = useState(0);
  const [selectedQuantity, setSelectedQuantity] = useState("totalInvestments");
  const [selectedChartType, setSelectedChartType] = useState("investments");
  const [aggregationThreshold, setAggregationThreshold] = useState(0);
  const [selectedValueType, setSelectedValueType] = useState("median"); // Default to median

  // Handle checkbox change for chart selection
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    if (checked) {
      setSelectedCharts((prev) => ({
        ...prev,
        [name]: checked ? (name === "lineChart" ? lineChartCount : shadedLineChartCount) : 0,
      }));
    } else {
      setSelectedCharts((prev) => {
        const updatedCharts = { ...prev };
        delete updatedCharts[name]; // Remove the chart type if unchecked
        return updatedCharts;
      });

      // Reset counts when unchecked
      if (name === "lineChart") setLineChartCount(0);
      else setShadedLineChartCount(0);
    }
  };

  const handleNumberChange = (e, chartType) => {
    const value = e.target.value;
    if (value === "" || value === "0") {
      if (chartType === "lineChart") {
        setLineChartCount(0);
      } else {
        setShadedLineChartCount(0);
      }
    } else {
      const parsedValue = Math.max(0, parseInt(value, 10) || 0);
      if (chartType === "lineChart") {
        setLineChartCount(parsedValue);
      } else {
        setShadedLineChartCount(parsedValue);
      }
    }
  };

  const handleApply = () => {
    setShowModal(false);
  };

  const handleQuantitySelect = (e) => {
    setSelectedQuantity(e.target.value);
  };

  const handleChartTypeSelect = (e) => {
    setSelectedChartType(e.target.value);
  };

  // Handle the Median/Average toggle
  const handleValueTypeSelect = (e) => {
    setSelectedValueType(e.target.value);
  };

  const handleThresholdChange = (e) => {
    const value = e.target.value;
    setAggregationThreshold(Math.max(0, parseInt(value, 10) || 0));
  };

  return (
    <div className={`fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center ${showModal ? "block" : "hidden"}`}>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h3 className="text-2xl font-semibold mb-4">Select Charts</h3>

        {/* Line Chart Option */}
        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="lineChart"
              onChange={handleCheckboxChange}
              checked={selectedCharts["lineChart"] !== undefined}
              className="focus:ring-blue-500"
            />
            <span className="text-gray-800 text-sm">Line Chart (Probability of Success Over Time)</span>
          </label>
          {selectedCharts["lineChart"] !== undefined && (
            <div className="mt-2">
              <span className="text-sm text-gray-600">Number of Line Charts</span>
              <input
                type="number"
                min="0"
                value={lineChartCount === 0 ? "" : lineChartCount}
                onChange={(e) => handleNumberChange(e, "lineChart")}
                className="w-16 ml-2 p-1 border border-gray-300 rounded-md text-sm"
                placeholder="0"
              />
            </div>
          )}
        </div>

        {/* Shaded Line Chart Option */}
        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="shadedLineChart"
              onChange={handleCheckboxChange}
              checked={selectedCharts["shadedLineChart"] !== undefined}
              className="focus:ring-blue-500"
            />
            <span className="text-gray-800 text-sm">Shaded Line Chart (Probability Ranges Over Time)</span>
          </label>
          {selectedCharts["shadedLineChart"] !== undefined && (
            <>
              <div className="mt-2">
                <span className="text-sm text-gray-600">Number of Shaded Line Charts</span>
                <input
                  type="number"
                  min="0"
                  value={shadedLineChartCount === 0 ? "" : shadedLineChartCount}
                  onChange={(e) => handleNumberChange(e, "shadedLineChart")}
                  className="w-16 ml-2 p-1 border border-gray-300 rounded-md text-sm"
                  placeholder="0"
                />
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-600">Select Quantity</span>
                <select
                  value={selectedQuantity}
                  onChange={handleQuantitySelect}
                  className="ml-2 p-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="totalInvestments">Total Investments</option>
                  <option value="totalIncome">Total Income</option>
                  <option value="totalExpenses">Total Expenses</option>
                  <option value="earlyWithdrawalTax">Early Withdrawal Tax</option>
                  <option value="discretionaryExpenses">Discretionary Expenses</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Stacked Bar Chart Option */}
        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="stackedBarChart"
              onChange={handleCheckboxChange}
              checked={selectedCharts["stackedBarChart"] !== undefined}
              className="focus:ring-blue-500"
            />
            <span className="text-gray-800 text-sm">Stacked Bar Chart (Median/Average Values Over Time)</span>
          </label>
          {selectedCharts["stackedBarChart"] !== undefined && (
            <>
              <div className="mt-2">
                <span className="text-sm text-gray-600">Select Data Type</span>
                <select
                  value={selectedChartType}
                  onChange={handleChartTypeSelect}
                  className="ml-2 p-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="investments">Investments</option>
                  <option value="income">Income</option>
                  <option value="expenses">Expenses</option>
                </select>
              </div>

              {/* Median/Average Toggle */}
              <div className="mt-2">
                <span className="text-sm text-gray-600">Select Median or Average</span>
                <div className="flex items-center">
                  <label className="mr-4">
                    <input
                      type="radio"
                      value="median"
                      checked={selectedValueType === "median"}
                      onChange={handleValueTypeSelect}
                      className="mr-2"
                    />
                    Median
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="average"
                      checked={selectedValueType === "average"}
                      onChange={handleValueTypeSelect}
                      className="mr-2"
                    />
                    Average
                  </label>
                </div>
              </div>

              {/* Aggregation Threshold */}
              <div className="mt-2">
                <span className="text-sm text-gray-600">Aggregation Threshold</span>
                <input
                  type="number"
                  min="0"
                  value={aggregationThreshold}
                  onChange={handleThresholdChange}
                  className="ml-2 p-1 border border-gray-300 rounded-md text-sm"
                  placeholder="0"
                />
              </div>
            </>
          )}
        </div>

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

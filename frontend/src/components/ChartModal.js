import { useState, useEffect, useRef } from "react";

export default function ChartModal({ showModal, setShowModal, selectedCharts, setSelectedCharts }) {
  const wasCancelled = useRef(false);

  const [lineChartCount, setLineChartCount] = useState(0);
  const [shadedLineChartCount, setShadedLineChartCount] = useState(0);
  const [stackedBarChartCount, setStackedBarChartCount] = useState(0);
  const [selectedQuantity, setSelectedQuantity] = useState("totalInvestments");
  const [selectedChartType, setSelectedChartType] = useState("investments");
  const [aggregationThreshold, setAggregationThreshold] = useState(0);
  const [selectedValueType, setSelectedValueType] = useState("median");

  // ✅ Sync modal state when modal opens for a new scenario
  useEffect(() => {
    if (showModal) {
      setLineChartCount(selectedCharts.lineChart || 0);
      setShadedLineChartCount(selectedCharts.shadedLineChart || 0);
      setStackedBarChartCount(selectedCharts.stackedBarChart || 0);
      setSelectedQuantity(selectedCharts.selectedQuantity || "totalInvestments");
      setSelectedChartType(selectedCharts.selectedChartType || "investments");
      setAggregationThreshold(selectedCharts.aggregationThreshold || 0);
      setSelectedValueType(selectedCharts.selectedValueType || "median");
    }
  }, [showModal, selectedCharts]);

  useEffect(() => {
    if (!showModal && wasCancelled.current) {
      setLineChartCount(0);
      setShadedLineChartCount(0);
      setStackedBarChartCount(0);
      setSelectedQuantity("totalInvestments");
      setSelectedChartType("investments");
      setAggregationThreshold(0);
      setSelectedValueType("median");
      setSelectedCharts({});
      wasCancelled.current = false;
    }
  }, [showModal]);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    if (name === "lineChart") {
      setLineChartCount(checked ? 1 : 0);
    } else if (name === "shadedLineChart") {
      setShadedLineChartCount(checked ? 1 : 0);
    } else if (name === "stackedBarChart") {
      setStackedBarChartCount(checked ? 1 : 0);
    }
  };

  const handleNumberChange = (e, chartType) => {
    const parsed = Math.max(0, parseInt(e.target.value, 10) || 0);
    if (chartType === "lineChart") setLineChartCount(parsed);
    else if (chartType === "shadedLineChart") setShadedLineChartCount(parsed);
    else if (chartType === "stackedBarChart") setStackedBarChartCount(parsed);
  };

  const handleQuantitySelect = (e) => setSelectedQuantity(e.target.value);
  const handleChartTypeSelect = (e) => setSelectedChartType(e.target.value);
  const handleValueTypeSelect = (e) => setSelectedValueType(e.target.value);
  const handleThresholdChange = (e) => setAggregationThreshold(Math.max(0, parseInt(e.target.value, 10) || 0));

  const handleApply = () => {
    const newSelectedCharts = {};

    if (lineChartCount > 0) newSelectedCharts.lineChart = lineChartCount;

    if (shadedLineChartCount > 0) {
      newSelectedCharts.shadedLineChart = shadedLineChartCount;
      newSelectedCharts.selectedQuantity = selectedQuantity;
    }

    if (stackedBarChartCount > 0) {
      newSelectedCharts.stackedBarChart = stackedBarChartCount;
      newSelectedCharts.selectedChartType = selectedChartType;
      newSelectedCharts.selectedValueType = selectedValueType;
      newSelectedCharts.aggregationThreshold = aggregationThreshold;
    }

    setSelectedCharts(newSelectedCharts);
    wasCancelled.current = false;
    setShowModal(false);
  };

  const handleCancel = () => {
    wasCancelled.current = true;
    setShowModal(false);
  };

  return (
    <div className={`fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center ${showModal ? "block" : "hidden"}`}>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h3 className="text-2xl font-semibold mb-4">Select Charts</h3>

        {/* Line Chart */}
        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="lineChart"
              onChange={handleCheckboxChange}
              checked={lineChartCount > 0}
            />
            <span className="text-sm text-gray-800">Line Chart (Probability of Success Over Time)</span>
          </label>
          {lineChartCount > 0 && (
            <div className="mt-2">
              <label className="text-sm text-gray-600">Number of Line Charts</label>
              <input
                type="number"
                min="0"
                value={lineChartCount === 0 ? "" : lineChartCount}
                onChange={(e) => handleNumberChange(e, "lineChart")}
                className="w-16 ml-2 p-1 border border-gray-300 rounded-md text-sm"
              />
            </div>
          )}
        </div>

        {/* Shaded Line Chart */}
        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="shadedLineChart"
              onChange={handleCheckboxChange}
              checked={shadedLineChartCount > 0}
            />
            <span className="text-sm text-gray-800">Shaded Line Chart (Probability Ranges Over Time)</span>
          </label>
          {shadedLineChartCount > 0 && (
            <>
              <div className="mt-2">
                <label className="text-sm text-gray-600">Number of Shaded Line Charts</label>
                <input
                  type="number"
                  min="0"
                  value={shadedLineChartCount === 0 ? "" : shadedLineChartCount}
                  onChange={(e) => handleNumberChange(e, "shadedLineChart")}
                  className="w-16 ml-2 p-1 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="mt-2">
                <label className="text-sm text-gray-600">Select Quantity</label>
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

        {/* Stacked Bar Chart */}
        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="stackedBarChart"
              onChange={handleCheckboxChange}
              checked={stackedBarChartCount > 0}
            />
            <span className="text-sm text-gray-800">Stacked Bar Chart (Median/Average Values Over Time)</span>
          </label>
          {stackedBarChartCount > 0 && (
            <>
              <div className="mt-2">
                <label className="text-sm text-gray-600">Number of Stacked Bar Charts</label>
                <input
                  type="number"
                  min="0"
                  value={stackedBarChartCount === 0 ? "" : stackedBarChartCount}
                  onChange={(e) => handleNumberChange(e, "stackedBarChart")}
                  className="w-16 ml-2 p-1 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="mt-2">
                <label className="text-sm text-gray-600">Select Data Type</label>
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
              <div className="mt-2">
                <label className="text-sm text-gray-600">Select Median or Average</label>
                <div className="flex items-center">
                  <label className="mr-4">
                    <input
                      type="radio"
                      value="median"
                      checked={selectedValueType === "median"}
                      onChange={handleValueTypeSelect}
                      className="mr-1"
                    />
                    Median
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="average"
                      checked={selectedValueType === "average"}
                      onChange={handleValueTypeSelect}
                      className="mr-1"
                    />
                    Average
                  </label>
                </div>
              </div>
              <div className="mt-2">
                <label className="text-sm text-gray-600">Aggregation Threshold</label>
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
            onClick={handleCancel}
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

import { useState, useEffect, useRef } from "react";

export default function ChartModal({ showModal, setShowModal, selectedCharts, setSelectedCharts }) {
  const wasCancelled = useRef(false);

  const [lineChartEnabled, setLineChartEnabled] = useState(false);
  const [shadedLineChartEnabled, setShadedLineChartEnabled] = useState(false);
  const [stackedBarChartEnabled, setStackedBarChartEnabled] = useState(false);

  const [selectedQuantities, setSelectedQuantities] = useState([]);
  const [selectedChartType, setSelectedChartType] = useState([]);
  const [aggregationThreshold, setAggregationThreshold] = useState(0);
  const [selectedValueType, setSelectedValueType] = useState("median");

  const quantityOptions = [
    { value: "totalInvestments", label: "Total Investments" },
    { value: "totalIncome", label: "Total Income" },
    { value: "totalExpenses", label: "Total Expenses" },
    { value: "earlyWithdrawalTax", label: "Early Withdrawal Tax" },
    { value: "discretionaryExpenses", label: "Discretionary Expenses" },
  ];

  const chartTypeOptions = [
    { value: "investments", label: "Investments" },
    { value: "expenses", label: "Expenses" },
    { value: "income", label: "Income" },
  ];

  useEffect(() => {
    if (showModal) {
      setLineChartEnabled(!!selectedCharts.lineChart);
      setShadedLineChartEnabled(!!selectedCharts.shadedLineChart);
      setStackedBarChartEnabled(!!selectedCharts.stackedBarChart);
      setSelectedQuantities(selectedCharts.selectedQuantities || []);
      setSelectedChartType(selectedCharts.selectedChartType || []);
      setAggregationThreshold(selectedCharts.aggregationThreshold || 0);
      setSelectedValueType(selectedCharts.selectedValueType || "median");
    }
  }, [showModal]);

  useEffect(() => {
    if (!showModal && wasCancelled.current) {
      setLineChartEnabled(false);
      setShadedLineChartEnabled(false);
      setStackedBarChartEnabled(false);
      setSelectedQuantities([]);
      setSelectedChartType([]);
      setAggregationThreshold(0);
      setSelectedValueType("median");
      setSelectedCharts({});
      wasCancelled.current = false;
    }
  }, [showModal]);

  const toggleQuantity = (value) => {
    setSelectedQuantities((prev) =>
      prev.includes(value) ? prev.filter((q) => q !== value) : [...prev, value]
    );
  };

  const toggleChartType = (value) => {
    setSelectedChartType((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  };

  const handleApply = () => {
    const charts = {};

    if (lineChartEnabled) charts.lineChart = true;

    if (shadedLineChartEnabled && selectedQuantities.length > 0) {
      charts.shadedLineChart = true;
      charts.selectedQuantities = selectedQuantities;
    }

    if (stackedBarChartEnabled && selectedChartType.length > 0) {
      charts.stackedBarChart = true;
      charts.selectedChartType = selectedChartType;
      charts.selectedValueType = selectedValueType;
      charts.aggregationThreshold = aggregationThreshold;
    }

    setSelectedCharts(charts);
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
              checked={lineChartEnabled}
              onChange={(e) => setLineChartEnabled(e.target.checked)}
            />
            <span className="text-sm text-gray-800">Line Chart (Probability of Success Over Time)</span>
          </label>
        </div>

        {/* Shaded Line Chart */}
        <div className="mb-4">
          <label className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              checked={shadedLineChartEnabled}
              onChange={(e) => setShadedLineChartEnabled(e.target.checked)}
            />
            <span className="text-sm text-gray-800">Shaded Line Chart (Probability Ranges Over Time)</span>
          </label>

          {shadedLineChartEnabled && (
            <div className="pl-6 mt-2">
              <p className="text-sm text-gray-600 mb-2 font-medium">Select Quantities:</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {quantityOptions.map((q) => (
                  <label key={q.value} className="text-sm text-gray-700 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedQuantities.includes(q.value)}
                      onChange={() => toggleQuantity(q.value)}
                      className="mr-2"
                    />
                    {q.label}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stacked Bar Chart */}
        <div className="mb-4">
          <label className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              checked={stackedBarChartEnabled}
              onChange={(e) => setStackedBarChartEnabled(e.target.checked)}
            />
            <span className="text-sm text-gray-800">Stacked Bar Chart (Median/Average Values Over Time)</span>
          </label>

          {stackedBarChartEnabled && (
            <div className="ml-4 space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Select Data Types:</p>
                <div className="flex flex-col space-y-1 ml-2">
                  {chartTypeOptions.map((t) => (
                    <label key={t.value} className="text-sm text-gray-700 flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedChartType.includes(t.value)}
                        onChange={() => toggleChartType(t.value)}
                        className="mr-2"
                      />
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Select Median or Average</label>
                <div className="flex items-center mt-1">
                  <label className="mr-4">
                    <input
                      type="radio"
                      value="median"
                      checked={selectedValueType === "median"}
                      onChange={(e) => setSelectedValueType(e.target.value)}
                      className="mr-1"
                    />
                    Median
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="average"
                      checked={selectedValueType === "average"}
                      onChange={(e) => setSelectedValueType(e.target.value)}
                      className="mr-1"
                    />
                    Average
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Aggregation Threshold</label>
                <input
                  type="number"
                  min="0"
                  value={aggregationThreshold}
                  onChange={(e) => setAggregationThreshold(Math.max(0, parseInt(e.target.value) || 0))}
                  className="ml-2 p-1 border border-gray-300 rounded-md text-sm"
                  placeholder="0"
                />
              </div>
            </div>
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

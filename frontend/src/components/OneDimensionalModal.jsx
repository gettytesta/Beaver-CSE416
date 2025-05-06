"use client";
import { useState, useEffect, useRef } from "react";

export default function OneDimensionalModal({
  showModal,
  setShowModal,
  selectedCharts,
  setSelectedCharts
}) {
  const wasCancelled = useRef(false);

  const [multiLineEnabled, setMultiLineEnabled] = useState(false);
  const [finalVsParamEnabled, setFinalVsParamEnabled] = useState(false);

  const [multiLineQuantities, setMultiLineQuantities] = useState([]);
  const [finalValueQuantities, setFinalValueQuantities] = useState([]);

  const quantityOptionsMultiLine = [
    { value: "probabilityOfSuccess", label: "Probability of Success" },
    { value: "medianTotalInvestments", label: "Median Total Investments" },
  ];

  const quantityOptionsFinalValue = [
    { value: "finalProbabilityOfSuccess", label: "Final Value of Probability of Success" },
    { value: "finalMedianTotalInvestments", label: "Final Value of Median Total Investments" },
  ];

  useEffect(() => {
    if (showModal) {
      setMultiLineEnabled(!!selectedCharts.multiLine);
      setFinalVsParamEnabled(!!selectedCharts.finalVsParam);
      setMultiLineQuantities(selectedCharts.multiLineQuantities || []);
      setFinalValueQuantities(selectedCharts.finalValueQuantities || []);
    }
  }, [showModal]);

  useEffect(() => {
    if (!showModal && wasCancelled.current) {
      setMultiLineEnabled(false);
      setFinalVsParamEnabled(false);
      setMultiLineQuantities([]);
      setFinalValueQuantities([]);
      wasCancelled.current = false; //don't clear selectedCharts!
    }
  }, [showModal]);

  const toggleQuantity = (value, target) => {
    if (target === "multiLine") {
      setMultiLineQuantities((prev) =>
        prev.includes(value) ? prev.filter((q) => q !== value) : [...prev, value]
      );
    } else {
      setFinalValueQuantities((prev) =>
        prev.includes(value) ? prev.filter((q) => q !== value) : [...prev, value]
      );
    }
  };

  const handleApply = () => {
    const charts = {};

    if (multiLineEnabled && multiLineQuantities.length > 0) {
      charts.multiLine = true;
      charts.multiLineQuantities = multiLineQuantities;
    }

    if (finalVsParamEnabled && finalValueQuantities.length > 0) {
      charts.finalVsParam = true;
      charts.finalValueQuantities = finalValueQuantities;
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
    <div className={`fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50 ${showModal ? "block" : "hidden"}`}>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h3 className="text-2xl font-semibold mb-4">One-Dimensional Chart Selection</h3>

        {/* Multi-Line Chart */}
        <div className="mb-4">
          <label className="flex items-center space-x-2 mb-1">
            <input
              type="checkbox"
              checked={multiLineEnabled}
              onChange={(e) => setMultiLineEnabled(e.target.checked)}
            />
            <span className="text-sm text-gray-800">Multi-Line Chart (Over Time)</span>
          </label>

          {multiLineEnabled && (
            <div className="pl-6 mt-2">
              <p className="text-sm text-gray-600 mb-2 font-medium">Select Quantities:</p>
              <div className="grid grid-cols-1 gap-y-1">
                {quantityOptionsMultiLine.map((q) => (
                  <label key={q.value} className="text-sm text-gray-700 flex items-center">
                    <input
                      type="checkbox"
                      checked={multiLineQuantities.includes(q.value)}
                      onChange={() => toggleQuantity(q.value, "multiLine")}
                      className="mr-2"
                    />
                    {q.label}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Final Value vs. Param */}
        <div className="mb-4">
          <label className="flex items-center space-x-2 mb-1">
            <input
              type="checkbox"
              checked={finalVsParamEnabled}
              onChange={(e) => setFinalVsParamEnabled(e.target.checked)}
            />
            <span className="text-sm text-gray-800">Final Value vs. Parameter Value</span>
          </label>

          {finalVsParamEnabled && (
            <div className="pl-6 mt-2">
              <p className="text-sm text-gray-600 mb-2 font-medium">Select Final Value Quantities:</p>
              <div className="grid grid-cols-1 gap-y-1">
                {quantityOptionsFinalValue.map((q) => (
                  <label key={q.value} className="text-sm text-gray-700 flex items-center">
                    <input
                      type="checkbox"
                      checked={finalValueQuantities.includes(q.value)}
                      onChange={() => toggleQuantity(q.value, "final")}
                      className="mr-2"
                    />
                    {q.label}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button onClick={handleCancel} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md text-sm">Cancel</button>
          <button onClick={handleApply} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Apply</button>
        </div>
      </div>
    </div>
  );
}

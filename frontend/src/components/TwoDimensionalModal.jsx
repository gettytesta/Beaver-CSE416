"use client";
import { useState, useEffect, useRef } from "react";

export default function TwoDimensionalModal({
  showModal,
  setShowModal,
  selectedCharts,
  setSelectedCharts
}) {
  const wasCancelled = useRef(false);

  const [surfaceEnabled, setSurfaceEnabled] = useState(false);
  const [contourEnabled, setContourEnabled] = useState(false);

  const [surfaceQuantities, setSurfaceQuantities] = useState([]);
  const [contourQuantities, setContourQuantities] = useState([]);

  const quantityOptionsSurface = [
    { value: "probabilityOfSuccess", label: "Probability of Success" },
    { value: "medianTotalInvestments", label: "Median Total Investments" },
  ];

  const quantityOptionsContour = [
    { value: "finalProbabilityOfSuccess", label: "Final Value of Probability of Success" },
    { value: "finalMedianTotalInvestments", label: "Final Value of Median Total Investments" },
  ];

  useEffect(() => {
    if (showModal) {
      setSurfaceEnabled(!!selectedCharts.surfacePlot);
      setContourEnabled(!!selectedCharts.contourPlot);
      setSurfaceQuantities(selectedCharts.surfaceQuantities || []);
      setContourQuantities(selectedCharts.contourQuantities || []);
    }
  }, [showModal]);

  useEffect(() => {
    if (!showModal && wasCancelled.current) {
      setSurfaceEnabled(false);
      setContourEnabled(false);
      setSurfaceQuantities([]);
      setContourQuantities([]);
      wasCancelled.current = false;
    }
  }, [showModal]);

  const toggleQuantity = (value, target) => {
    if (target === "surface") {
      setSurfaceQuantities((prev) =>
        prev.includes(value) ? prev.filter((q) => q !== value) : [...prev, value]
      );
    } else {
      setContourQuantities((prev) =>
        prev.includes(value) ? prev.filter((q) => q !== value) : [...prev, value]
      );
    }
  };

  const handleApply = () => {
    const charts = {};

    if (surfaceEnabled && surfaceQuantities.length > 0) {
      charts.surfacePlot = true;
      charts.surfaceQuantities = surfaceQuantities;
    }

    if (contourEnabled && contourQuantities.length > 0) {
      charts.contourPlot = true;
      charts.contourQuantities = contourQuantities;
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
        <h3 className="text-2xl font-semibold mb-4">Two-Dimensional Chart Selection</h3>

        {/* Surface Plot */}
        <div className="mb-4">
          <label className="flex items-center space-x-2 mb-1">
            <input
              type="checkbox"
              checked={surfaceEnabled}
              onChange={(e) => setSurfaceEnabled(e.target.checked)}
            />
            <span className="text-sm text-gray-800">Surface Plot (Over Time)</span>
          </label>

          {surfaceEnabled && (
            <div className="pl-6 mt-2">
              <p className="text-sm text-gray-600 mb-2 font-medium">Select Quantities:</p>
              <div className="grid grid-cols-1 gap-y-1">
                {quantityOptionsSurface.map((q) => (
                  <label key={q.value} className="text-sm text-gray-700 flex items-center">
                    <input
                      type="checkbox"
                      checked={surfaceQuantities.includes(q.value)}
                      onChange={() => toggleQuantity(q.value, "surface")}
                      className="mr-2"
                    />
                    {q.label}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contour Plot */}
        <div className="mb-4">
          <label className="flex items-center space-x-2 mb-1">
            <input
              type="checkbox"
              checked={contourEnabled}
              onChange={(e) => setContourEnabled(e.target.checked)}
            />
            <span className="text-sm text-gray-800">Contour Plot</span>
          </label>

          {contourEnabled && (
            <div className="pl-6 mt-2">
              <p className="text-sm text-gray-600 mb-2 font-medium">Select Final Value Quantities:</p>
              <div className="grid grid-cols-1 gap-y-1">
                {quantityOptionsContour.map((q) => (
                  <label key={q.value} className="text-sm text-gray-700 flex items-center">
                    <input
                      type="checkbox"
                      checked={contourQuantities.includes(q.value)}
                      onChange={() => toggleQuantity(q.value, "contour")}
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

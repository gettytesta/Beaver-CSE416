"use client";
import { useState, useEffect } from "react";

export default function ParamOneModal({ showModal, setShowModal, scenario, param, setParam }) {
  const [selectedSubOption, setSelectedSubOption] = useState("");
  const [rangeValues, setRangeValues] = useState({ lower: "", upper: "", step: "" });
  const [rothStart, setRothStart] = useState("");
  const [rothEnd, setRothEnd] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedField, setSelectedField] = useState("start");

  useEffect(() => {
    if (showModal) {
      setSelectedSubOption(param?.subParameter || "");
      setRangeValues(param?.range || { lower: "", upper: "", step: "" });
      setRothStart(param?.rothStart || "");
      setRothEnd(param?.rothEnd || "");
      setSelectedEventId(param?.eventId || "");
      setSelectedField(param?.field || "start");
    }
  }, [showModal]);

  const handleApply = () => {
    const updatedParam = {
      subParameter: selectedSubOption,
      eventId: selectedEventId,
      range: rangeValues,
      field: selectedField,
      rothStart,
      rothEnd
    };
    setParam(updatedParam);
    setShowModal(false);
  };

  const handleCancel = () => setShowModal(false);
  const handleSubOptionChange = (e) => {
    setSelectedSubOption(e.target.value);
    setSelectedEventId("");
    setSelectedField("start");
    setRangeValues({ lower: "", upper: "", step: "" });
    setRothStart("");
    setRothEnd("");
  };
  const handleRangeChange = (e) => {
    const { name, value } = e.target;
    setRangeValues((prev) => ({ ...prev, [name]: value }));
  };

  const showRCOOption = scenario?.rothConversionOpt === false;
  const incomeOrExpenseEvents = scenario?.eventSeriesSet?.filter(e => e.type === "income" || e.type === "expense") || [];
  const validInvestEvents = scenario?.eventSeriesSet?.filter(e => e.type === "invest" && e.invest?.allocations && Object.keys(e.invest.allocations).length === 2) || [];
  const selectedEvent = scenario?.eventSeriesSet?.find((e) => e._id === selectedEventId);
  const startType = selectedEvent?.start?.type;
  const durationType = selectedEvent?.duration?.type;

  const isStartOrDurationNumeric =
    selectedSubOption === "startYearDuration" &&
    selectedEvent &&
    ((selectedField === "start" && ["fixed", "uniform", "normal"].includes(startType)) ||
     (selectedField === "duration" && ["fixed", "uniform", "normal"].includes(durationType)));

  const currentValue = selectedSubOption === "incomeExpenseInitial"
    ? selectedEvent?.[selectedEvent.type]?.initialAmount ?? "Unavailable"
    : selectedField === "start"
      ? selectedEvent?.start?.value ?? selectedEvent?.start?.year ?? "Unavailable"
      : selectedEvent?.duration?.value ?? "Unavailable";

  return (
    <div className={`fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center ${showModal ? "block" : "hidden"}`}>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">Configure Parameter 1</h3>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-2">Choose sub-parameter</label>
          <select
            value={selectedSubOption}
            onChange={handleSubOptionChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select a sub-parameter</option>
            {showRCOOption && <option value="rothOptimizer">Roth Conversion Optimizer (RCO)</option>}
            {!showRCOOption && <option value="rothOptimizer" disabled>RCO (already enabled)</option>}
            <option value="startYearDuration">Start Year / Duration of Event</option>
            <option value="incomeExpenseInitial">Initial Amount of Income/Expense</option>
            <option value="investmentPercentage">Investment Percentage</option>
          </select>
        </div>

        {(selectedSubOption === "startYearDuration" || selectedSubOption === "incomeExpenseInitial") && (
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-2">Select Event</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select one</option>
              {incomeOrExpenseEvents.map((e) => (
                <option key={e._id} value={e._id}>{e.name} ({e.type})</option>
              ))}
            </select>
          </div>
        )}

        {selectedSubOption === "incomeExpenseInitial" && selectedEventId && (
          <p className="text-sm text-gray-600 mb-4">
            Initial Amount: <span className="font-medium">{currentValue}</span>
          </p>
        )}

        {selectedSubOption === "investmentPercentage" && (
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-2">Select Investment Event</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select one</option>
              {validInvestEvents.map((e) => (
                <option key={e._id} value={e._id}>{e.name}</option>
              ))}
            </select>
          </div>
        )}

        {selectedSubOption === "startYearDuration" && selectedEventId && (
          <>
            <label className="block text-sm text-gray-600 mb-2">Select Field</label>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
            >
              <option value="start">Start Year</option>
              <option value="duration">Duration</option>
            </select>
            <p className="text-sm text-gray-600 mb-4">Current: <span className="font-semibold">{currentValue}</span></p>
          </>
        )}

        {(selectedSubOption === "startYearDuration" && isStartOrDurationNumeric ||
          selectedSubOption === "incomeExpenseInitial" && typeof currentValue === "number" ||
          selectedSubOption === "investmentPercentage") && (
          ["lower", "upper", "step"].map((field) => (
            <div key={field} className="mb-4">
              <label className="block text-sm text-gray-600 mb-2 capitalize">{field} Bound</label>
              <input
                type="number"
                name={field}
                value={rangeValues[field]}
                onChange={handleRangeChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>
          ))
        )}

        {selectedSubOption === "rothOptimizer" && showRCOOption && (
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-2">Roth Start Year</label>
            <input
              type="number"
              value={rothStart}
              onChange={(e) => setRothStart(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
            <label className="block text-sm text-gray-600 mt-4 mb-2">Roth End Year</label>
            <input
              type="number"
              value={rothEnd}
              onChange={(e) => setRothEnd(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-4">
          <button onClick={handleCancel} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md text-sm">Cancel</button>
          <button onClick={handleApply} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Apply</button>
        </div>
      </div>
    </div>
  );
}

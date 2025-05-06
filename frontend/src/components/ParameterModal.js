import { useState, useEffect } from "react";

export default function ParameterModal({
  showModal,
  setShowModal,
  setSelectedParameter,
  currentParameter,
  scenario,
}) {
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedSubOption, setSelectedSubOption] = useState("");
  const [rangeValues, setRangeValues] = useState({ lower: "", upper: "", step: "" });
  const [rothStart, setRothStart] = useState("");
  const [rothEnd, setRothEnd] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedField, setSelectedField] = useState("start");

  const [selectedSubOption2, setSelectedSubOption2] = useState("");
  const [rangeValues2, setRangeValues2] = useState({ lower: "", upper: "", step: "" });
  const [selectedEventId2, setSelectedEventId2] = useState("");
  const [selectedField2, setSelectedField2] = useState("start");
  const [firstParamSaved, setFirstParamSaved] = useState(false);



  useEffect(() => {
    if (showModal) {
      setSelectedOption(currentParameter?.parameterType || "");
      setSelectedSubOption(currentParameter?.subParameter || "");
      setRangeValues(currentParameter?.range || { lower: "", upper: "", step: "" });
      setRothStart(currentParameter?.rothStart || "");
      setRothEnd(currentParameter?.rothEnd || "");
      setSelectedEventId(currentParameter?.eventId || "");
      setSelectedField(currentParameter?.field || "start");

      setSelectedSubOption2(currentParameter?.subParameter2 || "");
      setRangeValues2(currentParameter?.range2 || { lower: "", upper: "", step: "" });
      setSelectedEventId2(currentParameter?.eventId2 || "");
      setSelectedField2(currentParameter?.field2 || "start");
      setFirstParamSaved(false);

    }
  }, [showModal]);

  const handleApply = () => {
    const parameter = {
      parameterType: selectedOption,
      subParameter: selectedSubOption,
    };
  
    if (selectedSubOption === "rothOptimizer" && !scenario.rothConversionOpt) {
      parameter.rothStart = rothStart;
      parameter.rothEnd = rothEnd;
    }
  
    if (
      selectedSubOption === "startYearDuration" ||
      selectedSubOption === "incomeExpenseInitial" ||
      selectedSubOption === "investmentPercentage"
    ) {
      parameter.eventId = selectedEventId;
    }
  
    if (
      selectedSubOption === "investmentPercentage" ||
      (selectedSubOption === "startYearDuration" && isStartOrDurationNumeric) ||
      (selectedSubOption === "incomeExpenseInitial" && typeof currentValue === "number")
    ) {
      parameter.range = rangeValues;
    }
  
    if (selectedSubOption === "startYearDuration") {
      parameter.field = selectedField;
    }
  
    // twoDimensional logic
    if (selectedOption === "twoDimensional") {
      if (!firstParamSaved) {
        setFirstParamSaved(true);
        return;
      }
  
      parameter.subParameter2 = selectedSubOption2;
  
      if (
        selectedSubOption2 === "startYearDuration" ||
        selectedSubOption2 === "incomeExpenseInitial" ||
        selectedSubOption2 === "investmentPercentage"
      ) {
        parameter.eventId2 = selectedEventId2;
      }
  
      if (
        selectedSubOption2 === "investmentPercentage" ||
        (selectedSubOption2 === "startYearDuration" && isStartOrDurationNumeric2) ||
        (selectedSubOption2 === "incomeExpenseInitial" && typeof currentValue2 === "number")
      ) {
        parameter.range2 = rangeValues2;
      }
  
      if (selectedSubOption2 === "startYearDuration") {
        parameter.field2 = selectedField2;
      }
    }
  
    setSelectedParameter(parameter);
    setShowModal(false);
  };

  const handleCancel = () => setShowModal(false);
  const handleOptionChange = (e) => {
    const value = e.target.value;
    setSelectedOption(value);
  
    // Reset all fields regardless of option
    setSelectedSubOption("");
    setSelectedEventId("");
    setSelectedField("start");
    setRangeValues({ lower: "", upper: "", step: "" });
    setRothStart("");
    setRothEnd("");
  
    // Also reset 2D-specific fields
    setSelectedSubOption2("");
    setSelectedEventId2("");
    setSelectedField2("start");
    setRangeValues2({ lower: "", upper: "", step: "" });
    setFirstParamSaved(false);
  
    if (value === "noParameters") {
      setSelectedParameter(null); // Clear any existing parameter
    }
  };
  const handleSubOptionChange = (e) => {
    const newSubOption = e.target.value;
    setSelectedSubOption(newSubOption);
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

  const getReadableParameterName = (value) => {
    switch (value) {
      case "noParameters": return "No Parameters";
      case "oneDimensional": return "One-Dimensional Scenario Exploration";
      case "twoDimensional": return "Two-Dimensional Scenario Exploration";
      default: return null;
    }
  };

  const showRCOOption = scenario && scenario.rothConversionOpt === false;
  const incomeOrExpenseEvents = scenario?.eventSeriesSet?.filter(
    (e) => e.type === "income" || e.type === "expense"
  ) || [];

  const validInvestEvents = scenario?.eventSeriesSet?.filter(
    (e) => e.type === "invest" && e.invest?.allocations && Object.keys(e.invest.allocations).length === 2
  ) || [];

  const selectedEvent = scenario?.eventSeriesSet?.find((e) => e._id === selectedEventId);
  const startType = selectedEvent?.start?.type;
  const durationType = selectedEvent?.duration?.type;

  const isStartOrDurationNumeric =
    selectedSubOption === "startYearDuration" &&
    selectedEvent &&
    (
      (selectedField === "start" && ["fixed", "uniform", "normal"].includes(startType)) ||
      (selectedField === "duration" && ["fixed", "uniform", "normal"].includes(durationType))
    );

  const currentValue = selectedSubOption === "incomeExpenseInitial"
    ? selectedEvent?.[selectedEvent.type]?.initialAmount ?? "Unavailable"
    : selectedField === "start"
      ? selectedEvent?.start?.value ?? selectedEvent?.start?.year ?? "Unavailable"
      : selectedEvent?.duration?.value ?? "Unavailable";



  const selectedEvent2 = scenario?.eventSeriesSet?.find((e) => e._id === selectedEventId2);
  const startType2 = selectedEvent2?.start?.type;
  const durationType2 = selectedEvent2?.duration?.type;
  const isStartOrDurationNumeric2 =
    selectedSubOption2 === "startYearDuration" &&
    selectedEvent2 &&
    (
      (selectedField2 === "start" && ["fixed", "uniform", "normal"].includes(startType2)) ||
      (selectedField2 === "duration" && ["fixed", "uniform", "normal"].includes(durationType2))
    );
      
  const currentValue2 = selectedSubOption2 === "incomeExpenseInitial"
    ? selectedEvent2?.[selectedEvent2.type]?.initialAmount ?? "Unavailable"
    : selectedField2 === "start"
      ? selectedEvent2?.start?.value ?? selectedEvent2?.start?.year ?? "Unavailable"
      : selectedEvent2?.duration?.value ?? "Unavailable";









  return (
    <div className={`fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center ${showModal ? "block" : "hidden"}`}>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-2xl font-semibold mb-4">Select Parameter for Scenario Exploration</h3>

        <div className="mb-2">
          <label className="block text-sm text-gray-600 mb-2">Choose a parameter type</label>
          <select
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

        {selectedOption && (
          <p className="text-sm text-gray-500 mb-4">
            <span className="font-medium">{getReadableParameterName(selectedOption)}</span> is currently chosen
          </p>
        )}

        {selectedOption === "oneDimensional" && (
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-2">Choose a sub-parameter</label>
            <select
              value={selectedSubOption}
              onChange={handleSubOptionChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select a sub-parameter</option>
              {showRCOOption && <option value="rothOptimizer">Roth Conversion Optimizer (RCO)</option>}
              {!showRCOOption && <option value="rothOptimizer" disabled>Roth Conversion Optimizer (RCO) (RCO enabled)</option>}
              <option value="startYearDuration">Start Year / Duration of Event Series</option>
              <option value="incomeExpenseInitial">Initial Amount of Income/Expense Event</option>
              <option value="investmentPercentage">Percentage of First Investment in Asset Allocation</option>
            </select>
          </div>
        )}

       
    {/* -------------------- 2d goes here  -------------------- */}

        <div className="mt-6 flex justify-end space-x-4">
          <button onClick={handleCancel} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md text-sm">Cancel</button>
          <button onClick={handleApply} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Apply</button>
        </div>
      </div>
    </div>
  );
}

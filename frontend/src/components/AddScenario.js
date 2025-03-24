"use client";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

  const [investments, setInvestments] = useState([{ value: "", taxStatus: "", type: "" }]);
  const [investmentTypes, setInvestmentTypes] = useState([]);
  const [showInvestmentTypeModal, setShowInvestmentTypeModal] = useState(false);
  const [newInvestmentType, setNewInvestmentType] = useState({
    name: "",
    description: "",
    returnAmtOrPct: "percent",
    returnDistribution: { type: "fixed", value: "" },
    expenseRatio: "",
    incomeAmtOrPct: "percent",
    incomeDistribution: { type: "fixed", value: "" },
    taxability: true,
  });

  const [eventSeries, setEventSeries] = useState([]);

  
  const [editingEventIndex, setEditingEventIndex] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  const [tempEvent, setTempEvent] = useState(null);
  
  
  const [inflation, setInflation] = useState({
    type: "fixed",
    value: ""
  });


 //TEMP DUMMY DATA
  const [spendingStrategy, setSpendingStrategy] = useState([
    { id: "expense-a", name: "Discretionary Expense A" },
    { id: "expense-b", name: "Discretionary Expense B" },
  ]);
  
  const sensors = useSensors(useSensor(PointerSensor));
  const [rmdStrategy, setRmdStrategy] = useState([]);

  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = spendingStrategy.findIndex((i) => i.id === active.id);
      const newIndex = spendingStrategy.findIndex((i) => i.id === over?.id);
      setSpendingStrategy((items) => arrayMove(items, oldIndex, newIndex));
    }
  }


  function SortableItem({ id, name, index }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
  
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="flex items-center gap-3 bg-white border rounded px-4 py-2 shadow-sm cursor-move"
      >
        <span className="text-sm font-medium w-6">{index + 1}.</span>
        <div className="flex-1 text-gray-800">{name}</div>
        <div className="text-gray-400 text-xs select-none">⠿</div>
      </div>
    );
  }



  //TEMP DUMMY DATA ONCE AGAIN 
  const [withdrawalStrategy, setWithdrawalStrategy] = useState([]);
  const dummyInvestmentNames = ["Investment X", "Investment Y", "Investment Z"];



  //TEMP DUMMY DATA ONCE AGAIN
  const [enableRothConversion, setEnableRothConversion] = useState(false);
  const [rothStartYear, setRothStartYear] = useState("");
  const [rothEndYear, setRothEndYear] = useState("");
  const [rothConversionStrategy, setRothConversionStrategy] = useState([
    "Traditional 401k",
    "IRA",
    "Pre-Tax Mutual Fund"
  ]);


  



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

  const investmentStatusOptions = ["Taxable", "Tax-Deferred", "Tax-Exempt"];

  const unavailableStates = ["Wyoming", "Alaska"];
  const stateRequiresUpload = unavailableStates.includes(state);

  const handleYamlUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected YAML file:", file.name);
    }
  };

  const handleInvestmentChange = (index, field, value) => {
    const updated = [...investments];
    updated[index][field] = value;
    setInvestments(updated);
  };

  const addInvestment = () => {
    setInvestments([...investments, { value: "", taxStatus: "", type: "" }]);
  };

  const removeInvestment = () => {
    if (investments.length > 1) {
      setInvestments(investments.slice(0, -1));
    }
  };

  const addInvestmentType = () => {
    setInvestmentTypes([...investmentTypes, newInvestmentType]);
    setNewInvestmentType({
      name: "",
      description: "",
      returnAmtOrPct: "percent",
      returnDistribution: { type: "fixed", value: "" },
      expenseRatio: "",
      incomeAmtOrPct: "percent",
      incomeDistribution: { type: "fixed", value: "" },
      taxability: true,
    });
    setShowInvestmentTypeModal(false);
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

  const handleEventSeriesChange = (index, field, value) => {
    const updated = [...eventSeries];
    if (field === "startType") {
      updated[index].start.type = value;
    } else if (field === "startValue") {
      updated[index].start.value = value;
    } else if (field === "durationType") {
      updated[index].duration.type = value;
    } else if (field === "durationValue") {
      updated[index].duration.value = value;
    } else {
      updated[index][field] = value;
    }
    setEventSeries(updated);
  };
  
  const addEventSeries = () => {
    setEventSeries([
      ...eventSeries,
      {
        name: "",
        description: "",
        start: { type: "fixed", value: "" },
        duration: { type: "fixed", value: "" },
        type: "", //FIX THIS LATER EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE REMEMBER THIS
        invest: {
          allocationType: "fixed",
          selected: [],
          allocations: {},
        },
        rebalance: {
          allocationType: "fixed",
          selected: [],
          allocations: {},
        },
      },
    ]);
  };

  const removeEventSeries = (indexToRemove) => {
    const updated = eventSeries.filter((_, index) => index !== indexToRemove);
    setEventSeries(updated);
  };

  const openEventModal = (index) => {
    const original = eventSeries[index];
  
    const investDefaults = original.type === "invest"
      ? {
          allocationType: original.invest?.allocationType || "fixed",
          selected: original.invest?.selected || [],
          allocations: original.invest?.allocations || {},
        }
      : undefined;
  
    const rebalanceDefaults = original.type === "rebalance"
      ? {
          allocationType: original.rebalance?.allocationType || "fixed",
          selected: original.rebalance?.selected || [],
          allocations: original.rebalance?.allocations || {},
        }
      : undefined;
  
    setEditingEventIndex(index);
    setTempEvent({
      ...original,
      ...(original.type === "invest" && { invest: investDefaults }),
      ...(original.type === "rebalance" && { rebalance: rebalanceDefaults }),
    });
    setShowEventModal(true);
  };  

  const renderEventModal = () => {
    if (editingEventIndex === null || !tempEvent) return null;
  
    const isMarried = filingStatus === "married";
    const eventType = tempEvent.type;
  
    const handleIncomeChange = (field, value) => {
      setTempEvent({
        ...tempEvent,
        income: { ...tempEvent.income, [field]: value },
      });
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-4">
          <h2 className="text-lg font-semibold">Edit Event Series</h2>
  
          <input
            type="text"
            placeholder="Event Series Name"
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
            value={tempEvent.name}
            onChange={(e) => setTempEvent({ ...tempEvent, name: e.target.value })}
          />
  
          <input
            type="text"
            placeholder="Short description (Optional)..."
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
            value={tempEvent.description}
            onChange={(e) => setTempEvent({ ...tempEvent, description: e.target.value })}
          />
  
          {/* START YEAR */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Year Expression</label>
            <select
              value={tempEvent.start.type}
              onChange={(e) => setTempEvent({ ...tempEvent, start: { type: e.target.value } })}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="fixed">Fixed Year</option>
              <option value="uniform">Uniform Distribution</option>
              <option value="normal">Normal Distribution</option>
              <option value="startWith">Start With Another Series</option>
              <option value="startAfter">Year After Another Series Ends</option>
            </select>
  
            {tempEvent.start.type === "fixed" && (
              <input
                type="number"
                placeholder="e.g. 2025"
                className="w-full mt-2 border px-3 py-2 rounded"
                value={tempEvent.start.value || ""}
                onChange={(e) =>
                  setTempEvent({ ...tempEvent, start: { ...tempEvent.start, value: e.target.value } })
                }
              />
            )}
  
            {tempEvent.start.type === "uniform" && (
              <div className="flex gap-2 mt-2">
                <input
                  type="number"
                  placeholder="Lower"
                  className="w-1/2 border px-3 py-2 rounded"
                  value={tempEvent.start.lower || ""}
                  onChange={(e) =>
                    setTempEvent({ ...tempEvent, start: { ...tempEvent.start, lower: e.target.value } })
                  }
                />
                <input
                  type="number"
                  placeholder="Upper"
                  className="w-1/2 border px-3 py-2 rounded"
                  value={tempEvent.start.upper || ""}
                  onChange={(e) =>
                    setTempEvent({ ...tempEvent, start: { ...tempEvent.start, upper: e.target.value } })
                  }
                />
              </div>
            )}
  
            {tempEvent.start.type === "normal" && (
              <div className="flex gap-2 mt-2">
                <input
                  type="number"
                  placeholder="Mean"
                  className="w-1/2 border px-3 py-2 rounded"
                  value={tempEvent.start.mean || ""}
                  onChange={(e) =>
                    setTempEvent({ ...tempEvent, start: { ...tempEvent.start, mean: e.target.value } })
                  }
                />
                <input
                  type="number"
                  placeholder="Stdev"
                  className="w-1/2 border px-3 py-2 rounded"
                  value={tempEvent.start.stdev || ""}
                  onChange={(e) =>
                    setTempEvent({ ...tempEvent, start: { ...tempEvent.start, stdev: e.target.value } })
                  }
                />
              </div>
            )}
  
            {(tempEvent.start.type === "startWith" || tempEvent.start.type === "startAfter") && (
              <input
                type="text"
                placeholder="Event Series Name"
                className="w-full mt-2 border px-3 py-2 rounded"
                value={tempEvent.start.value || ""}
                onChange={(e) =>
                  setTempEvent({ ...tempEvent, start: { ...tempEvent.start, value: e.target.value } })
                }
              />
            )}
          </div>
  
          {/* DURATION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration Expression</label>
            <select
              value={tempEvent.duration.type}
              onChange={(e) => setTempEvent({ ...tempEvent, duration: { type: e.target.value } })}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="fixed">Fixed Duration</option>
              <option value="uniform">Uniform Distribution</option>
              <option value="normal">Normal Distribution</option>
            </select>
  
            {tempEvent.duration.type === "fixed" && (
              <input
                type="number"
                placeholder="Duration (e.g. 40)"
                className="w-full mt-2 border px-3 py-2 rounded"
                value={tempEvent.duration.value || ""}
                onChange={(e) =>
                  setTempEvent({ ...tempEvent, duration: { ...tempEvent.duration, value: e.target.value } })
                }
              />
            )}
  
            {tempEvent.duration.type === "uniform" && (
              <div className="flex gap-2 mt-2">
                <input
                  type="number"
                  placeholder="Lower"
                  className="w-1/2 border px-3 py-2 rounded"
                  value={tempEvent.duration.lower || ""}
                  onChange={(e) =>
                    setTempEvent({ ...tempEvent, duration: { ...tempEvent.duration, lower: e.target.value } })
                  }
                />
                <input
                  type="number"
                  placeholder="Upper"
                  className="w-1/2 border px-3 py-2 rounded"
                  value={tempEvent.duration.upper || ""}
                  onChange={(e) =>
                    setTempEvent({ ...tempEvent, duration: { ...tempEvent.duration, upper: e.target.value } })
                  }
                />
              </div>
            )}
  
            {tempEvent.duration.type === "normal" && (
              <div className="flex gap-2 mt-2">
                <input
                  type="number"
                  placeholder="Mean"
                  className="w-1/2 border px-3 py-2 rounded"
                  value={tempEvent.duration.mean || ""}
                  onChange={(e) =>
                    setTempEvent({ ...tempEvent, duration: { ...tempEvent.duration, mean: e.target.value } })
                  }
                />
                <input
                  type="number"
                  placeholder="Stdev"
                  className="w-1/2 border px-3 py-2 rounded"
                  value={tempEvent.duration.stdev || ""}
                  onChange={(e) =>
                    setTempEvent({ ...tempEvent, duration: { ...tempEvent.duration, stdev: e.target.value } })
                  }
                />
              </div>
            )}
          </div>
  
          {/* EVENT TYPE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
            <select
              value={tempEvent.type || ""}
              onChange={(e) => setTempEvent({ ...tempEvent, type: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Select Type</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="invest">Invest</option>
              <option value="rebalance">Rebalance</option>
            </select>
          </div>
  
          {/* INCOME LOGIC */}
          {eventType === "income" && (
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium">Initial Amount ($)</label>
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  value={tempEvent.income?.initialAmount || ""}
                  onChange={(e) => handleIncomeChange("initialAmount", e.target.value)}
                />
              </div>
  
              <div>
                <label className="block text-sm font-medium">Change Type</label>
                <select
                  value={tempEvent.income?.changeAmtOrPct || "amount"}
                  onChange={(e) => handleIncomeChange("changeAmtOrPct", e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="amount">Amount</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>
  
              <div>
                <label className="block text-sm font-medium">Change Distribution</label>
                <select
                  value={tempEvent.income?.changeDistribution?.type || "fixed"}
                  onChange={(e) =>
                    handleIncomeChange("changeDistribution", { type: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="fixed">Fixed</option>
                  <option value="normal">Normal</option>
                  <option value="uniform">Uniform</option>
                </select>
              </div>
  
              {tempEvent.income?.changeDistribution?.type === "fixed" && (
                <input
                  type="number"
                  placeholder="Value"
                  className="w-full border px-3 py-2 rounded"
                  value={tempEvent.income.changeDistribution?.value || ""}
                  onChange={(e) =>
                    handleIncomeChange("changeDistribution", {
                      ...tempEvent.income.changeDistribution,
                      value: e.target.value,
                    })
                  }
                />
              )}
  
              {tempEvent.income?.changeDistribution?.type === "normal" && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Mean"
                    className="w-1/2 border px-3 py-2 rounded"
                    value={tempEvent.income.changeDistribution?.mean || ""}
                    onChange={(e) =>
                      handleIncomeChange("changeDistribution", {
                        ...tempEvent.income.changeDistribution,
                        mean: e.target.value,
                      })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Stdev"
                    className="w-1/2 border px-3 py-2 rounded"
                    value={tempEvent.income.changeDistribution?.stdev || ""}
                    onChange={(e) =>
                      handleIncomeChange("changeDistribution", {
                        ...tempEvent.income.changeDistribution,
                        stdev: e.target.value,
                      })
                    }
                  />
                </div>
              )}
  
              {tempEvent.income?.changeDistribution?.type === "uniform" && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Lower"
                    className="w-1/2 border px-3 py-2 rounded"
                    value={tempEvent.income.changeDistribution?.lower || ""}
                    onChange={(e) =>
                      handleIncomeChange("changeDistribution", {
                        ...tempEvent.income.changeDistribution,
                        lower: e.target.value,
                      })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Upper"
                    className="w-1/2 border px-3 py-2 rounded"
                    value={tempEvent.income.changeDistribution?.upper || ""}
                    onChange={(e) =>
                      handleIncomeChange("changeDistribution", {
                        ...tempEvent.income.changeDistribution,
                        upper: e.target.value,
                      })
                    }
                  />
                </div>
              )}


              {isMarried && (
                <div className="mt-2">
                  <label className="block text-sm font-medium">User % (for married scenarios)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    className="w-full border px-3 py-2 rounded"
                    value={tempEvent.income?.userPct || ""}
                    onChange={(e) => handleIncomeChange("userPct", e.target.value)}
                  />
                </div>
              )}


              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={tempEvent.income?.adjustForInflation || false}
                  onChange={(e) =>
                    handleIncomeChange("adjustForInflation", e.target.checked)
                  }
                />
                <label>Adjust for Inflation</label>
              </div>

  
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={tempEvent.income?.isSocialSecurity || false}
                  onChange={(e) => handleIncomeChange("isSocialSecurity", e.target.checked)}
                />
                <label>Social Security Income</label>
              </div>
            </div>
          )}

          {/* EXPENSE LOGIC */}
          {eventType === "expense" && (
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium">Initial Amount ($)</label>
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  value={tempEvent.expense?.initialAmount || ""}
                  onChange={(e) =>
                    setTempEvent({
                      ...tempEvent,
                      expense: {
                        ...tempEvent.expense,
                        initialAmount: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Change Type</label>
                <select
                  value={tempEvent.expense?.changeAmtOrPct || "amount"}
                  onChange={(e) =>
                    setTempEvent({
                      ...tempEvent,
                      expense: {
                        ...tempEvent.expense,
                        changeAmtOrPct: e.target.value,
                      },
                    })
                  }
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="amount">Amount</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Change Distribution</label>
                <select
                  value={tempEvent.expense?.changeDistribution?.type || "fixed"}
                  onChange={(e) =>
                    setTempEvent({
                      ...tempEvent,
                      expense: {
                        ...tempEvent.expense,
                        changeDistribution: { type: e.target.value },
                      },
                    })
                  }
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="fixed">Fixed</option>
                  <option value="normal">Normal</option>
                  <option value="uniform">Uniform</option>
                </select>
              </div>

              {/* Fixed Value Input */}
              {tempEvent.expense?.changeDistribution?.type === "fixed" && (
                <input
                  type="number"
                  placeholder="Value"
                  className="w-full border px-3 py-2 rounded"
                  value={tempEvent.expense.changeDistribution?.value || ""}
                  onChange={(e) =>
                    setTempEvent({
                      ...tempEvent,
                      expense: {
                        ...tempEvent.expense,
                        changeDistribution: {
                          ...tempEvent.expense.changeDistribution,
                          value: e.target.value,
                        },
                      },
                    })
                  }
                />
              )}

              {/* Normal Dist Inputs */}
              {tempEvent.expense?.changeDistribution?.type === "normal" && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Mean"
                    className="w-1/2 border px-3 py-2 rounded"
                    value={tempEvent.expense.changeDistribution?.mean || ""}
                    onChange={(e) =>
                      setTempEvent({
                        ...tempEvent,
                        expense: {
                          ...tempEvent.expense,
                          changeDistribution: {
                            ...tempEvent.expense.changeDistribution,
                            mean: e.target.value,
                          },
                        },
                      })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Stdev"
                    className="w-1/2 border px-3 py-2 rounded"
                    value={tempEvent.expense.changeDistribution?.stdev || ""}
                    onChange={(e) =>
                      setTempEvent({
                        ...tempEvent,
                        expense: {
                          ...tempEvent.expense,
                          changeDistribution: {
                            ...tempEvent.expense.changeDistribution,
                            stdev: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
              )}

              {/* Uniform Dist Inputs */}
              {tempEvent.expense?.changeDistribution?.type === "uniform" && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Lower"
                    className="w-1/2 border px-3 py-2 rounded"
                    value={tempEvent.expense.changeDistribution?.lower || ""}
                    onChange={(e) =>
                      setTempEvent({
                        ...tempEvent,
                        expense: {
                          ...tempEvent.expense,
                          changeDistribution: {
                            ...tempEvent.expense.changeDistribution,
                            lower: e.target.value,
                          },
                        },
                      })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Upper"
                    className="w-1/2 border px-3 py-2 rounded"
                    value={tempEvent.expense.changeDistribution?.upper || ""}
                    onChange={(e) =>
                      setTempEvent({
                        ...tempEvent,
                        expense: {
                          ...tempEvent.expense,
                          changeDistribution: {
                            ...tempEvent.expense.changeDistribution,
                            upper: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
              )}


              {isMarried && (
            <div className="mt-2">
              <label className="block text-sm font-medium">User % (for married scenarios)</label>
              <input
                type="number"
                placeholder="e.g. 50"
                className="w-full border px-3 py-2 rounded"
                value={tempEvent.expense?.userPct || ""}
                onChange={(e) =>
                  setTempEvent({
                    ...tempEvent,
                    expense: {
                      ...tempEvent.expense,
                      userPct: e.target.value,
                    },
                  })
                }
              />
            </div>
          )}



              {/* Adjust for Inflation */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={tempEvent.expense?.adjustForInflation || false}
                  onChange={(e) =>
                    setTempEvent({
                      ...tempEvent,
                      expense: {
                        ...tempEvent.expense,
                        adjustForInflation: e.target.checked,
                      },
                    })
                  }
                />
                <label>Adjust for Inflation</label>
              </div>

              {/* Discretionary */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={tempEvent.expense?.isDiscretionary || false}
                  onChange={(e) =>
                    setTempEvent({
                      ...tempEvent,
                      expense: {
                        ...tempEvent.expense,
                        isDiscretionary: e.target.checked,
                      },
                    })
                  }
                />
                <label>Discretionary Expense</label>
              </div>
            </div>
          )}



      {/* INVEST LOGIC */}
      {eventType === "invest" && (
        <div className="space-y-4 mt-4">
          {/* Allocation Type */}
          <div>
            <label className="block text-sm font-medium">Allocation Type</label>
            <select
              value={tempEvent.invest?.allocationType || "fixed"}
              onChange={(e) =>
                setTempEvent({
                  ...tempEvent,
                  invest: {
                    ...tempEvent.invest,
                    allocationType: e.target.value,
                    selected: [],
                    allocations: {},
                  },
                })
              }
              className="w-full border px-3 py-2 rounded"
            >
              <option value="fixed">Fixed Allocation</option>
              <option value="glide">Linear Glide Path</option>
            </select>
          </div>

          {/* Investment Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Select Investments (non-pre-tax only)</label>
            <div className="space-y-1">
              {investments
                .filter((inv) => inv.taxStatus !== "tax-deferred")
                .map((inv, index) => {
                  const isChecked = tempEvent.invest?.selected?.includes(index) || false;
                  return (
                    <label key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={isChecked}
                        onChange={(e) => {
                          const selected = new Set(tempEvent.invest?.selected || []);
                          if (e.target.checked) {
                            selected.add(index);
                          } else {
                            selected.delete(index);
                          }
                          setTempEvent({
                            ...tempEvent,
                            invest: {
                              ...tempEvent.invest,
                              selected: Array.from(selected),
                            },
                          });
                        }}
                      />
                      {`Investment ${index + 1} (${inv.type || "Unnamed"})`}
                    </label>
                  );
                })}
            </div>
          </div>

          {/* Allocation Inputs */}
          {tempEvent.invest?.selected?.length > 0 && (
        <div className="space-y-3">
          {tempEvent.invest.selected.map((invIndex) => (
            <div key={invIndex}>
              <label className="block text-sm font-medium mb-1">{`Investment ${invIndex + 1} Allocation (%)`}</label>

              {(tempEvent.invest.allocationType || "fixed") === "fixed" ? (
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  placeholder="e.g. 50"
                  value={tempEvent.invest?.allocations?.[invIndex]?.value || ""}
                  onChange={(e) => {
                    const updatedAlloc = {
                      ...tempEvent.invest.allocations,
                      [invIndex]: {
                        value: e.target.value,
                      },
                    };
                    setTempEvent({
                      ...tempEvent,
                      invest: {
                        ...tempEvent.invest,
                        allocations: updatedAlloc,
                      },
                    });
                  }}
                />
              ) : (
                // Glide path: show both initial and final
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="w-1/2 border px-3 py-2 rounded"
                    placeholder="Initial %"
                    value={tempEvent.invest?.allocations?.[invIndex]?.initial || ""}
                    onChange={(e) => {
                      const updatedAlloc = {
                        ...tempEvent.invest.allocations,
                        [invIndex]: {
                          ...tempEvent.invest.allocations?.[invIndex],
                          initial: e.target.value,
                        },
                      };
                      setTempEvent({
                        ...tempEvent,
                        invest: {
                          ...tempEvent.invest,
                          allocations: updatedAlloc,
                        },
                      });
                    }}
                  />
                  <input
                    type="number"
                    className="w-1/2 border px-3 py-2 rounded"
                    placeholder="Final %"
                    value={tempEvent.invest?.allocations?.[invIndex]?.final || ""}
                    onChange={(e) => {
                      const updatedAlloc = {
                        ...tempEvent.invest.allocations,
                        [invIndex]: {
                          ...tempEvent.invest.allocations?.[invIndex],
                          final: e.target.value,
                        },
                      };
                      setTempEvent({
                        ...tempEvent,
                        invest: {
                          ...tempEvent.invest,
                          allocations: updatedAlloc,
                        },
                      });
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
        </div>
      )}


      {/* REBALANCE LOGIC  All selected investments must have the same tax status do this later*/}
      {eventType === "rebalance" && (
        <div className="space-y-4 mt-4">
          {/* Allocation Type */}
          <div>
            <label className="block text-sm font-medium">Allocation Type</label>
            <select
              value={tempEvent.rebalance?.allocationType || "fixed"}
              onChange={(e) =>
                setTempEvent({
                  ...tempEvent,
                  rebalance: {
                    ...tempEvent.rebalance,
                    allocationType: e.target.value,
                    selected: [],
                    allocations: {},
                  },
                })
              }
              className="w-full border px-3 py-2 rounded"
            >
              <option value="fixed">Fixed Allocation</option>
              <option value="glide">Linear Glide Path</option>
            </select>
        </div>

      {/* Select Investments */}
      <div>
        <label className="block text-sm font-medium mb-1">Select Investments (same tax status only)</label>
        <div className="space-y-1">
          {investments.map((inv, index) => {
            const isChecked = tempEvent.rebalance?.selected?.includes(index) || false;
            return (
              <label key={index} className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={isChecked}
                  onChange={(e) => {
                    const selected = new Set(tempEvent.rebalance?.selected || []);
                    if (e.target.checked) {
                      selected.add(index);
                    } else {
                      selected.delete(index);
                    }
                    setTempEvent({
                      ...tempEvent,
                      rebalance: {
                        ...tempEvent.rebalance,
                        selected: Array.from(selected),
                      },
                    });
                  }}
                />
                {`Investment ${index + 1} (${inv.type || "Unnamed"} – ${inv.taxStatus || "Unknown"})`}
              </label>
            );
          })}
        </div>
      </div>

      {/* Allocation Inputs */}
      {tempEvent.rebalance?.selected?.length > 0 && (
        <div className="space-y-3">
          {tempEvent.rebalance.selected.map((invIndex) => (
            <div key={invIndex}>
              <label className="block text-sm font-medium mb-1">{`Investment ${invIndex + 1} Allocation (%)`}</label>
              {(tempEvent.rebalance.allocationType || "fixed") === "fixed" ? (
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  placeholder="e.g. 50"
                  value={tempEvent.rebalance?.allocations?.[invIndex]?.value || ""}
                  onChange={(e) => {
                    const updatedAlloc = {
                      ...tempEvent.rebalance.allocations,
                      [invIndex]: {
                        value: e.target.value,
                      },
                    };
                    setTempEvent({
                      ...tempEvent,
                      rebalance: {
                        ...tempEvent.rebalance,
                        allocations: updatedAlloc,
                      },
                    });
                  }}
                />
              ) : (
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="w-1/2 border px-3 py-2 rounded"
                    placeholder="Initial %"
                    value={tempEvent.rebalance?.allocations?.[invIndex]?.initial || ""}
                    onChange={(e) => {
                      const updatedAlloc = {
                        ...tempEvent.rebalance.allocations,
                        [invIndex]: {
                          ...tempEvent.rebalance.allocations?.[invIndex],
                          initial: e.target.value,
                        },
                      };
                      setTempEvent({
                        ...tempEvent,
                        rebalance: {
                          ...tempEvent.rebalance,
                          allocations: updatedAlloc,
                        },
                      });
                    }}
                  />
                  <input
                    type="number"
                    className="w-1/2 border px-3 py-2 rounded"
                    placeholder="Final %"
                    value={tempEvent.rebalance?.allocations?.[invIndex]?.final || ""}
                    onChange={(e) => {
                      const updatedAlloc = {
                        ...tempEvent.rebalance.allocations,
                        [invIndex]: {
                          ...tempEvent.rebalance.allocations?.[invIndex],
                          final: e.target.value,
                        },
                      };
                      setTempEvent({
                        ...tempEvent,
                        rebalance: {
                          ...tempEvent.rebalance,
                          allocations: updatedAlloc,
                        },
                      });
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )}


          {/* ACTIONS */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowEventModal(false);
                setEditingEventIndex(null);
                setTempEvent(null);
              }}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const updated = [...eventSeries];
                updated[editingEventIndex] = tempEvent;
                setEventSeries(updated);
                setShowEventModal(false);
                setEditingEventIndex(null);
                setTempEvent(null);
              }}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
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

  const renderInvestmentTypeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl space-y-4">
        <h2 className="text-lg font-semibold">Add Investment Type</h2>
  
        <input
          placeholder="Name"
          value={newInvestmentType.name}
          onChange={(e) => setNewInvestmentType({ ...newInvestmentType, name: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
  
        <input
          placeholder="Description"
          value={newInvestmentType.description}
          onChange={(e) => setNewInvestmentType({ ...newInvestmentType, description: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
  
        <input
          type="text"
          inputMode="decimal"
          pattern="[0-9]*"
          min="0"
          max="100"
          placeholder="Expense Ratio (%)"
          value={newInvestmentType.expenseRatio}
          onChange={(e) => {
            let val = e.target.value.replace(/[^\d.]/g, "");
            if (val !== "" && (isNaN(val) || parseFloat(val) < 0 || parseFloat(val) > 100)) return;
            setNewInvestmentType({ ...newInvestmentType, expenseRatio: val });
          }}
          className="w-full border px-3 py-2 rounded pr-8"
        />
  
        <div>
          <label className="block font-medium">Expected Annual Return</label>
          <select
            value={newInvestmentType.returnDistribution.type}
            onChange={(e) => {
              const newType = e.target.value;
              let returnValue = {};
              if (newType === "fixed" || newType === "percent") returnValue = { value: "" };
              else if (newType === "normal") returnValue = { mean: "", stdev: "" };
              setNewInvestmentType({
                ...newInvestmentType,
                returnDistribution: { type: newType, ...returnValue },
              });
            }}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="fixed">Fixed</option>
            <option value="percent">Percent</option>
            <option value="normal">Normal Distribution</option>
          </select>
        </div>
  
        {newInvestmentType.returnDistribution.type === "fixed" && (
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm pointer-events-none">
              $
            </span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="e.g. 500"
              className="pl-7 pr-3 border border-gray-300 rounded-md py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={newInvestmentType.returnDistribution.value}
              onChange={(e) =>
                setNewInvestmentType({
                  ...newInvestmentType,
                  returnDistribution: {
                    ...newInvestmentType.returnDistribution,
                    value: e.target.value.replace(/\D/g, "")
                  }
                })
              }
            />
          </div>
        )}
  
        {newInvestmentType.returnDistribution.type === "percent" && (
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              pattern="^\d*\.?\d*$"
              placeholder="e.g. 7"
              className="pl-3 pr-7 border border-gray-300 rounded-md py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={newInvestmentType.returnDistribution.value}
              onChange={(e) => {
                let val = e.target.value;
                if (/^\d*\.?\d*$/.test(val)) {
                  if (parseFloat(val) <= 100 || val === "") {
                    setNewInvestmentType({
                      ...newInvestmentType,
                      returnDistribution: {
                        ...newInvestmentType.returnDistribution,
                        value: val
                      }
                    });
                  }
                }
              }}
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm pointer-events-none">
              %
            </span>
          </div>
        )}
  
        {newInvestmentType.returnDistribution.type === "normal" && (
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Mean"
              value={newInvestmentType.returnDistribution.mean || ""}
              onChange={(e) =>
                setNewInvestmentType({
                  ...newInvestmentType,
                  returnDistribution: {
                    ...newInvestmentType.returnDistribution,
                    mean: e.target.value,
                  },
                })
              }
              className="w-1/2 border px-3 py-2 rounded"
            />
            <input
              type="number"
              placeholder="Stdev"
              value={newInvestmentType.returnDistribution.stdev || ""}
              onChange={(e) =>
                setNewInvestmentType({
                  ...newInvestmentType,
                  returnDistribution: {
                    ...newInvestmentType.returnDistribution,
                    stdev: e.target.value,
                  },
                })
              }
              className="w-1/2 border px-3 py-2 rounded"
            />
          </div>
        )}
  
        <div>
          <label className="block font-medium">Expected Annual Income</label>
          <select
            value={newInvestmentType.incomeDistribution.type}
            onChange={(e) => {
              const newType = e.target.value;
              let incomeValue = {};
              if (newType === "fixed" || newType === "percent") incomeValue = { value: "" };
              else if (newType === "normal") incomeValue = { mean: "", stdev: "" };
              setNewInvestmentType({
                ...newInvestmentType,
                incomeDistribution: { type: newType, ...incomeValue },
              });
            }}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="fixed">Fixed</option>
            <option value="percent">Percent</option>
            <option value="normal">Normal Distribution</option>
          </select>
        </div>
  
        {newInvestmentType.incomeDistribution.type === "fixed" && (
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm pointer-events-none">
              $
            </span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="e.g. 300"
              className="pl-7 pr-3 border border-gray-300 rounded-md py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={newInvestmentType.incomeDistribution.value}
              onChange={(e) =>
                setNewInvestmentType({
                  ...newInvestmentType,
                  incomeDistribution: {
                    ...newInvestmentType.incomeDistribution,
                    value: e.target.value.replace(/\D/g, "")
                  },
                })
              }
            />
          </div>
        )}
  
        {newInvestmentType.incomeDistribution.type === "percent" && (
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              pattern="^\d*\.?\d*$"
              placeholder="e.g. 3"
              className="pl-3 pr-7 border border-gray-300 rounded-md py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={newInvestmentType.incomeDistribution.value}
              onChange={(e) => {
                let val = e.target.value;
                if (/^\d*\.?\d*$/.test(val)) {
                  if (parseFloat(val) <= 100 || val === "") {
                    setNewInvestmentType({
                      ...newInvestmentType,
                      incomeDistribution: {
                        ...newInvestmentType.incomeDistribution,
                        value: val,
                      },
                    });
                  }
                }
              }}
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm pointer-events-none">
              %
            </span>
          </div>
        )}
  
        {newInvestmentType.incomeDistribution.type === "normal" && (
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Mean"
              value={newInvestmentType.incomeDistribution.mean || ""}
              onChange={(e) =>
                setNewInvestmentType({
                  ...newInvestmentType,
                  incomeDistribution: {
                    ...newInvestmentType.incomeDistribution,
                    mean: e.target.value,
                  },
                })
              }
              className="w-1/2 border px-3 py-2 rounded"
            />
            <input
              type="number"
              placeholder="Stdev"
              value={newInvestmentType.incomeDistribution.stdev || ""}
              onChange={(e) =>
                setNewInvestmentType({
                  ...newInvestmentType,
                  incomeDistribution: {
                    ...newInvestmentType.incomeDistribution,
                    stdev: e.target.value,
                  },
                })
              }
              className="w-1/2 border px-3 py-2 rounded"
            />
          </div>
        )}
  
        <div>
          <label className="block font-medium mb-1">Taxability</label>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="taxability"
                value="true"
                checked={newInvestmentType.taxability === true}
                onChange={() => setNewInvestmentType({ ...newInvestmentType, taxability: true })}
                className="mr-2"
              />
              Taxable
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="taxability"
                value="false"
                checked={newInvestmentType.taxability === false}
                onChange={() => setNewInvestmentType({ ...newInvestmentType, taxability: false })}
                className="mr-2"
              />
              Tax-Exempt
            </label>
          </div>
        </div>
  
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              setShowInvestmentTypeModal(false);
              setNewInvestmentType({
                name: "",
                description: "",
                returnAmtOrPct: "percent",
                returnDistribution: { type: "fixed", value: "" },
                expenseRatio: "",
                incomeAmtOrPct: "percent",
                incomeDistribution: { type: "fixed", value: "" },
                taxability: true,
              });
            }}
            className="px-4 py-2 bg-gray-200 rounded"
            >
            Cancel
          </button>
          
          <button
            onClick={addInvestmentType}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Add Type
          </button>
        </div>


        
      </div>
    </div>
  );

  return (
    <div className="w-full px-4 mt-20">
      {showLifespanModal && renderLifespanModal()}
      {showInvestmentTypeModal && renderInvestmentTypeModal()}

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
      </div> {/* Wrapper div for scenario inputs */}

      {/* Investments Section */}
      <div className="w-full border border-gray-300 rounded-md p-6 mt-8 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Investments</h2>
          <div className="space-x-2">
            <button
              type="button"
              onClick={() => setShowInvestmentTypeModal(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded"
            >
              + Add Investment Type
            </button>
            <button
              type="button"
              onClick={() =>
                setInvestments([...investments, { value: "", taxStatus: "", type: "" }])
              }
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setInvestments(investments.slice(0, -1))}
              disabled={investments.length === 1}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
            >
              −
            </button>
          </div>
        </div>

        {investments.map((investment, index) => (
          <div key={index} className="flex flex-col md:flex-row gap-4 mb-4">

            {/* Investment Value */}
            <div className="flex-1 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Investment Value
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm pointer-events-none">
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="e.g. 100000"
                  className="pl-7 pr-3 border border-gray-300 rounded-md py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={investment.value}
                  onChange={(e) => {
                  const updated = [...investments];
                  updated[index].value = e.target.value.replace(/\D/g, "");
                  setInvestments(updated);
                }}
                />
              </div>
            </div>

            {/* Tax Status */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Status
              </label>
              <select
                value={investment.taxStatus}
                onChange={(e) => {
                  const updated = [...investments];
                  updated[index].taxStatus = e.target.value;
                  setInvestments(updated);
                }}
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Select Status Fix LATER</option>
                <option value="taxable">Taxable (Non-Retire)</option>
                <option value="tax-deferred">Tax-Deferred (PreTax-Retire)</option>
                <option value="tax-exempt">Tax-Exempt (AfterTax-Retire)</option>
              </select>
            </div>

            {/* Investment Type */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Investment Type
              </label>
              <select
                value={investment.type}
                onChange={(e) => {
                  const updated = [...investments];
                  updated[index].type = e.target.value;
                  setInvestments(updated);
                }}
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Select Type</option>
                {investmentTypes.map((type) => (
                  <option key={type.name} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Event Series Section */}
      {showEventModal && renderEventModal()}

      <div className="w-full border border-gray-300 rounded-md p-6 mt-8 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Event Series</h2>

        <div className="space-y-4">
          {eventSeries.map((event, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-md p-4 bg-white shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-md font-semibold text-gray-800">
                    {event.name || "Unnamed Event Series"}
                  </h3>
                  {event.description && (
                    <p className="text-sm text-gray-600">{event.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEventModal(index)}
                    className="px-3 py-1 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeEventSeries(index)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  <span className="font-medium">Start:</span> {event.start.type} – {event.start.value || "–"}
                </p>
                <p>
                  <span className="font-medium">Duration:</span> {event.duration.type} – {event.duration.value || "–"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Event Button at Bottom */}
        <div className="flex justify-center mt-6">
          <button
            onClick={addEventSeries}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            + Add Another Event Series
          </button>
        </div>
      </div>






      {/* Spending Strategy Section */}
      <div className="w-full border border-gray-300 rounded-md p-6 mt-8 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Spending Strategy</h2>

        {spendingStrategy.length === 0 ? (
          <p className="text-sm italic text-gray-500">No discretionary expenses available.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={spendingStrategy.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {spendingStrategy.map((item, index) => (
                  <SortableItem key={item.id} id={item.id} name={item.name} index={index} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Expense Withdrawal Strategy Section */}
      <div className="w-full border border-gray-300 rounded-md p-6 mt-8 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Expense Withdrawal Strategy</h2>

        {dummyInvestmentNames.length === 0 ? (
          <p className="text-gray-500 italic">No investments available.</p>
        ) : (
          <div className="space-y-2">
            {withdrawalStrategy.length === 0 &&
              setWithdrawalStrategy(dummyInvestmentNames)
            }

            <ul className="space-y-2">
              {withdrawalStrategy.map((invName, index) => (
                <li
                  key={invName}
                  className="flex items-center gap-3 p-2 bg-white border rounded shadow-sm cursor-grab"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", index.toString());
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const fromIndex = Number(e.dataTransfer.getData("text/plain"));
                    const newOrder = [...withdrawalStrategy];
                    const [movedItem] = newOrder.splice(fromIndex, 1);
                    newOrder.splice(index, 0, movedItem);
                    setWithdrawalStrategy(newOrder);
                  }}
                >
                  <span className="text-sm font-medium w-6">{index + 1}.</span>
                  <div className="flex-1">{invName}</div>
                  <span className="text-gray-400">⋮⋮</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>


      {/* Inflation Assumption Section */}
      <div className="w-full border border-gray-300 rounded-md p-6 mt-8 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Inflation Assumption</h2>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inflation Type</label>
            <select
              value={inflation.type}
              onChange={(e) => {
                const newType = e.target.value;
                let newValue = {};
                if (newType === "fixed") newValue = { value: "" };
                else if (newType === "normal") newValue = { mean: "", stdev: "" };
                else if (newType === "uniform") newValue = { lower: "", upper: "" };
                setInflation({ type: newType, ...newValue });
              }}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="fixed">Fixed</option>
              <option value="normal">Normal Distribution</option>
              <option value="uniform">Uniform Distribution</option>
            </select>
          </div>

          {inflation.type === "fixed" && (
            <div className="relative">
              <input
                type="number"
                placeholder="e.g. 2.5"
                className="w-full border px-3 py-2 rounded pr-10"
                value={inflation.value}
                onChange={(e) => setInflation({ ...inflation, value: e.target.value })}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
          )}

          {inflation.type === "normal" && (
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Mean %"
                className="w-1/2 border px-3 py-2 rounded"
                value={inflation.mean}
                onChange={(e) => setInflation({ ...inflation, mean: e.target.value })}
              />
              <input
                type="number"
                placeholder="Stdev %"
                className="w-1/2 border px-3 py-2 rounded"
                value={inflation.stdev}
                onChange={(e) => setInflation({ ...inflation, stdev: e.target.value })}
              />
            </div>
          )}

          {inflation.type === "uniform" && (
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Lower Bound %"
                className="w-1/2 border px-3 py-2 rounded"
                value={inflation.lower}
                onChange={(e) => setInflation({ ...inflation, lower: e.target.value })}
              />
              <input
                type="number"
                placeholder="Upper Bound %"
                className="w-1/2 border px-3 py-2 rounded"
                value={inflation.upper}
                onChange={(e) => setInflation({ ...inflation, upper: e.target.value })}
              />
            </div>
          )}
        </div>
      </div>






      {/* Roth Conversion Optimizer */}
      <div className="w-full border border-gray-300 rounded-md p-6 mt-8 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Roth Conversion Optimizer</h2>

        <div className="mb-4 flex items-center space-x-3">
          <input
            type="checkbox"
            checked={enableRothConversion}
            onChange={(e) => setEnableRothConversion(e.target.checked)}
          />
          <label className="text-gray-700 font-medium">Enable Roth Conversion Optimizer</label>
        </div>

        {enableRothConversion && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
                <input
                  type="number"
                  placeholder="e.g. 2050"
                  className="border border-gray-300 rounded-md px-3 py-2 w-32"
                  value={rothStartYear}
                  onChange={(e) => setRothStartYear(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
                <input
                  type="number"
                  placeholder="e.g. 2060"
                  className="border border-gray-300 rounded-md px-3 py-2 w-32"
                  value={rothEndYear}
                  onChange={(e) => setRothEndYear(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Roth Conversion Strategy (pre-tax investments only)
              </label>

              {rothConversionStrategy.length === 0 ? (
                <p className="text-gray-500 italic">No eligible pre-tax investments available.</p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => {
                    const { active, over } = event;
                    if (active.id !== over?.id) {
                      const oldIndex = rothConversionStrategy.findIndex((i) => i === active.id);
                      const newIndex = rothConversionStrategy.findIndex((i) => i === over?.id);
                      setRothConversionStrategy((items) => arrayMove(items, oldIndex, newIndex));
                    }
                  }}
                >
                  <SortableContext
                    items={rothConversionStrategy}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {rothConversionStrategy.map((item, index) => (
                        <SortableItem key={item} id={item} name={item} index={index} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        )}
      </div>


      {/* RMD Strategy Section  NEED TO FIX THIS LATER EEEEEEEEEEEEEEEE*/}
      <div className="w-full border border-gray-300 rounded-md p-6 mt-8 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">RMD Strategy</h2>

          {rmdStrategy.length === 0 ? (
            <p className="text-sm italic text-gray-500">No pre-tax investments available.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={rmdStrategy.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {rmdStrategy.map((item, index) => (
                    <SortableItem key={item.id} id={item.id} name={item.name} index={index} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
        
    <div className="w-full border border-gray-300 rounded-md p-6 mt-8 bg-gray-50">
      <div className="flex justify-center">
        <button
          onClick={() => {
            // Logic to save the scenario can go here
            alert("Scenario saved!");
          }}
          className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Save Scenario
        </button>
      </div>
    </div>



</div> 
);
}
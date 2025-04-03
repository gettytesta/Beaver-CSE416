"use client";


// TP: ChatGPT. Prompt: "I need help with UI/UX challenges in a complex scenario builder page, such as modals, dropdowns, and popups.
// Also looking to implement drag-and-drop reordering for investments."
//
// Since this file grew large over time, I asked ChatGPT several specific questions throughout development, mostly related to 
// UI/UX implementation. It helped me design and refine interactive elements like modals, dropdown menus, popups, 
// and drag-and-drop behavior for investment ordering. The backend is not yet connected — the current focus is frontend interaction and layout.
//
// TODO: This file is currently ~2000 lines and should be modularized into smaller components for readability and maintainability.


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
import ScenarioInfo from "./scenarioBuilder/ScenarioInfo";
import useScenarioInfo from "./scenarioBuilder/useScenarioInfo";
import Investments from "./scenarioBuilder/Investments";
import useInvestments from "./scenarioBuilder/useInvestments";
import EventSeries from "./scenarioBuilder/EventSeries";


export default function AddScenario() {

  // ================== SCENARIO INFO SECTION ==================
  const {
    filingStatus,
    setFilingStatus,
    birthYears,
    setBirthYears,
    retirementAges,
    setRetirementAges,
    lifespanTypes,
    setLifespanTypes,
    lifespanValues,
    setLifespanValues,
    state,
    setState,
    states,
    stateRequiresUpload,
    fileInputRef,
    handleYamlUpload,
    handleFilingStatusChange,
    financialGoal,
    setFinancialGoal,
    scenarioName,
    setScenarioName,
    renderYearDropdown,
    renderRetirementAge,
    renderLifespanModal,
    showLifespanModal,
    setShowLifespanModal,
    ignoreStateTax,             
    setIgnoreStateTax
  } = useScenarioInfo();
  //components/UseScenarioInfo.jsx to edit this

  // ================== INVESTMENTS SECTION ==================

  const {
    investments,
    setInvestments,
    investmentTypes,
    setInvestmentTypes,
    showInvestmentTypeModal,
    setShowInvestmentTypeModal,
    newInvestmentType,
    setNewInvestmentType,
    investmentStatusOptions,
    handleInvestmentChange,
    addInvestment,
    removeInvestment,
    addInvestmentType,
    renderInvestmentTypeModal,
    handleEditInvestmentType,
    handleDeleteInvestmentType,
  } = useInvestments();

  // ================== EVENT SERIES SECTION ==================


  const [eventSeries, setEventSeries] = useState([]);
  
  const [editingEventIndex, setEditingEventIndex] = useState(null);

  const [showEventModal, setShowEventModal] = useState(false);

  const [tempEvent, setTempEvent] = useState(null);
  
  
  const [inflation, setInflation] = useState({
    type: "fixed",
    value: ""
  });

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
  
  ///////////////////////////////////////////////////////////////////////////////////////////////

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

  

  return (
    <div className="w-full px-4 mt-20">
      {showLifespanModal && renderLifespanModal()}
      {showInvestmentTypeModal && renderInvestmentTypeModal()}

      {/* Scenario Info Section */}
      <ScenarioInfo
        filingStatus={filingStatus}
        onFilingStatusChange={handleFilingStatusChange}
        birthYears={birthYears}
        setBirthYears={setBirthYears}
        retirementAges={retirementAges}
        setRetirementAges={setRetirementAges}
        lifespanTypes={lifespanTypes}
        setLifespanTypes={setLifespanTypes}
        lifespanValues={lifespanValues}
        setLifespanValues={setLifespanValues}
        state={state}
        setState={setState}
        states={states}
        stateRequiresUpload={stateRequiresUpload}
        fileInputRef={fileInputRef}
        handleYamlUpload={handleYamlUpload}
        financialGoal={financialGoal}
        setFinancialGoal={setFinancialGoal}
        scenarioName={scenarioName}
        setScenarioName={setScenarioName}
        setShowLifespanModal={setShowLifespanModal}
        renderYearDropdown={renderYearDropdown}
        renderRetirementAge={renderRetirementAge}
        ignoreStateTax={ignoreStateTax}
        setIgnoreStateTax={setIgnoreStateTax}
      />

      {/* Investments Section */}
      <Investments
        investments={investments}
        investmentTypes={investmentTypes}
        setShowInvestmentTypeModal={setShowInvestmentTypeModal}
        handleInvestmentChange={handleInvestmentChange}
        addInvestment={addInvestment}
        removeInvestment={removeInvestment}
        handleEditInvestmentType={handleEditInvestmentType}
        handleDeleteInvestmentType={handleDeleteInvestmentType}
      />


      {/* Event Series Section */}
      {/*showEventModal && renderEventModal()*/}

      <EventSeries
        eventSeries={eventSeries}
        showEventModal={showEventModal}
        renderEventModal={renderEventModal}
        openEventModal={openEventModal}
        removeEventSeries={removeEventSeries}
        addEventSeries={addEventSeries}
      />

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
import React from "react";
import { useEffect } from "react";

export default function EventModal({
  filingStatus,
  tempEvent,
  setTempEvent,
  editingEventIndex,
  setEditingEventIndex,
  setShowEventModal,
  eventSeries,
  setEventSeries,
  investments,
}) {
  if (editingEventIndex === null || !tempEvent) return null;

  const isMarried = filingStatus === "married";
  const eventType = tempEvent.type;
  

  const handleIncomeChange = (field, value) => {
    setTempEvent({
      ...tempEvent,
      income: { ...tempEvent.income, [field]: value },
    });
  };



  useEffect(() => {
    // Log tempEvent structure when it changes
  
    // Make sure fixed distribution value is initialized for EXPENSE
    if (tempEvent?.type === "expense") {
      const dist = tempEvent.expense?.changeDistribution;
  
      if (dist?.type === "fixed" && dist.value === undefined) {
        setTempEvent(prev => ({
          ...prev,
          expense: {
            ...prev.expense,
            changeDistribution: {
              ...prev.expense.changeDistribution,
              value: "",
            },
          },
        }));
      }
    }
  
    // Make sure fixed distribution value is initialized for INCOME
    if (tempEvent?.type === "income") {
      const dist = tempEvent.income?.changeDistribution;
  
      if (dist?.type === "fixed" && dist.value === undefined) {
        setTempEvent(prev => ({
          ...prev,
          income: {
            ...prev.income,
            changeDistribution: {
              ...prev.income.changeDistribution,
              value: "",
            },
          },
        }));
      }
    }
  }, [tempEvent?.type, tempEvent?.income?.changeDistribution?.type, tempEvent?.expense?.changeDistribution?.type]);





  const availableSeriesNames = eventSeries
    .filter((_, idx) => idx !== editingEventIndex)
    .map((series) => series.name)
    .filter(Boolean);

  

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
            <div>
              <label className="block text-sm font-medium mt-2">Event Series Name</label>
              <select
                className="w-full border px-3 py-2 rounded"
                value={tempEvent.start?.eventSeries || ""}
                onChange={(e) =>
                  setTempEvent({
                    ...tempEvent,
                    start: {
                      ...tempEvent.start,
                      eventSeries: e.target.value,
                    },
                  })
                }
              >
                <option value="">-- Select an Event Series --</option>
                {availableSeriesNames.map((name, idx) => (
                  <option key={idx} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
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
    onChange={(e) => {
      const selectedType = e.target.value;
      let updatedEvent = { ...tempEvent, type: selectedType };

      if (selectedType === "expense") {
        updatedEvent.expense = {
          initialAmount: "",
          changeAmtOrPct: "amount",
          changeDistribution: { type: "fixed", value: "" },
          adjustForInflation: false,
          discretionary: false,
          userPct: "",
        };
      }

      if (selectedType === "income") {
        updatedEvent.income = {
          initialAmount: "",
          changeAmtOrPct: "amount",
          changeDistribution: { type: "fixed", value: "" },
          adjustForInflation: false,
          isSocialSecurity: false,
          userPct: "",
        };
      }

      setTempEvent(updatedEvent);
    }}
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
                <option value="percent">Percentage</option>
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
                <option value="percent">Percentage</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Change Distribution</label>
              <select
                value={tempEvent.expense.changeDistribution?.type || "fixed"}
                onChange={(e) => {
                  setTempEvent({
                    ...tempEvent,
                    expense: {
                      ...tempEvent.expense,
                      changeDistribution: {
                        ...tempEvent.expense.changeDistribution,
                        type: e.target.value,
                      },
                    },
                  });
                }}
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
                checked={tempEvent.expense?.discretionary || false}
                onChange={(e) =>
                  setTempEvent({
                    ...tempEvent,
                    expense: {
                      ...tempEvent.expense,
                      discretionary: e.target.checked,
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
          .filter((inv) => inv.taxStatus !== "pretaxretirement") // ✅ Updated filter
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
                    const updatedAllocations = { ...tempEvent.invest.allocations };

                    if (e.target.checked) {
                      selected.add(index);
                    } else {
                      selected.delete(index);
                      delete updatedAllocations[index]; // 🧼 Remove stale allocation entry
                    }

                    setTempEvent({
                      ...tempEvent,
                      invest: {
                        ...tempEvent.invest,
                        selected: Array.from(selected),
                        allocations: updatedAllocations,
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

        {/* Max Cash */}
        <div>
          <label className="block text-sm font-medium">Maximum Cash ($)</label>
          <input
            type="number"
            inputMode="decimal"
            placeholder="e.g. 1000"
            value={tempEvent.invest?.maxCash || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (!isNaN(value) && parseFloat(value) >= 0) {
                setTempEvent({
                  ...tempEvent,
                  invest: {
                    ...tempEvent.invest,
                    maxCash: parseFloat(value),
                  },
                });
              }
            }}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
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
      <label className="block text-sm font-medium mb-1">
        Select Investments (same tax status only)
      </label>

      <div className="space-y-1">
        {investments.map((inv, index) => {
          const selected = tempEvent.rebalance?.selected || [];
          const isChecked = selected.includes(index);

          // Get tax status of the first selected investment
          const firstSelectedTaxStatus =
            selected.length > 0 ? investments[selected[0]]?.taxStatus : null;

          // Enforce same tax status
          const isSelectable =
            isChecked ||
            selected.length === 0 ||
            inv.taxStatus === firstSelectedTaxStatus;

          return (
            <label
              key={index}
              className="flex items-center text-sm text-gray-700"
            >
              <input
                type="checkbox"
                className="mr-2"
                checked={isChecked}
                disabled={!isSelectable}
                onChange={(e) => {
                  const updatedSelected = new Set(selected);
                  const updatedAllocations = {
                    ...tempEvent.rebalance.allocations,
                  };

                  if (e.target.checked) {
                    updatedSelected.add(index);
                  } else {
                    updatedSelected.delete(index);
                    delete updatedAllocations[index]; // Clear stale allocation
                  }

                  setTempEvent({
                    ...tempEvent,
                    rebalance: {
                      ...tempEvent.rebalance,
                      selected: Array.from(updatedSelected),
                      allocations: updatedAllocations,
                    },
                  });
                }}
              />
              {`Investment ${index + 1} (${inv.type || "Unnamed"} – ${
                inv.taxStatus || "Unknown"
              })`}
              {!isSelectable && (
                <span className="text-red-500 ml-2">
                  (Tax status mismatch)
                </span>
              )}
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

                let updatedTemp = { ...tempEvent };

                // Make sure subfields are initialized and structured correctly
                if (updatedTemp.type === "income") {
                  updatedTemp.income = {
                    initialAmount: updatedTemp.income?.initialAmount ?? "",
                    changeAmtOrPct: updatedTemp.income?.changeAmtOrPct ?? "amount",
                    changeDistribution: updatedTemp.income?.changeDistribution ?? { type: "fixed", value: "" },
                    adjustForInflation: updatedTemp.income?.adjustForInflation ?? false,
                    isSocialSecurity: updatedTemp.income?.isSocialSecurity ?? false,
                    userPct: updatedTemp.income?.userPct ?? "",
                  };
                }

                if (updatedTemp.type === "expense") {
                  updatedTemp.expense = {
                    initialAmount: updatedTemp.expense?.initialAmount ?? "",
                    changeAmtOrPct: updatedTemp.expense?.changeAmtOrPct ?? "amount",
                    changeDistribution: updatedTemp.expense?.changeDistribution ?? { type: "fixed", value: "" },
                    adjustForInflation: updatedTemp.expense?.adjustForInflation ?? false,
                    discretionary: updatedTemp.expense?.discretionary ?? false,
                    userPct: updatedTemp.expense?.userPct ?? "",
                  };
                }

                updated[editingEventIndex] = updatedTemp;
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
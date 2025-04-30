import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';

export default function useEventSeries(initialScenario = null, isEdit = false) {

    
  const [eventSeries, setEventSeries] = useState(() => {
    return initialScenario?.eventSeriesSet || [];
  });
  const [editingEventIndex, setEditingEventIndex] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [tempEvent, setTempEvent] = useState(null);


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
        _id: uuidv4(), //✅ assign a unique string ID for reference
        name: "",
        description: "",
        start: { type: "fixed", value: "" },
        duration: { type: "fixed", value: "" },
        type: "",
        income: {},
        expense: {},
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
    const type = original.type || "";
  
    const percentFromDecimal = (val) =>
      val != null && !isNaN(val)
        ? String(Math.round(parseFloat(val) * 100))
        : "";
  
    const formatValue = (val, isPercent) =>
      val !== undefined ? (isPercent ? percentFromDecimal(val) : String(val)) : "";
  
    let incomeDefaults, expenseDefaults;
  
    if (type === "income") {
      const isPercent = original.income?.changeAmtOrPct === "percent";
  
      incomeDefaults = {
        initialAmount: original.income?.initialAmount ?? "",
        changeAmtOrPct: original.income?.changeAmtOrPct ?? "amount",
        changeDistribution: {
          type: original.income?.changeDistribution?.type ?? "fixed",
          ...(original.income?.changeDistribution?.type === "fixed" && {
            value: formatValue(original.income.changeDistribution.value, isPercent),
          }),
          ...(original.income?.changeDistribution?.type === "normal" && {
            mean: formatValue(original.income.changeDistribution.mean, isPercent),
            stdev: formatValue(original.income.changeDistribution.stdev, isPercent),
          }),
          ...(original.income?.changeDistribution?.type === "uniform" && {
            lower: formatValue(original.income.changeDistribution.lower, isPercent),
            upper: formatValue(original.income.changeDistribution.upper, isPercent),
          }),
        },
        adjustForInflation: original.income?.adjustForInflation ?? false,
        isSocialSecurity: original.income?.isSocialSecurity ?? false,
        userPct: isEdit ? percentFromDecimal(original.income?.userPct) : original.income?.userPct ?? "",
      };
    }
  
    if (type === "expense") {
      const isPercent = original.expense?.changeAmtOrPct === "percent";
  
      expenseDefaults = {
        initialAmount: original.expense?.initialAmount ?? "",
        changeAmtOrPct: original.expense?.changeAmtOrPct ?? "amount",
        changeDistribution: {
          type: original.expense?.changeDistribution?.type ?? "fixed",
          ...(original.expense?.changeDistribution?.type === "fixed" && {
            value: formatValue(original.expense.changeDistribution.value, isPercent),
          }),
          ...(original.expense?.changeDistribution?.type === "normal" && {
            mean: formatValue(original.expense.changeDistribution.mean, isPercent),
            stdev: formatValue(original.expense.changeDistribution.stdev, isPercent),
          }),
          ...(original.expense?.changeDistribution?.type === "uniform" && {
            lower: formatValue(original.expense.changeDistribution.lower, isPercent),
            upper: formatValue(original.expense.changeDistribution.upper, isPercent),
          }),
        },
        adjustForInflation: original.expense?.adjustForInflation ?? false,
        discretionary: original.expense?.discretionary ?? false,
        userPct: isEdit ? percentFromDecimal(original.expense?.userPct) : original.expense?.userPct ?? "",
      };
    }

    let investDefaults;

    if (type === "invest") {
      const allocationMap = original.invest?.allocations ?? {};
      const isGlide = original.invest?.allocationType === "glide";
    
      const convertedAllocations = {};
      for (const [key, val] of Object.entries(allocationMap)) {
        convertedAllocations[key] = isGlide
          ? {
              initial: isEdit ? percentFromDecimal(val.initial) : val.initial,
              final: isEdit ? percentFromDecimal(val.final) : val.final,
            }
          : {
              value: isEdit ? percentFromDecimal(val.value) : val.value,
            };
      }
    
      investDefaults = {
        allocationType: original.invest?.allocationType ?? "fixed",
        allocations: convertedAllocations,
        maxCash: original.invest?.maxCash ?? "",
        selected: Object.keys(convertedAllocations), // optional: drives checkboxes
      };
    }


    let rebalanceDefaults;
    
    if (type === "rebalance") {
      const allocationMap = original.rebalance?.allocations ?? {};
      const isGlide = original.rebalance?.allocationType === "glide";
    
      const normalizedAllocations = {};
      for (const [key, val] of Object.entries(allocationMap)) {
        normalizedAllocations[String(key)] = {
          ...(isGlide
            ? {
                initial: isEdit ? percentFromDecimal(val.initial) : val.initial,
                final: isEdit ? percentFromDecimal(val.final) : val.final,
              }
            : {
                value: isEdit ? percentFromDecimal(val.value) : val.value,
              }),
        };
      }
    
      rebalanceDefaults = {
        allocationType: original.rebalance?.allocationType ?? "fixed",
        allocations: normalizedAllocations,
        selected: Object.keys(normalizedAllocations),
      };
    }


  
    const temp = {
      ...original,
      ...(type === "income" && { income: incomeDefaults }),
      ...(type === "expense" && { expense: expenseDefaults }),
      ...(type === "invest" && { invest: investDefaults }), 
      ...(type === "rebalance" && { rebalance: rebalanceDefaults }),
    };
    
  
    setEditingEventIndex(index);
    setTempEvent(temp);
    setShowEventModal(true);
  };

  return {
    eventSeries,
    setEventSeries,
    editingEventIndex,
    setEditingEventIndex,
    showEventModal,
    setShowEventModal,
    tempEvent,
    setTempEvent,
    handleEventSeriesChange,
    addEventSeries,
    removeEventSeries,
    openEventModal,
  };
}
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
  
    const formatValue = (val) =>
      val !== undefined && val !== null ? String(val) : "";
  
    let incomeDefaults, expenseDefaults;
  
    if (type === "income") {
      incomeDefaults = {
        initialAmount: original.income?.initialAmount ?? "",
        changeAmtOrPct: original.income?.changeAmtOrPct ?? "amount",
        changeDistribution: {
          type: original.income?.changeDistribution?.type ?? "fixed",
          ...(original.income?.changeDistribution?.type === "fixed" && {
            value: formatValue(original.income.changeDistribution?.value),
          }),
          ...(original.income?.changeDistribution?.type === "normal" && {
            mean: formatValue(original.income.changeDistribution?.mean),
            stdev: formatValue(original.income.changeDistribution?.stdev),
          }),
          ...(original.income?.changeDistribution?.type === "uniform" && {
            lower: formatValue(original.income.changeDistribution?.lower),
            upper: formatValue(original.income.changeDistribution?.upper),
          }),
        },
        adjustForInflation: original.income?.adjustForInflation ?? false,
        isSocialSecurity: original.income?.isSocialSecurity ?? false,
        userPct: original.income?.userPct ?? "",
      };
    }
  
    if (type === "expense") {
      expenseDefaults = {
        initialAmount: original.expense?.initialAmount ?? "",
        changeAmtOrPct: original.expense?.changeAmtOrPct ?? "amount",
        changeDistribution: {
          type: original.expense?.changeDistribution?.type ?? "fixed",
          ...(original.expense?.changeDistribution?.type === "fixed" && {
            value: formatValue(original.expense.changeDistribution?.value),
          }),
          ...(original.expense?.changeDistribution?.type === "normal" && {
            mean: formatValue(original.expense.changeDistribution?.mean),
            stdev: formatValue(original.expense.changeDistribution?.stdev),
          }),
          ...(original.expense?.changeDistribution?.type === "uniform" && {
            lower: formatValue(original.expense.changeDistribution?.lower),
            upper: formatValue(original.expense.changeDistribution?.upper),
          }),
        },
        adjustForInflation: original.expense?.adjustForInflation ?? false,
        discretionary: original.expense?.discretionary ?? false,
        userPct: original.expense?.userPct ?? "",
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
              initial: val.initial,
              final: val.final,
            }
          : {
              value: val.value,
            };
      }
  
      investDefaults = {
        allocationType: original.invest?.allocationType ?? "fixed",
        allocations: convertedAllocations,
        maxCash: original.invest?.maxCash ?? "",
        selected: Object.keys(convertedAllocations),
      };
    }
  
    let rebalanceDefaults;
    if (type === "rebalance") {
      const allocationMap = original.rebalance?.allocations ?? {};
      const isGlide = original.rebalance?.allocationType === "glide";
  
      const normalizedAllocations = {};
      for (const [key, val] of Object.entries(allocationMap)) {
        normalizedAllocations[String(key)] = isGlide
          ? {
              initial: val.initial,
              final: val.final,
            }
          : {
              value: val.value,
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
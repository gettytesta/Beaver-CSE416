import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';

export default function useEventSeries() {

    
  const [eventSeries, setEventSeries] = useState([]);
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
    const type = original.type || ""; // fallback in case it's blank
  
    let incomeDefaults, expenseDefaults;
  
    if (type === "income") {
      incomeDefaults = {
        initialAmount: original.income?.initialAmount ?? "",
        changeAmtOrPct: original.income?.changeAmtOrPct ?? "amount",
        changeDistribution: original.income?.changeDistribution?.type
          ? {
              ...original.income.changeDistribution,
              ...(original.income.changeDistribution.type === "fixed" && {
                value: original.income.changeDistribution.value ?? ""
              }),
              ...(original.income.changeDistribution.type === "normal" && {
                mean: original.income.changeDistribution.mean ?? "",
                stdev: original.income.changeDistribution.stdev ?? ""
              }),
              ...(original.income.changeDistribution.type === "uniform" && {
                lower: original.income.changeDistribution.lower ?? "",
                upper: original.income.changeDistribution.upper ?? ""
              }),
            }
          : { type: "fixed", value: "" },
        adjustForInflation: original.income?.adjustForInflation ?? false,
        isSocialSecurity: original.income?.isSocialSecurity ?? false,
        userPct: original.income?.userPct ?? "",
      };
    }
  
    if (type === "expense") {
      expenseDefaults = {
        initialAmount: original.expense?.initialAmount ?? "",
        changeAmtOrPct: original.expense?.changeAmtOrPct ?? "amount",
        changeDistribution: original.expense?.changeDistribution?.type
          ? {
              ...original.expense.changeDistribution,
              ...(original.expense.changeDistribution.type === "fixed" && {
                value: original.expense.changeDistribution.value ?? ""
              }),
              ...(original.expense.changeDistribution.type === "normal" && {
                mean: original.expense.changeDistribution.mean ?? "",
                stdev: original.expense.changeDistribution.stdev ?? ""
              }),
              ...(original.expense.changeDistribution.type === "uniform" && {
                lower: original.expense.changeDistribution.lower ?? "",
                upper: original.expense.changeDistribution.upper ?? ""
              }),
            }
          : { type: "fixed", value: "" },
        adjustForInflation: original.expense?.adjustForInflation ?? false,
        discretionary: original.expense?.discretionary ?? false,
        userPct: original.expense?.userPct ?? "",
      };
    }
  
    
  
    const temp = {
      ...original,
      ...(type === "income" && { income: incomeDefaults }),
      ...(type === "expense" && { expense: expenseDefaults }),
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
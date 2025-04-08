import { useState } from "react";

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
        name: "",
        description: "",
        start: { type: "fixed", value: "" },
        duration: { type: "fixed", value: "" },
        type: "",
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
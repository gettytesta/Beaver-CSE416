import React from "react";
import EventModal from "./EventModal";

const formatDistribution = (dist) => {
  if (!dist || typeof dist !== "object") return "—";
  if (dist.type === "fixed") return `fixed – ${dist.value}`;
  if (dist.type === "normal") return `normal – mean ${dist.mean}, stdev ${dist.stdev}`;
  if (dist.type === "uniform") return `uniform – ${dist.lower}–${dist.upper}`;
  if (dist.type === "startWith") return `start with "${dist.eventSeries}"`;
  if (dist.type === "startAfter") return `start after "${dist.eventSeries}"`;
  return JSON.stringify(dist);
};



export default function EventSeries({
  eventSeries,
  showEventModal,
  tempEvent,
  setTempEvent,
  editingEventIndex,
  setEditingEventIndex,
  setShowEventModal,
  filingStatus,
  setEventSeries,
  investments,
  openEventModal,
  removeEventSeries,
  addEventSeries,
  investmentTypes,
  isEdit
}) {
  return (
    <div className="w-full border border-gray-300 rounded-md p-6 mt-8 bg-gray-50">
      {showEventModal && (
        <EventModal
          filingStatus={filingStatus}
          tempEvent={tempEvent}
          setTempEvent={setTempEvent}
          editingEventIndex={editingEventIndex}
          setEditingEventIndex={setEditingEventIndex}
          setShowEventModal={setShowEventModal}
          eventSeries={eventSeries}
          setEventSeries={setEventSeries}
          investments={investments}
          investmentTypes={investmentTypes} // ✅ Add this here
          isEdit={isEdit}
        />
      )}

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
                <span className="font-bold">{event.name || "Unnamed Event Series"}</span>
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
  <p><span className="font-medium"><strong>Start:</strong></span> {formatDistribution(event.start)}</p>
  <p><span className="font-medium"><strong>Duration:</strong></span> {formatDistribution(event.duration)}</p>
  <p><span className="font-medium"><strong>Type:</strong></span> {event.type}</p>

  {event.type === "income" && event.income && (
    <>
      <p><strong>Initial Amount:</strong> ${event.income.initialAmount}</p>
      <p><strong>Change Distribution:</strong> {formatDistribution(event.income.changeDistribution)}</p>
      <p><strong>Adjust for Inflation:</strong> {event.income.adjustForInflation ? "Yes" : "No"}</p>
      <p><strong>User %:</strong> {event.income.userPct}</p>
      <p><strong>Social Security:</strong> {event.income.isSocialSecurity ? "Yes" : "No"}</p>
    </>
  )}

  {event.type === "expense" && event.expense && (
    <>
      <p><strong>Initial Amount:</strong> ${event.expense.initialAmount}</p>
      <p><strong>Change Distribution:</strong> {formatDistribution(event.expense.changeDistribution)}</p>
      <p><strong>Adjust for Inflation:</strong> {event.expense.adjustForInflation ? "Yes" : "No"}</p>
      <p><strong>User %:</strong> {event.expense.userPct}</p>
      <p><strong>Discretionary:</strong> {event.expense.discretionary ? "Yes" : "No"}</p>
    </>
  )}

  {event.type === "invest" && event.invest && (
    <>
      <p><strong>Allocation Type:</strong> {event.invest.allocationType}</p>
      <p><strong>Max Cash:</strong> ${event.invest.maxCash}</p>
      <p><strong>Allocations:</strong></p>
      <ul className="list-disc ml-6">
        {Object.entries(event.invest.allocations).map(([invId, alloc]) => (
          <li key={invId}>
            {invId}: {alloc.initial} → {alloc.final}
          </li>
        ))}
      </ul>
    </>
  )}

  {event.type === "rebalance" && event.rebalance && (
    <>
      <p><strong>Allocation Type:</strong> {event.rebalance.allocationType}</p>
      <p><strong>Allocations:</strong></p>
      <ul className="list-disc ml-6">
        {Object.entries(event.rebalance.allocations).map(([invId, alloc]) => (
          <li key={invId}>
            {invId}: {alloc.value}
          </li>
        ))}
      </ul>
    </>
  )}
</div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={addEventSeries}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          + Add Another Event Series
        </button>
      </div>
    </div>
  );
}

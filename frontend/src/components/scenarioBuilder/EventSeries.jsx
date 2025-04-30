import React from "react";
import EventModal from "./EventModal";

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

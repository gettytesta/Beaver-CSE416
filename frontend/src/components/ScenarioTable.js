"use client";
import { CheckSquare, Square } from "lucide-react";
import { useState } from "react";

export default function ScenarioTable() {
  const [selected, setSelected] = useState(false);

  const toggleSelection = () => setSelected(!selected);

  return (
    <div className="w-full p-1">
      <table className="w-full border-collapse border border-gray-200 shadow-sm rounded-lg">
        {/* Table Header */}
        <thead className="bg-gray-100 text-gray-700 font-semibold">
          <tr className="border-b border-gray-300">
            <th className="p-4 text-left w-12">
              <button onClick={toggleSelection} className="flex items-center justify-center">
                {selected ? (
                  <CheckSquare className="w-5 h-5 text-blue-500" />
                ) : (
                  <Square className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </th>
            <th className="p-4 text-left">Scenario Name</th>
            <th className="p-4 text-left">Marital Status</th>
            <th className="p-4 text-left"># of Investments</th>
            <th className="p-4 text-left"># of Events</th>
            <th className="p-4 text-left"># of Simulations</th>
            <th className="p-4 text-left"></th>
            <th className="p-4 text-left">Scenario Exploration</th>
            <th className="p-4 text-left"></th>
          </tr>
        </thead>

        {/* Table Body one row only */}
        <tbody>
          <tr className="border-b border-gray-200 hover:bg-gray-50 transition">
            <td className="p-4 text-left">
              <button onClick={toggleSelection} className="flex items-center justify-center">
                {selected ? (
                  <CheckSquare className="w-5 h-5 text-blue-500" />
                ) : (
                  <Square className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </td>
            <td className="p-4">Scenario 1</td>
            <td className="p-4">Single</td>
            <td className="p-4">2</td>
            <td className="p-4">10</td>
            <td className="p-4">5</td>
            <td className="p-4">
              <button className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm">
                Edit
              </button>
            </td>
            <td className="p-4">
              <button className="px-3 py-1 bg-gray-500 text-white rounded-md text-sm">
                Choose Parameters
              </button>
            </td>
            <td className="p-4">
              <button className="px-3 py-1 bg-orange-500 text-white rounded-md text-sm">
                Run
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
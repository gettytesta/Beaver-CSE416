import { Trash2, Filter } from "lucide-react";
import ScenarioTable from "@/components/ScenarioTable";  // Import Table Component

export default function ScenarioDashboard() {
  return (
    <div className="w-full border-b border-gray-200 pt-16">
      <div className="h-[78px] flex items-center justify-between px-6">
        {/* Left Section - Title and Scenario Count */}
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-semibold leading-none">Saved Scenarios:</h2>
          <span className="text-blue-600 text-md hover:underline cursor-pointer leading-none pt-2">
            Num of Scenarios
          </span>
        </div>

        {/* Right Section - Delete,Filters,Build,Share */}
        <div className="flex items-center space-x-8">
          <button className="text-gray-600 hover:text-gray-900 flex items-center justify-center text-lg">
            <Trash2 className="w-6 h-6 mr-1" />
            <span className="leading-none font-semibold">Delete</span>
          </button>
          <button className="text-gray-600 hover:text-gray-900 flex items-center justify-center text-lg">
            <Filter className="w-6 h-6 mr-1" />
            <span className="leading-none font-semibold">Filters</span>
          </button>
          <button className="px-5 py-3 bg-blue-500 text-white rounded-md flex items-center justify-center text-lg">
            Add
          </button>
          <button className="px-5 py-3 bg-gray-600 text-white rounded-md flex items-center justify-center text-lg">
            Share
          </button>
        </div>
      </div>
      {/* Table Goes Here */}
      <ScenarioTable />

    </div>
  );
}
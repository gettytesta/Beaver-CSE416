"use client";
import React from "react";

export default function Investments({
  investments,
  investmentTypes,
  setShowInvestmentTypeModal,
  handleInvestmentChange,
  addInvestment,
  removeInvestment,
  handleEditInvestmentType,
  handleDeleteInvestmentType,
}) {
  return (
    <div className="w-full border border-gray-300 rounded-md p-6 mt-8 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Investments</h2>
        <div className="space-x-2">
          <button
            type="button"
            onClick={() => setShowInvestmentTypeModal(true)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded"
          >
            + Add Investment Type
          </button>
          <button
            type="button"
            onClick={addInvestment}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
          >
            +
          </button>
          <button
            type="button"
            onClick={removeInvestment}
            disabled={investments.length === 1}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
          >
            −
          </button>
        </div>
      </div>

      {investments.map((investment, index) => (
        <div key={index} className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Value */}
          <div className="flex-1 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Investment Value
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm pointer-events-none">
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 100000"
                className="pl-7 pr-3 border border-gray-300 rounded-md py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={investment.value}
                onChange={(e) =>
                  handleInvestmentChange(index, "value", e.target.value.replace(/\D/g, ""))
                }
              />
            </div>
          </div>

          {/* Tax Status */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tax Status</label>
            <select
              value={investment.taxStatus}
              onChange={(e) => handleInvestmentChange(index, "taxStatus", e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select Status Fix LATER</option>
              <option value="non-retirement">Taxable (Non-Retire)</option>
              <option value="pre-tax">Tax-Deferred (PreTax-Retire)</option>
              <option value="after-tax">Tax-Exempt (AfterTax-Retire)</option>
            </select>
          </div>

          {/* Type */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Investment Type</label>
            <select
              value={investment.type}
              onChange={(e) => handleInvestmentChange(index, "type", e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select Type</option>
              {investmentTypes.map((type) => (
                <option key={type.name} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}

      {/* View/Edit Investment Types */}
      {investmentTypes.length > 0 && (
        <div className="mt-8">
          <h3 className="text-md font-semibold mb-2 text-gray-800">Defined Investment Types</h3>
          <div className="space-y-2">
            {investmentTypes.map((type, index) => (
              <div
                key={index}
                className="border rounded px-4 py-2 bg-white shadow-sm flex justify-between items-center"
              >
                <div>
                  <div className="font-medium text-gray-900">{type.name}</div>
                  <div className="text-sm text-gray-600">
                    {type.description || "No description"}
                  </div>
                </div>
                <div className="space-x-2">
                  <button
                    type="button"
                    className="border border-indigo-500 text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded"
                    onClick={() => handleEditInvestmentType(index)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => handleDeleteInvestmentType(index)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

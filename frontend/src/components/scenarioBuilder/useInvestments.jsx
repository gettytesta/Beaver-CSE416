import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';

export default function useInvestments(initialScenario = null, isEdit=false) {
  // ================== INVESTMENTS INFO SECTION ==================

  const [investments, setInvestments] = useState(() => {
    if (!initialScenario?.investments) {
      return [{ _id: uuidv4(), value: "", taxStatus: "", type: "" }];
    }
  
    return initialScenario.investments.map((inv) => ({
      _id: inv._id,
      value: inv.value,
      taxStatus: inv.accountTaxStatus,
      type: inv.type, // temporarily unnormalized
    }));
  });
  
  const [investmentTypes, setInvestmentTypes] = useState(() => {
    if (!initialScenario?.investments) return [];
  
    const seen = new Set();
    return initialScenario.investments
      .map((inv) => inv.type)
      .filter((type) => {
        const key = `${type.name}-${type.taxability}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  });

  
  
  const [showInvestmentTypeModal, setShowInvestmentTypeModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null); 
  const [newInvestmentType, setNewInvestmentType] = useState({
    name: "",
    description: "",
    returnAmtOrPct: "percent",
    returnDistribution: { type: "fixed", value: "" },
    expenseRatio: "",
    incomeAmtOrPct: "percent",
    incomeDistribution: { type: "fixed", value: "" },
    taxability: true,
  });

  const investmentStatusOptions = ["Taxable", "Tax-Deferred", "Tax-Exempt"];

  const handleInvestmentChange = (index, field, value) => {
    const updated = [...investments];
    updated[index][field] = value;
    setInvestments(updated);
  };

  const addInvestment = () => {
    setInvestments([...investments, { _id: uuidv4(), value: "", taxStatus: "", type: "" }]);
  };

  const removeInvestment = () => {
    if (investments.length > 1) {
      setInvestments(investments.slice(0, -1));
    }
  };
  

  const addInvestmentType = () => {
    if (editIndex !== null) {
      const updated = [...investmentTypes];
      updated[editIndex] = newInvestmentType;
      setInvestmentTypes(updated);
    } else {
      setInvestmentTypes([...investmentTypes, newInvestmentType]);
    }
  
    setNewInvestmentType({
      name: "",
      description: "",
      returnAmtOrPct: "percent",
      returnDistribution: { type: "fixed", value: "" },
      expenseRatio: "",
      incomeAmtOrPct: "percent",
      incomeDistribution: { type: "fixed", value: "" },
      taxability: true,
    });
    setShowInvestmentTypeModal(false);
    setEditIndex(null);
  };

  const handleEditInvestmentType = (index) => {
    const original = investmentTypes[index] || {};
  
    const asString = (val, convertToPercent = false) => {
      if (val === undefined || val === null) return "";
      const numberVal = parseFloat(val);
      return isEdit && convertToPercent ? String(numberVal * 100) : String(numberVal);
    };
  
    const convertDistribution = (dist, amtOrPct) => {
      if (!dist || !dist.type) return { type: "fixed", value: "" };
  
      const isPercent = isEdit && amtOrPct === "percent";
  
      if (dist.type === "fixed") {
        return {
          type: "fixed",
          value: asString(dist.value, isPercent),
        };
      }
  
      if (dist.type === "normal") {
        return {
          type: "normal",
          mean: asString(dist.mean, isPercent),
          stdev: asString(dist.stdev, isPercent),
        };
      }
  
      return dist;
    };
  
    const expectedAnnualReturn =
      original.expectedAnnualReturn || original.returnDistribution;
    const expectedAnnualIncome =
      original.expectedAnnualIncome || original.incomeDistribution;
  
    setNewInvestmentType({
      name: original.name || "",
      description: original.description || "",
      returnAmtOrPct: original.returnAmtOrPct || "percent",
      returnDistribution: convertDistribution(expectedAnnualReturn, original.returnAmtOrPct),
      expenseRatio: asString(original.expenseRatio, isEdit),
      incomeAmtOrPct: original.incomeAmtOrPct || "percent",
      incomeDistribution: convertDistribution(expectedAnnualIncome, original.incomeAmtOrPct),
      taxability:
        original.taxability !== undefined ? original.taxability : true,
    });
  
    setEditIndex(index);
    setShowInvestmentTypeModal(true);
  };
  
  const handleDeleteInvestmentType = (index) => {
    const updated = [...investmentTypes];
    updated.splice(index, 1);
    setInvestmentTypes(updated);
  };

  const renderInvestmentTypeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl space-y-4">
        <h2 className="text-lg font-semibold">Add Investment Type</h2>
  
        <input
          placeholder="Name"
          value={newInvestmentType.name}
          onChange={(e) => setNewInvestmentType({ ...newInvestmentType, name: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
  
        <input
          placeholder="Description"
          value={newInvestmentType.description}
          onChange={(e) => setNewInvestmentType({ ...newInvestmentType, description: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
  
        <input
          type="text"
          inputMode="decimal"
          pattern="^\d*\.?\d*$"
          min="0"
          max="100"
          placeholder="Expense Ratio (%)"
          value={newInvestmentType.expenseRatio}
          onChange={(e) => {
            const val = e.target.value;
    if (val !== "" && (!/^\d*\.?\d*$/.test(val) || parseFloat(val) < 0 || parseFloat(val) > 100)) return;
            setNewInvestmentType({ ...newInvestmentType, expenseRatio: val });
          }}
          className="w-full border px-3 py-2 rounded pr-8"
        />
  
        {/* Return Distribution Section */}
        <label className="block font-medium mb-1">Return Format</label>
        <select
          value={newInvestmentType.returnAmtOrPct}
          onChange={(e) =>
            setNewInvestmentType({ ...newInvestmentType, returnAmtOrPct: e.target.value })
          }
          className="w-full border px-3 py-2 rounded mb-4"
        >
          <option value="amount">Amount ($)</option>
          <option value="percent">Percent (%)</option>
        </select>

        {/* Return Distribution Type Selector */}
        <label className="block font-medium mb-1">Expected Annual Return</label>
        <select
          value={newInvestmentType.returnDistribution.type}
          onChange={(e) => {
            const distType = e.target.value;
            const newDist = { type: distType };

            if (distType === "fixed") newDist.value = "";
            else if (distType === "normal") {
              newDist.mean = "";
              newDist.stdev = "";
            }

            setNewInvestmentType({
              ...newInvestmentType,
              returnDistribution: newDist,
            });
          }}
          className="w-full border px-3 py-2 rounded mb-4"
        >
          <option value="fixed">Fixed</option>
          <option value="normal">Normal Distribution</option>
        </select>

        {/* Conditionally Render Return Inputs */}
        {newInvestmentType.returnDistribution.type === "fixed" && (
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm pointer-events-none">
              {newInvestmentType.returnAmtOrPct === "amount" ? "$" : "%"}
            </span>
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*"
              placeholder={
                newInvestmentType.returnAmtOrPct === "amount" ? "e.g. 500" : "e.g. 5"
              }
              className="pl-7 pr-3 border border-gray-300 rounded-md py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={newInvestmentType.returnDistribution.value}
              onChange={(e) =>
                setNewInvestmentType({
                  ...newInvestmentType,
                  returnDistribution: {
                    ...newInvestmentType.returnDistribution,
                    value: e.target.value.replace(/\D/g, ""),
                  },
                })
              }
            />
          </div>
        )}

        {newInvestmentType.returnDistribution.type === "normal" && (
          <div className="flex gap-2">
            <input
              type="number"
              placeholder={
                newInvestmentType.returnAmtOrPct === "amount" ? "Mean ($)" : "Mean (%)"
              }
              value={newInvestmentType.returnDistribution.mean || ""}
              onChange={(e) =>
                setNewInvestmentType({
                  ...newInvestmentType,
                  returnDistribution: {
                    ...newInvestmentType.returnDistribution,
                    mean: e.target.value,
                  },
                })
              }
              className="w-1/2 border px-3 py-2 rounded"
            />
            <input
              type="number"
              placeholder={
                newInvestmentType.returnAmtOrPct === "amount" ? "Stdev ($)" : "Stdev (%)"
              }
              value={newInvestmentType.returnDistribution.stdev || ""}
              onChange={(e) =>
                setNewInvestmentType({
                  ...newInvestmentType,
                  returnDistribution: {
                    ...newInvestmentType.returnDistribution,
                    stdev: e.target.value,
                  },
                })
              }
              className="w-1/2 border px-3 py-2 rounded"
            />
          </div>
        )}
  
        {/* Income Distribution Section */}
        <label className="block font-medium mb-1 mt-4">Income Format</label>
        <select
          value={newInvestmentType.incomeAmtOrPct}
          onChange={(e) =>
            setNewInvestmentType({ ...newInvestmentType, incomeAmtOrPct: e.target.value })
          }
          className="w-full border px-3 py-2 rounded mb-4"
        >
          <option value="amount">Amount ($)</option>
          <option value="percent">Percent (%)</option>
        </select>

        {/* Income Distribution Type */}
        <label className="block font-medium mb-1">Expected Annual Income</label>
        <select
          value={newInvestmentType.incomeDistribution.type}
          onChange={(e) => {
            const distType = e.target.value;
            const newDist = { type: distType };

            if (distType === "fixed") newDist.value = "";
            else if (distType === "normal") {
              newDist.mean = "";
              newDist.stdev = "";
            }

            setNewInvestmentType({
              ...newInvestmentType,
              incomeDistribution: newDist,
            });
          }}
          className="w-full border px-3 py-2 rounded mb-4"
        >
          <option value="fixed">Fixed</option>
          <option value="normal">Normal Distribution</option>
        </select>

        {/* Conditionally Render Income Inputs */}
        {newInvestmentType.incomeDistribution.type === "fixed" && (
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm pointer-events-none">
              {newInvestmentType.incomeAmtOrPct === "amount" ? "$" : "%"}
            </span>
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*"
              placeholder={
                newInvestmentType.incomeAmtOrPct === "amount" ? "e.g. 300" : "e.g. 3"
              }
              className="pl-7 pr-3 border border-gray-300 rounded-md py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={newInvestmentType.incomeDistribution.value}
              onChange={(e) =>
                setNewInvestmentType({
                  ...newInvestmentType,
                  incomeDistribution: {
                    ...newInvestmentType.incomeDistribution,
                    value: e.target.value.replace(/\D/g, ""),
                  },
                })
              }
            />
          </div>
        )}

        {newInvestmentType.incomeDistribution.type === "normal" && (
          <div className="flex gap-2">
            <input
              type="number"
              placeholder={
                newInvestmentType.incomeAmtOrPct === "amount" ? "Mean ($)" : "Mean (%)"
              }
              value={newInvestmentType.incomeDistribution.mean || ""}
              onChange={(e) =>
                setNewInvestmentType({
                  ...newInvestmentType,
                  incomeDistribution: {
                    ...newInvestmentType.incomeDistribution,
                    mean: e.target.value,
                  },
                })
              }
              className="w-1/2 border px-3 py-2 rounded"
            />
            <input
              type="number"
              placeholder={
                newInvestmentType.incomeAmtOrPct === "amount" ? "Stdev ($)" : "Stdev (%)"
              }
              value={newInvestmentType.incomeDistribution.stdev || ""}
              onChange={(e) =>
                setNewInvestmentType({
                  ...newInvestmentType,
                  incomeDistribution: {
                    ...newInvestmentType.incomeDistribution,
                    stdev: e.target.value,
                  },
                })
              }
              className="w-1/2 border px-3 py-2 rounded"
            />
          </div>
        )}
  
        {/* Taxability Section */}
        <div>
          <label className="block font-medium mb-1">Taxability</label>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="taxability"
                value="true"
                checked={newInvestmentType.taxability === true}
                onChange={() => setNewInvestmentType({ ...newInvestmentType, taxability: true })}
                className="mr-2"
              />
              Taxable
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="taxability"
                value="false"
                checked={newInvestmentType.taxability === false}
                onChange={() => setNewInvestmentType({ ...newInvestmentType, taxability: false })}
                className="mr-2"
              />
              Tax-Exempt
            </label>
          </div>
        </div>
  
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
                setShowInvestmentTypeModal(false);
                setNewInvestmentType({
                  name: "",
                  description: "",
                  returnAmtOrPct: "percent",
                  returnDistribution: { type: "fixed", value: "" },
                  expenseRatio: "",
                  incomeAmtOrPct: "percent",
                  incomeDistribution: { type: "fixed", value: "" },
                  taxability: true,
                });
                setEditIndex(null); // ← this is important
              }}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
  
          <button
            onClick={addInvestmentType}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Add Type
          </button>
        </div>
      </div>
    </div>
  );
  
  return {
    investments,
    setInvestments,
    investmentTypes,
    setInvestmentTypes,
    showInvestmentTypeModal,
    setShowInvestmentTypeModal,
    newInvestmentType,
    setNewInvestmentType,
    investmentStatusOptions,
    handleInvestmentChange,
    addInvestment,
    removeInvestment,
    addInvestmentType,
    renderInvestmentTypeModal,
    handleEditInvestmentType,
    handleDeleteInvestmentType,
  };
}
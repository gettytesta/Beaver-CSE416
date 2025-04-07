import { useState } from "react";

export default function useInvestments() {
  // ================== INVESTMENTS INFO SECTION ==================
  const [investments, setInvestments] = useState([{ value: "", taxStatus: "", type: "" }]);
  const [investmentTypes, setInvestmentTypes] = useState([]);
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
    setInvestments([...investments, { value: "", taxStatus: "", type: "" }]);
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
    setNewInvestmentType(investmentTypes[index]);
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
          pattern="[0-9]*"
          min="0"
          max="100"
          placeholder="Expense Ratio (%)"
          value={newInvestmentType.expenseRatio}
          onChange={(e) => {
            let val = e.target.value.replace(/[^\d.]/g, "");
            if (val !== "" && (isNaN(val) || parseFloat(val) < 0 || parseFloat(val) > 100)) return;
            setNewInvestmentType({ ...newInvestmentType, expenseRatio: val });
          }}
          className="w-full border px-3 py-2 rounded pr-8"
        />
  
        {/* Return Distribution Section */}
        <div>
          <label className="block font-medium">Expected Annual Return</label>
          <select
            value={newInvestmentType.returnDistribution.type}
            onChange={(e) => {
              const newType = e.target.value;
              let returnValue = {};
              if (newType === "fixed" || newType === "percent") returnValue = { value: "" };
              else if (newType === "normal") returnValue = { mean: "", stdev: "" };
              setNewInvestmentType({
                ...newInvestmentType,
                returnDistribution: { type: newType, ...returnValue },
              });
            }}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="fixed">Fixed</option>
            <option value="percent">Percent</option>
            <option value="normal">Normal Distribution</option>
          </select>
        </div>
  
        {newInvestmentType.returnDistribution.type === "fixed" && (
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm pointer-events-none">$</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="e.g. 500"
              className="pl-7 pr-3 border border-gray-300 rounded-md py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={newInvestmentType.returnDistribution.value}
              onChange={(e) =>
                setNewInvestmentType({
                  ...newInvestmentType,
                  returnDistribution: {
                    ...newInvestmentType.returnDistribution,
                    value: e.target.value.replace(/\D/g, "")
                  }
                })
              }
            />
          </div>
        )}
  
        {newInvestmentType.returnDistribution.type === "percent" && (
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              pattern="^\d*\.?\d*$"
              placeholder="e.g. 7"
              className="pl-3 pr-7 border border-gray-300 rounded-md py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={newInvestmentType.returnDistribution.value}
              onChange={(e) => {
                let val = e.target.value;
                if (/^\d*\.?\d*$/.test(val)) {
                  if (parseFloat(val) <= 100 || val === "") {
                    setNewInvestmentType({
                      ...newInvestmentType,
                      returnDistribution: {
                        ...newInvestmentType.returnDistribution,
                        value: val
                      }
                    });
                  }
                }
              }}
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm pointer-events-none">%</span>
          </div>
        )}
  
        {newInvestmentType.returnDistribution.type === "normal" && (
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Mean"
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
              placeholder="Stdev"
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
        <div>
          <label className="block font-medium">Expected Annual Income</label>
          <select
            value={newInvestmentType.incomeDistribution.type}
            onChange={(e) => {
              const newType = e.target.value;
              let incomeValue = {};
              if (newType === "fixed" || newType === "percent") incomeValue = { value: "" };
              else if (newType === "normal") incomeValue = { mean: "", stdev: "" };
              setNewInvestmentType({
                ...newInvestmentType,
                incomeDistribution: { type: newType, ...incomeValue },
              });
            }}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="fixed">Fixed</option>
            <option value="percent">Percent</option>
            <option value="normal">Normal Distribution</option>
          </select>
        </div>
  
        {newInvestmentType.incomeDistribution.type === "fixed" && (
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm pointer-events-none">$</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="e.g. 300"
              className="pl-7 pr-3 border border-gray-300 rounded-md py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={newInvestmentType.incomeDistribution.value}
              onChange={(e) =>
                setNewInvestmentType({
                  ...newInvestmentType,
                  incomeDistribution: {
                    ...newInvestmentType.incomeDistribution,
                    value: e.target.value.replace(/\D/g, "")
                  },
                })
              }
            />
          </div>
        )}
  
        {newInvestmentType.incomeDistribution.type === "percent" && (
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              pattern="^\d*\.?\d*$"
              placeholder="e.g. 3"
              className="pl-3 pr-7 border border-gray-300 rounded-md py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={newInvestmentType.incomeDistribution.value}
              onChange={(e) => {
                let val = e.target.value;
                if (/^\d*\.?\d*$/.test(val)) {
                  if (parseFloat(val) <= 100 || val === "") {
                    setNewInvestmentType({
                      ...newInvestmentType,
                      incomeDistribution: {
                        ...newInvestmentType.incomeDistribution,
                        value: val,
                      },
                    });
                  }
                }
              }}
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm pointer-events-none">%</span>
          </div>
        )}
  
        {newInvestmentType.incomeDistribution.type === "normal" && (
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Mean"
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
              placeholder="Stdev"
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
export default function InflationAssumption({ inflation, setInflation }) {
    const handleTypeChange = (e) => {
      const newType = e.target.value;
      let newValue = {};
      if (newType === "fixed") newValue = { value: "" };
      else if (newType === "normal") newValue = { mean: "", stdev: "" };
      else if (newType === "uniform") newValue = { lower: "", upper: "" };
      setInflation({ type: newType, ...newValue });
    };
  
    return (
      <div className="w-full border border-gray-300 rounded-md p-6 mt-8 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Inflation Assumption</h2>
  
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inflation Type</label>
            <select
              value={inflation.type}
              onChange={handleTypeChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="fixed">Fixed</option>
              <option value="normal">Normal Distribution</option>
              <option value="uniform">Uniform Distribution</option>
            </select>
          </div>
  
          {inflation.type === "fixed" && (
            <div className="relative">
              <input
                type="number"
                placeholder="e.g. 2.5"
                className="w-full border px-3 py-2 rounded pr-10"
                value={inflation.value}
                onChange={(e) => setInflation({ ...inflation, value: e.target.value })}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
          )}
  
          {inflation.type === "normal" && (
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Mean %"
                className="w-1/2 border px-3 py-2 rounded"
                value={inflation.mean}
                onChange={(e) => setInflation({ ...inflation, mean: e.target.value })}
              />
              <input
                type="number"
                placeholder="Stdev %"
                className="w-1/2 border px-3 py-2 rounded"
                value={inflation.stdev}
                onChange={(e) => setInflation({ ...inflation, stdev: e.target.value })}
              />
            </div>
          )}
  
          {inflation.type === "uniform" && (
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Lower Bound %"
                className="w-1/2 border px-3 py-2 rounded"
                value={inflation.lower}
                onChange={(e) => setInflation({ ...inflation, lower: e.target.value })}
              />
              <input
                type="number"
                placeholder="Upper Bound %"
                className="w-1/2 border px-3 py-2 rounded"
                value={inflation.upper}
                onChange={(e) => setInflation({ ...inflation, upper: e.target.value })}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
  
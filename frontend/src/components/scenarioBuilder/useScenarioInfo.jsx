import { useState, useRef, useEffect } from "react";
import axios from "axios"; 
import { useMemo } from "react";

export default function useScenarioInfo() {
  const [filingStatus, setFilingStatus] = useState("single");
  const [state, setState] = useState("NONE");
  const [scenarioName, setScenarioName] = useState("");
  const [retirementAges, setRetirementAges] = useState([""]);
  const [financialGoal, setFinancialGoal] = useState("");
  const [birthYears, setBirthYears] = useState([""]);
  const [showLifespanModal, setShowLifespanModal] = useState(false);
  const [lifespanValues, setLifespanValues] = useState([{ type: "fixed", value: "" }]);
  const [ignoreStateTax, setIgnoreStateTax] = useState(false);
  const [userRetireContributionLimit, setUserRetireContributionLimit] = useState("");
  const [spouseRetireContributionLimit, setSpouseRetireContributionLimit] = useState("");

  const fileInputRef = useRef(null);
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 125 }, (_, i) => `${currentYear - i}`);

  const states = [
    { name: "No State Taxes", code: "NONE" },
    { name: "Alabama", code: "AL" },
    { name: "Alaska", code: "AK" },
    { name: "Arizona", code: "AZ" },
    { name: "Arkansas", code: "AR" },
    { name: "California", code: "CA" },
    { name: "Colorado", code: "CO" },
    { name: "Connecticut", code: "CT" },
    { name: "Delaware", code: "DE" },
    { name: "District of Columbia", code: "DC" },
    { name: "Florida", code: "FL" },
    { name: "Georgia", code: "GA" },
    { name: "Hawaii", code: "HI" },
    { name: "Idaho", code: "ID" },
    { name: "Illinois", code: "IL" },
    { name: "Indiana", code: "IN" },
    { name: "Iowa", code: "IA" },
    { name: "Kansas", code: "KS" },
    { name: "Kentucky", code: "KY" },
    { name: "Louisiana", code: "LA" },
    { name: "Maine", code: "ME" },
    { name: "Maryland", code: "MD" },
    { name: "Massachusetts", code: "MA" },
    { name: "Michigan", code: "MI" },
    { name: "Minnesota", code: "MN" },
    { name: "Mississippi", code: "MS" },
    { name: "Missouri", code: "MO" },
    { name: "Montana", code: "MT" },
    { name: "Nebraska", code: "NE" },
    { name: "Nevada", code: "NV" },
    { name: "New Hampshire", code: "NH" },
    { name: "New Jersey", code: "NJ" },
    { name: "New Mexico", code: "NM" },
    { name: "New York", code: "NY" },
    { name: "North Carolina", code: "NC" },
    { name: "North Dakota", code: "ND" },
    { name: "Ohio", code: "OH" },
    { name: "Oklahoma", code: "OK" },
    { name: "Oregon", code: "OR" },
    { name: "Pennsylvania", code: "PA" },
    { name: "Rhode Island", code: "RI" },
    { name: "South Carolina", code: "SC" },
    { name: "South Dakota", code: "SD" },
    { name: "Tennessee", code: "TN" },
    { name: "Texas", code: "TX" },
    { name: "Utah", code: "UT" },
    { name: "Vermont", code: "VT" },
    { name: "Virginia", code: "VA" },
    { name: "Washington", code: "WA" },
    { name: "West Virginia", code: "WV" },
    { name: "Wisconsin", code: "WI" },
    { name: "Wyoming", code: "WY" }
  ];

  const [supportedStates, setSupportedStates] = useState([]);

  useEffect(() => {
    const fetchAvailableStates = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/yaml/statetax/available`);
        if (res.data.success) {
          setSupportedStates(res.data.data); // array like ["NY", "NJ", "CT"]
        }
      } catch (err) {
        console.error("Failed to fetch supported state tax files:", err);
      }
    };

    fetchAvailableStates();
  }, []);

  const stateRequiresUpload = useMemo(() => {
    return state !== "NONE" && !supportedStates.includes(state);
  }, [state, supportedStates]); //NO STATE TAXES DOESNT SHOW MESSAGE TO IGNORE


  const handleYamlUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('selectedStateCode', state); // <- Required for backend validation
  
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/yaml/statetax/upload`,
        formData,
        { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
      );
  
      if (res.data.success) {
        alert(`YAML file for ${state} uploaded successfully.`);
  
        // ✅ Re-fetch supported states
        const refresh = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/yaml/statetax/available`);
        if (refresh.data.success) {
          setSupportedStates(refresh.data.data);
        }
  
        //Reset ignore flag if user had clicked "Ignore"
        setIgnoreStateTax(false);
      } else {
        alert(`Upload failed: ${res.data.message}`);
      }
    } catch (err) {
      console.error("YAML Upload Error:", err.response?.data || err.message);
      alert("❌ Error uploading YAML file.");
    }
  };
  

  const handleBirthYearChange = (index, value) => {
    const updated = [...birthYears];
    updated[index] = value;
    setBirthYears(updated);
  };

  const handleRetirementAgeChange = (index, value) => {
    const updated = [...retirementAges];
    updated[index] = value;
    setRetirementAges(updated);
  };

  const handleLifespanTypeChange = (index, type) => {
    const updated = [...lifespanValues];
    if (type === "fixed") {
      updated[index] = { type: "fixed", value: "" };
    } else {
      updated[index] = { type: "normal", mean: "", stdev: "" };
    }
    setLifespanValues(updated);
  };

  const handleLifespanValueChange = (index, key, value) => {
    const updated = [...lifespanValues];
    updated[index][key] = value;
    setLifespanValues(updated);
  };

  const handleFilingStatusChange = (status) => {
    setFilingStatus(status);
    if (status === "single") {
      setBirthYears([birthYears[0] || ""]);
      setRetirementAges([retirementAges[0] || ""]);
      setLifespanValues([lifespanValues[0] || { type: "fixed", value: "" }]);
    } else {
      setBirthYears([birthYears[0] || "", birthYears[1] || ""]);
      setRetirementAges([retirementAges[0] || "", retirementAges[1] || ""]);
      setLifespanValues([
        lifespanValues[0] || { type: "fixed", value: "" },
        lifespanValues[1] || { type: "fixed", value: "" }
      ]);
    }
  };

  useEffect(() => {
    setIgnoreStateTax(false);
  }, [state]);

  const renderYearDropdown = (label, index, placeholder) => (
    <div className="flex flex-col">
      <label className="text-sm text-gray-600 mb-1">{label}</label>
      <select
        value={birthYears[index] || ""}
        onChange={(e) => handleBirthYearChange(index, e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 w-[180px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <option value="">{placeholder}</option>
        {yearOptions.map((year) => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
    </div>
  );

  const renderRetirementAge = (label, index, placeholder) => (
    <div className="flex flex-col">
      <label className="text-sm text-gray-600 mb-1">{label}</label>
      <input
        type="number"
        min="0"
        placeholder={placeholder}
        className="border border-gray-300 rounded-md px-3 py-2 w-[180px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
        value={retirementAges[index] || ""}
        onChange={(e) => handleRetirementAgeChange(index, e.target.value)}
      />
    </div>
  );

  const renderLifespanModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-xl space-y-6">
        <h2 className="text-lg font-semibold">Life Expectancy</h2>
        {[...Array(filingStatus === "married" ? 2 : 1)].map((_, index) => (
          <div key={index} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {filingStatus === "married" && index === 1 ? "Spouse" : "User"} Life Expectancy
            </label>
            <select
              value={lifespanValues[index]?.type || "fixed"}
              onChange={(e) => handleLifespanTypeChange(index, e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            >
              <option value="fixed">Fixed</option>
              <option value="normal">Normal (Dist.)</option>
            </select>
            {lifespanValues[index]?.type === "fixed" ? (
              <input
                type="number"
                placeholder="e.g. 80"
                value={lifespanValues[index]?.value || ""}
                onChange={(e) => handleLifespanValueChange(index, "value", e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
              />
            ) : (
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Mean"
                  value={lifespanValues[index]?.mean || ""}
                  onChange={(e) => handleLifespanValueChange(index, "mean", e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-1/2"
                />
                <input
                  type="number"
                  placeholder="Stdev"
                  value={lifespanValues[index]?.stdev || ""}
                  onChange={(e) => handleLifespanValueChange(index, "stdev", e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-1/2"
                />
              </div>
            )}
          </div>
        ))}
        <div className="flex justify-end gap-3">
          <button onClick={() => setShowLifespanModal(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded">
            Cancel
          </button>
          <button onClick={() => setShowLifespanModal(false)} className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return {
    filingStatus,
    setFilingStatus,
    state,
    setState,
    scenarioName,
    setScenarioName,
    retirementAges,
    setRetirementAges,
    financialGoal,
    setFinancialGoal,
    birthYears,
    setBirthYears,
    showLifespanModal,
    setShowLifespanModal,
    lifespanValues,
    setLifespanValues,
    fileInputRef,
    yearOptions,
    states,
    stateRequiresUpload,
    handleYamlUpload,
    handleBirthYearChange,
    handleRetirementAgeChange,
    handleLifespanTypeChange,
    handleLifespanValueChange,
    handleFilingStatusChange,
    renderYearDropdown,
    renderRetirementAge,
    renderLifespanModal,
    ignoreStateTax,             
    setIgnoreStateTax,
    supportedStates,
    userRetireContributionLimit,
    setUserRetireContributionLimit,
    spouseRetireContributionLimit,
    setSpouseRetireContributionLimit,
  };
}

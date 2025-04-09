"use client";


// TP: ChatGPT. Prompt: "I need help with UI/UX challenges in a complex scenario builder page, such as modals, dropdowns, and popups.
// Also looking to implement drag-and-drop reordering for investments."
//
// Since this file grew large over time, I asked ChatGPT several specific questions throughout development, mostly related to 
// UI/UX implementation. It helped me design and refine interactive elements like modals, dropdown menus, popups, 
// and drag-and-drop behavior for investment ordering. The backend is not yet connected — the current focus is frontend interaction and layout.



import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useRef } from "react";
// Check if the user is a guest or not
import ScenarioInfo from "./scenarioBuilder/ScenarioInfo";
import useScenarioInfo from "./scenarioBuilder/useScenarioInfo";
import Investments from "./scenarioBuilder/Investments";
import useInvestments from "./scenarioBuilder/useInvestments";
import EventSeries from "./scenarioBuilder/EventSeries";
import useEventSeries from "./scenarioBuilder/useEventSeries"; 
import EventModal from "./scenarioBuilder/EventModal"; 
import SpendingStrategy from './scenarioBuilder/SpendingStrategy';
import ExpenseWithdrawalStrategy from './scenarioBuilder/ExpenseWithdrawalStrategy';
import InflationAssumption from "./scenarioBuilder/InflationAssumption";
import RothConversionOptimizer from './scenarioBuilder/RothConversionOptimizer';
import RmdStrategy from "./scenarioBuilder/RmdStrategy";


export default function AddScenario() {

  // ================== SCENARIO INFO SECTION ==================
  const {
    filingStatus,
    setFilingStatus,
    birthYears,
    setBirthYears,
    retirementAges,
    setRetirementAges,
    lifespanTypes,
    setLifespanTypes,
    lifespanValues,
    setLifespanValues,
    state,
    setState,
    states,
    stateRequiresUpload,
    fileInputRef,
    handleYamlUpload,
    handleFilingStatusChange,
    financialGoal,
    setFinancialGoal,
    scenarioName,
    setScenarioName,
    renderYearDropdown,
    renderRetirementAge,
    renderLifespanModal,
    showLifespanModal,
    setShowLifespanModal,
    ignoreStateTax,             
    setIgnoreStateTax
  } = useScenarioInfo();
  //components/UseScenarioInfo.jsx to edit this

  // ================== INVESTMENTS SECTION ==================
  const {
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
  } = useInvestments();

  // ================== EVENT SERIES SECTION ==================
  const {
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
  } = useEventSeries();
  
  // ================== Spending Strategy SECTION ==================
 //TEMP DUMMY DATA
  const [spendingStrategy, setSpendingStrategy] = useState([
    { id: "expense-a", name: "Discretionary Expense A" },
    { id: "expense-b", name: "Discretionary Expense B" },
  ]);
  
  // ================== Expense withdrawal strategy  SECTION ==================
  const [withdrawalStrategy, setWithdrawalStrategy] = useState([]);
  const dummyInvestmentNames = ["Investment X", "Investment Y", "Investment Z"];

  // ================== Inflation Assumption  SECTION ==================
  const [inflation, setInflation] = useState({
    type: "fixed",
    value: ""
  });

  // ================== Roth Conversion Optimizer  SECTION ==================
  //TEMP DUMMY DATA ONCE AGAIN
  const [enableRothConversion, setEnableRothConversion] = useState(false);
  const [rothStartYear, setRothStartYear] = useState("");
  const [rothEndYear, setRothEndYear] = useState("");
  const [rothConversionStrategy, setRothConversionStrategy] = useState([
    "Traditional 401k",
    "IRA",
    "Pre-Tax Mutual Fund"
  ]);

// ================== RMD STRATEGY  SECTION =================
  const [rmdStrategy, setRmdStrategy] = useState([]);

// ================== CHECK IF USER IS GUEST ==================
  // Retrieves the guest session from sessionStorage. Will be null if the user is not a guest.
  const guestSession = JSON.parse(sessionStorage.getItem("guestSession"));

  return (
    <div className="w-full px-4 mt-20">
      {showLifespanModal && renderLifespanModal()}
      {showInvestmentTypeModal && renderInvestmentTypeModal()}

      {/* Scenario Info Section */}
      <ScenarioInfo
        filingStatus={filingStatus}
        onFilingStatusChange={handleFilingStatusChange}
        birthYears={birthYears}
        setBirthYears={setBirthYears}
        retirementAges={retirementAges}
        setRetirementAges={setRetirementAges}
        lifespanTypes={lifespanTypes}
        setLifespanTypes={setLifespanTypes}
        lifespanValues={lifespanValues}
        setLifespanValues={setLifespanValues}
        state={state}
        setState={setState}
        states={states}
        stateRequiresUpload={stateRequiresUpload}
        fileInputRef={fileInputRef}
        handleYamlUpload={handleYamlUpload}
        financialGoal={financialGoal}
        setFinancialGoal={setFinancialGoal}
        scenarioName={scenarioName}
        setScenarioName={setScenarioName}
        setShowLifespanModal={setShowLifespanModal}
        renderYearDropdown={renderYearDropdown}
        renderRetirementAge={renderRetirementAge}
        ignoreStateTax={ignoreStateTax}
        setIgnoreStateTax={setIgnoreStateTax}
      />

      {/* Investments Section */}
      <Investments
        investments={investments}
        investmentTypes={investmentTypes}
        setShowInvestmentTypeModal={setShowInvestmentTypeModal}
        handleInvestmentChange={handleInvestmentChange}
        addInvestment={addInvestment}
        removeInvestment={removeInvestment}
        handleEditInvestmentType={handleEditInvestmentType}
        handleDeleteInvestmentType={handleDeleteInvestmentType}
      />

      {/* Event Series Section */}
      <EventSeries
        eventSeries={eventSeries}
        setEventSeries={setEventSeries}
        editingEventIndex={editingEventIndex}
        setEditingEventIndex={setEditingEventIndex}
        showEventModal={showEventModal}
        setShowEventModal={setShowEventModal}
        tempEvent={tempEvent}
        setTempEvent={setTempEvent}
        filingStatus={filingStatus}
        investments={investments}
        openEventModal={openEventModal}
        removeEventSeries={removeEventSeries}
        addEventSeries={addEventSeries}
      />

      {/* Spending Strategy Section */}
      <SpendingStrategy
        spendingStrategy={spendingStrategy}
        setSpendingStrategy={setSpendingStrategy}
      />

      {/* Expense Withdrawal Strategy Section */}
      <ExpenseWithdrawalStrategy
        dummyInvestmentNames={dummyInvestmentNames}
        withdrawalStrategy={withdrawalStrategy}
        setWithdrawalStrategy={setWithdrawalStrategy}
      />

      {/* Inflation Assumption Section */}
      <InflationAssumption inflation={inflation} setInflation={setInflation} />

      {/* Roth Conversion Optimizer */}
      <RothConversionOptimizer
        enableRothConversion={enableRothConversion}
        setEnableRothConversion={setEnableRothConversion}
        rothStartYear={rothStartYear}
        setRothStartYear={setRothStartYear}
        rothEndYear={rothEndYear}
        setRothEndYear={setRothEndYear}
        rothConversionStrategy={rothConversionStrategy}
        setRothConversionStrategy={setRothConversionStrategy}
      />

      {/* RMD Strategy Section  NEED TO FIX THIS LATER EEEEEEEEEEEEEEEE*/}
      <RmdStrategy
        rmdStrategy={rmdStrategy}
        setRmdStrategy={setRmdStrategy}
      />
        
    {/* Save button*/}
    <div className="w-full mt-8 mb-8 flex justify-center">
      <button
        onClick={() => {
          // Logic to save the scenario can go here
          // TODO - CREATE THE SCENARIO OBJECT
          
          // Checks if the user is a guest or not
          // Checks if a local session exists for a guest
          if (guestSession && guestSession.isGuest) {
            alert("guest user, session works")
            // TODO - SAVE THE SCENARIO TO THE GUEST SESSION
            guestSession.scenarioName = scenarioName;
            sessionStorage.setItem("guestSession", JSON.stringify(guestSession));
          } else {
            alert("not a guest user, session works")
          }
          alert("Scenario saved!");
        }}
        className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Save Scenario
      </button>
    </div>



</div> 
);
}
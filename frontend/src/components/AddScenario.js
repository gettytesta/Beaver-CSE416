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
import { useState, useRef, useEffect } from "react";
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
import axios from "axios";
import { useRouter } from "next/navigation";





export default function AddScenario({ isEdit = false, scenarioId = null, prefilledScenario = null }) {

  

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
    setIgnoreStateTax,
    supportedStates
  } = useScenarioInfo();
  //components/UseScenarioInfo.jsx to edit this
  //get rid of supported states?

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

  useEffect(() => {
    if (!isEdit || !prefilledScenario) return;
  
    console.log("🔁 Prefilling scenario:", prefilledScenario);
  
    // Scenario Info
    setScenarioName(prefilledScenario.name || "");
    setFilingStatus(prefilledScenario.isMarriedCouple ? "married" : "single");
    setBirthYears([
      prefilledScenario.userBirthYear || "",
      prefilledScenario.spouseBirthYear || ""
    ]);
    setRetirementAges([
      prefilledScenario.userRetirementAge || "",
      prefilledScenario.spouseRetirementAge || ""
    ]);
    setLifespanValues([
      prefilledScenario.userLifeExpectancy || {},
      prefilledScenario.spouseLifeExpectancy || {}
    ]);
    setState(prefilledScenario.userStateOfResidence || "");
    setFinancialGoal(prefilledScenario.financialGoal || "");
    setIgnoreStateTax(prefilledScenario.stateTaxStatus === "ignored");
  
    // Investments
    setInvestments(prefilledScenario.investments || []);
    const types = (prefilledScenario.investments || []).map(inv => inv.type);
    setInvestments(
      (prefilledScenario.investments || []).map((inv) => ({
        ...inv,
        type: inv.type.name,               // flatten embedded type back to name
        taxStatus: inv.accountTaxStatus,   // assign tax status for dropdown
      }))
    );
  
    // Event Series
    setEventSeries(prefilledScenario.eventSeriesSet || []);
  
    // Inflation Assumption
    setInflation(prefilledScenario.inflationAssumption || { type: "fixed", value: "" });
  
    // Strategies
    setSpendingStrategy((prefilledScenario.spendingStrategy || []).map(id => ({ id, name: id })));
    setWithdrawalStrategy((prefilledScenario.expenseWithdrawalStrategy || []).map(id => ({ id, name: id })));
    setRmdStrategy((prefilledScenario.rmdStrategy || []).map(id => ({ id, name: id })));
  
    // Roth Conversion
    setEnableRothConversion(prefilledScenario.rothConversionOpt || false);
    setRothStartYear(prefilledScenario.rothConversionStart || "");
    setRothEndYear(prefilledScenario.rothConversionEnd || "");
    setRothConversionStrategy((prefilledScenario.rothConversionStrategy || []).map(id => ({ id, name: id })));
  
  }, [isEdit, prefilledScenario]);
  
  // ================== Spending Strategy SECTION ==================
  useEffect(() => {
    const discretionaryExpenses = eventSeries
      .filter(
        (event) =>
          event.type === "expense" &&
          (event.expense?.discretionary ?? event.expense?.isDiscretionary)
      )
      .map((event, index) => ({
        id: event._id, // ✅ Already a UUID string
        name: event.name || `Unnamed Expense ${index + 1}`,
      }));
  
    console.log("💸 Discretionary expenses found:", discretionaryExpenses);
  
    setSpendingStrategy(discretionaryExpenses);
  }, [eventSeries]);
  

 const [spendingStrategy, setSpendingStrategy] = useState([]);

  
  // ================== Expense withdrawal strategy  SECTION ==================
  const [withdrawalStrategy, setWithdrawalStrategy] = useState([]);

  useEffect(() => {
    const orderedInvestments = investments.map((inv) => ({
      id: inv._id, // use actual unique _id
      name: `${inv.type} ${inv.taxStatus}`, // Format: InvestmentType + TaxStatus
    }));
    setWithdrawalStrategy(orderedInvestments);
  }, [investments]);
  

  // ================== Inflation Assumption  SECTION ==================
  const [inflation, setInflation] = useState({
    type: "fixed",
    value: ""
  });

  // ================== Roth Conversion Optimizer  SECTION ==================
  

  const [enableRothConversion, setEnableRothConversion] = useState(false);

const enableRothConversionRef = useRef(enableRothConversion);

useEffect(() => {
  enableRothConversionRef.current = enableRothConversion;
}, [enableRothConversion]);
  
  const [rothStartYear, setRothStartYear] = useState("");
  const [rothEndYear, setRothEndYear] = useState("");
  const [rothConversionStrategy, setRothConversionStrategy] = useState([]);
  useEffect(() => {
    if (enableRothConversion) {
      const pretaxInvestments = investments
        .filter((inv) => inv.taxStatus === "pre-tax")
        .map((inv, index) => ({
          id: inv._id, // for payload
          name: `${inv.type} ${inv.taxStatus}`,
        }));
      setRothConversionStrategy(pretaxInvestments);
    }
  }, [enableRothConversion, investments]);
  


// ================== RMD STRATEGY  SECTION =================
  const [rmdStrategy, setRmdStrategy] = useState([]);

  useEffect(() => {
    //Filter pre-tax retirement investments and set them for RMD strategy
    const preTaxInvestments = investments
      .filter((inv) => inv.taxStatus === "pre-tax")
      .map((inv) => ({
        id: inv._id,  
        name: `${inv.type} – ${inv.taxStatus}`,  // Format: InvestmentType + TaxStatus
      }));
  
    setRmdStrategy(preTaxInvestments); // Set the filtered list to the state
  }, [investments]); // Run the effect when `investments` change
  
/////////////////////////SAVE SCENARIO////////////////////////////////////
const router = useRouter();
// TP: ChatGPT. Prompt: "Help me debug a large save function for a scenario builder form. Where should I put console.logs? How can I inspect nested state?"
// 
// This function sends the scenario data to the backend. I used ChatGPT extensively to debug this logic,
// especially in figuring out how to inspect and format complex nested state like event series, strategies, and investment mappings.
// GPT helped me decide where to place `console.log` statements both here and across multiple components (like Investments, ScenarioInfo, etc.)
// to verify section-specific state and troubleshoot issues with form data and conditional rendering (e.g., for married vs single).
// It also guided the formatting of tricky fields like inflation assumptions, investment types, and UUID-based strategies.

  const handleSaveScenario = async () => {
    try {   

      //does backend have Statetax? if yes = used, if yes but ignored = ignored, if no state tax = none
      let stateTaxStatus = "used";
      if (state === "NONE") {
        stateTaxStatus = "none";
      } else if (ignoreStateTax) {
        stateTaxStatus = "ignored";
      }

      let inflationAssumption = { type: inflation.type };
        if (inflation.type === "fixed") {
          inflationAssumption.value = parseFloat(inflation.value);
        } else if (inflation.type === "normal") {
          inflationAssumption.mean = parseFloat(inflation.mean);
          inflationAssumption.stdev = parseFloat(inflation.stdev);
        } else if (inflation.type === "uniform") {
          inflationAssumption.lower = parseFloat(inflation.lower);
          inflationAssumption.upper = parseFloat(inflation.upper);
        }
      //Build payload
      const scenarioInfoPayload = {
        name: scenarioName,
        //userId: user?._id,
        isMarriedCouple: filingStatus === "married",
        userBirthYear: birthYears[0],
        spouseBirthYear: filingStatus === "married" ? birthYears[1] : undefined,
        userRetirementAge: retirementAges[0],
        spouseRetirementAge: filingStatus === "married" ? retirementAges[1] : undefined,
        userLifeExpectancy: lifespanValues[0],
        spouseLifeExpectancy: filingStatus === "married" ? lifespanValues[1] : undefined,
        userRetireContributionLimit: 0,
        spouseRetireContributionLimit: filingStatus === "married" ? 0 : undefined,
        userStateOfResidence: state,
        financialGoal: financialGoal,
        stateTaxStatus,
        //investments next
        investments: investments.map((inv) => {
          const invType = investmentTypes.find((type) => type.name === inv.type);
            return {
              id: inv._id, 
              type: {
                name: invType.name,
                description: invType.description,
                returnAmtOrPct: invType.returnAmtOrPct,
                expectedAnnualReturn: invType.returnDistribution,
                expenseRatio: parseFloat(invType.expenseRatio),
                incomeAmtOrPct: invType.incomeAmtOrPct,
                expectedAnnualIncome: invType.incomeDistribution,
                taxability: invType.taxability,
              },
              value: parseFloat(inv.value),
              accountTaxStatus: inv.taxStatus,
            };
          }),


        //event series: 
        eventSeriesSet: eventSeries.map((series) => {
          const { name, description, start, duration, type } = series;

          const cleanedStart = { type: start.type };
          if (start.type === "fixed") {
            cleanedStart.value = parseInt(start.value);
          } else if (start.type === "uniform") {
            cleanedStart.lower = parseInt(start.lower);
            cleanedStart.upper = parseInt(start.upper);
          } else if (start.type === "normal") {
            cleanedStart.mean = parseInt(start.mean);
            cleanedStart.stdev = parseInt(start.stdev);
          } else if (start.type === "startWith" || start.type === "startAfter") {
            cleanedStart.eventSeries = start.eventSeries;
          }

          const cleanedDuration = { type: duration.type };
          if (duration.type === "fixed") {
            cleanedDuration.value = parseInt(duration.value);
          } else if (duration.type === "uniform") {
            cleanedDuration.lower = parseInt(duration.lower);
            cleanedDuration.upper = parseInt(duration.upper);
          } else if (duration.type === "normal") {
            cleanedDuration.mean = parseInt(duration.mean);
            cleanedDuration.stdev = parseInt(duration.stdev);
          }

          const payload = {
            _id: series._id,
            name,
            description: description || "",
            start: cleanedStart,
            duration: cleanedDuration,
            type
          };

          //Add income type-specific fields
          if (type === "income") {
            payload.income = {
              initialAmount: parseFloat(series.income.initialAmount),
              changeAmtOrPct: series.income.changeAmtOrPct,
              changeDistribution: series.income.changeDistribution,
              adjustForInflation: !!series.income.adjustForInflation,
              userPct: filingStatus === "married" ? parseFloat(series.income.userPct) : undefined,
              isSocialSecurity: !!series.income.isSocialSecurity,
            };
          }

          if (type === "expense") {
            payload.expense = {
              initialAmount: parseFloat(series.expense.initialAmount),
              changeAmtOrPct: series.expense.changeAmtOrPct,
              changeDistribution: series.expense.changeDistribution,
              adjustForInflation: !!series.expense.adjustForInflation,
              discretionary: series.expense?.discretionary ?? false, // Default to false if not provided
              ...(filingStatus === "married" && {
                userPct: series.expense?.userPct ? parseFloat(series.expense.userPct) : 0,
              }),
            };
          }

           //
          if (type === "invest") {
            payload.invest = {
              allocationType: series.invest.allocationType, // "fixed" or "glide"
              selectedInvestments: series.invest.selected,  //assume already array of ObjectIds or names
              allocations: series.invest.allocations,       //{ investmentId: { value / initial+final } }
              maxCash: parseFloat(series.invest.maxCash || 0),
            };
          }

          if (type === "rebalance") {
            payload.rebalance = {
              allocationType: series.rebalance.allocationType, // "fixed" or "glide"
              selectedInvestments: series.rebalance.selected,  
              allocations: series.rebalance.allocations,
            };
          }

          return payload;
        }),


        spendingStrategy: spendingStrategy.map(item => item.name),

        expenseWithdrawalStrategy: withdrawalStrategy.length > 0 ? withdrawalStrategy.map((item) => item.id) : [],

        inflationAssumption: inflationAssumption,

        rmdStrategy: rmdStrategy.map(item => item.id),


      };
      if (enableRothConversionRef.current) {
        scenarioInfoPayload.rothConversionOpt = true;
        scenarioInfoPayload.rothConversionStart = parseInt(rothStartYear);
        scenarioInfoPayload.rothConversionEnd = parseInt(rothEndYear);
        scenarioInfoPayload.rothConversionStrategy = rothConversionStrategy.map((item) => item.id);
      }

    /*
      console.log("SCENARIO NAME:", scenarioName);
      console.log("FILING STATUS:", filingStatus);
      console.log("USER BIRTH YEAR:", birthYears[0]);
      console.log("SPOUSE BIRTH YEAR:", filingStatus === "married" ? birthYears[1] : "N/A");
      console.log("USER LIFE EXPECTANCY:", lifespanValues[0]);
      console.log("SPOUSE LIFE EXPECTANCY:", filingStatus === "married" ? lifespanValues[1] : "N/A");
      console.log("STATE OF RESIDENCE:", state);
      console.log("FINANCIAL GOAL:", financialGoal);
      console.log("INVESTMENTS:", investments);

      console.log("EVENTSERIES :", scenarioInfoPayload.eventSeriesSet);

      console.log("SpendingStrategy :", spendingStrategy);
      console.log("spendingStrategy payload:", spendingStrategy.map((item) => item.id))

      console.log("Withdrawal Strategy Mapping:", withdrawalStrategy);
      console.log("Mapped Expense Strategy:", withdrawalStrategy.map((item) => item.id));

      console.log("Inflation Assumption Payload:", inflationAssumption);

      //console.log("Roth Strategy Mapping:", rothConversionStrategy)*/



      

      console.log("Sending Scenario Info:", scenarioInfoPayload); // TEMP debug

      const res = isEdit
        ? await axios.put(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/scenarios/${scenarioId}`,
            scenarioInfoPayload,
            { withCredentials: true }
          )
        : await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/scenarios`,
            scenarioInfoPayload,
            { withCredentials: true }
          );

      if (res.data?.success) {
        router.push("/scenarios?showSuccessPopup=true");
      } else {
        alert("❌ Failed to save scenario.");
      }
    } catch (err) {
      console.error("Save scenario error:", err.response?.data || err.message);
      alert("❌ Error saving scenario.");
    }
  };

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
        investments={investments}
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
        onClick={handleSaveScenario}
        className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Save Scenario
      </button>
    </div>



</div> 
);
}
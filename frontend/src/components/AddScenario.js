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
    renderLifespanModal,
    showLifespanModal,
    setShowLifespanModal,
    ignoreStateTax,             
    setIgnoreStateTax,
    supportedStates,
    userRetireContributionLimit,
    setUserRetireContributionLimit,
  } = useScenarioInfo(prefilledScenario);
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
  } = useInvestments(prefilledScenario,isEdit);

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
  } = useEventSeries(prefilledScenario, isEdit);

  
  // ================== Spending Strategy SECTION ==================
  useEffect(() => {
    const discretionaryExpenses = eventSeries
      .filter(
        (event) =>
          event.type === "expense" &&
          (event.expense?.discretionary ?? event.expense?.isDiscretionary)
      )
      .map((event, index) => ({
        id: event._id,
        name: event.name || `Unnamed Expense ${index + 1}`,
      }));
  
    if (isEdit && prefilledScenario?.spendingStrategy?.length > 0) {
      // Preserve ordering from existing strategy
      const ordered = prefilledScenario.spendingStrategy
        .map((id) => discretionaryExpenses.find((e) => e.id === id))
        .filter(Boolean); 
      setSpendingStrategy(ordered);
    } else {
      setSpendingStrategy(discretionaryExpenses);
    }
  }, [eventSeries]);
  

 const [spendingStrategy, setSpendingStrategy] = useState([]);

  
  // ================== Expense withdrawal strategy  SECTION ==================
  const [withdrawalStrategy, setWithdrawalStrategy] = useState([]);
  const [selectedWithdrawalIds, setSelectedWithdrawalIds] = useState(() => {
    return isEdit && prefilledScenario?.expenseWithdrawalStrategy
      ? prefilledScenario.expenseWithdrawalStrategy
      : [];
  });
  

  useEffect(() => {
    const selected = investments
      .filter((inv) => selectedWithdrawalIds.includes(inv._id))
      .map((inv) => ({
        id: inv._id,
        name: `${typeof inv.type === "string" ? inv.type : inv.type?.name || "Unnamed"} ${inv.taxStatus}`,
      }));
  
    setWithdrawalStrategy(selected);
  }, [investments, selectedWithdrawalIds]);
  

  // ================== Inflation Assumption  SECTION ==================
  const [inflation, setInflation] = useState(() => {
    if (isEdit && prefilledScenario?.inflationAssumption) {
      const infl = prefilledScenario.inflationAssumption;
      const convert = (val) => val !== undefined ? String(val) : "";
  
      if (infl.type === "fixed") {
        return { type: "fixed", value: convert(infl.value) };
      }
      if (infl.type === "normal") {
        return { type: "normal", mean: convert(infl.mean), stdev: convert(infl.stdev) };
      }
      if (infl.type === "uniform") {
        return { type: "uniform", lower: convert(infl.lower), upper: convert(infl.upper) };
      }
    }
  
    return { type: "fixed", value: "" }; // default for create mode
  });

  // ================== Roth Conversion Optimizer  SECTION ==================
  

  const [enableRothConversion, setEnableRothConversion] = useState(() => {
    return isEdit ? !!prefilledScenario?.rothConversionOpt : false;
  });
  

const enableRothConversionRef = useRef(enableRothConversion);

useEffect(() => {
  enableRothConversionRef.current = enableRothConversion;
}, [enableRothConversion]);
  
  const [rothStartYear, setRothStartYear] = useState(() => {
    return isEdit ? prefilledScenario?.rothConversionStart ?? "" : "";
  });

  const [rothEndYear, setRothEndYear] = useState(() => {
    return isEdit ? prefilledScenario?.rothConversionEnd ?? "" : "";
  });
  const [rothConversionStrategy, setRothConversionStrategy] = useState([]);

  useEffect(() => {
  if (enableRothConversion) {
    const pretaxInvestments = investments
      .filter((inv) => inv.taxStatus === "pre-tax")
      .map((inv) => ({
        id: inv._id,
        name: `${typeof inv.type === "string" ? inv.type : inv.type?.name || "Unnamed"} ${inv.taxStatus}`,
      }));

    if (isEdit && prefilledScenario?.rothConversionStrategy?.length > 0) {
      // preserve original order from prefilledScenario
      const ordered = prefilledScenario.rothConversionStrategy
        .map((id) => pretaxInvestments.find((inv) => inv.id === id))
        .filter(Boolean);
      setRothConversionStrategy(ordered);
    } else {
      setRothConversionStrategy(pretaxInvestments);
    }
  }
}, [enableRothConversion, investments]);
  


// ================== RMD STRATEGY  SECTION =================
  const [rmdStrategy, setRmdStrategy] = useState([]);

  useEffect(() => {
    const preTaxInvestments = investments
      .filter((inv) => inv.taxStatus === "pre-tax")
      .map((inv) => ({
        id: inv._id,
        name: `${typeof inv.type === "string" ? inv.type : inv.type?.name || "Unnamed"} ${inv.taxStatus}`,
      }));
  
    if (isEdit && prefilledScenario?.rmdStrategy?.length > 0) {
      const ordered = prefilledScenario.rmdStrategy
        .map((id) => preTaxInvestments.find((i) => i.id === id))
        .filter(Boolean);
      setRmdStrategy(ordered);
    } else {
      setRmdStrategy(preTaxInvestments);
    }
  }, [investments]);
  
/////////////////////////SAVE SCENARIO////////////////////////////////////
const router = useRouter();


//PERCENT CONVERSION
const percentToDecimal = (val) =>
  val !== "" && !isNaN(val) ? parseFloat(val) / 100 : 0;

const convertDistributionIfPercent = (dist, amtOrPct) => {
  if (amtOrPct !== "percent") return dist;

  const type = dist.type;
  if (type === "fixed") {
    return { type: "fixed", value: percentToDecimal(dist.value) };
  } else if (type === "normal") {
    return {
      type: "normal",
      mean: percentToDecimal(dist.mean),
      stdev: percentToDecimal(dist.stdev),
    };
  } else if (type === "uniform") {
    return {
      type: "uniform",
      lower: percentToDecimal(dist.lower),
      upper: percentToDecimal(dist.upper),
    };
  }
  return dist;
};

function convertAllocationMapToDecimal(allocationMap, allocationType) {
  const converted = {};
  for (const [key, val] of Object.entries(allocationMap)) {
    const id = investments[key]?._id || key; // map index back to UUID
    if (allocationType === "glide") {
      converted[id] = {
        initial: parseFloat(val.initial) / 100,
        final: parseFloat(val.final) / 100,
      };
    } else {
      converted[id] = {
        value: parseFloat(val.value) / 100,
      };
    }
  }
  return converted;
}

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
        userLifeExpectancy: lifespanValues[0],
        spouseLifeExpectancy: filingStatus === "married" ? lifespanValues[1] : undefined,
        userRetireContributionLimit: 0,
        spouseRetireContributionLimit: filingStatus === "married" ? 0 : undefined,
        userStateOfResidence: state,
        financialGoal: financialGoal,
        stateTaxStatus,
        userRetireContributionLimit: Number(userRetireContributionLimit),
        //investments next
        investments: investments.map((inv, index) => {
          const invType = inv.type;

          /*console.log(`📦 [${index}] Preparing investment "${invType?.name}" (ID: ${inv._id})`);

          
          if (!invType?.returnDistribution?.type) {
            console.warn(`⚠️ Missing returnDistribution.type for investment ${inv._id}`, invType.returnDistribution);
          }

          if (!invType?.incomeDistribution?.type) {
            console.warn(`⚠️ Missing incomeDistribution.type for investment ${inv._id}`, invType.incomeDistribution);
          }*/

          // Convert percentages to decimals if needed
          const expectedAnnualReturn = {
            ...invType.returnDistribution,
            type: invType.returnDistribution.type,
          };
          if (invType.returnAmtOrPct === "percent") {
            if (expectedAnnualReturn.type === "fixed") {
              expectedAnnualReturn.value = expectedAnnualReturn.value; // Keep value as it is, no conversion
            } else if (expectedAnnualReturn.type === "normal") {
              expectedAnnualReturn.mean = expectedAnnualReturn.mean; // Keep mean as it is
              expectedAnnualReturn.stdev = expectedAnnualReturn.stdev; // Keep stdev as it is
            }
          }

          const expectedAnnualIncome = {
            ...invType.incomeDistribution,
            type: invType.incomeDistribution.type,
          };
          if (invType.incomeAmtOrPct === "percent") {
            if (expectedAnnualIncome.type === "fixed") {
              expectedAnnualIncome.value = expectedAnnualIncome.value; // Keep value as it is
            } else if (expectedAnnualIncome.type === "normal") {
              expectedAnnualIncome.mean = expectedAnnualIncome.mean; // Keep mean as it is
              expectedAnnualIncome.stdev = expectedAnnualIncome.stdev; // Keep stdev as it is
            }
          }

          const finalInvestment = {
            _id: inv._id,
            type: {
              name: invType.name,
              description: invType.description,
              returnAmtOrPct: invType.returnAmtOrPct,
              expectedAnnualReturn,
              expenseRatio: invType.expenseRatio, // Keep expense ratio as is, no conversion
              incomeAmtOrPct: invType.incomeAmtOrPct,
              expectedAnnualIncome,
              taxability: invType.taxability,
            },
            value: parseFloat(inv.value),
            accountTaxStatus: inv.taxStatus,
          };
          //console.log(`✅ [${index}] Final investment payload:`, finalInvestment);

          return finalInvestment;

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

          if (type === "income") {
            payload.income = {
              initialAmount: parseFloat(series.income.initialAmount),
              changeAmtOrPct: series.income.changeAmtOrPct,
              changeDistribution: series.income.changeDistribution,
              adjustForInflation: !!series.income.adjustForInflation,
              userPct: filingStatus === "married" ? series.income.userPct : undefined,
              isSocialSecurity: !!series.income.isSocialSecurity,
            };
          }

          if (type === "expense") {
            payload.expense = {
              initialAmount: parseFloat(series.expense.initialAmount),
              changeAmtOrPct: series.expense.changeAmtOrPct,
              changeDistribution: series.expense.changeDistribution,
              adjustForInflation: !!series.expense.adjustForInflation,
              discretionary: series.expense?.discretionary ?? false,
              ...(filingStatus === "married" && {
                userPct: series.expense?.userPct ?? 0,
              }),
            };
          }

          if (type === "invest") {
            payload.invest = {
              allocationType: series.invest.allocationType,
              allocations: series.invest.allocations,
              maxCash: parseFloat(series.invest.maxCash || 0),
            };
          }

          if (type === "rebalance") {
            payload.rebalance = {
              allocationType: series.rebalance.allocationType,
              allocations: series.rebalance.allocations,
            };
          }

          return payload;
        }),


        //spendingStrategy: spendingStrategy.map(item => item.name),
        spendingStrategy: spendingStrategy.map(item => item.id),

        expenseWithdrawalStrategy: withdrawalStrategy.length > 0 ? withdrawalStrategy.map((item) => item.id) : [],

        inflationAssumption: inflationAssumption,

        rmdStrategy: rmdStrategy.map(item => item.id),


      };
      if (enableRothConversionRef.current) {
        scenarioInfoPayload.rothConversionOpt = true;
        scenarioInfoPayload.rothConversionStart = parseInt(rothStartYear);
        scenarioInfoPayload.rothConversionEnd = parseInt(rothEndYear);
        scenarioInfoPayload.rothConversionStrategy = rothConversionStrategy.map((item) => item.id);
      } ////CHANGED

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
        ignoreStateTax={ignoreStateTax}
        setIgnoreStateTax={setIgnoreStateTax}
        userRetireContributionLimit={userRetireContributionLimit}
        setUserRetireContributionLimit={setUserRetireContributionLimit}
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
        investmentTypes={investmentTypes} 
        isEdit={isEdit}
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
        selectedWithdrawalIds={selectedWithdrawalIds}
        setSelectedWithdrawalIds={setSelectedWithdrawalIds}
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
        
   {/* Save button */}
    <div className="w-full mt-8 mb-8 flex justify-center">
      <button
        onClick={handleSaveScenario}
        className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        {isEdit ? "Edit Scenario" : "Save Scenario"}
      </button>
    </div>


</div> 
);
}
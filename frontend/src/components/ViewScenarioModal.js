import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";

export default function ViewScenarioModal({ isOpen, onClose, scenario }) {
  if (!scenario) return null;

  const formatDistribution = (dist) => {
    if (!dist || typeof dist !== "object") return "—";
    if (dist.type === "fixed") return `Fixed: ${dist.value}`;
    if (dist.type === "normal") return `Normal: mean ${dist.mean}, stdev ${dist.stdev}`;
    if (dist.type === "uniform") return `Uniform: ${dist.lower}–${dist.upper}`;
    if (dist.type === "startWith") return `EventSeries named "${dist.eventSeries}"`;
    if (dist.type === "startAfter") return `After EventSeries "${dist.eventSeries}"`;
    return JSON.stringify(dist);
  };

  const getInvestmentLabel = (id) => {
    const inv = scenario.investments.find((inv) => inv._id === id);
    if (!inv) return `Unknown Investment (${id})`;
    return `${inv.type.name} (${inv.accountTaxStatus})`;
  };

  const getEventNameById = (id) => {
    const evt = scenario.eventSeriesSet.find((e) => e._id === id);
    return evt ? evt.name : `Unknown Event (${id})`;
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-40 p-4">
        <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-2xl font-semibold mb-4">Scenario Overview</Dialog.Title>

          <section className="mb-6">
            <h3 className="text-lg font-bold mb-2">Basic Info</h3>
            <p><strong>Name:</strong> {scenario.name}</p>
            <p><strong>Marital Status:</strong> {scenario.isMarriedCouple ? "Married" : "Single"}</p>
            <p><strong>User Birth Year:</strong> {scenario.userBirthYear}</p>
            {scenario.isMarriedCouple && (
              <p><strong>Spouse Birth Year:</strong> {scenario.spouseBirthYear}</p>
            )}
            <p><strong>User Life Expectancy:</strong> {formatDistribution(scenario.userLifeExpectancy)}</p>
            {scenario.isMarriedCouple && (
              <p><strong>Spouse Life Expectancy:</strong> {formatDistribution(scenario.spouseLifeExpectancy)}</p>
            )}
            {/*<p><strong>Inflation:</strong> {formatDistribution(scenario.inflationAssumption)}</p>*/}
            <p><strong>Financial Goal:</strong> ${scenario.financialGoal}</p>
            <p><strong>After-Tax Contribution Limit:</strong> ${scenario.userRetireContributionLimit}</p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-bold mb-2">Investment Types</h3>
            <ul className="list-disc ml-6 space-y-3">
                {[...new Map(
                scenario.investments.map((inv) => [inv.type.name + inv.type.taxability, inv.type])
                ).values()].map((type, index) => (
                <li key={index}>
                    <p><strong>Name:</strong> {type.name}</p>
                    <p><strong>Description:</strong> {type.description}</p>
                    <p><strong>Return:</strong> {formatDistribution(type.expectedAnnualReturn)} ({type.returnAmtOrPct})</p>
                    <p><strong>Income:</strong> {formatDistribution(type.expectedAnnualIncome)} ({type.incomeAmtOrPct})</p>
                    <p><strong>Expense Ratio:</strong> {type.expenseRatio}</p>
                    <p><strong>Taxable:</strong> {type.taxability ? "Yes" : "No"}</p>
                    <hr className="my-2" />
                </li>
                ))}
            </ul>
            </section>

            <section className="mb-6">
            <h3 className="text-lg font-bold mb-2">Investments</h3>
            <ul className="list-disc ml-6 space-y-3">
                {scenario.investments.map((inv) => (
                <li key={inv._id}>
                    <p><strong>Type:</strong> {inv.type.name}</p>
                    <p><strong>Tax Status:</strong> {inv.accountTaxStatus}</p>
                    <p><strong>Value:</strong> ${inv.value.toLocaleString()}</p>
                    <hr className="my-2" />
                </li>
                ))}
            </ul>
            </section>

            <section className="mb-6">
            <h3 className="text-lg font-bold mb-2">Event Series</h3>
            <ul className="list-disc ml-6 space-y-4">
                {scenario.eventSeriesSet.map((event) => (
                <li key={event._id}>
                    <p><strong>Name:</strong> {event.name}</p>
                    <p><strong>Type:</strong> {event.type}</p>
                    <p><strong>Start:</strong> {formatDistribution(event.start)}</p>
                    <p><strong>Duration:</strong> {formatDistribution(event.duration)}</p>

                    {event.type === "income" && event.income && (
                    <>
                        <p><strong>Initial Amount:</strong> ${event.income.initialAmount}</p>
                        <p><strong>Change:</strong> {formatDistribution(event.income.changeDistribution)}</p>
                        <p><strong>Inflation Adjusted:</strong> {event.income.adjustForInflation ? "Yes" : "No"}</p>
                        <p><strong>User %:</strong> {event.income.userPct * 100}%</p>
                        <p><strong>Social Security:</strong> {event.income.isSocialSecurity ? "Yes" : "No"}</p>
                    </>
                    )}

                    {event.type === "expense" && event.expense && (
                    <>
                        <p><strong>Initial Amount:</strong> ${event.expense.initialAmount}</p>
                        <p><strong>Change:</strong> {formatDistribution(event.expense.changeDistribution)}</p>
                        <p><strong>Inflation Adjusted:</strong> {event.expense.adjustForInflation ? "Yes" : "No"}</p>
                        <p><strong>User %:</strong> {event.expense.userPct * 100}%</p>
                        <p><strong>Discretionary:</strong> {event.expense.discretionary ? "Yes" : "No"}</p>
                    </>
                    )}

                    {event.type === "invest" && event.invest && (
                    <>
                        <p><strong>Allocation Type:</strong> {event.invest.allocationType}</p>
                        <p><strong>Max Cash:</strong> ${event.invest.maxCash}</p>
                        <p><strong>Allocations:</strong></p>
                        <ul className="list-disc ml-6">
                        {Object.entries(event.invest.allocations).map(([invId, alloc]) => (
                            <li key={invId}>
                            {getInvestmentLabel(invId)}: {alloc.initial} → {alloc.final}
                            </li>
                        ))}
                        </ul>
                    </>
                    )}

                    {event.type === "rebalance" && event.rebalance && (
                    <>
                        <p><strong>Allocation Type:</strong> {event.rebalance.allocationType}</p>
                        <p><strong>Allocations:</strong></p>
                        <ul className="list-disc ml-6">
                        {Object.entries(event.rebalance.allocations).map(([invId, alloc]) => (
                            <li key={invId}>
                            {getInvestmentLabel(invId)}: {alloc.value}
                            </li>
                        ))}
                        </ul>
                    </>
                    )}

                    <hr className="my-3" />
                </li>
                ))}
            </ul>
            </section>

        

            <section className="mb-6">
                <h3 className="text-lg font-bold mb-2">Inflation Assumption</h3>
                <p><strong>Type:</strong> {scenario.inflationAssumption?.type}</p>

                {scenario.inflationAssumption?.type === "fixed" && (
                    <p><strong>Value:</strong> {scenario.inflationAssumption.value}%</p>
                )}

                {scenario.inflationAssumption?.type === "normal" && (
                    <>
                    <p><strong>Mean:</strong> {scenario.inflationAssumption.mean}</p>
                    <p><strong>Stdev:</strong> {scenario.inflationAssumption.stdev}</p>
                    </>
                )}

                {scenario.inflationAssumption?.type === "uniform" && (
                    <>
                    <p><strong>Lower:</strong> {scenario.inflationAssumption.lower}</p>
                    <p><strong>Upper:</strong> {scenario.inflationAssumption.upper}</p>
                    </>
                )}
                </section>

          {/* Spending Strategy */}
            <section className="mb-6">
            <h3 className="text-lg font-bold mb-2">Spending Strategy</h3>
            <p>
                <strong>Spending Order:</strong>{" "}
                {scenario.spendingStrategy?.map(getEventNameById).join(", ") || "None"}
            </p>
            </section>

            {/* Expense Withdrawal Strategy */}
            <section className="mb-6">
            <h3 className="text-lg font-bold mb-2">Expense Withdrawal Strategy</h3>
            {scenario.expenseWithdrawalStrategy?.length > 0 ? (
                <ul className="list-disc ml-6">
                {scenario.expenseWithdrawalStrategy.map((invId) => {
                    const investment = scenario.investments.find((inv) => inv._id === invId);
                    const label = investment
                    ? `Investment (${investment.type.name} ${investment.accountTaxStatus})`
                    : invId;
                    return <li key={invId}>{label}</li>;
                })}
                </ul>
            ) : (
                <p>No strategy specified.</p>
            )}
            </section>

          <section className="mb-6">
            <h3 className="text-lg font-bold mb-2">Roth Conversion Strategy</h3>

            {scenario.rothConversionOpt ? (
                <>
                <p><strong>Conversion Window:</strong> {scenario.rothConversionStart} – {scenario.rothConversionEnd}</p>
                <p><strong>Strategy:</strong></p>
                <ul className="list-disc ml-6">
                    {scenario.rothConversionStrategy?.map((invId) => {
                    const inv = scenario.investments?.find((i) => i._id === invId);
                    return (
                        <li key={invId}>
                        {inv ? `Investment (${inv.type.name} ${inv.accountTaxStatus})` : invId}
                        </li>
                    );
                    })}
                </ul>
                </>
            ) : (
                <p>Roth conversions are not enabled for this scenario.</p>
            )}
            </section>

            <section className="mb-6">
                <h3 className="text-lg font-bold mb-2">RMD Strategy</h3>
                {scenario.rmdStrategy?.length > 0 ? (
                    <ul className="list-disc ml-6">
                    {scenario.rmdStrategy.map((invId) => {
                        const inv = scenario.investments?.find((i) => i._id === invId);
                        return (
                        <li key={invId}>
                            {inv ? `Investment (${inv.type.name} ${inv.accountTaxStatus})` : invId}
                        </li>
                        );
                    })}
                    </ul>
                ) : (
                    <p>No RMD strategy specified.</p>
                )}
                </section>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

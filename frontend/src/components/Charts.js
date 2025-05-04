import React, { useState } from 'react';

import ProbabilityOfSuccessChart from './graphs/ProbabilityOfSuccess.jsx';
import ProbabilityRangesChart from './graphs/ProbabilityRanges.jsx';
import StackedBarChart from './graphs/StackedBarChart.jsx';

// TODO - IMPORT DATA THAT WILL BE USED FOR THE CHARTS
//        IMPORT THE TYPES OF CHARTS THAT WILL BE USED

// 4 Charts
// After defining a scenario, the user specifies how many simulations to perform and, runs them.
// The user then selects a set of charts to be generated to visualize the results. The set may include 
// multiple charts of the same kind, e.g., multiple shaded line charts. 
// For all charts, hovering over an appropriate visual element---point, shaded region, bar, etc.,
// depending on the chart type---raises a pop-up displaying associated numerical values. Charts 
// that show values of investments over time (e.g., charts 4.2.1 and 5.1.2) should show the values
// of the investments at the end of each year.

// Dummy data for now
const dummySimulationResult = {
    simulationId: "dummy-simulation-id",
    result: {
        endYear: 2030,
        yearlyData: [
            {
                year: 2025,
                income: 50000,
                socialSecurity: 20000,
                inflationRate: 0.02,
                investments: [
                    { id: "investment1", type: "stocks", accountTaxStatus: "pre-tax", value: 300000 },
                    { id: "investment2", type: "bonds", accountTaxStatus: "non-retirement", value: 100000 },
                    { id: "investment3", type: "real estate", accountTaxStatus: "after-tax", value: 200000 },
                    { id: "investment4", type: "cash", accountTaxStatus: "non-retirement", value: 50000 },
                ],
                yearGains: 10000,
                earlyWithdrawals: 0,
                userAge: 65,
                spouseAge: 63,
                isUserAlive: true,
                isSpouseAlive: true,
            },
            {
                year: 2026,
                income: 52000,
                socialSecurity: 21000,
                inflationRate: 0.02,
                investments: [
                    { id: "investment1", type: "stocks", accountTaxStatus: "pre-tax", value: 310000 },
                    { id: "investment2", type: "bonds", accountTaxStatus: "non-retirement", value: 105000 },
                    { id: "investment3", type: "real estate", accountTaxStatus: "after-tax", value: 205000 },
                    { id: "investment4", type: "cash", accountTaxStatus: "non-retirement", value: 55000 },
                ],
                yearGains: 12000,
                earlyWithdrawals: 0,
                userAge: 66,
                spouseAge: 64,
                isUserAlive: true,
                isSpouseAlive: true,
            },
            {
                year: 2027,
                income: 54000,
                socialSecurity: 22000,
                inflationRate: 0.02,
                investments: [
                    { id: "investment1", type: "stocks", accountTaxStatus: "pre-tax", value: 320000 },
                    { id: "investment2", type: "bonds", accountTaxStatus: "non-retirement", value: 110000 },
                    { id: "investment3", type: "real estate", accountTaxStatus: "after-tax", value: 210000 },
                    { id: "investment4", type: "cash", accountTaxStatus: "non-retirement", value: 60000 },
                ],
                yearGains: 14000,
                earlyWithdrawals: 0,
                userAge: 67,
                spouseAge: 65,
                isUserAlive: true,
                isSpouseAlive: true,
            },
            {
                year: 2028,
                income: 56000,
                socialSecurity: 23000,
                inflationRate: 0.02,
                investments: [
                    { id: "investment1", type: "stocks", accountTaxStatus: "pre-tax", value: 330000 },
                    { id: "investment2", type: "bonds", accountTaxStatus: "non-retirement", value: 115000 },
                    { id: "investment3", type: "real estate", accountTaxStatus: "after-tax", value: 215000 },
                    { id: "investment4", type: "cash", accountTaxStatus: "non-retirement", value: 65000 },
                ],
                yearGains: 16000,
                earlyWithdrawals: 0,
                userAge: 68,
                spouseAge: 66,
                isUserAlive: true,
                isSpouseAlive: true,
            },
            {
                year: 2029,
                income: 58000,
                socialSecurity: 24000,
                inflationRate: 0.02,
                investments: [
                    { id: "investment1", type: "stocks", accountTaxStatus: "pre-tax", value: 340000 },
                    { id: "investment2", type: "bonds", accountTaxStatus: "non-retirement", value: 120000 },
                    { id: "investment3", type: "real estate", accountTaxStatus: "after-tax", value: 220000 },
                    { id: "investment4", type: "cash", accountTaxStatus: "non-retirement", value: 70000 },
                ],
                yearGains: 18000,
                earlyWithdrawals: 0,
                userAge: 69,
                spouseAge: 67,
                isUserAlive: true,
                isSpouseAlive: true,
            },
            {
                year: 2030,
                income: 60000,
                socialSecurity: 25000,
                inflationRate: 0.02,
                investments: [
                    { id: "investment1", type: "stocks", accountTaxStatus: "pre-tax", value: 350000 },
                    { id: "investment2", type: "bonds", accountTaxStatus: "non-retirement", value: 125000 },
                    { id: "investment3", type: "real estate", accountTaxStatus: "after-tax", value: 225000 },
                    { id: "investment4", type: "cash", accountTaxStatus: "non-retirement", value: 75000 },
                ],
                yearGains: 20000,
                earlyWithdrawals: 0,
                userAge: 70,
                spouseAge: 68,
                isUserAlive: true,
                isSpouseAlive: true,
            },
        ],
    },
};

const scenario = {};

const ChartsPage = () => {
    const [currentChartIndex, setCurrentChartIndex] = useState(0);

    const charts = [
        <ProbabilityOfSuccessChart scenario={scenario} simulationResults={dummySimulationResult} />,
        <ProbabilityRangesChart scenario={scenario} simulationResults={dummySimulationResult} />,
        <StackedBarChart scenario={scenario} simulationResults={dummySimulationResult} />,
    ];

    const handlePrevious = () => {
        setCurrentChartIndex((prevIndex) => (prevIndex === 0 ? charts.length - 1 : prevIndex - 1));
    };

    const handleNext = () => {
        setCurrentChartIndex((prevIndex) => (prevIndex === charts.length - 1 ? 0 : prevIndex + 1));
    };

    return (
        <div className="charts-page">
            <h1 className="text-4xl font-bold text-center mt-8">Charts</h1>
            <div className="charts-container mt-4 relative">
                <button
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full"
                    onClick={handlePrevious}
                >
                    &#8592; {/* Left arrow */}
                </button>
                <div className="chart-content mx-auto max-w-6xl bg-white shadow-md rounded-lg p-4 border border-black">
                    {charts[currentChartIndex]}
                </div>
                <button
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full"
                    onClick={handleNext}
                >
                    &#8594; {/* Right arrow */}
                </button>
            </div>
        </div>
    );
};

export default ChartsPage;
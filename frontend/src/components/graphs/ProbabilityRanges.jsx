import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// 4.2 Shaded line chart of probability ranges for a selected quantity over time
// This type of line chart includes a line for the median value of a selected quantity over time (i.e., year by
// year), with shaded regions depicting probability ranges---specifically 10%-90%, 20%-80%, 30%-70%, and
// 40%-60%---for the value of that quantity. The selected quantity may be
//     1. total investments (the chart should also include a horizontal line representing the financial goal)
//     2. total income
//     3. total expenses, including taxes
//     4. early withdrawal tax
//     5. percentage of total discretionary expenses incurred (the percentage is based on the amounts,
//     not the number, of the discretionary expenses in that year).

// TP - Github Copilot - Was fed the description from the requirements document as a prompt.
//                       The code required heavy editing however.


//   <option value="totalInvestments">Total Investments</option>
//   <option value="totalIncome">Total Income</option>
//   <option value="totalExpenses">Total Expenses</option>
//   <option value="earlyWithdrawalTax">Early Withdrawal Tax</option>
//   <option value="discretionaryExpenses">Discretionary Expenses</option>




function getMedian(values) {
    values.sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    return values.length % 2 !== 0
    ? values[mid]
    : (values[mid - 1] + values[mid]) / 2;
}               

export const ProbabilityRangesChartInvestment = ({ scenario, simulationResults }) => {
    const financialGoal = scenario.financialGoal;
    const medianValues = {};

    // Collect incomes for each year
    simulationResults.forEach(simulation => {
        simulation.result.yearlyData.forEach(yearData => {
            if (medianValues[yearData.year] === undefined) {
                medianValues[yearData.year] = [];
            }
            const totalInvestments = yearData.investments.reduce((sum, investment) => sum + investment.value, 0);

            medianValues[yearData.year].push(totalInvestments);
        });
    });

    // Extract labels (years) and data (number of successful simulations)
    const labels = Object.keys(medianValues).sort((a, b) => a - b); // Sort years in ascending order
    const dataPoints = labels.map(year => getMedian(medianValues[year]));

    // TODO - FIGURE OUT WHAT THE RANGES ARE
    // FOR NOW THEY ARE DUMMY VALUES
    const range10_90_min = labels.map(year => getMedian(medianValues[year]) * 0.9);
    const range10_90_max = labels.map(year => getMedian(medianValues[year]) * 1.1);
    const range20_80_min = labels.map(year => getMedian(medianValues[year]) * 0.8);
    const range20_80_max = labels.map(year => getMedian(medianValues[year]) * 1.2);
    const range30_70_min = labels.map(year => getMedian(medianValues[year]) * 0.7);
    const range30_70_max = labels.map(year => getMedian(medianValues[year]) * 1.3);
    const range40_60_min = labels.map(year => getMedian(medianValues[year]) * 0.6);
    const range40_60_max = labels.map(year => getMedian(medianValues[year]) * 1.4);

    const data = {
        labels,
        datasets: [
            {
                label: 'Financial Goal',
                data: labels.map(() => financialGoal), // Horizontal line at the financial goal
                borderColor: 'rgb(18, 183, 81)', // Green color for the financial goal line
                borderWidth: 2,
                fill: false,
                pointRadius: 0, // No points on the line
            },
            {
                label: 'Median Value',
                data: dataPoints,
                borderColor: 'rgb(255, 2, 2)', // Actual color
                backgroundColor: 'rgba(255, 2, 2, 0.3)',
                fill: false,
            },
            {
                label: '10%-90% Range (Min)',
                data: range10_90_min,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.72)',
                fill: false, // No fill below this dataset
            },
            {
                label: '10%-90% Range (Max)',
                data: range10_90_max,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.72)',
                fill: '-1', // Fill to the previous dataset (min)
            },
            {
                label: '20%-80% Range (Min)',
                data: range20_80_min,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.58)',
                fill: false,
            },
            {
                label: '20%-80% Range (Max)',
                data: range20_80_max,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.58)',
                fill: '-1',
            },
            {
                label: '30%-70% Range (Min)',
                data: range30_70_min,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.40)',
                fill: false,
            },
            {
                label: '30%-70% Range (Max)',
                data: range30_70_max,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.40)',
                fill: '-1',
            },
            {
                label: '40%-60% Range (Min)',
                data: range40_60_min,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.24)',
                fill: false,
            },
            {
                label: '40%-60% Range (Max)',
                data: range40_60_max,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.24)',
                fill: '-1',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Probability Ranges of Total Investments Over Time',
            },
        },
        layout: {
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Years',
                },
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Total Investments ($)',
                },
            },
        },
    };

    return <Line data={data} options={options} />;
};

export const ProbabilityRangesChartIncome = ({ scenario, simulationResults }) => {
    const medianValues = {};

    // Collect incomes for each year
    simulationResults.forEach(simulation => {
        simulation.result.yearlyData.forEach(yearData => {
            if (medianValues[yearData.year] === undefined) {
                medianValues[yearData.year] = [];
            }
            medianValues[yearData.year].push(yearData.income);
        });
    });

    // Extract labels (years) and data (number of successful simulations)
    const labels = Object.keys(medianValues).sort((a, b) => a - b); // Sort years in ascending order
    const dataPoints = labels.map(year => getMedian(medianValues[year]));

    // TODO - FIGURE OUT WHAT THE RANGES ARE
    // FOR NOW THEY ARE DUMMY VALUES
    const range10_90_min = labels.map(year => getMedian(medianValues[year]) * 0.9);
    const range10_90_max = labels.map(year => getMedian(medianValues[year]) * 1.1);
    const range20_80_min = labels.map(year => getMedian(medianValues[year]) * 0.8);
    const range20_80_max = labels.map(year => getMedian(medianValues[year]) * 1.2);
    const range30_70_min = labels.map(year => getMedian(medianValues[year]) * 0.7);
    const range30_70_max = labels.map(year => getMedian(medianValues[year]) * 1.3);
    const range40_60_min = labels.map(year => getMedian(medianValues[year]) * 0.6);
    const range40_60_max = labels.map(year => getMedian(medianValues[year]) * 1.4);

    const data = {
        labels,
        datasets: [
            {
                label: 'Median Value',
                data: dataPoints,
                borderColor: 'rgb(255, 2, 2)', // Actual color
                backgroundColor: 'rgba(255, 2, 2, 0.3)',
                fill: false,
            },
            {
                label: '10%-90% Range (Min)',
                data: range10_90_min,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.72)',
                fill: false, // No fill below this dataset
            },
            {
                label: '10%-90% Range (Max)',
                data: range10_90_max,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.72)',
                fill: '-1', // Fill to the previous dataset (min)
            },
            {
                label: '20%-80% Range (Min)',
                data: range20_80_min,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.58)',
                fill: false,
            },
            {
                label: '20%-80% Range (Max)',
                data: range20_80_max,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.58)',
                fill: '-1',
            },
            {
                label: '30%-70% Range (Min)',
                data: range30_70_min,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.40)',
                fill: false,
            },
            {
                label: '30%-70% Range (Max)',
                data: range30_70_max,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.40)',
                fill: '-1',
            },
            {
                label: '40%-60% Range (Min)',
                data: range40_60_min,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.24)',
                fill: false,
            },
            {
                label: '40%-60% Range (Max)',
                data: range40_60_max,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.24)',
                fill: '-1',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Probability Ranges of Total Income Over Time',
            },
        },
        layout: {
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Years',
                },
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Total Income ($)',
                },
            },
        },
    };

    return <Line data={data} options={options} />;
};

export const ProbabilityRangesChartExpenses = ({ scenario, simulationResults }) => {
    const medianValues = {};

    // Collect incomes for each year
    simulationResults.forEach(simulation => {
        simulation.result.yearlyData.forEach(yearData => {
            if (medianValues[yearData.year] === undefined) {
                medianValues[yearData.year] = [];
            }
            medianValues[yearData.year].push(yearData.expenses);
        });
    });

    // Extract labels (years) and data (number of successful simulations)
    const labels = Object.keys(medianValues).sort((a, b) => a - b); // Sort years in ascending order
    const dataPoints = labels.map(year => getMedian(medianValues[year]));

    // TODO - FIGURE OUT WHAT THE RANGES ARE
    // FOR NOW THEY ARE DUMMY VALUES
    const range10_90_min = labels.map(year => getMedian(medianValues[year]) * 0.9);
    const range10_90_max = labels.map(year => getMedian(medianValues[year]) * 1.1);
    const range20_80_min = labels.map(year => getMedian(medianValues[year]) * 0.8);
    const range20_80_max = labels.map(year => getMedian(medianValues[year]) * 1.2);
    const range30_70_min = labels.map(year => getMedian(medianValues[year]) * 0.7);
    const range30_70_max = labels.map(year => getMedian(medianValues[year]) * 1.3);
    const range40_60_min = labels.map(year => getMedian(medianValues[year]) * 0.6);
    const range40_60_max = labels.map(year => getMedian(medianValues[year]) * 1.4);

    const data = {
        labels,
        datasets: [
            {
                label: 'Median Value',
                data: dataPoints,
                borderColor: 'rgb(255, 2, 2)', // Actual color
                backgroundColor: 'rgba(255, 2, 2, 0.3)',
                fill: false,
            },
            {
                label: '10%-90% Range (Min)',
                data: range10_90_min,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.72)',
                fill: false, // No fill below this dataset
            },
            {
                label: '10%-90% Range (Max)',
                data: range10_90_max,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.72)',
                fill: '-1', // Fill to the previous dataset (min)
            },
            {
                label: '20%-80% Range (Min)',
                data: range20_80_min,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.58)',
                fill: false,
            },
            {
                label: '20%-80% Range (Max)',
                data: range20_80_max,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.58)',
                fill: '-1',
            },
            {
                label: '30%-70% Range (Min)',
                data: range30_70_min,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.40)',
                fill: false,
            },
            {
                label: '30%-70% Range (Max)',
                data: range30_70_max,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.40)',
                fill: '-1',
            },
            {
                label: '40%-60% Range (Min)',
                data: range40_60_min,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.24)',
                fill: false,
            },
            {
                label: '40%-60% Range (Max)',
                data: range40_60_max,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.24)',
                fill: '-1',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Probability Ranges of Total Expenses Over Time',
            },
        },
        layout: {
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Years',
                },
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Total Expenses ($)',
                },
            },
        },
    };

    return <Line data={data} options={options} />;
};

export const ProbabilityRangesChartWithdrawalTax = ({ scenario, simulationResults }) => {
    const medianValues = {};

    // Collect incomes for each year
    simulationResults.forEach(simulation => {
        simulation.result.yearlyData.forEach(yearData => {
            if (medianValues[yearData.year] === undefined) {
                medianValues[yearData.year] = [];
            }

            medianValues[yearData.year].push(yearData.earlyWithdrawals);
        });
    });

    // Extract labels (years) and data (number of successful simulations)
    const labels = Object.keys(medianValues).sort((a, b) => a - b); // Sort years in ascending order
    const dataPoints = labels.map(year => getMedian(medianValues[year]));

    // TODO - FIGURE OUT WHAT THE RANGES ARE
    // FOR NOW THEY ARE DUMMY VALUES
    const range10_90_min = labels.map(year => getMedian(medianValues[year]) * 0.9);
    const range10_90_max = labels.map(year => getMedian(medianValues[year]) * 1.1);
    const range20_80_min = labels.map(year => getMedian(medianValues[year]) * 0.8);
    const range20_80_max = labels.map(year => getMedian(medianValues[year]) * 1.2);
    const range30_70_min = labels.map(year => getMedian(medianValues[year]) * 0.7);
    const range30_70_max = labels.map(year => getMedian(medianValues[year]) * 1.3);
    const range40_60_min = labels.map(year => getMedian(medianValues[year]) * 0.6);
    const range40_60_max = labels.map(year => getMedian(medianValues[year]) * 1.4);

    const data = {
        labels,
        datasets: [
            {
                label: 'Median Value',
                data: dataPoints,
                borderColor: 'rgb(255, 2, 2)', // Actual color
                backgroundColor: 'rgba(255, 2, 2, 0.3)',
                fill: false,
            },
            {
                label: '10%-90% Range (Min)',
                data: range10_90_min,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.72)',
                fill: false, // No fill below this dataset
            },
            {
                label: '10%-90% Range (Max)',
                data: range10_90_max,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.72)',
                fill: '-1', // Fill to the previous dataset (min)
            },
            {
                label: '20%-80% Range (Min)',
                data: range20_80_min,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.58)',
                fill: false,
            },
            {
                label: '20%-80% Range (Max)',
                data: range20_80_max,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.58)',
                fill: '-1',
            },
            {
                label: '30%-70% Range (Min)',
                data: range30_70_min,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.40)',
                fill: false,
            },
            {
                label: '30%-70% Range (Max)',
                data: range30_70_max,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.40)',
                fill: '-1',
            },
            {
                label: '40%-60% Range (Min)',
                data: range40_60_min,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.24)',
                fill: false,
            },
            {
                label: '40%-60% Range (Max)',
                data: range40_60_max,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.24)',
                fill: '-1',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Probability Ranges of Total Investments Over Time',
            },
        },
        layout: {
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Years',
                },
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Total Investments ($)',
                },
            },
        },
    };

    return <Line data={data} options={options} />;
};

export const ProbabilityRangesChartDiscretionaryExpenses = ({ scenario, simulationResults }) => {
    const medianValues = {};

    // Collect incomes for each year
    simulationResults.forEach(simulation => {
        simulation.result.yearlyData.forEach(yearData => {
            if (medianValues[yearData.year] === undefined) {
                medianValues[yearData.year] = [];
            }
            medianValues[yearData.year].push(yearData.discretionaryExpenses);
        });
    });

    // Extract labels (years) and data (number of successful simulations)
    const labels = Object.keys(medianValues).sort((a, b) => a - b); // Sort years in ascending order
    const dataPoints = labels.map(year => getMedian(medianValues[year]));

    // TODO - FIGURE OUT WHAT THE RANGES ARE
    // FOR NOW THEY ARE DUMMY VALUES
    const range10_90_min = labels.map(year => getMedian(medianValues[year]) * 0.9);
    const range10_90_max = labels.map(year => getMedian(medianValues[year]) * 1.1);
    const range20_80_min = labels.map(year => getMedian(medianValues[year]) * 0.8);
    const range20_80_max = labels.map(year => getMedian(medianValues[year]) * 1.2);
    const range30_70_min = labels.map(year => getMedian(medianValues[year]) * 0.7);
    const range30_70_max = labels.map(year => getMedian(medianValues[year]) * 1.3);
    const range40_60_min = labels.map(year => getMedian(medianValues[year]) * 0.6);
    const range40_60_max = labels.map(year => getMedian(medianValues[year]) * 1.4);

    const data = {
        labels,
        datasets: [
            {
                label: 'Median Value',
                data: dataPoints,
                borderColor: 'rgb(255, 2, 2)', // Actual color
                backgroundColor: 'rgba(255, 2, 2, 0.3)',
                fill: false,
            },
            {
                label: '10%-90% Range (Min)',
                data: range10_90_min,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.72)',
                fill: false, // No fill below this dataset
            },
            {
                label: '10%-90% Range (Max)',
                data: range10_90_max,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.72)',
                fill: '-1', // Fill to the previous dataset (min)
            },
            {
                label: '20%-80% Range (Min)',
                data: range20_80_min,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.58)',
                fill: false,
            },
            {
                label: '20%-80% Range (Max)',
                data: range20_80_max,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.58)',
                fill: '-1',
            },
            {
                label: '30%-70% Range (Min)',
                data: range30_70_min,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.40)',
                fill: false,
            },
            {
                label: '30%-70% Range (Max)',
                data: range30_70_max,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.40)',
                fill: '-1',
            },
            {
                label: '40%-60% Range (Min)',
                data: range40_60_min,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.24)',
                fill: false,
            },
            {
                label: '40%-60% Range (Max)',
                data: range40_60_max,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.24)',
                fill: '-1',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Probability Ranges of Total Investments Over Time',
            },
        },
        layout: {
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Years',
                },
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Total Investments ($)',
                },
            },
        },
    };

    return <Line data={data} options={options} />;
};
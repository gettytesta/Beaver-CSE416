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

const ProbabilityRangesChart = ({ scenario, simulationResults }) => {
    const yearlyData = simulationResults.result.yearlyData;

    // Extract data for the chart
    const labels = yearlyData.map(data => data.year);

    // Example data for probability ranges (replace with actual calculations)
    const medianValues = yearlyData.map(data => data.income); // Median values (e.g., total income)
    const range10_90_min = yearlyData.map(data => data.income * 0.9);
    const range10_90_max = yearlyData.map(data => data.income * 1.1);
    const range20_80_min = yearlyData.map(data => data.income * 0.8);
    const range20_80_max = yearlyData.map(data => data.income * 1.2);
    const range30_70_min = yearlyData.map(data => data.income * 0.7);
    const range30_70_max = yearlyData.map(data => data.income * 1.3);
    const range40_60_min = yearlyData.map(data => data.income * 0.6);
    const range40_60_max = yearlyData.map(data => data.income * 1.4);

    const data = {
        labels,
        datasets: [
            {
                label: 'Median Value',
                data: medianValues,
                borderColor: 'rgb(255, 2, 2)', // Actual color
                backgroundColor: 'rgba(255, 2, 2, 0.3)',
                tension: 0.4,
                fill: false,
            },
            {
                label: '10%-90% Range (Min)',
                data: range10_90_min,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.72)',
                tension: 0.4,
                fill: false, // No fill below this dataset
            },
            {
                label: '10%-90% Range (Max)',
                data: range10_90_max,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.72)',
                tension: 0.4,
                fill: '-1', // Fill to the previous dataset (min)
            },
            {
                label: '20%-80% Range (Min)',
                data: range20_80_min,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.58)',
                tension: 0.4,
                fill: false,
            },
            {
                label: '20%-80% Range (Max)',
                data: range20_80_max,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.58)',
                tension: 0.4,
                fill: '-1',
            },
            {
                label: '30%-70% Range (Min)',
                data: range30_70_min,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.40)',
                tension: 0.4,
                fill: false,
            },
            {
                label: '30%-70% Range (Max)',
                data: range30_70_max,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.40)',
                tension: 0.4,
                fill: '-1',
            },
            {
                label: '40%-60% Range (Min)',
                data: range40_60_min,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.24)',
                tension: 0.4,
                fill: false,
            },
            {
                label: '40%-60% Range (Max)',
                data: range40_60_max,
                borderColor: 'rgba(23, 104, 144, 0)',
                backgroundColor: 'rgba(23, 104, 144, 0.24)',
                tension: 0.4,
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

export default ProbabilityRangesChart;
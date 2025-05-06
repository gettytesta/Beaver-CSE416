import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// 5.1 Multi-line chart of the value of a selected quantity over time
// The chart contains a line for each value of the parameter. The selected quantity may be
//     1. probability of success
//     2. median total investments

// TP - ChatGPT - Was asked to create functions for calculating the median of an array of numbers.
function getMedian(values) {
    values.sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    return values.length % 2 !== 0
    ? values[mid]
    : (values[mid - 1] + values[mid]) / 2;
}     

// TP - Github Copilot - Was fed the description from the requirements document as a prompt.
//                       The code required heavy editing however.

// simulationSetResults is a list of list of simulation results
export const MultiLineProbabilityOfSuccessChart = ({scenario, simulationSetResults}) => {
    const financialGoal = scenario.financialGoal;

    const datasets = [];
    const allYears = new Set();

    simulationSetResults.forEach((simulationSetThing, setIndex) => {
        const simulationResults = simulationSetThing.results;
        const successCounts = {}

        simulationResults.data.forEach(sim => {
            const simulation = sim.data
            simulation.result.yearlyData.forEach(yearData => {
                if (successCounts[yearData.year] === undefined) {
                    successCounts[yearData.year] = 0; // Initialize count for the year
                }
                const totalInvestments = yearData.investments.reduce((sum, investment) => sum + investment.value, 0);
                if (totalInvestments >= financialGoal) {
                    successCounts[yearData.year] += 1;
                }
                allYears.add(yearData.year); // Collect all unique years
            });
        })

        // Extract labels (years) and data (number of successful simulations)
        const sortedYears = Array.from(allYears).sort((a, b) => a - b);
        const dataPoints = sortedYears.map(year => (successCounts[year] || 0) / simulationResults.length * 100);

        datasets.push({
            label: `${simulationSetThing.parameter}: ${simulationSetThing.value}` ,
            data: dataPoints,
            borderColor: `hsl(${(setIndex * 360) / simulationSetResults.length}, 70%, 50%)`,
            backgroundColor: `hsla(${(setIndex * 360) / simulationSetResults.length}, 70%, 50%, 0.3)`,
        });
    })

    const data = {
        labels: Array.from(allYears).sort((a, b) => a - b), // Use all unique years as labels
        datasets,
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Probability of Success Over Time',
            },
        },
        layout: {
            padding: {
                top: 20, // Padding at the top
                right: 20, // Padding on the right
                bottom: 20, // Padding at the bottom
                left: 20, // Padding on the left
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Years', // Label for the x-axis
                },
            },
            y: {
                beginAtZero: true,
                max: 100, // Probability is between 0 and 1
                title: {
                    display: true,
                    text: 'Probability (%)', // Label for the y-axis
                },
            },
        },
    };

    return <Line data={data} options={options} />;
};

export const MultiLineMedianInvestmentsChart = ({scenario, simulationSetResults}) => {
    const datasets = [];
    const allYears = new Set();

    simulationSetResults.forEach((simulationSetThing, setIndex) => {
        const simulationResults = simulationSetThing.results;
        const medianValues = {}

        simulationResults.forEach(simulation => {
            simulation.result.yearlyData.forEach(yearData => {
                if (medianValues[yearData.year] === undefined) {
                    medianValues[yearData.year] = [];
                }
                const totalInvestments = yearData.investments.reduce((sum, investment) => sum + investment.value, 0);
    
                medianValues[yearData.year].push(totalInvestments);

                allYears.add(yearData.year); // Collect all unique years
            });
        })

        // Extract labels (years) and data (number of successful simulations)
        const sortedYears = Array.from(allYears).sort((a, b) => a - b);
        const dataPoints = sortedYears.map(year => getMedian(medianValues[year]));

        datasets.push({
            label: `${simulationSetThing.parameter}: ${simulationSetThing.value}`,
            data: dataPoints,
            borderColor: `hsl(${(setIndex * 360) / simulationSetResults.length}, 70%, 50%)`,
            backgroundColor: `hsla(${(setIndex * 360) / simulationSetResults.length}, 70%, 50%, 0.3)`,
        });
    })

    console.log("Datasets: ", datasets);

    const data = {
        labels: Array.from(allYears).sort((a, b) => a - b), // Use all unique years as labels
        datasets,
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Median Total Investments Over Time',
            },
        },
        layout: {
            padding: {
                top: 20, // Padding at the top
                right: 20, // Padding on the right
                bottom: 20, // Padding at the bottom
                left: 20, // Padding on the left
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Years', // Label for the x-axis
                },
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Probability (%)', // Label for the y-axis
                },
            },
        },
    };

    return <Line data={data} options={options} />;
};
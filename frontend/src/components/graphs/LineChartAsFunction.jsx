import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// 5.2 Line chart of a selected quantity as a function of parameter value
// This type of chart is applicable if the scenario parameter is numeric. The selected quantity may be
//     1. final value of probability of success
//     2. final value of median total investments

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

export const ProbSuccessLineChartAsFunction = ({scenario, simulationSetResults}) => {
    const financialGoal = scenario.financialGoal;
    const values = {}

    simulationSetResults.data.forEach((simulationSetThing, setIndex) => {
        const simulationResults = simulationSetThing.results;
        let successCount = 0;

        const lastYearSim = simulationResults.yearlyData[simulationResults.yearlyData.length - 1];
        console.log("Last Year Sim: ", lastYearSim);   
        const totalInvestments = lastYearSim.investments.reduce((sum, investment) => sum + investment.value, 0);
        if (totalInvestments >= financialGoal) {
            successCount += + 1;
        }
        values[simulationSetThing.value] = successCount * 100;
    })

    // Extract labels (years) and data (number of successful simulations)
    const labels = Object.keys(values).sort((a, b) => a - b); // Sort years in ascending order
    const dataPoints = labels.map(value => values[value]);

    const data = {
        labels,
        datasets: [
            {
                label: 'Probability of Success',
                data: dataPoints,
                borderColor: 'rgb(171, 19, 19)',
                backgroundColor: 'rgba(171, 19, 19,0.3)',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Probability of Success as a Function of ${simulationSetResults.data[0].parameter}`, // Title of the chart
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
                    text: 'Value', // Label for the x-axis
                },
            },
            y: {
                beginAtZero: true,
                max: 100, // Probability is between 0 and 1
                title: {
                    display: true,
                    text: 'Probability of Success (%)', // Label for the y-axis
                },
            },
        },
    };

    return <Line data={data} options={options} />;
};

export const InvesmentsLineChartAsFunction = ({scenario, simulationSetResults}) => {
    const financialGoal = scenario.financialGoal;
    const values = {}

    simulationSetResults.data.forEach((simulationSetThing, setIndex) => {
        const simulationResults = simulationSetThing.results;
        const totalInvestments = [];

        const lastYearSim = simulationResults.yearlyData[simulationResults.yearlyData.length - 1];
        const investments = lastYearSim.investments.reduce((sum, investment) => sum + investment.value, 0);
        totalInvestments.push(investments);

        values[simulationSetThing.value] = getMedian(totalInvestments);
    })

    // Extract labels (years) and data (number of successful simulations)
    const labels = Object.keys(values).sort((a, b) => a - b); // Sort years in ascending order
    const dataPoints = labels.map(value => values[value]);

    const data = {
        labels,
        datasets: [
            {
                label: 'Median Total Investments',
                data: dataPoints,
                borderColor: 'rgb(171, 19, 19)',
                backgroundColor: 'rgba(171, 19, 19,0.3)',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Median Total Investments as a function of ${simulationSetResults.data[0].parameter}`,
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
                    text: "Value", // Label for the x-axis
                },
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: simulationSetResults.data[0].parameter, // Label for the y-axis
                },
            },
        },
    };

    return <Line data={data} options={options} />;
};
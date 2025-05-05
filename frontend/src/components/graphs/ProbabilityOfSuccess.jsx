import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { data } from 'autoprefixer';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// 4.1 Line chart of probability of success over time
// This line chart shows the probability of success over time. For a given year, this is the percentage of
// simulations in which the financial goal is satisfied in that year. To determine whether the financial 
// goal is satisfied in a given year, it is sufficient to check the total value of investments at the end
// of the year. Note that a success probability less than 100% might be OK.

// TP - Github Copilot - Was fed the description from the requirements document as a prompt.
//                       The code required heavy editing however.

const ProbabilityOfSuccessChart = ({scenario, simulationResults}) => {
    const financialGoal = scenario.financialGoal;
    const successCounts = {};

    simulationResults.forEach(simulation => {
        simulation.result.yearlyData.forEach(yearData => {
            if (successCounts[yearData.year] === undefined) {
                successCounts[yearData.year] = 0; // Initialize count for the year
            }
            const totalInvestments = yearData.investments.reduce((sum, investment) => sum + investment.value, 0);
            if (totalInvestments >= financialGoal) {
                successCounts[yearData.year] += 1;
            }
        });
    })

    // Extract labels (years) and data (number of successful simulations)
    const labels = Object.keys(successCounts).sort((a, b) => a - b); // Sort years in ascending order
    const dataPoints = labels.map(year => successCounts[year] / simulationResults.length * 100);

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

export default ProbabilityOfSuccessChart;
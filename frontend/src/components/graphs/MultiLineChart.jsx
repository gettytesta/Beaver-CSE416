import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// 5.1 Multi-line chart of the value of a selected quantity over time
// The chart contains a line for each value of the parameter. The selected quantity may be
//     1. probability of success
//     2. median total investments

// TP - Github Copilot - Was fed the description from the requirements document as a prompt.
//                       The code required heavy editing however.

const ProbabilityOfSuccessChart = ({scenario, simulationResults}) => {
    const yearlyData = simulationResults.result.yearlyData;

    // Extract data for the chart
    const labels = yearlyData.map(data => data.year);
    const probabilities = yearlyData.map(data => data.yearGains / 50000 * 100);

    const data = {
        labels,
        datasets: [
            {
                label: 'Probability of Success',
                data: probabilities,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
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
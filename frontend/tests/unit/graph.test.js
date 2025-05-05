import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChartsPage from '../../src/components/Charts';

// Mock the subcomponents with named exports
jest.mock('../../src/components/graphs/ProbabilityOfSuccess', () => ({
    ProbabilityOfSuccessChart: () => <div>Probability of Success</div>,
}));
jest.mock('../../src/components/graphs/ProbabilityRanges', () => ({
    ProbabilityRangesChartWithdrawalTax: () => <div>Probability Ranges</div>,
}));
jest.mock('../../src/components/graphs/StackedBarChart', () => ({
    StackedBarChartInvestments: () => <div>Stacked Bar Chart</div>,
}));

describe('ChartsPage Component', () => {
    test('renders the ChartsPage and displays the first chart', () => {
        render(<ChartsPage />);
        // Check that the scenario name is displayed
        expect(screen.getByText('Dummy Scenario')).toBeInTheDocument();

        // Check that the first chart (Probability of Success) is displayed
        expect(screen.getByText('Probability of Success')).toBeInTheDocument();
    });

    test('navigates to the next chart when the right arrow is clicked', () => {
        render(<ChartsPage />);
        const nextButton = screen.getByTitle('Next Chart');

        // Click the next button to navigate to the second chart
        fireEvent.click(nextButton);
        expect(screen.getByText('Probability Ranges')).toBeInTheDocument();

        // Click the next button again to navigate to the third chart
        fireEvent.click(nextButton);
        expect(screen.getByText('Stacked Bar Chart')).toBeInTheDocument();
    });

    test('navigates to the previous chart when the left arrow is clicked', () => {
        render(<ChartsPage />);
        const prevButton = screen.getByTitle('Previous Chart');

        // Click the previous button to navigate to the last chart
        fireEvent.click(prevButton);
        expect(screen.getByText('Stacked Bar Chart')).toBeInTheDocument();

        // Click the previous button again to navigate to the second chart
        fireEvent.click(prevButton);
        expect(screen.getByText('Probability Ranges')).toBeInTheDocument();
    });

    test('cycles back to the first chart after the last chart', () => {
        render(<ChartsPage />);
        const nextButton = screen.getByTitle('Next Chart');

        // Navigate through all charts and cycle back to the first chart
        fireEvent.click(nextButton); // Go to Probability Ranges
        fireEvent.click(nextButton); // Go to Stacked Bar Chart
        fireEvent.click(nextButton); // Cycle back to Probability of Success
        expect(screen.getByText('Probability of Success')).toBeInTheDocument();
    });

    test('cycles back to the last chart when navigating left from the first chart', () => {
        render(<ChartsPage />);
        const prevButton = screen.getByTitle('Previous Chart');

        // Navigate to the last chart by clicking the previous button from the first chart
        fireEvent.click(prevButton);
        expect(screen.getByText('Stacked Bar Chart')).toBeInTheDocument();
    });

    test('renders the correct chart content when navigating multiple times', () => {
        render(<ChartsPage />);
        const nextButton = screen.getByTitle('Next Chart');
        const prevButton = screen.getByTitle('Previous Chart');

        // Navigate forward twice
        fireEvent.click(nextButton);
        fireEvent.click(nextButton);
        expect(screen.getByText('Stacked Bar Chart')).toBeInTheDocument();

        // Navigate backward once
        fireEvent.click(prevButton);
        expect(screen.getByText('Probability Ranges')).toBeInTheDocument();

        // Navigate backward again to the first chart
        fireEvent.click(prevButton);
        expect(screen.getByText('Probability of Success')).toBeInTheDocument();
    });

    test('does not throw errors when navigating with no charts', () => {
        // Mock ChartsPage with no charts
        jest.spyOn(React, 'useState').mockImplementation(() => [0, jest.fn()]);
        render(<ChartsPage />);

        const nextButton = screen.getByTitle('Next Chart');
        const prevButton = screen.getByTitle('Previous Chart');

        // Ensure no errors occur when clicking navigation buttons
        fireEvent.click(nextButton);
        fireEvent.click(prevButton);

        // Restore original useState
        jest.restoreAllMocks();
    });
});
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChartsPage from '../../src/components/Charts';

// Mock the subcomponents
jest.mock('../../src/components/graphs/ProbabilityOfSuccess', () => () => <div>Probability of Success</div>);
jest.mock('../../src/components/graphs/ProbabilityRanges', () => () => <div>Probability Ranges</div>);
jest.mock('../../src/components/graphs/StackedBarChart', () => () => <div>Stacked Bar Chart</div>);

const scenario = {
    name: "Dummy Scenario",
    financialGoal: 100000,
};

describe('ChartsPage Component', () => {
    test('renders the ChartsPage and displays the first chart', () => {
        render(<ChartsPage />);
        expect(screen.getByText('Dummy Scenario')).toBeInTheDocument();
        expect(screen.getByText('Probability of Success')).toBeInTheDocument();
    });

    test('navigates to the next chart when the right arrow is clicked', () => {
        render(<ChartsPage />);
        const nextButton = screen.getByText('→');
        fireEvent.click(nextButton);
        expect(screen.getByText('Probability Ranges')).toBeInTheDocument();
    });

    test('navigates to the previous chart when the left arrow is clicked', () => {
        render(<ChartsPage />);
        const prevButton = screen.getByText('←');
        fireEvent.click(prevButton);
        expect(screen.getByText('Stacked Bar Chart')).toBeInTheDocument();
    });
});
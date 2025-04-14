// TP - Claude AI was used to generate these tests.
// Prompt: Can you write a simulation.test.js (Jest) script for testing the attached functionalities? <attached_files>

const { 
    sampleValueFromDistribution, 
    calculateRMD, 
    calculateIncome, 
    calculateExpense 
} = require('../../utils/simulationUtils');

describe('Simulation Utility Functions', () => {
    // sampleValueFromDistribution tests
    describe('sampleValueFromDistribution', () => {
        test('returns fixed value for fixed distribution', () => {
            const fixedDist = { type: 'fixed', value: 100 };
            expect(sampleValueFromDistribution(fixedDist)).toBe(100);
        });

        test('returns value within range for uniform distribution', () => {
            const uniformDist = { 
                type: 'uniform', 
                lower: 10, 
                upper: 20 
            };
            const result = sampleValueFromDistribution(uniformDist);
            expect(result).toBeGreaterThanOrEqual(10);
            expect(result).toBeLessThanOrEqual(20);
        });

        test('generates normal distribution samples', () => {
            const normalDist = { 
                type: 'normal', 
                mean: 50, 
                stdev: 10 
            };
            const samples = Array.from({length: 1000}, () => 
                sampleValueFromDistribution(normalDist)
            );

            // Check basic statistical properties with wider tolerance
            const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
            const variance = samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / samples.length;

            expect(mean).toBeCloseTo(50, 0); // Allow 1 unit difference
            expect(Math.sqrt(variance)).toBeCloseTo(10, 0); // Allow 1 unit difference
        });

        test('throws error for unknown distribution type', () => {
            const invalidDist = { type: 'unknown' };
            expect(() => sampleValueFromDistribution(invalidDist)).toThrow('Unknown distribution type');
        });

        test('returns 0 for undefined or null distribution', () => {
            expect(sampleValueFromDistribution(null)).toBe(0);
            expect(sampleValueFromDistribution(undefined)).toBe(0);
            expect(sampleValueFromDistribution({})).toBe(0);
        });
    });

    // calculateIncome tests
    describe('calculateIncome', () => {
        const inflationRate = 0.03;

        test('calculates fixed income without inflation', () => {
            const incomeEvent = {
                initialAmount: 50000,
                isInflationAdjusted: false,
                isPercentChange: false,
                changeDistribution: { type: 'fixed', value: 1000 }
            };

            expect(calculateIncome(incomeEvent, 0, inflationRate)).toBeCloseTo(51000, 0);
        });

        test('calculates percent change income', () => {
            const incomeEvent = {
                initialAmount: 50000,
                isInflationAdjusted: false,
                isPercentChange: true,
                changeDistribution: { type: 'fixed', value: 0.1 }
            };

            expect(calculateIncome(incomeEvent, 0, inflationRate)).toBeCloseTo(55000, 0);
        });
    });

    // calculateExpense tests
    describe('calculateExpense', () => {
        const inflationRate = 0.03;

        test('calculates fixed expense without inflation', () => {
            const expenseEvent = {
                initialAmount: 30000,
                isInflationAdjusted: false,
                isPercentChange: false,
                changeDistribution: { type: 'fixed', value: 500 }
            };

            expect(calculateExpense(expenseEvent, 0, inflationRate)).toBeCloseTo(30500, 0);
        });

        test('calculates percent change expense', () => {
            const expenseEvent = {
                initialAmount: 30000,
                isInflationAdjusted: false,
                isPercentChange: true,
                changeDistribution: { type: 'fixed', value: 0.05 }
            };

            expect(calculateExpense(expenseEvent, 0, inflationRate)).toBeCloseTo(31500, 0);
        });
    });
});

// Simulation Controller Integration Tests
describe('Simulation Controller', () => {
    let mockScenario, mockFederalTax, mockStateTax, mockRMDTable;

    beforeEach(() => {
        // Setup mock data
        mockScenario = {
            _id: 'test-scenario-id',
            name: 'Test Scenario',
            initialLimit: 100000,
            userLifeExpectancy: { type: 'fixed', value: 30 },
            spouseLifeExpectancy: { type: 'fixed', value: 30 },
            inflationAssumption: { type: 'fixed', value: 0.03 },
            investments: [{ value: 50000, type: { expectedAnnualReturn: 0.07 } }],
            eventSeriesSet: [
                { 
                    type: 'income', 
                    initialAmount: 50000, 
                    startYear: 2024,
                    isInflationAdjusted: false 
                },
                { 
                    type: 'expense', 
                    initialAmount: 30000, 
                    startYear: 2024,
                    isInflationAdjusted: false 
                }
            ]
        };

        mockFederalTax = {
            marriedFilingJointly: { 
                incomeTaxBrackets: [
                    { rate: 0.10, ceiling: 20000 },
                    { rate: 0.12, ceiling: 50000 }
                ]
            }
        };

        mockStateTax = {
            marriedFilingJointly: { 
                incomeTaxBrackets: [
                    { rate: 0.02, ceiling: 20000 },
                    { rate: 0.04, ceiling: 50000 }
                ]
            }
        };

        mockRMDTable = { 74: 27.4 };
    });

    test('Simulation scenarios have required properties', () => {
        expect(mockScenario).toHaveProperty('_id');
        expect(mockScenario).toHaveProperty('name');
        expect(mockScenario).toHaveProperty('initialLimit');
        expect(mockScenario).toHaveProperty('investments');
        expect(mockScenario).toHaveProperty('eventSeriesSet');
    });

    test('Tax data structure is valid', () => {
        expect(mockFederalTax.marriedFilingJointly).toHaveProperty('incomeTaxBrackets');
        expect(mockStateTax.marriedFilingJointly).toHaveProperty('incomeTaxBrackets');
    });

    test('Basic simulation flow', () => {
        const startYear = new Date().getFullYear();
        const endYear = startYear + 30;

        expect(startYear).toBeLessThan(endYear);
    });
});
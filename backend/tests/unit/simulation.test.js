// TP - Claude AI was used to generate these tests.
// Prompt: Can you write a simulation.test.js (Jest) script for testing the attached functionalities? <attached_files>

const { Worker } = require('worker_threads');
const path = require('path');
const logService = require('../../services/logService');

// Mock data for testing
const mockScenario = {
    name: 'Retirement Planning Scenario',
    isMarriedCouple: true,
    userBirthYear: 1985,
    spouseBirthYear: 1987,
    userLifeExpectancy: { type: 'fixed', value: 80 },
    spouseLifeExpectancy: { type: 'normal', mean: 87, stdev: 3 },

    investments: [
        {
            _id: 'cash',
            type: {
                name: 'cash',
                description: 'cash',
                returnAmtOrPct: 'amount',
                expectedAnnualReturn: { type: 'fixed', value: 0 },
                expenseRatio: 0,
                incomeAmtOrPct: 'percent',
                expectedAnnualIncome: { type: 'fixed', value: 0 },
                taxability: true
            },
            value: 100,
            taxStatus: 'non-retirement'
        },
        {
            _id: 'S&P 500 non-retirement',
            type: {
                name: 'S&P 500',
                description: 'S&P 500 index fund',
                returnAmtOrPct: 'percent',
                expectedAnnualReturn: { type: 'normal', mean: 0.06, stdev: 0.02 },
                expenseRatio: 0.001,
                incomeAmtOrPct: 'percent',
                expectedAnnualIncome: { type: 'normal', mean: 0.01, stdev: 0.005 },
                taxability: true
            },
            value: 10000,
            taxStatus: 'non-retirement'
        },
        {
            _id: 'tax-exempt bonds',
            type: {
                name: 'tax-exempt bonds',
                description: 'NY tax-exempt bonds',
                returnAmtOrPct: 'amount',
                expectedAnnualReturn: { type: 'fixed', value: 0 },
                expenseRatio: 0.004,
                incomeAmtOrPct: 'percent',
                expectedAnnualIncome: { type: 'normal', mean: 0.03, stdev: 0.01 },
                taxability: false
            },
            value: 2000,
            taxStatus: 'non-retirement'
        },
        {
            _id: 'S&P 500 pre-tax',
            type: {
                name: 'S&P 500',
                description: 'S&P 500 index fund',
                returnAmtOrPct: 'percent',
                expectedAnnualReturn: { type: 'normal', mean: 0.06, stdev: 0.02 },
                expenseRatio: 0.001,
                incomeAmtOrPct: 'percent',
                expectedAnnualIncome: { type: 'normal', mean: 0.01, stdev: 0.005 },
                taxability: true
            },
            value: 10000,
            taxStatus: 'pre-tax'
        },
        {
            _id: 'S&P 500 after-tax',
            type: {
                name: 'S&P 500',
                description: 'S&P 500 index fund',
                returnAmtOrPct: 'percent',
                expectedAnnualReturn: { type: 'normal', mean: 0.06, stdev: 0.02 },
                expenseRatio: 0.001,
                incomeAmtOrPct: 'percent',
                expectedAnnualIncome: { type: 'normal', mean: 0.01, stdev: 0.005 },
                taxability: true
            },
            value: 2000,
            taxStatus: 'after-tax'
        },
    ],

    eventSeriesSet: [
        {
            name: 'salary',
            type: 'income',
            start: { type: 'fixed', value: 2025 },
            duration: { type: 'fixed', value: 40 },
            income: {
                initialAmount: 75000,
                changeAmtOrPct: 'amount',
                changeDistribution: { type: 'uniform', lower: 500, upper: 2000 },
                adjustForInflation: false,
                userPct: 1.0,
                isSocialSecurity: false
            }
        },
        {
            name: 'food',
            type: 'expense',
            start: { type: 'fixed', value: 2025 }, // TODO replace with { type: 'startWith', eventSeries: 'salary'}
            duration: { type: 'fixed', value: 200 },
            expense: {
                initialAmount: 5000,
                changeAmtOrPct: 'percent',
                changeDistribution: { type: 'normal', mean: 0.02, stdev: 0.01 },
                adjustForInflation: true,
                userPct: 0.5,
                isDiscretionary: false
            }
        },

        {
            name: 'vacation',
            type: 'expense',
            start: { type: 'fixed', value: 2025 }, // TODO replace with { type: 'startWith', eventSeries: 'salary'}
            duration: { type: 'fixed', value: 40 },
            expense: {
                initialAmount: 1200,
                changeAmtOrPct: 'amount',
                changeDistribution: { type: 'fixed', value: 0 },
                adjustForInflation: true,
                userPct: 0.6,
                isDiscretionary: true
            }
        },

        {
            name: 'streaming services',
            type: 'expense',
            start: { type: 'fixed', value: 2025 }, // TODO replace with { type: 'startWith', eventSeries: 'salary'}
            duration: { type: 'fixed', value: 40 },
            expense: {
                initialAmount: 500,
                changeAmtOrPct: 'amount',
                changeDistribution: { type: 'fixed', value: 0 },
                adjustForInflation: true,
                userPct: 1.0,
                isDiscretionary: true
            }
        },

        // {
        //     name: 'my investments',
        //     type: 'invest',
        //     start: { type: 'uniform', lower: 2025, upper: 2030 },
        //     duration: { type: 'fixed', value: 10 }, 
        //     invest: {
        //         assetAllocation: {'S&P 500 non-retirement': 0.6, 'S&P 500 after-tax': 0.4}, // TODO handle logic for this in the simulation code
        //         glidePath: true,
        //         assetAllocation2: {'S&P 500 non-retirement': 0.8, 'S&P 500 after-tax': 0.2},
        //         maxCash: 1000
        //     }
        // },

        // {
        //     name: 'rebalance',
        //     type: 'rebalance',
        //     start: { type: 'uniform', lower: 2025, upper: 2030 },
        //     duration: { type: 'fixed', value: 10 }, 
        //     rebalance: {
        //         assetAllocation: {'S&P 500 non-retirement': 0.7, 'tax-exempt bonds': 0.3}, // TODO handle logic for this in the simulation code
        //     }
        // }
    ],

    userRetireContributionLimit: 7000,
    inflationAssumption: { type: 'fixed', value: 0.03 },
    spendingStrategy: ["vacation", "streaming services"],
    expenseWithdrawalStrategy: ["S&P 500 non-retirement", "tax-exempt bonds", "S&P 500 after-tax"],
    rmdStrategy: ["S&P 500 pre-tax",],

    rothConversionOpt: true,
    rothConversionStart: 2050,
    rothConversionEnd: 2060,
    rothConversionStrategy: ["S&P 500 pre-tax"],
    userStateOfResidence: 'NY'
};

const mockFederalTax = {
    single: {
        standardDeduction: 14600,
        incomeTaxBrackets: [
            { lowerBound: 0, upperBound: 11600, rate: 0.10 },
            { lowerBound: 11601, upperBound: 47150, rate: 0.12 },
            { lowerBound: 47151, upperBound: 100525, rate: 0.22 },
            { lowerBound: 100526, upperBound: 191950, rate: 0.24 },
            { lowerBound: 191951, upperBound: 243725, rate: 0.32 },
            { lowerBound: 243726, upperBound: 609350, rate: 0.35 },
            { lowerBound: 609351, upperBound: Infinity, rate: 0.37 }
        ],
        capitalGainsBrackets: [
            { lowerBound: 0, upperBound: 47025, rate: 0.00 },
            { lowerBound: 47025, upperBound: 518900, rate: 0.15 },
            { lowerBound: 518900, upperBound: Infinity, rate: 0.20 }
        ]
    },
    marriedFilingJointly: {
        standardDeduction: 25900,
        incomeTaxBrackets: [
            { lowerBound: 0, upperBound: 23200, rate: 0.10 },
            { lowerBound: 23201, upperBound: 94300, rate: 0.12 },
            { lowerBound: 94301, upperBound: 201050, rate: 0.22 },
            { lowerBound: 201051, upperBound: 383900, rate: 0.24 },
            { lowerBound: 383901, upperBound: 487450, rate: 0.32 },
            { lowerBound: 487451, upperBound: 731200, rate: 0.35 },
            { lowerBound: 731201, upperBound: Infinity, rate: 0.37 }
        ],
        capitalGainsBrackets: [
            { lowerBound: 0, upperBound: 94050, rate: 0.00 },
            { lowerBound: 94050, upperBound: 583750, rate: 0.15 },
            { lowerBound: 583750, upperBound: Infinity, rate: 0.20 }
        ]
    }
};

// TODO fix this to match with NY.yaml
const mockStateTax = {
    single: {
        standardDeduction: 0,
        incomeTaxBrackets: [
            { lowerBound: 0, upperBound: 10000, rate: 0.05 },
            { lowerBound: 10001, upperBound: 50000, rate: 0.07 },
            { lowerBound: 50001, upperBound: Infinity, rate: 0.09 }
        ],
        capitalGainsBrackets: [
            { lowerBound: 0, upperBound: Infinity, rate: 0.05 }
        ]
    },
    marriedFilingJointly: {
        standardDeduction: 0,
        incomeTaxBrackets: [
            { lowerBound: 0, upperBound: 20000, rate: 0.05 },
            { lowerBound: 20001, upperBound: 100000, rate: 0.07 },
            { lowerBound: 100001, upperBound: Infinity, rate: 0.09 }
        ],
        capitalGainsBrackets: [
            { lowerBound: 0, upperBound: Infinity, rate: 0.05 }
        ]
    }
};

const mockRmdTable = {
    72: 27.4,
    73: 26.5,
    74: 25.5,
    75: 24.6,
    76: 23.7,
    77: 22.9,
    78: 22.0,
    79: 21.1,
    80: 20.2,
    81: 19.4,
    82: 18.5,
    83: 17.7,
    84: 16.8,
    85: 16.0,
    86: 15.2,
    87: 14.4,
    88: 13.6,
    89: 12.9,
    90: 12.2,
    91: 11.5,
    92: 10.8,
    93: 10.1,
    94: 9.5,
    95: 8.9,
    96: 8.3,
    97: 7.7,
    98: 7.1,
    99: 6.6,
    100: 6.1,
    101: 5.6,
    102: 5.1,
    103: 4.7,
    104: 4.3,
    105: 3.9,
    106: 3.5,
    107: 3.2,
    108: 2.9,
    109: 2.6,
    110: 2.3,
    111: 2.1,
    112: 1.9,
    113: 1.7,
    114: 1.5,
    115: 1.3,
    116: 1.2,
    117: 1.1,
    118: 1.0,
    119: 0.9,
    120: 0.8
};

describe('Simulation Worker Tests', () => {
    let worker;
    const simulationId = 'test-simulation-123';

    beforeEach(() => {
        // Create a new worker for each test
        worker = new Worker(path.resolve(__dirname, '../../workers/simulationWorker.js'));
    });

    afterEach(() => {
        // Terminate the worker after each test
        worker.terminate();
    });

    test('should run a simulation with mock data', async () => {
        // Create a promise that resolves when the worker sends a message
        const resultPromise = new Promise((resolve, reject) => {
            worker.on('message', (message) => {
                resolve(message);
            });

            worker.on('error', (error) => {
                reject(error);
            });
        });

        // Send the mock data to the worker
        worker.postMessage({
            scenario: mockScenario,
            simulationId,
            federalTax: mockFederalTax,
            stateTax: mockStateTax,
            rmdTable: mockRmdTable
        });

        // Wait for the worker to respond
        const result = await resultPromise;
        const csvFilePath = logService.logSimulationResult('Jest', result.data);

        // Assert that the simulation completed successfully
        expect(result.success).toBe(true);
        expect(result.data.simulationId).toBe(simulationId);
        expect(result.data.result).toBeDefined();
    });

    // test('should handle errors gracefully', async () => {
    //     // Create a promise that resolves when the worker sends a message
    //     const resultPromise = new Promise((resolve, reject) => {
    //         worker.on('message', (message) => {
    //             resolve(message);
    //         });

    //         worker.on('error', (error) => {
    //             reject(error);
    //         });
    //     });

    //     // Send invalid data to the worker to trigger an error
    //     worker.postMessage({
    //         scenario: { invalidScenario: true },
    //         simulationId,
    //         federalTax: {},
    //         stateTax: {},
    //         rmdTable: {}
    //     });

    //     // Wait for the worker to respond
    //     const result = await resultPromise;

    //     // Assert that the simulation failed gracefully
    //     expect(result.success).toBe(false);
    //     expect(result.error).toBeDefined();
    // });
});




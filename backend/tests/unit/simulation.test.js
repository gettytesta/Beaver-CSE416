// Used Claude AI to generate these tests.
// Prompt: Can you write a simulation.test.js (Jest) script for testing simulationWorker.js?

const { Worker } = require('worker_threads');
const path = require('path');

// Mock data for testing
const mockScenario = {
  userBirthYear: 1960,
  spouseBirthYear: 1962,
  userLifeExpectancy: { type: 'fixed', value: 85 },
  spouseLifeExpectancy: { type: 'fixed', value: 87 },
  isMarriedCouple: true,
  userRetireContributionLimit: 19500,
  spouseRetireContributionLimit: 19500,
  inflationAssumption: { type: 'fixed', value: 0.03 },
  investments: [
    {
      id: 'cash',
      type: { name: 'cash' },
      value: 50000,
      taxStatus: 'after-tax'
    },
    {
      id: 'ira',
      type: { name: 'stock' },
      value: 100000,
      taxStatus: 'pre-tax'
    },
    {
      id: 'roth',
      type: { name: 'bond' },
      value: 50000,
      taxStatus: 'after-tax'
    }
  ],
  eventSeriesSet: [
    {
      type: 'income',
      start: { type: 'fixed', value: 2023 },
      duration: { type: 'fixed', value: 20 },
      income: {
        initialAmount: 80000,
        changeAmtOrPct: 'percent',
        changeDistribution: { type: 'fixed', value: 0.02 },
        adjustForInflation: true,
        userPct: 60,
        isSocialSecurity: false
      }
    },
    {
      type: 'expense',
      start: { type: 'fixed', value: 2023 },
      duration: { type: 'fixed', value: 30 },
      expense: {
        initialAmount: 40000,
        changeAmtOrPct: 'percent',
        changeDistribution: { type: 'fixed', value: 0.03 },
        adjustForInflation: true,
        isDiscretionary: false
      }
    }
  ]
};

const mockFederalTax = {
  single: {
    standardDeduction: 12950,
    incomeTaxBrackets: [
      { lowerBound: 0, upperBound: 11000, rate: 0.10 },
      { lowerBound: 11001, upperBound: 44725, rate: 0.12 },
      { lowerBound: 44726, upperBound: 95375, rate: 0.22 },
      { lowerBound: 95376, upperBound: 182100, rate: 0.24 },
      { lowerBound: 182101, upperBound: 231250, rate: 0.32 },
      { lowerBound: 231251, upperBound: 578125, rate: 0.35 },
      { lowerBound: 578126, upperBound: Infinity, rate: 0.37 }
    ],
    capitalGainsBrackets: [
      { lowerBound: 0, upperBound: 44500, rate: 0.00 },
      { lowerBound: 44501, upperBound: 492300, rate: 0.15 },
      { lowerBound: 492301, upperBound: Infinity, rate: 0.20 }
    ]
  },
  marriedFilingJointly: {
    standardDeduction: 25900,
    incomeTaxBrackets: [
      { lowerBound: 0, upperBound: 22000, rate: 0.10 },
      { lowerBound: 22001, upperBound: 89450, rate: 0.12 },
      { lowerBound: 89451, upperBound: 190750, rate: 0.22 },
      { lowerBound: 190751, upperBound: 364200, rate: 0.24 },
      { lowerBound: 364201, upperBound: 462500, rate: 0.32 },
      { lowerBound: 462501, upperBound: 693750, rate: 0.35 },
      { lowerBound: 693751, upperBound: Infinity, rate: 0.37 }
    ],
    capitalGainsBrackets: [
      { lowerBound: 0, upperBound: 89000, rate: 0.00 },
      { lowerBound: 89001, upperBound: 553850, rate: 0.15 },
      { lowerBound: 553851, upperBound: Infinity, rate: 0.20 }
    ]
  }
};

const mockStateTax = {
  single: {
    standardDeduction: 5000,
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
    standardDeduction: 10000,
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

    // Assert that the simulation completed successfully
    expect(result.success).toBe(true);
    expect(result.data.simulationId).toBe(simulationId);
    expect(result.data.result).toBeDefined();
  });

  test('should handle errors gracefully', async () => {
    // Create a promise that resolves when the worker sends a message
    const resultPromise = new Promise((resolve, reject) => {
      worker.on('message', (message) => {
        resolve(message);
      });
      
      worker.on('error', (error) => {
        reject(error);
      });
    });

    // Send invalid data to the worker to trigger an error
    worker.postMessage({
      scenario: { invalidScenario: true },
      simulationId,
      federalTax: {},
      stateTax: {},
      rmdTable: {}
    });

    // Wait for the worker to respond
    const result = await resultPromise;

    // Assert that the simulation failed gracefully
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});




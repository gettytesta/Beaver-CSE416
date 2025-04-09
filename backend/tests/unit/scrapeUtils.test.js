const axios = require('axios');
const cheerio = require('cheerio');
const { 
    parseMoneyToNumber, 
    parseRateToDecimal, 
    initializeFederalTaxData,
    extractTaxBracketsFromTable, 
    scrapeIncomeTaxBrackets,
    scrapeStandardDeductions,
    parseCapitalGainsRatesAndThresholds,
    buildCapitalGainsBrackets,
    scrapeCapitalGainsBrackets,
    scrapeFederalTax 
} = require('../../utils/scrapeUtils');

// Mock axios to prevent actual network requests during tests
jest.mock('axios');

describe('Scrape Utils - Money and Rate Parsing', () => {
    describe('parseMoneyToNumber', () => {
        test('parses dollar amount correctly', () => {
            expect(parseMoneyToNumber('$1,234.56')).toBe(1234.56);
        });

        test('handles "and up" text by returning Infinity', () => {
            expect(parseMoneyToNumber('$500,000 and up')).toBe(Infinity);
        });

        test('returns 0 for empty input', () => {
            expect(parseMoneyToNumber('')).toBe(0);
            expect(parseMoneyToNumber(null)).toBe(0);
            expect(parseMoneyToNumber(undefined)).toBe(0);
        });
    });

    describe('parseRateToDecimal', () => {
        test('parses percentage correctly', () => {
            expect(parseRateToDecimal('10%')).toBe(0.1);
            expect(parseRateToDecimal('37.5%')).toBe(0.375);
        });

        test('returns 0 for empty input', () => {
            expect(parseRateToDecimal('')).toBe(0);
            expect(parseRateToDecimal(null)).toBe(0);
            expect(parseRateToDecimal(undefined)).toBe(0);
        });
    });
});

describe('Scrape Utils - Federal Tax Data Initialization', () => {
    test('initializes federal tax data with correct structure', () => {
        const year = 2023;
        const data = initializeFederalTaxData(year);
        
        expect(data).toHaveProperty('year', 2023);
        expect(data).toHaveProperty('single');
        expect(data).toHaveProperty('marriedFilingJointly');
        
        expect(data.single).toHaveProperty('standardDeduction', 0);
        expect(data.single).toHaveProperty('incomeTaxBrackets', []);
        expect(data.single).toHaveProperty('capitalGainsBrackets', []);
        
        expect(data.marriedFilingJointly).toHaveProperty('standardDeduction', 0);
        expect(data.marriedFilingJointly).toHaveProperty('incomeTaxBrackets', []);
        expect(data.marriedFilingJointly).toHaveProperty('capitalGainsBrackets', []);
    });
});

describe('Scrape Utils - Tax Bracket Extraction', () => {
    test('extracts tax brackets from table correctly', () => {
        // Create a mock HTML table
        const html = `
            <table>
                <tbody>
                    <tr>
                        <td>10%</td>
                        <td>$0</td>
                        <td>$10,275</td>
                    </tr>
                    <tr>
                        <td>12%</td>
                        <td>$10,276</td>
                        <td>$41,775</td>
                    </tr>
                    <tr>
                        <td>37%</td>
                        <td>$539,901</td>
                        <td>and up</td>
                    </tr>
                </tbody>
            </table>
        `;
        
        const $ = cheerio.load(html);
        const table = $('table');
        const brackets = extractTaxBracketsFromTable($, table);
        
        expect(brackets).toHaveLength(3);
        
        expect(brackets[0]).toEqual({
            rate: 0.1,
            lowerBound: 0,
            upperBound: 10275
        });
        
        expect(brackets[1]).toEqual({
            rate: 0.12,
            lowerBound: 10276,
            upperBound: 41775
        });
        
        expect(brackets[2]).toEqual({
            rate: 0.37,
            lowerBound: 539901,
            upperBound: Infinity
        });
    });
    
    test('returns empty array for invalid table', () => {
        const html = '<table><tbody></tbody></table>';
        const $ = cheerio.load(html);
        const table = $('table');
        
        expect(extractTaxBracketsFromTable($, table)).toEqual([]);
    });
});

describe('Scrape Utils - Income Tax Brackets', () => {
    beforeEach(() => {
        // Reset all mocks
        jest.resetAllMocks();
    });
    
    test('scrapes income tax brackets successfully', async () => {
        // Mock HTML response from IRS website
        const mockedHtml = `
            <h2>Tax Rates for Single Taxpayers</h2>
            <table>
                <tbody>
                    <tr>
                        <td>10%</td>
                        <td>$0</td>
                        <td>$10,275</td>
                    </tr>
                    <tr>
                        <td>12%</td>
                        <td>$10,276</td>
                        <td>$41,775</td>
                    </tr>
                </tbody>
            </table>
            
            <h4><a>Married filing jointly</a></h4>
            <div class="collapsible-item-collapse">
                <table>
                    <tbody>
                        <tr>
                            <td>10%</td>
                            <td>$0</td>
                            <td>$20,550</td>
                        </tr>
                        <tr>
                            <td>12%</td>
                            <td>$20,551</td>
                            <td>$83,550</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        
        // Mock axios response
        axios.get.mockResolvedValue({ data: mockedHtml });
        
        // Initialize empty federal tax data
        const federalTaxData = initializeFederalTaxData(2023);
        
        // Call the function
        const result = await scrapeIncomeTaxBrackets(federalTaxData);
        
        // Check that axios was called with the correct URL
        expect(axios.get).toHaveBeenCalledWith('https://www.irs.gov/filing/federal-income-tax-rates-and-brackets');
        
        // Verify the results
        expect(result.single.incomeTaxBrackets).toHaveLength(2);
        expect(result.marriedFilingJointly.incomeTaxBrackets).toHaveLength(2);
        
        expect(result.single.incomeTaxBrackets[0]).toEqual({
            rate: 0.1,
            lowerBound: 0,
            upperBound: 10275
        });
        
        expect(result.marriedFilingJointly.incomeTaxBrackets[0]).toEqual({
            rate: 0.1,
            lowerBound: 0,
            upperBound: 20550
        });
    });
    
    test('throws error when single brackets not found', async () => {
        // Mock HTML with no single taxpayer table
        const mockedHtml = `
            <h4><a>Married filing jointly</a></h4>
            <div class="collapsible-item-collapse">
                <table>
                    <tbody>
                        <tr>
                            <td>10%</td>
                            <td>$0</td>
                            <td>$20,550</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        
        axios.get.mockResolvedValue({ data: mockedHtml });
        const federalTaxData = initializeFederalTaxData(2023);
        
        await expect(scrapeIncomeTaxBrackets(federalTaxData)).rejects.toThrow('Failed to extract income tax brackets for single filers');
    });
    
    test('throws error when married brackets not found', async () => {
        // Mock HTML with no married filing jointly table
        const mockedHtml = `
            <h2>Tax Rates for Single Taxpayers</h2>
            <table>
                <tbody>
                    <tr>
                        <td>10%</td>
                        <td>$0</td>
                        <td>$10,275</td>
                    </tr>
                </tbody>
            </table>
        `;
        
        axios.get.mockResolvedValue({ data: mockedHtml });
        const federalTaxData = initializeFederalTaxData(2023);
        
        await expect(scrapeIncomeTaxBrackets(federalTaxData)).rejects.toThrow('Failed to extract income tax brackets for married filing jointly');
    });
});

describe('Scrape Utils - Standard Deductions', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    
    test('scrapes standard deductions successfully', async () => {
        // Mock HTML response with standard deduction table
        const mockedHtml = `
            <p class="title">Table 10-1. Standard Deductions</p>
            <div class="table-contents">
                <table>
                    <tbody>
                        <tr>
                            <td>Single</td>
                            <td>$13,850</td>
                        </tr>
                        <tr>
                            <td>Married filing jointly</td>
                            <td>$27,700</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        
        axios.get.mockResolvedValue({ data: mockedHtml });
        const federalTaxData = initializeFederalTaxData(2023);
        
        const result = await scrapeStandardDeductions(federalTaxData);
        
        expect(axios.get).toHaveBeenCalledWith('https://www.irs.gov/publications/p17');
        expect(result.single.standardDeduction).toBe(13850);
        expect(result.marriedFilingJointly.standardDeduction).toBe(27700);
    });
    
    test('throws error when standard deductions not found', async () => {
        // Mock HTML with no standard deduction table
        const mockedHtml = `<p>Some content without standard deduction table</p>`;
        
        axios.get.mockResolvedValue({ data: mockedHtml });
        const federalTaxData = initializeFederalTaxData(2023);
        
        await expect(scrapeStandardDeductions(federalTaxData)).rejects.toThrow('Failed to extract standard deduction for single filers');
    });
});

describe('Scrape Utils - Capital Gains', () => {
    test('parses capital gains rates and thresholds correctly', () => {
        // Mock HTML with capital gains information
        const html = `
            <p>A capital gains rate of 0% applies to those with income up to:</p>
            <ul>
                <li>$44,625 for single taxpayers</li>
                <li>$89,250 for married filing jointly</li>
            </ul>
            
            <p>A capital gains rate of 15% applies to those with income between:</p>
            <ul>
                <li>$44,626 to $492,300 for single taxpayers</li>
                <li>$89,251 to $553,850 for married filing jointly</li>
            </ul>
            
            <p>A capital gains rate of 20% applies to those with income above:</p>
            <ul>
                <li>$492,301 for single taxpayers</li>
                <li>$553,851 for married filing jointly</li>
            </ul>
        `;
        
        const $ = cheerio.load(html);
        const { rates, thresholds } = parseCapitalGainsRatesAndThresholds($);
        
        expect(rates).toEqual([0, 0.15, 0.2]);
        expect(thresholds).toHaveLength(3);
        
        expect(thresholds[0].single).toEqual({
            lowerBound: 0,
            upperBound: 44625
        });
        
        expect(thresholds[1].single).toEqual({
            lowerBound: 44626,
            upperBound: 492300
        });
        
        expect(thresholds[2].single).toEqual({
            lowerBound: 492301,
            upperBound: Infinity
        });
        
        expect(thresholds[0].marriedFilingJointly).toEqual({
            lowerBound: 0,
            upperBound: 89250
        });
    });
    
    test('builds capital gains brackets correctly', () => {
        const rates = [0, 0.15, 0.2];
        const thresholds = [
            {
                single: { lowerBound: 0, upperBound: 44625 },
                marriedFilingJointly: { lowerBound: 0, upperBound: 89250 }
            },
            {
                single: { lowerBound: 44626, upperBound: 492300 },
                marriedFilingJointly: { lowerBound: 89251, upperBound: 553850 }
            },
            {
                single: { lowerBound: 492301, upperBound: Infinity },
                marriedFilingJointly: { lowerBound: 553851, upperBound: Infinity }
            }
        ];
        
        const singleBrackets = buildCapitalGainsBrackets(rates, thresholds, 'single');
        
        expect(singleBrackets).toHaveLength(3);
        expect(singleBrackets[0]).toEqual({
            rate: 0,
            lowerBound: 0,
            upperBound: 44625
        });
        expect(singleBrackets[1]).toEqual({
            rate: 0.15,
            lowerBound: 44626,
            upperBound: 492300
        });
        expect(singleBrackets[2]).toEqual({
            rate: 0.2,
            lowerBound: 492301,
            upperBound: Infinity
        });
    });
    
    test('scrapeCapitalGainsBrackets processes data correctly', async () => {
        // Mock HTML with capital gains information
        const mockedHtml = `
            <p>A capital gains rate of 0% applies to those with income up to:</p>
            <ul>
                <li>$44,625 for single taxpayers</li>
                <li>$89,250 for married filing jointly</li>
            </ul>
            
            <p>A capital gains rate of 15% applies to those with income between:</p>
            <ul>
                <li>$44,626 to $492,300 for single taxpayers</li>
                <li>$89,251 to $553,850 for married filing jointly</li>
            </ul>
        `;
        
        axios.get.mockResolvedValue({ data: mockedHtml });
        const federalTaxData = initializeFederalTaxData(2023);
        
        const result = await scrapeCapitalGainsBrackets(federalTaxData);
        
        expect(axios.get).toHaveBeenCalledWith('https://www.irs.gov/taxtopics/tc409');
        expect(result.single.capitalGainsBrackets).toHaveLength(2);
        expect(result.marriedFilingJointly.capitalGainsBrackets).toHaveLength(2);
    });
    
    test('throws error when capital gains data not found', async () => {
        // Mock HTML with no capital gains information
        const mockedHtml = `<p>Some content without capital gains information</p>`;
        
        axios.get.mockResolvedValue({ data: mockedHtml });
        const federalTaxData = initializeFederalTaxData(2023);
        
        await expect(scrapeCapitalGainsBrackets(federalTaxData)).rejects.toThrow('Failed to extract capital gains rates and thresholds');
    });
});

describe('Scrape Utils - Full Federal Tax Scraping', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        
        // We need to mock the schema/model to avoid database operations
        jest.mock('../../models/federalTax', () => {
            return function() {
                return {
                    save: jest.fn().mockResolvedValue(true)
                };
            };
        });
    });
    
    test('scrapeFederalTax integrates all scraping functions', async () => {
        // Mock successful responses for all API calls
        const incomeTaxHtml = `
            <h2>Tax Rates for Single Taxpayers</h2>
            <table>
                <tbody>
                    <tr>
                        <td>10%</td>
                        <td>$0</td>
                        <td>$10,275</td>
                    </tr>
                </tbody>
            </table>
            
            <h4><a>Married filing jointly</a></h4>
            <div class="collapsible-item-collapse">
                <table>
                    <tbody>
                        <tr>
                            <td>10%</td>
                            <td>$0</td>
                            <td>$20,550</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        
        const standardDeductionHtml = `
            <p class="title">Table 10-1. Standard Deductions</p>
            <div class="table-contents">
                <table>
                    <tbody>
                        <tr>
                            <td>Single</td>
                            <td>$13,850</td>
                        </tr>
                        <tr>
                            <td>Married filing jointly</td>
                            <td>$27,700</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        
        const capitalGainsHtml = `
            <p>A capital gains rate of 0% applies to those with income up to:</p>
            <ul>
                <li>$44,625 for single taxpayers</li>
                <li>$89,250 for married filing jointly</li>
            </ul>
        `;
        
        // Setup axios responses for different endpoints
        axios.get.mockImplementation((url) => {
            if (url.includes('federal-income-tax-rates-and-brackets')) {
                return Promise.resolve({ data: incomeTaxHtml });
            } else if (url.includes('publications/p17')) {
                return Promise.resolve({ data: standardDeductionHtml });
            } else if (url.includes('taxtopics/tc409')) {
                return Promise.resolve({ data: capitalGainsHtml });
            }
            return Promise.reject(new Error('Unknown URL'));
        });
        
        // Test with simplified implementation to avoid database operations
        const origFederalTax = require('../../models/federalTax');
        jest.mock('../../models/federalTax', () => {
            return jest.fn().mockImplementation(data => ({
                ...data,
                save: jest.fn().mockResolvedValue(true)
            }));
        });
        
        // Call the function
        const result = await scrapeFederalTax();
        
        // Restore the original module
        jest.resetModules();
        require('../../models/federalTax');
        
        // Verify API calls were made
        expect(axios.get).toHaveBeenCalledTimes(3);
        
        // Verify the function progressed through all steps
        expect(result).toBeDefined();
    });
}); 
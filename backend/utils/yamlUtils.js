const yaml = require('js-yaml');
const fs = require('fs');
const StateTax = require('../models/stateTax');
const { DistributionTypes } = require('../models/distribution');
const { AccountTaxStatus, Investment } = require('../models/investment');
const { EventSeries } = require('../models/eventseries');
const { v4: uuidv4 } = require('uuid');

// Placeholder function for YAML to Scenario conversion
exports.convertYamlToScenario = (yamlData, userId) => {
    // This function would be implemented later to convert a parsed YAML 
    // object into a proper Scenario object structure

    let data = {}
    data.name = yamlData.name;
    data.userId = userId;
    data.isMarriedCouple = yamlData.maritalStatus === 'couple';
    data.userBirthYear = yamlData.birthYears[0];
    data.userLifeExpectancy = convertYamlToDistribution(yamlData.lifeExpectancy[0]);
    data.userRetirementAge = 65; // hard-coded, can't be found in scenario.yaml
    data.userRetireContributionLimit = yamlData.userRetireContributionLimit || 0;

    if (data.isMarriedCouple)
    {
        data.spouseBirthYear = yamlData.birthYears[1];
        data.spouseLifeExpectancy = convertYamlToDistribution(yamlData.lifeExpectancy[1]);
        data.spouseRetirementAge = 65; // also hard-coded
        data.spouseRetireContributionLimit = yamlData.spouseRetireContributionLimit || 0;
    }

    // set up investment types
    let investmentType = {};
    for (const type of yamlData.investmentTypes)
    {
        investmentType[type.name] = {
            name: type.name,
            description: type.description,
            returnAmtOrPct: type.returnAmtOrPct,
            expectedAnnualReturn: convertYamlToDistribution(type.returnDistribution),
            expenseRatio: type.expenseRatio,
            incomeAmtOrPct: type.incomeAmtOrPct,
            expectedAnnualIncome: convertYamlToDistribution(type.incomeDistribution),
            taxability: type.taxability,
        };
    }

    // create investments
    let investments = [];
    for (const investment of yamlData.investments)
    {
        let ts = ({
            ['non-retirement']: AccountTaxStatus.NON_RETIREMENT,
            ['pre-tax']: AccountTaxStatus.PRE_TAX_RETIREMENT,
            ['after-tax']: AccountTaxStatus.POST_TAX_RETIREMENT,
        })[investment.taxStatus];
        investments.push(
            new Investment({
                _id: uuidv4(),
                id: investment.id,
                type: investmentType[investment.investmentType],
                value: investment.value,
                accountTaxStatus: ts,
            })
        );
    }

    data.investments = investments.map(i => i.toObject());

    // event series set
    let eventSeriesSet = [];
    for (const event of yamlData.eventSeries)
    {
        let series = {
            id: uuidv4(),
            name: event.name,
            duration: convertYamlToDistribution(event.duration),
            type: event.type,
            start: event.start,
        };
        switch (series.type)
        {
            case 'income':
                series.income = {
                    initialAmount: event.initialAmount,
                    changeAmtOrPct: event.changeAmtOrPct,
                    changeDistribution: convertYamlToDistribution(event.changeDistribution),
                    adjustForInflation: event.inflationAdjusted,
                    isSocialSecurity: event.socialSecurity,
                };
                if (data.isMarriedCouple)
                    series.income.userPct = event.userFraction;
                break;
            case 'expense':
                series.expense = {
                    initialAmount: event.initialAmount,
                    changeAmtOrPct: event.changeAmtOrPct,
                    changeDistribution: convertYamlToDistribution(event.changeDistribution),
                    adjustForInflation: event.inflationAdjusted,
                    discretionary: event.discretionary,
                }
                if (data.isMarriedCouple)
                    series.expense.userPct = event.userFraction;
                break;
            case 'invest':
                series.invest = {
                    allocationType: event.glidePath? 'glide' : 'fixed',
                    maxCash: event.maxCash,
                }
                series.invest.selectedInvestments = Object.keys(event.assetAllocation).map(k =>
                    investments.find(i => i.id === k)?._id
                );
                series.invest.allocations = {};
                if (event.glidePath)
                    Object.keys(event.assetAllocation).forEach(k =>
                        series.invest.allocations[k] = {
                            initial: event.assetAllocation[k],
                            final: event.assetAllocation2[k],
                        }
                    );
                else
                    Object.keys(event.assetAllocation).forEach(k =>
                        series.invest.allocations[k] = { value: event.assetAllocation[k], }
                    );
                break;
            case 'rebalance':
                series.rebalance = {};
                series.rebalance.allocationType = 'fixed';
                series.rebalance.selectedInvestments = Object.keys(event.assetAllocation).map(k =>
                    investments.find(i => i.id === k)?._id
                );
                series.rebalance.allocations = {};
                Object.keys(event.assetAllocation).forEach(k => 
                    series.rebalance.allocations[k] = { value: event.assetAllocation[k], }
                );
                break;
            default:
                throw new Error("Unidentifiable Event Series type");
                break;
        }
        eventSeriesSet.push(new EventSeries(series));
    }

    data.eventSeriesSet = eventSeriesSet;
    data.spendingStrategy = eventSeriesSet.filter(e => yamlData.spendingStrategy.includes(e.name)).map(e => e._id);

    data.expenseWithdrawalStrategy = investments.filter(i => yamlData.expenseWithdrawalStrategy.includes(i.id)).map(i => i._id);

    data.inflationAssumption = convertYamlToDistribution(yamlData.inflationAssumption);
    data.rothConversionOpt = yamlData.RothConversionOpt;
    data.rothConversionStart = yamlData.RothConversionStart;
    data.rothConversionEnd = yamlData.RothConversionEnd;
    data.rothConversionStrategy = investments.filter(i => yamlData.RothConversionStrategy.includes(i.id)).map(i => i._id);
    data.rmdStrategy = investments.filter(i => yamlData.RMDStrategy.includes(i.id)).map(i => i._id);
    data.afterTaxContributionLimit = yamlData.afterTaxContributionLimit;
    data.financialGoal = yamlData.financialGoal;
    data.userStateOfResidence = yamlData.residenceState;


    return data;
}

// Placeholder function for Scenario to YAML conversion
exports.convertScenarioToYaml = (scenario) => {
    // This function would be implemented later to convert a Scenario
    // object into a properly formatted YAML string
    let obj = {
        name: scenario.name,
        maritalStatus: scenario.isMarriedCouple? 'couple' : 'individual',
        birthYears: scenario.isMarriedCouple? [ scenario.userBirthYear, scenario.spouseBirthYear, ]
            : [ scenario.userBirthYear, ],
        lifeExpectancy: scenario.isMarriedCouple?
            [ convertDistributionToYaml(scenario.userLifeExpectancy), convertDistributionToYaml(scenario.spouseLifeExpectancy), ]
            : [ convertDistributionToYaml(scenario.userLifeExpectancy), ],
        inflationAssumption: convertDistributionToYaml(scenario.inflationAssumption),
        afterTaxContributionLimit: scenario.afterTaxContributionLimit,
        RothConversionOpt: scenario.rothConversionOpt,
        RothConversionStart: scenario.rothConversionStart || undefined,
        RothConversionEnd: scenario.rothConversionEnd || undefined,
        financialGoal: scenario.financialGoal,
        residenceState: scenario.userStateOfResidence,
        // unsure whether these contribution limits are included in YAML
        // userRetireContributionLimit: scenario.userRetireContributionLimit,
        // spouseRetireContributionLimit: scenario.spouseRetireContributionLimit || undefined,
    };

    let investmentTypes = {};
    let investments = [];
    let eventSeries = [];
    scenario.investments.forEach(investment =>
        investmentTypes[investment.type.name] = {
            name: investment.type.name,
            description: investment.type.description,
            returnAmtOrPct: investment.type.returnAmtOrPct,
            returnDistribution: convertDistributionToYaml(investment.type.expectedAnnualReturn),
            expenseRatio: investment.type.expenseRatio,
            incomeAmtOrPct: investment.type.incomeAmtOrPct,
            incomeDistribution: convertDistributionToYaml(investment.type.expectedAnnualIncome),
            taxability: investment.type.taxability,
        }
    );
    scenario.investments.forEach(investment =>
        investments.push({
            investmentType: investment.type.name,
            value: investment.value,
            taxStatus: investment.accountTaxStatus,
            id: investment.id,
        })
    );
    scenario.eventSeriesSet.forEach(event => {
        let d = {
            name: event.name,
            start: convertDistributionToYaml(event.start),
            duration: convertDistributionToYaml(event.duration),
            type: event.type,
        };
        switch (event.type)
        {
            case 'income':
                d.initialAmount = event.income.initialAmount;
                d.changeAmtOrPct = event.income.changeAmtOrPct;
                d.changeDistribution = convertDistributionToYaml(event.income.changeDistribution);
                d.inflationAdjusted = event.income.adjustForInflation;
                d.userFraction = event.income.userPct || 1;
                d.socialSecurity = event.income.isSocialSecurity;
                break;
            case 'expense':
                d.initialAmount = event.expense.initialAmount;
                d.changeAmtOrPct = event.expense.changeAmtOrPct;
                d.changeDistribution = convertDistributionToYaml(event.expense.changeDistribution);
                d.inflationAdjusted = event.expense.adjustForInflation;
                d.userFraction = event.expense.userPct || 1;
                d.discretionary = event.expense.discretionary;
                break;
            case 'invest':
                d.glidePath = event.invest.allocationType === 'glide';
                d.assetAllocation = {};
                d.assetAllocation2 = {};
                for (const [allocation, values] of event.invest.allocations)
                {
                    if (d.glidePath)
                    {
                        d.assetAllocation[allocation] = values.initial;
                        d.assetAllocation2[allocation] = values.final;
                    } else
                        d.assetAllocation[allocation] = values.value;
                }

                d.maxCash = event.invest.maxCash;
                break;
            case 'rebalance':
                d.assetAllocation = {};
                for (const [allocation, values] of event.rebalance.allocations)
                {
                    d.assetAllocation[allocation] = values.value;
                }
                break;
            default:
                throw new Error('Unrecognized event type.');
        }
        eventSeries.push(d);
    });

    obj.investmentTypes = Object.values(investmentTypes);
    obj.investments = investments;
    obj.eventSeries = eventSeries;
    obj.spendingStrategy = scenario.spendingStrategy.map(e =>
        scenario.eventSeriesSet.find(t => t._id.toString() === e.toString())?.name
    );
    obj.expenseWithdrawalStrategy = scenario.expenseWithdrawalStrategy.map(i =>
        scenario.investments.find(t => t._id.toString() === i.toString())?.id
    );
    obj.RMDStrategy = scenario.rmdStrategy.map(i =>
        scenario.investments.find(t => t._id.toString() === i.toString())?.id
    );
    obj.RothConversionStrategy = scenario.rothConversionStrategy.map(i =>
        scenario.investments.find(t => t._id.toString() === i.toString())?.id
    );

    return yaml.dump(obj);
}

/**
 * Convert YAML file to StateTax object
 * @param {String} filePath - The location of the file.
 * @returns {Promise<Object>} The state tax object
 */
exports.convertYamlToStateTax = async (filePath) => {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8'); // Read file content
        const parsedYaml = yaml.load(fileContent); // Parse YAML
        
        if (!parsedYaml || !parsedYaml.stateCode || 
            !parsedYaml.single || !parsedYaml.marriedFilingJointly) {
            throw new Error('Invalid state tax YAML structure');
        }
        
        // Create StateTax object
        const stateTax = new StateTax({
            stateCode: parsedYaml.stateCode,
            single: parsedYaml.single,
            marriedFilingJointly: parsedYaml.marriedFilingJointly
        });
        
        return stateTax;
    } catch (error) {
        console.error(`Error converting YAML at ${filePath} to StateTax: ${error}`);
        throw error;
    }
}

function convertYamlToDistribution(yamlData)
{
    let type = ({
        ['fixed']: DistributionTypes.FIXED,
        ['normal']: DistributionTypes.NORMAL,
        ['uniform']: DistributionTypes.UNIFORM,
        ['GBM']: DistributionTypes.GBM,
    })[yamlData.type];
    let data = {};
    switch (type)
    {
        case DistributionTypes.FIXED:
            data.value = yamlData.value;
            break;
        case DistributionTypes.NORMAL:
            data.mean = yamlData.mean;
            data.stdev = yamlData.stdev;
            break;
        case DistributionTypes.UNIFORM:
            data.lower = yamlData.lower;
            data.upper = yamlData.upper;
            break;
        case DistributionTypes.GBM:
            data.mu = yamlData.mu;
            data.sigma = yamlData.sigma;
            break;
        default: // unrecognized type
            return new Error('Invalid type');
    }
    return { type, ...data };
}

function convertDistributionToYaml(distr)
{
    let y = { ... distr._doc };
    delete y._id;
    return y;
}
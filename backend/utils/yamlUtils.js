const yaml = require('js-yaml');
const fs = require('fs');
const StateTax = require('../models/stateTax');
const { DistributionTypes } = require('../models/distribution');
const { AccountTaxStatus } = require('../models/investment');

// Placeholder function for YAML to Scenario conversion
exports.convertYamlToScenario = async (yamlData, userId) => {
    // This function would be implemented later to convert a parsed YAML 
    // object into a proper Scenario object structure

    // TODO: Implement the conversion
    let data = {}
    data.name = yamlData.name;
    data.userId = userId;
    data.isMarriedCouple = yamlData.maritalStatus === 'couple';
    data.userBirthYear = yamlData.birthYears[0];
    data.userLifeExpectancy = convertYamlToDistribution(yamlData.lifeExpectancy[0]);
    if (data.isMarriedCouple)
    {
        data.spouseBirthYear = yamlData.birthYears[1];
        data.spouseLifeExpectancy = convertYamlToDistribution(yamlData.lifeExpectancy[1]);
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
            {
                _id: investment.id,
                type: investmentType[investment.investmentType],
                value: investment.value,
                accountTaxStatus: ts,
            }
        );
    }

    data.investments = investments;

    // event series set
    // TODO: finish this.... :(
    let eventSeriesSet = [];
    for (const event of yamlData.eventSeries)
    {

    }

    data.eventSeriesSet = eventSeriesSet;
    data.spendingStrategy = eventSeriesSet.filter(e => e.name in yamlData.spendingStrategy);

    data.expenseWithdrawalStrategy = investments.filter(i => i._id in yamlData.expenseWithdrawalStrategy);

    data.inflationAssumption = convertYamlToDistribution(yamlData.inflationAssumption);
    data.rothConversionOpt = yamlData.RothConversionOpt;
    data.rothConversionStart = yamlData.RothConversionStart;
    data.rothConversionEnd = yamlData.RothConversionEnd;
    data.rothConversionStrategy = investments.filter(i => i._id in yamlData.RMDStrategy);
    data.afterTaxContributionLimit = yamlData.afterTaxContributionLimit;
    data.financialGoal = yamlData.financialGoal;
    data.userStateOfResidence = yamlData.residenceState;


    return data;
}

// Placeholder function for Scenario to YAML conversion
exports.convertScenarioToYaml = async (scenario) => {
    // This function would be implemented later to convert a Scenario
    // object into a properly formatted YAML string
    
    // TODO: Implement the conversion
    
    // TODO: test this
    return yaml.dump(scenario);
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
        ['uniform']: DistributionTypes.UNIFORM
    })[yamlData.type];
    let data = {}
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
        default: // unrecognized type
            return new Error('Invalid type');
    }
    return { type, ...data };
}

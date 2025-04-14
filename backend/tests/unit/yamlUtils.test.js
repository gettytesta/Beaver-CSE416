// Testing conversions within utils/yamlUtils.js

const yaml = require('js-yaml');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

const yamlUtils = require('../../utils/yamlUtils');
const { Scenario } = require('../../models/scenario');
const User = require('../../models/user');


describe('YAML Functions', () => {
    let db;
    let scenario;

    beforeAll(async () => {
        db = await mongoose.connect(process.env.MONGO_URI);
    });
    afterAll(async () => {
        await scenario?.deleteOne();
        await db?.disconnect();
    });

    

    test('Uploading scenario.yaml', async () => {
        let fileContents = fs.readFileSync('./tests/unit/yamlConversionInputs/scenario.yaml', 'utf8');
        let parsedYaml = yaml.load(fileContents);
        let user = await User.findOne({});
        let data = yamlUtils.convertYamlToScenario(parsedYaml, user._id);
        scenario = new Scenario(data);
        await scenario.save();
        await expect(Scenario.findById(scenario._id)).toBeDefined();
    });

    test('Downloading scenario.yaml', async () => {
        let origYaml = fs.readFileSync('./tests/unit/yamlConversionInputs/scenario.yaml', 'utf8');
        let yamlString = yamlUtils.convertScenarioToYaml(scenario);
        let obj1 = yaml.load(origYaml);
        let obj2 = yaml.load(yamlString);
        return expect(obj2).toBe(obj1); // comparing parsed objects rather than strings, as string syntax can be different
    });
});
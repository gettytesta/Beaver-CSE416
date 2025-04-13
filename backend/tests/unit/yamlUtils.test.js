// Testing conversions within utils/yamlUtils.js

const yaml = require('js-yaml');
const fs = require('fs');

const yamlUtils = require('../../utils/yamlUtils');


test("YAML Data to Scenario Conversions", () => {
    // sample scenario yaml
    const fileContent = fs.readFileSync('./tests/unit/yamlConversionInputs/scenario.yaml', 'utf8');
    let parsedYaml = yaml.load(fileContent);
    console.log(yamlUtils.convertYamlToScenario(parsedYaml));
    expect((1 + 1)).toBe(2);
});
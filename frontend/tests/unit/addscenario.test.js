// TP - GitHub Copilot was used to generate these tests.
// Copilot was asked to generate frontend tests for the addscenario component

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AddScenario from "../../src/components/AddScenario";

// Mock the components from the ScenarioBuilder folder
jest.mock("../../src/components/scenarioBuilder/ScenarioInfo", () => (props) => (
  <div>
    Mocked ScenarioInfo Component
    <input
      type="text"
      placeholder="Scenario Name"
      value={props.scenarioName}
      onChange={(e) => props.setScenarioName(e.target.value)}
    />
  </div>
));
jest.mock("../../src/components/scenarioBuilder/Investments", () => () => (
  <div>Mocked Investments Component</div>
));
jest.mock("../../src/components/scenarioBuilder/EventSeries", () => () => (
  <div>Mocked EventSeries Component</div>
));
jest.mock("../../src/components/scenarioBuilder/SpendingStrategy", () => () => (
  <div>Mocked SpendingStrategy Component</div>
));
jest.mock(
  "../../src/components/scenarioBuilder/ExpenseWithdrawalStrategy",
  () => () => <div>Mocked ExpenseWithdrawalStrategy Component</div>
);
jest.mock("../../src/components/scenarioBuilder/InflationAssumption", () => () => (
  <div>Mocked InflationAssumption Component</div>
));
jest.mock(
  "../../src/components/scenarioBuilder/RothConversionOptimizer",
  () => () => <div>Mocked RothConversionOptimizer Component</div>
);
jest.mock("../../src/components/scenarioBuilder/RmdStrategy", () => () => (
  <div>Mocked RmdStrategy Component</div>
));

describe("AddScenario Component", () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  test("renders the AddScenario component with all sections", () => {
    render(<AddScenario />);

    // Check if all mocked components are rendered
    expect(screen.getByText("Mocked ScenarioInfo Component")).toBeInTheDocument();
    expect(screen.getByText("Mocked Investments Component")).toBeInTheDocument();
    expect(screen.getByText("Mocked EventSeries Component")).toBeInTheDocument();
    expect(screen.getByText("Mocked SpendingStrategy Component")).toBeInTheDocument();
    expect(
      screen.getByText("Mocked ExpenseWithdrawalStrategy Component")
    ).toBeInTheDocument();
    expect(screen.getByText("Mocked InflationAssumption Component")).toBeInTheDocument();
    expect(
      screen.getByText("Mocked RothConversionOptimizer Component")
    ).toBeInTheDocument();
    expect(screen.getByText("Mocked RmdStrategy Component")).toBeInTheDocument();
  });

  test("allows the user to enter a scenario name", () => {
    render(<AddScenario />);

    // Find the input field for the scenario name
    const scenarioNameInput = screen.getByPlaceholderText("Scenario Name");

    // Simulate entering a scenario name
    fireEvent.change(scenarioNameInput, { target: { value: "My Test Scenario" } });

    // Verify that the input value has been updated
    expect(scenarioNameInput.value).toBe("My Test Scenario");
  });
});
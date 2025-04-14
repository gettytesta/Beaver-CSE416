// TP - GitHub Copilot was used to generate these tests.
// Copilot was asked to generate frontend tests for the sidebar component

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Sidebar from "../../src/components/Sidebar";

// Mock the useUser hook
jest.mock("@/context/UserContext", () => ({
    useUser: jest.fn().mockReturnValue({ user: null, checkedSession: true }),
  }));

describe("Sidebar Component", () => {
  test("renders the sidebar with navigation links", () => {
    render(<Sidebar />);

    // Check if the sidebar contains navigation links
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Scenarios")).toBeInTheDocument();
  });
});
// TP - GitHub Copilot was used to generate these tests.
// Copilot was asked to generate frontend tests for the dashboard component

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useUser } from "@/context/UserContext";
import Dashboard from "../../src/app/dashboard/page";

jest.mock("@/context/UserContext", () => ({
  useUser: jest.fn().mockReturnValue({ user: null, checkedSession: true }),
}));

describe("Dashboard Component", () => {
  test("renders loading state while session is being checked", () => {
    useUser.mockReturnValue({ user: null, checkedSession: false });

    render(<Dashboard />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("renders guest message for guest users", () => {
    useUser.mockReturnValue({
      user: { username: "Guest", isGuest: true },
      checkedSession: true,
    });

    render(<Dashboard />);

    expect(screen.getByText("guest")).toBeInTheDocument();
  });

  test("renders dashboard for logged-in users", () => {
    useUser.mockReturnValue({
      user: { name: "John Doe", email: "john@example.com" },
      checkedSession: true,
    });

    render(<Dashboard />);

    expect(screen.getByText("Welcome John Doe!")).toBeInTheDocument();
    expect(screen.getByText("Logged in as: john@example.com")).toBeInTheDocument();
  });
});
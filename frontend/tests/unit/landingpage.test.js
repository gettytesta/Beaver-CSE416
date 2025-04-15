// TP - GitHub Copilot was used to generate these tests.
// Copilot was asked to generate frontend tests for the landing page component

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import LandingPage from "../../src/app/page";

describe("LandingPage Component", () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  test("renders the landing page with buttons", () => {
    render(<LandingPage />);

    // Check if the title is rendered
    expect(
      screen.getByText("Welcome to Lifetime Financial Planner")
    ).toBeInTheDocument();

    // Check if the Google login button is rendered
    expect(screen.getByText("Log in with Google")).toBeInTheDocument();

    // Check if the guest login button is rendered
    expect(screen.getByText("Continue as Guest")).toBeInTheDocument();
  });

  test("skip Google OAuth when 'Continue as Guest' is clicked", () => {
    delete window.location;
    window.location = { href: "" };

    render(<LandingPage />);

    const guestButton = screen.getByText("Continue as Guest");
    fireEvent.click(guestButton);

    expect(window.location.href).toBe("");
  });

  test("clears guest session and navigates to Google OAuth login when 'Log in with Google' is clicked", () => {
    delete window.location;
    window.location = { href: "" };

    // Store a guest session in sessionStorage
    sessionStorage.setItem(
      "guestSession",
      JSON.stringify({ username: "guest", isGuest: true })
    );

    render(<LandingPage />);

    const googleButton = screen.getByText("Log in with Google");
    fireEvent.click(googleButton);

    // Check if the guest session was cleared
    expect(sessionStorage.getItem("guestSession")).toBeNull();

    // Check if the window location was updated
    expect(window.location.href).toBe(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google?prompt=select_account`
    );
  });
});
"use client";
import { createContext, useContext, useState } from "react";

const SimulationResultContext = createContext();

export function SimulationResultProvider({ children }) {
  const [results, setResults] = useState(null); // will hold full data

  return (
    <SimulationResultContext.Provider value={{ results, setResults }}>
      {children}
    </SimulationResultContext.Provider>
  );
}

export function useSimulationResult() {
  return useContext(SimulationResultContext);
}
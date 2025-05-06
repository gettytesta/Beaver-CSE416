"use client";
import { useSimulationResult } from "@/context/SimulationResultContext";
import ChartsPage from "@/components/Charts";

export default function ChartsLandingPage() {
  const { results } = useSimulationResult();

  if (!results) {
    return <div className="p-10 text-gray-500">No simulation results found.</div>;
  }
//
  const {
    scenario,
    scenarioId,
    numSimulations,
    selectedCharts,
    selectedParameter,
    data
  } = results;

  console.log(data)

  return (
    <div className="text-center mt-20">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
      </h1>
      <div className="mx-auto max-w-6xl bg-white shadow-md rounded-lg">
        <ChartsPage scenario={scenario} simulationResults={data} selectedCharts={selectedCharts}/>
      </div>
    </div>
  );

  // return (
  //   <div className="pt-16 px-10 space-y-6 min-h-screen overflow-y-auto">

  //     <h1 className="text-3xl font-bold">Simulation Overview</h1>

  //     <section>
  //       <h2 className="text-xl font-semibold mb-2">Scenario Info</h2>
  //       <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">{JSON.stringify(scenario, null, 2)}</pre>
  //     </section>

  //     <section>
  //       <h2 className="text-xl font-semibold mb-2">Simulation Settings</h2>
  //       <p><strong>Scenario ID:</strong> {scenarioId}</p>
  //       <p><strong>Number of Simulations:</strong> {numSimulations}</p>
  //     </section>

  //     <section>
  //       <h2 className="text-xl font-semibold mb-2">Selected Parameter</h2>
  //       <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">{JSON.stringify(selectedParameter, null, 2)}</pre>
  //     </section>

  //     <section>
  //       <h2 className="text-xl font-semibold mb-2">Selected Charts</h2>
  //       <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">{JSON.stringify(selectedCharts, null, 2)}</pre>
  //     </section>

  //     <section>
  //       <h2 className="text-xl font-semibold mb-2">Simulation Result Data</h2>
  //       <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
  //     </section>
  //   </div>
  // );
}
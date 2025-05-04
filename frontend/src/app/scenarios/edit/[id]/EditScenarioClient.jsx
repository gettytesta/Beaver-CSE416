'use client';
 
 import { useParams } from 'next/navigation'; 
 import { useEffect, useState } from 'react';
 import AddScenario from '@/components/AddScenario';
 
 export default function EditScenarioClient() {
   const params = useParams(); 
   const scenarioId = params?.id;
 
   const [scenario, setScenario] = useState(null);
   const [error, setError] = useState(null);
 
   useEffect(() => {
     if (!scenarioId) return;
 
     const fetchScenario = async () => {
       try {
         const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/scenarios/${scenarioId}`, {
           credentials: "include",
         });
 
         if (!res.ok) throw new Error("Failed to load scenario");
         const data = await res.json();
         setScenario(data.data);
       } catch (err) {
         console.error(err);
         setError("Failed to load scenario.");
       }
     };
 
     fetchScenario();
   }, [scenarioId]);
 
   if (error) return <div className="p-6 text-red-600">{error}</div>;
   if (!scenario) return <div className="p-6 text-gray-600">Loading scenario...</div>;
 
   return (
     <AddScenario
       isEdit={true}
       scenarioId={scenarioId}
       prefilledScenario={scenario}
     />
   );
  }
/*
   return (
    <div className="p-6 text-gray-700">
      <h1 className="text-2xl font-semibold mb-2">Edit Scenario</h1>
      <p className="text-md text-gray-600">
        This feature is currently being updated. Editing scenarios will be available soon.
      </p>
    </div>
  );

 }*/
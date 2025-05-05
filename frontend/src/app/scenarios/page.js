"use client";



// TP: ChatGPT. Prompt: "Can you help me connect a dashboard page to a backend in a MERN stack app using Next.js? 
// I want to fetch a list of saved scenarios from an API route like /api/scenarios using session cookies."
// ChatGPT helped with the fetch logic and how to include credentials in the request. 
// I implemented the rest of the component, including error handling, dynamic scenario counts, 
// connecting the reusable ScenarioTable component, and all layout and styling details — 
// such as spacing, padding, and button alignment using Tailwind CSS.


import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Trash2, Filter, Plus, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import ScenarioTable from "@/components/ScenarioTable";
import { useUser } from "@/context/UserContext";
import ShareScenarioModal from "@/components/ShareScenarioModal"; 

export default function ScenarioDashboard() {
  const { user, checkedSession } = useUser();
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false); 
  const [shareData, setShareData] = useState({
    scenarioId: "",
    username: "",
    accessLevel: "read_only",
  });
  
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);

  const searchParams = useSearchParams();

  const fetchScenarios = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/scenarios`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) setScenarios(data.data || []);
      else setError(data.message || "Failed to load scenarios");
    } catch (err) {
      console.error("Error fetching scenarios:", err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!checkedSession || !user) return;
    fetchScenarios();
  }, [checkedSession, user]);

  useEffect(() => {
    const showSuccess = searchParams.get("showSuccessPopup") === "true";
    if (showSuccess) {
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }
  }, [searchParams]);

  const handleShareSubmit = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/scenarios/${shareData.scenarioId}/share`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: shareData.username,
            accessLevel: shareData.accessLevel,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to share");

      alert("Scenario shared!");
      await fetchScenarios(); // ensure full refresh

      setShowShareModal(false);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (!checkedSession || loading) {
    return <div className="text-center mt-20 text-gray-500">Loading scenarios...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-500">{error}</div>;
  }

  return (
    <div className="w-full border-b border-gray-200 pt-16">
      {showPopup && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-lg font-semibold px-6 py-4 rounded-lg shadow-2xl z-50">
          ✅ Scenario was successfully saved!
        </div>
      )}

      <div className="h-[78px] flex items-center justify-between px-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-semibold leading-none">Saved Scenarios:</h2>
          <span className="text-blue-600 text-md hover:underline cursor-pointer leading-none pt-2">
            {scenarios.length} {scenarios.length === 1 ? "Scenario" : "Scenarios"}
          </span>
        </div>

        <div className="flex items-center space-x-8">

          <Link href="/scenarios/add">
            <button className="px-5 py-3 bg-blue-500 text-white rounded-md flex items-center justify-center text-lg font-semibold hover:bg-blue-600">
              <span>Add Scenario</span>
              <Plus className="w-5 h-5 ml-1.5" />
            </button>
          </Link>

          <button
            className="px-5 py-3 bg-blue-800 text-white rounded-md text-lg"
            onClick={() => setShowImportModal(true)}
          >
            Import Scenario
          </button>
{/* ... 
          <form
            className="px-5 py-3 bg-blue-800 text-white rounded-md flex items-center justify-center text-lg font-medium hover:bg-blue-900"
            onSubmit={async (e) => {
              e.preventDefault();
              let fd = new FormData();
              fd.append("file", e.target.file.files[0]);
              await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/yaml/scenario`, {
                method: "POST",
                credentials: "include",
                body: fd,
              });
              await fetchScenarios(); // also refresh after import
            }}
          >
            <input type="file" name="file" accept=".yaml" />
            <button type="submit">Upload Scenario</button>
          </form>
*/}

          <button
            className="px-5 py-3 bg-gray-600 text-white rounded-md text-lg"
            onClick={() => setShowShareModal(true)}
          >
            Share
          </button>
        </div>
      </div>

      <ScenarioTable
        scenarios={scenarios}
        onUpdateShare={fetchScenarios} // 👈 key fix here
        setScenarios={setScenarios} 
      />

      <ShareScenarioModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        scenarios={scenarios}
        shareData={shareData}
        setShareData={setShareData}
        onSubmit={handleShareSubmit}
      />
{/* IMPORT MODAL */}
{showImportModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
      <h2 className="text-xl font-semibold mb-6 text-center">Import Scenario</h2>

      <div className="flex flex-col items-center">
        {/* Neutral "Choose File" button */}
        <label className="relative inline-block cursor-pointer border border-gray-400 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded mb-2">
          Choose File
          <input
            key={importFile ? importFile.name : "empty"} // force re-render on clear
            type="file"
            accept=".yaml"
            onChange={(e) => setImportFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </label>

        {/* File preview with ✕ to remove */}
        {importFile && (
          <div className="mt-1 bg-gray-100 px-4 py-2 rounded text-sm text-gray-800 flex items-center gap-2">
            <span>{importFile.name}</span>
            <button
              onClick={() => setImportFile(null)}
              className="text-red-500 hover:text-red-700 text-xs font-semibold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => {
              setImportFile(null);
              setShowImportModal(false);
            }}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              if (!importFile) return alert("Please select a file.");
              const fd = new FormData();
              fd.append("file", importFile);
              try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/yaml/scenario`, {
                  method: "POST",
                  credentials: "include",
                  body: fd,
                });
                if (!res.ok) throw new Error("Failed to import scenario");

                await fetchScenarios();
                setShowImportModal(false);
                setImportFile(null);
                alert("Scenario imported successfully!");
              } catch (err) {
                alert(err.message);
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Import Scenario
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
// ShareScenarioModal.jsx
import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";

export default function ShareScenarioModal({
  isOpen,
  onClose,
  scenarios,
  shareData,
  setShareData,
  onSubmit,
}) {
  const [users, setUsers] = useState([]);
  const [filteredScenarios, setFilteredScenarios] = useState([]);
  const { user } = useUser();

  // Fetch the list of users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-lookup/users`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (res.ok && data.success) {
          const filteredUsers = data.users.filter(
            (u) => u.username !== user?.username
          );
          setUsers(filteredUsers);
        } else {
          console.error("Failed to load users");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    if (isOpen) fetchUsers();
  }, [isOpen, user]);

  // Filter scenarios to show only those where the current user is the owner
  useEffect(() => {
    const filteredScenarios = scenarios.filter((scenario) => {
      // Compare userIds (both should be ObjectIds, so convert to string)
      return scenario.userId.toString() === user.id.toString();
    });

    console.log("Filtered Scenarios (Owner Only):", filteredScenarios); // Log for debugging
    setFilteredScenarios(filteredScenarios); // Store the filtered scenarios
  }, [scenarios, user]);

  const handleSubmit = () => {
    if (!shareData.scenarioId || !shareData.username.trim()) {
      alert("Please select a valid user.");
      return;
    }
    onSubmit(); // Submit the share action
    onClose();  // Close the modal after submission
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-40">
        <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
          <Dialog.Title className="text-xl font-semibold mb-4">Share a Scenario</Dialog.Title>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Select Scenario</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={shareData.scenarioId}
              onChange={(e) =>
                setShareData({ ...shareData, scenarioId: e.target.value })
              }
            >
              <option value="">Choose a scenario</option>
              {filteredScenarios.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Select User</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={shareData.username}
              onChange={(e) =>
                setShareData({ ...shareData, username: e.target.value })
              }
            >
              <option value="">Choose a user</option>
              {users.map((u) => (
                <option key={u.username} value={u.username}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Access Level</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={shareData.accessLevel}
              onChange={(e) =>
                setShareData({ ...shareData, accessLevel: e.target.value })
              }
            >
              <option value="read_only">Read-only</option>
              <option value="read_write">Read & Write</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Share
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}






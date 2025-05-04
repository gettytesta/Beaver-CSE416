import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
export default function ManageShareModal({ isOpen, onClose, scenario, onUpdateShare }) {
  const [userInfos, setUserInfos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scenario || !isOpen) return;

    const fetchSharedUsers = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/scenarios/${scenario._id}/share`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (!res.ok || !data.success) throw new Error(data.message);

        const mapped = data.data.map((entry) => ({
          userId: entry.userId._id,
          username: entry.userId.username,
          accessLevel: entry.accessLevel,
        }));

        setUserInfos(mapped);
      } catch (err) {
        console.error("Error loading shared users:", err);
      } finally {
        setLoading(false);
      }
    };

    setUserInfos([]);
    setLoading(true);
    fetchSharedUsers();
  }, [scenario, isOpen]);

  const handleAccessChange = async (userId, newAccessLevel, username) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/scenarios/${scenario._id}/share`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, accessLevel: newAccessLevel }),
        }
      );
  
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
  
      const updatedRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/scenarios/${scenario._id}/share`,
        { credentials: "include" }
      );
      const updatedData = await updatedRes.json();
      const updatedUsers = updatedData.data.map((entry) => ({
        userId: entry.userId._id,
        username: entry.userId.username,
        accessLevel: entry.accessLevel,
      }));
      setUserInfos(updatedUsers);
  
      alert(`Access level for ${username} updated to ${newAccessLevel}!`);
      onUpdateShare?.(); 
    } catch (err) {
      alert("Failed to update share: " + err.message);
    }
  };

  const handleRemove = async (userId) => {
    console.log('Attempting to unshare user with userId:', userId);  // Log the userId
  
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/scenarios/${scenario._id}/share/${userId}`,
        {
          method: "DELETE", 
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );
  
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
  
      // Refresh the user list after unsharing
      const updatedRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/scenarios/${scenario._id}/share`,
        { credentials: "include" }
      );
      const updatedData = await updatedRes.json();
      const updatedUsers = updatedData.data.map((entry) => ({
        userId: entry.userId._id,
        username: entry.userId.username,
        accessLevel: entry.accessLevel,
      }));
  
      setUserInfos(updatedUsers);
  
      onUpdateShare?.(); // Optional if parent needs refresh
    } catch (err) {
      alert("Failed to unshare: " + err.message);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-40">
        <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
          <Dialog.Title className="text-xl font-semibold mb-4">Manage Shared Access</Dialog.Title>

          {loading ? (
            <p className="text-center text-gray-500 py-4">Loading shared users...</p>
          ) : userInfos.length === 0 ? (
            <p className="text-center text-gray-500 py-4">This scenario isn't shared yet.</p>
          ) : (
            <div className="space-y-4">
              {userInfos.map((user) => (
                <div
                  key={user.userId}
                  className="flex justify-between items-center border p-3 rounded-md"
                >
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-gray-500">Access: {user.accessLevel}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleAccessChange(
                          user.userId,
                          user.accessLevel === "read_only" ? "read_write" : "read_only",
                          user.username
                        )
                      }
                      className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
                    >
                      Make {user.accessLevel === "read_only" ? "Read-Write" : "Read-Only"}
                    </button>
                    <button
                      onClick={() => handleRemove(user.userId)}
                      className="px-3 py-1 rounded bg-red-600 text-white text-sm"
                    >
                      Unshare
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

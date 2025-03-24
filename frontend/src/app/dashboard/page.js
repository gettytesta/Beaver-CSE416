"use client";

import { useUser } from "@/context/UserContext";

export default function Dashboard() {
  const { user, checkedSession } = useUser();

  if (!checkedSession) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="text-center mt-20">
        <h1 className="text-2xl font-bold text-red-500">Not logged in</h1>
        <p className="mt-4 text-gray-600">
          Please go back to the landing page and log in.
        </p>
      </div>
    );
  }

  const isGuest = !user?.email;

  return (
    <div className="text-center mt-20">
      <h1 className="text-4xl font-bold text-gray-900">
        Welcome {user.name || user.username || "Guest"}!
      </h1>

      {isGuest ? (
        <>
          <p className="mt-4 text-lg text-gray-600">
            You're using Lifetime Financial Planner as a <strong>guest</strong>.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Scenarios will not be saved after you leave or refresh the page.
          </p>
        </>
      ) : (
        <>
          <p className="mt-4 text-lg text-gray-600">
            Plan your financial future with confidence. Create, analyze, and optimize scenarios to achieve your long-term goals.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Logged in as: {user.email}
          </p>
        </>
      )}
    </div>
  );
}
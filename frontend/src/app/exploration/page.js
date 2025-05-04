"use client";

import { useUser } from "@/context/UserContext";
import ChartsPage from "@/components/Charts";

export default function Dashboard() {
  const { user, checkedSession } = useUser(); //Access user session and loading state


  //Wait until session check finishes
  if (!checkedSession) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  //Handle unauthenticated users direct access to /dashboard without logging in
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

  //Determine if the user is a guest (no email in session)= We can change this later by passing in a IsGuest true or false boolean from the context
  const isGuest = !user?.email;

  return (
    <div className="text-center mt-20">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
      </h1>
      <div className="mx-auto max-w-6xl bg-white shadow-md rounded-lg">
        <ChartsPage />
      </div>
    </div>
  );
}
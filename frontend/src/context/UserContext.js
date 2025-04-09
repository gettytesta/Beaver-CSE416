"use client";

// TP: ChatGPT. Prompt: "I'm struggling with how to manage user sessions in a Next.js MERN stack app. 
// How should I approach this?"
// The assistant suggested creating a context provider to manage session state, with a useEffect call 
// to fetch the current user from the backend. It also advised using this 
// context in other pages and components to access user session data throughout the app. 
// I implemented the logic using axios and added my own error handling, a `checkedSession` flag, 
// and conditional behavior for unauthenticated users.

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

//Create a new context to manage user session data across the app
const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null); // What user is logged in 
  const [checkedSession, setCheckedSession] = useState(false); 

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/current-user`, {
          withCredentials: true, 
        });

        if (res.data?.user) {
          setUser(res.data.user);
        } else {
          console.warn("No session user found.");
          setUser(null);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          //When user is not logged in
          console.warn("User not authenticated (401) — likely on landing page.");
          setUser(null);
        } else {
          console.error("Unexpected error checking session:", error);
          setUser(null);
        }
      } finally {
        //Mark session check as complete
        setCheckedSession(true);
      }
    };

    fetchSession();
  }, []);

  return (
    <UserContext.Provider value={{ user, checkedSession }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom React hook to access user data from any component
export function useUser() {
  return useContext(UserContext);
}
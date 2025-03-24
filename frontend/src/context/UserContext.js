"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
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
          // Normal: user not logged in
          console.warn("User not authenticated (401) — likely on landing page.");
          setUser(null);
        } else {
          console.error("Unexpected error checking session:", error);
          setUser(null);
        }
      } finally {
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

export function useUser() {
  return useContext(UserContext);
}
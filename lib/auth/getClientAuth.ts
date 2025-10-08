"use client";

import { useEffect, useState } from "react";
import { JwtUser } from "./jwt";

export function useAuthUser() {
  const [user, setUser] = useState<JwtUser>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch auth user:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  return { user, loading };
}
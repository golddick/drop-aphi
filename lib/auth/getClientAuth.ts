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




// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { JwtUser } from "./jwt";

// export function useAuthUser(redirect = true) {
//   const [user, setUser] = useState<JwtUser | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     async function fetchUser() {
//       try {
//         const res = await fetch("/api/auth/me", { credentials: "include" });
//         if (!res.ok) throw new Error("Not authenticated");

//         const data = await res.json();
//         setUser(data);
//       } catch (err) {
//         console.error("Failed to fetch auth user:", err);
//         if (redirect) {
//           router.push("/auth"); // redirect to login page
//         }
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchUser();
//   }, [router, redirect]);

//   return { user, loading };
// }

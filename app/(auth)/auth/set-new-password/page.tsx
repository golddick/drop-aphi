"use client";

import React, { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SetNewPasswordPage from "@/modules/auth/set-password-form";
import Loader from "@/components/_component/Loader";

function SetNewPasswordWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      router.push("/auth?tab=reset"); // Redirect if no email
    }
  }, [email, router]);

  return <SetNewPasswordPage />;
}

export default function Page() {
  return (
    <Suspense fallback={<Loader/>}>
      <SetNewPasswordWrapper />
    </Suspense>
  );
}

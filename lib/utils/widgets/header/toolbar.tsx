"use client";

import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/lib/auth/getClientAuth";
import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Toolbar = () => {
  const { user, loading } = useAuthUser();

  // ✅ Show loader while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <Loader className="animate-spin size-4 text-gray-600" />
      </div>
    );
  }

  return (
    <>
      {user ? (
        <Link
          href="/dashboard"
          className="flex items-center gap-2 hover:opacity-90 transition"
        >
          <Image
            src={user?.imageUrl || "/no-img.jpg"}
            alt={user?.userName || "User profile"}
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
        </Link>
      ) : (
        <Link href="/auth">
          <Button
            className="bg-black text-white hover:bg-gray-800 transition"
          >
            Sign In
          </Button>
        </Link>
      )}
    </>
  );
};

export default Toolbar;

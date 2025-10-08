"use client";

import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/lib/auth/getClientAuth";
import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Toolbar = () => {

   const { user,loading } = useAuthUser();

  if (!user || loading) {
    return <div> <Loader className=" animate-spin size-4 "/></div>
  }
  return (
    <>
     
      {user ? (
        <>
          <Link href={"/dashboard"}>
            <Image
              src={user?.imageUrl || "/no-img.jpg"}
              alt="user profile "
              width={30}
              height={30}
              className="rounded-full"
            />
          </Link>

        </>
      ) : (
        <Link href={"/auth"}>
          <Button
            color="primary"
            className="bg-black text-white hover:bg-gray-800"
          >
            Sign In
          </Button>
        </Link>
      )}
    </>
  );
};

export default Toolbar;

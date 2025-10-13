import React from "react";
import { Metadata } from "next";
import { MobileNav } from "@/lib/utils/widgets/dashboard/MobileNav";
import { getServerAuth } from "@/lib/auth/getauth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Logo from "@/lib/utils/widgets/header/logo";


export const metadata: Metadata = {
  title: 'Drop-Aphi',
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {

   const user = await getServerAuth()
  
      if (!user) {
          redirect('/auth');
      }
  
  return (
    <>
         <div className=" lg:hidden w-full flex items-center justify-between p-5 border-none ">
                 <Link href={"/"}> 
                    <Logo />
                  </Link>
        
                <MobileNav/>
              </div>
      <div className="min-h-screen flex flex-col w-full ">
        {children}
      </div> 
    </>
  );
}

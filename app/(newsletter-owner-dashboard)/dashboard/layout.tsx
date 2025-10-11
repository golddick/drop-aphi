import React from "react";
import { Metadata } from "next";
import { MobileNav } from "@/lib/utils/widgets/dashboard/MobileNav";


export const metadata: Metadata = {
  title: 'Drop-Aphi',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
         <div className=" lg:hidden w-full flex items-center justify-between p-5 border-none ">
                <div>
                    <h1 className="text-2xl font-bold">Drop-Aphi</h1>
                </div>
        
                <MobileNav/>
              </div>
      <div className="min-h-screen flex flex-col w-full ">
        {children}
      </div> 
    </>
  );
}

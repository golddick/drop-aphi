import React from "react";
import AdminSideBar from "@/modules/admin/_component/AdminSideBar";
import AdminTopBar from "@/modules/admin/_component/AdminTopBar";



export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
        <div className=" flex min-h-screen w-full ">
        <AdminSideBar />
        <div className=" w-full  ">
        <AdminTopBar/>
        <div className="flex flex-col mt-[50px]  lg:ml-[230px] p-4">
        {children} 
        </div>
        </div>
      </div>
    </>
  );
}


"use client";

import { NextUIProvider } from "@nextui-org/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { addPaystack } from "@/actions/paystack/add.paystack";
import { getMembershipStatus } from "@/actions/membership/getTermsMembership";
import {  Toaster } from "sonner";
import DashboardSideBar from "./widgets/dashboard/sidebar/dashboard.sidebar";
import { useAuthUser } from "../auth/getClientAuth";

interface ProviderProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProviderProps) {
  const { user, loading } = useAuthUser();
  const pathname = usePathname();
  const [paystackInitialized, setPaystackInitialized] = useState(false);

  // Redirect if not logged in
  // useEffect(() => {
  //   if (!loading && !user) {
  //     toast.error("You must be logged in to access this page");
  //     router.push("/auth");
  //   }
  // }, [user, loading, router]);

  console.log(user, "user data")

  // Initialize Paystack only once when user is loaded
  useEffect(() => {
    const initializePaystack = async () => {
      if (!loading && user && !paystackInitialized) {
        try {
          await addPaystack();
          setPaystackInitialized(true);
        } catch (error) {
          console.error("Failed to initialize Paystack:", error);
        }
      }
    };

    initializePaystack();
  }, [loading, user, paystackInitialized]);

  // Check terms acceptance
  // useEffect(() => {
  //   const checkUserTerms = async () => {
  //     if (!loading && user) {
  //       try {
  //         const membershipStatus = await getMembershipStatus();
  //         if (membershipStatus?.termsAccepted === false) {
  //           toast.error('Accept our terms and conditions to continue');
  //           router.push("/legal");
  //         }
  //       } catch (error) {
  //         console.error("Failed to check membership status:", error);
  //       }
  //     }
  //   };

  //   checkUserTerms();
  // }, [loading, user, router]);

  // Sidebar is only visible for /dashboard routes
  const shouldShowSidebar = pathname.startsWith("/dashboard");

  return (
    <NextUIProvider>
      {shouldShowSidebar ? (
        <div className="w-full flex">
          <aside className="w-[250px] min-h-screen overflow-y-scroll hidden lg:block border-r relative hidden-scrollbar">
            <DashboardSideBar />
          </aside>
          <main className="flex-1">{children}</main>
        </div>
      ) : (
        <main>{children}</main>
      )}
      <Toaster position="bottom-center" />
    </NextUIProvider>
  );
}
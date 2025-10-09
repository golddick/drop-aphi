"use client";

import { NextUIProvider } from "@nextui-org/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { addPaystack } from "@/actions/paystack/add.paystack";
import { getMembershipStatus } from "@/actions/membership/getTermsMembership";
import { Toaster, toast } from "sonner";
import DashboardSideBar from "./widgets/dashboard/sidebar/dashboard.sidebar";
import { useAuthUser } from "../auth/getClientAuth";
import Loader from "@/components/_component/Loader";

interface ProviderProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuthUser();

  const [paystackInitialized, setPaystackInitialized] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // ✅ Unified app logic inside one effect
  useEffect(() => {
    const runAppLogic = async () => {
      // Don't run until auth is done
      if (loading) return;

      // ✅ Redirect unauthenticated users (only after hydration)
      // if (!user) {
      //   if (typeof window !== "undefined") {
      //     router.replace("/auth");
      //   }
      //   return;
      // }

      // ✅ Initialize Paystack only once
      if (!paystackInitialized) {
        try {
          await addPaystack();
          setPaystackInitialized(true);
        } catch (error) {
          console.error("Failed to initialize Paystack:", error);
        }
      }

      // ✅ Check membership/terms
      try {
        const membershipStatus = await getMembershipStatus();
        if (membershipStatus?.termsAccepted === false) {
          toast.error("Accept our terms and conditions to continue");
          router.replace("/legal");
        }
      } catch (error) {
        console.error("Failed to check membership status:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    // Run logic only when router is ready (prevents hydration error)
    if (typeof window !== "undefined") {
      runAppLogic();
    }
  }, [user, loading, router, paystackInitialized]);


  const shouldShowSidebar = pathname?.startsWith("/dashboard");

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

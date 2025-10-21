// "use client";

// import { NextUIProvider } from "@nextui-org/react";
// import { usePathname, useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { addPaystack } from "@/actions/paystack/add.paystack";
// import { getMembershipStatus } from "@/actions/membership/getTermsMembership";
// import { Toaster, toast } from "sonner";
// import DashboardSideBar from "./widgets/dashboard/sidebar/dashboard.sidebar";
// import { useAuthUser } from "../auth/getClientAuth";
// import Loader from "@/components/_component/Loader";

// interface ProviderProps {
//   children: React.ReactNode;
// }

// export default function Providers({ children }: ProviderProps) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const { user, loading } = useAuthUser();

//   const [paystackInitialized, setPaystackInitialized] = useState(false);
//   const [checkingStatus, setCheckingStatus] = useState(true);

//   // ✅ Unified app logic inside one effect
//   useEffect(() => {
//     const runAppLogic = async () => {
//       // Don't run until auth is done
//       if (loading) return;

//       // ✅ Redirect unauthenticated users (only after hydration)
//       // if (!user) {
//       //   if (typeof window !== "undefined") {
//       //     router.replace("/auth");
//       //   }
//       //   return;
//       // }

//       // ✅ Initialize Paystack only once
//       if (!paystackInitialized) {
//         try {
//           await addPaystack();
//           setPaystackInitialized(true);
//         } catch (error) {
//           console.error("Failed to initialize Paystack:", error);
//         }
//       }

//       // ✅ Check membership/terms
//       try {
//         const membershipStatus = await getMembershipStatus();
//         if (membershipStatus?.termsAccepted === false) {
//           toast.error("Accept our terms and conditions to continue");
//           router.replace("/legal");
//         }
//       } catch (error) {
//         console.error("Failed to check membership status:", error);
//       } finally {
//         setCheckingStatus(false);
//       }
//     };

//     // Run logic only when router is ready (prevents hydration error)
//     if (typeof window !== "undefined") {
//       runAppLogic();
//     }
//   }, [user, loading, router, paystackInitialized]);


//   const shouldShowSidebar = pathname?.startsWith("/dashboard");

//   return (
//     <NextUIProvider>
//       {shouldShowSidebar ? (
//         <div className="w-full flex">
//           <aside className="w-[250px] min-h-screen overflow-y-scroll hidden lg:block border-r relative hidden-scrollbar">
//             <DashboardSideBar />
//           </aside>
//           <main className="flex-1">{children}</main>
//         </div>
//       ) : (
//         <main>{children}</main>
//       )}
//       <Toaster position="bottom-center" />
//     </NextUIProvider>
//   );
// }













"use client";

import { NextUIProvider } from "@nextui-org/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { addPaystack } from "@/actions/paystack/add.paystack";
import { getMembershipStatus } from "@/actions/membership/getTermsMembership";
import { getMembership } from "@/actions/membership/getMembership";
import { Toaster, toast } from "sonner";
import DashboardSideBar from "./widgets/dashboard/sidebar/dashboard.sidebar";
import { useAuthUser } from "../auth/getClientAuth";
import Loader from "@/components/_component/Loader";
import { AlertCircle, X } from "lucide-react";

interface ProviderProps {
  children: React.ReactNode;
}

interface MembershipData {
  kycStatus?: boolean;
  approvedKYC?: boolean;
  termsAccepted?: boolean;
}

export default function Providers({ children }: ProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuthUser();

  const [paystackInitialized, setPaystackInitialized] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [membershipData, setMembershipData] = useState<MembershipData | null>(null);
  const [showKycBanner, setShowKycBanner] = useState(false);

  const fetchMembershipData = async () => {
    if (!user) return;
    try {
      const data = await getMembership();
      if (!data) throw new Error("No membership record found");

      setMembershipData(data);
      const isKycApproved = data.kycStatus === true;
      setShowKycBanner(!isKycApproved);
    } catch (error) {
      console.error("Failed to load membership data:", error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      if (loading || !user) {
        setCheckingStatus(false);
        return;
      }

      try {
        // 1️⃣ Fetch KYC & Membership details
        await fetchMembershipData();

        // 2️⃣ Check Terms acceptance
        const membershipStatus = await getMembershipStatus();
        if (membershipStatus?.termsAccepted === false) {
          // Delay toast to ensure it renders before redirect
          setTimeout(() => {
            toast.error("Please accept our Terms and Conditions to continue.");
            router.replace("/legal");
          }, 300);
          return;
        }

        // 3️⃣ Initialize Paystack (only once)
        if (!paystackInitialized) {
          await addPaystack();
          setPaystackInitialized(true);
        }
      } catch (error) {
        console.error("Initialization failed:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    // Ensure we are running client-side only
    if (typeof window !== "undefined") {
      initialize();
    }
  }, [user, loading]);

  // Re-check KYC when moving within dashboard
  useEffect(() => {
    if (user && pathname?.startsWith("/dashboard")) {
      fetchMembershipData();
    }
  }, [pathname]);

  const shouldShowSidebar = pathname?.startsWith("/dashboard");
  const isDashboardPage = pathname?.startsWith("/dashboard");

  const KycBanner = () => {
    if (!showKycBanner || !isDashboardPage) return null;

    return (
      <div className="w-full bg-amber-50 border-b border-amber-200 px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 max-w-7xl mx-auto">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 min-w-0 flex-1">
              <span className="text-amber-800 font-medium text-xs sm:text-sm whitespace-nowrap">
                Complete KYC Verification
              </span>
              <span className="text-amber-700 text-xs sm:text-sm hidden xs:inline">•</span>
              <span className="text-amber-700 text-xs sm:text-sm break-words line-clamp-2 xs:line-clamp-1">
                To unlock full access, please complete your KYC verification.
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between xs:justify-end gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={() => router.push("/dashboard/settings?tab=kyc")}
              className="px-2 sm:px-3 py-1.5 sm:py-1 bg-amber-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-amber-700 transition-colors whitespace-nowrap flex-shrink-0"
            >
              Complete KYC
            </button>
            <button
              onClick={() => setShowKycBanner(false)}
              className="p-1 text-amber-600 hover:text-amber-800 transition-colors flex-shrink-0"
              aria-label="Dismiss banner"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (checkingStatus || loading) {
    return <Loader />;
  }

  return (
    <NextUIProvider>
      {shouldShowSidebar ? (
        <div className="w-full flex flex-col">
          <KycBanner />
          <div className="flex flex-1">
            <aside className="w-[250px] min-h-screen overflow-y-scroll hidden lg:block border-r relative hidden-scrollbar">
              <DashboardSideBar />
            </aside>
            <main className="flex-1">{children}</main>
          </div>
        </div>
      ) : (
        <main>{children}</main>
      )}
      <Toaster position="bottom-center" richColors />
    </NextUIProvider>
  );
}

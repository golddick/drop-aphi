

// "use client";

// import { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import useGetMembership from "@/lib/hooks/useGetMembership";
// import { toast } from "sonner";
// import { ICONS } from "@/lib/utils/icons";

// const ApiKey = () => {
//   const { data: membership } = useGetMembership();
//   const [apiKey, setApiKey] = useState("");
//   const [expiresAt, setExpiresAt] = useState<Date | null>(null);
//   const [isTrial, setIsTrial] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const fetchApiKey = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch("/api/api-key");
//       const json = await res.json();
      
//       if (res.ok) {
//         setApiKey(json.apiKey);
//         setExpiresAt(new Date(json.expiresAt));
//         setIsTrial(json.isTrial || false);
//       } else {
//         if (res.status === 403) {
//           // Trial ended or subscription required
//           setApiKey("");
//           toast.error(json.error);
//         } else {
//           toast.error(json.error || "Failed to fetch API key");
//         }
//       }
//     } catch (err: any) {
//       toast.error(err.message || "Error fetching API key");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGenerateOrRegenerate = async (regenerate = false) => {
//     try {
//       setLoading(true);
//       const res = await fetch(`/api/api-key?regenerate=${regenerate}`, {
//         method: "GET",
//       });
//       const json = await res.json();

//       if (res.ok) {
//         setApiKey(json.apiKey);
//         setExpiresAt(new Date(json.expiresAt));
//         setIsTrial(json.isTrial || false);
//         toast.success(regenerate ? "API Key regenerated!" : "API Key created!");
//       } else {
//         toast.error(json.error || "API Key request failed");
//       }
//     } catch (err: any) {
//       toast.error(err.message || "Error creating API key");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCopy = () => {
//     navigator.clipboard.writeText(apiKey).then(() => {
//       toast.success("Copied to clipboard");
//     });
//   };

//   useEffect(() => {
//     fetchApiKey();
//   }, [membership?.plan]);

//   // Show different messages based on user status
//   const hasActiveSubscription = membership && membership.plan !== "FREE" && membership.subscriptionStatus === "ACTIVE";

//   return (
//     <div className="flex justify-center px-4">
//       <Card className="w-full max-w-2xl shadow-lg border rounded-lg bg-white">
//         <CardHeader>
//           <CardTitle className="text-xl md:text-2xl font-bold text-gray-800">
//             API Key Access
//           </CardTitle>
//           {isTrial && (
//             <div className="space-y-2">
//               <p className="text-sm text-orange-600 font-medium">
//                 ⚠️ Trial API Key - Expires on: {expiresAt?.toLocaleDateString()}
//               </p>
//               <p className="text-xs text-orange-500">
//                 You have 14 days of free API access. Upgrade to continue after trial ends.
//               </p>
//             </div>
//           )}
//           {!apiKey && !hasActiveSubscription && (
//             <p className="text-sm text-blue-600 font-medium">
//               Get started with a 14-day free trial API key!
//             </p>
//           )}
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <p className="text-sm text-gray-500">
//             Use your API key to authenticate requests. Keep it safe and do not share it publicly.
//           </p>

//           <div className="bg-gray-100 p-3 rounded-lg border text-sm font-mono break-all">
//             {loading ? "Loading..." : apiKey || "No API Key yet"}
//           </div>

//           {expiresAt && (
//             <p className="text-sm text-gray-600">
//               Expires on: {expiresAt.toLocaleDateString()}
//               {isTrial && " (14-day trial)"}
//             </p>
//           )}

//           <div className="flex flex-col sm:flex-row gap-3 mt-4">
//             {apiKey && (
//               <Button
//                 variant="outline"
//                 onClick={handleCopy}
//                 className="flex items-center justify-center gap-2"
//               >
//                 {ICONS.copy}
//                 Copy
//               </Button>
//             )}

//             {!apiKey ? (
//               <Button
//                 onClick={() => handleGenerateOrRegenerate(false)}
//                 className="flex items-center justify-center gap-2"
//               >
//                 {ICONS.key}
//                 Get Trial API Key
//               </Button>
//             ) : (
//               <Button
//                 variant="secondary"
//                 onClick={() => handleGenerateOrRegenerate(true)}
//                 disabled={isTrial} // Disable regeneration for trial users
//                 className="flex items-center justify-center gap-2"
//               >
//                 {ICONS.regenerate}
//                 Regenerate
//               </Button>
//             )}
//           </div>

//           {isTrial && (
//             <div className="space-y-2">
//               <p className="text-xs text-orange-600">
//                 ⚠️ Regeneration is not available for trial keys. 
//               </p>
//               <p className="text-xs text-orange-600">
//                 Upgrade to premium for full access and key management features.
//               </p>
//             </div>
//           )}

//           {!apiKey && hasActiveSubscription && (
//             <p className="text-xs text-blue-600">
//               You have an active subscription. Generate your premium API key.
//             </p>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default ApiKey;



"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useGetMembership from "@/lib/hooks/useGetMembership";
import { toast } from "sonner";
import { ICONS } from "@/lib/utils/icons";
import { useRouter, useSearchParams } from "next/navigation";

const ApiKey = () => {
  const { data: membership } = useGetMembership();
  const [apiKey, setApiKey] = useState("");
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [isTrial, setIsTrial] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchApiKey = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/api-key");
      const json = await res.json();
      
      if (res.ok) {
        setApiKey(json.key || json.apiKey); // Handle both key formats
        if (json.expiresAt) {
          setExpiresAt(new Date(json.expiresAt));
        }
        setIsTrial(json.isTrial || false);
      } else {
        if (res.status === 403 && json.code === "KYC_REQUIRED") {
          // KYC verification required
          setApiKey("");
          toast.error("KYC verification required", {
            description: "Please complete KYC verification to generate API keys",
            action: {
              label: "Complete KYC",
              onClick: () => router.push("/dashboard/settings?tab=kyc")
            }
          });
        } else if (res.status === 403) {
          // Trial ended or subscription required
          setApiKey("");
          toast.error(json.error);
        } else {
          toast.error(json.error || "Failed to fetch API key");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Error fetching API key");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOrRegenerate = async (regenerate = false) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/api-key?regenerate=${regenerate}`, {
        method: "GET",
      });
      const json = await res.json();

      if (res.ok) {
        setApiKey(json.key || json.apiKey); // Handle both key formats
        if (json.expiresAt) {
          setExpiresAt(new Date(json.expiresAt));
        }
        setIsTrial(json.isTrial || false);
        toast.success(regenerate ? "API Key regenerated!" : "API Key created!");
      } else {
        if (res.status === 403 && json.code === "KYC_REQUIRED") {
          // KYC verification required
          toast.error("KYC verification required", {
            description: "Please complete KYC verification to generate API keys",
            action: {
              label: "Complete KYC",
              onClick: () => router.push("/dashboard/settings?tab=kyc")
            }
          });
        } else {
          toast.error(json.error || "API Key request failed");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Error creating API key");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey).then(() => {
      toast.success("Copied to clipboard");
    });
  };

  // Check if we're coming from a KYC redirect
  useEffect(() => {
    const kycCompleted = searchParams.get('kycCompleted');
    if (kycCompleted === 'true') {
      toast.success("KYC verification completed!");
      // Refetch API key after KYC completion
      fetchApiKey();
    }
  }, [searchParams]);

  useEffect(() => {
    fetchApiKey();
  }, [membership?.plan]);

  // Show KYC status information
  const showKYCWarning = membership && membership.kycStatus !== true;
  const hasActiveSubscription = membership && membership.plan !== "FREE" && membership.subscriptionStatus === "ACTIVE";

  return (
    <div className="flex justify-center px-4">
      <Card className="w-full max-w-2xl shadow-lg border rounded-lg bg-white">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-bold text-gray-800">
            API Key Access
          </CardTitle>
          
          {/* KYC Status Warning */}
          {showKYCWarning && (
            <div className="space-y-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800 font-medium">
                ⚠️ KYC Verification Required
              </p>
              <p className="text-xs text-amber-700">
                You need to complete KYC verification before generating API keys.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/settings?tab=kyc")}
                className="text-amber-800 border-amber-300 hover:bg-amber-100"
              >
                Complete KYC Verification
              </Button>
            </div>
          )}

          {isTrial && (
            <div className="space-y-2">
              <p className="text-sm text-orange-600 font-medium">
                ⚠️ Trial API Key - Expires on: {expiresAt?.toLocaleDateString()}
              </p>
              <p className="text-xs text-orange-500">
                You have 14 days of free API access. Upgrade to continue after trial ends.
              </p>
            </div>
          )}
          
          {!apiKey && !hasActiveSubscription && !showKYCWarning && (
            <p className="text-sm text-blue-600 font-medium">
              Get started with a 14-day free trial API key!
            </p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            Use your API key to authenticate requests. Keep it safe and do not share it publicly.
          </p>

          <div className="bg-gray-100 p-3 rounded-lg border text-sm font-mono break-all">
            {loading ? "Loading..." : apiKey || "No API Key yet"}
          </div>

          {expiresAt && (
            <p className="text-sm text-gray-600">
              Expires on: {expiresAt.toLocaleDateString()}
              {isTrial && " (14-day trial)"}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            {apiKey && (
              <Button
                variant="outline"
                onClick={handleCopy}
                className="flex items-center justify-center gap-2"
              >
                {ICONS.copy}
                Copy
              </Button>
            )}

            {!apiKey ? (
              <Button
                onClick={() => handleGenerateOrRegenerate(false)}
                disabled={showKYCWarning || loading}
                className="flex items-center justify-center gap-2"
              >
                {ICONS.key}
                {showKYCWarning ? "KYC Required" : "Get Trial API Key"}
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => handleGenerateOrRegenerate(true)}
                disabled={isTrial || showKYCWarning || loading} // Disable for trial users and when KYC not approved
                className="flex items-center justify-center gap-2"
              >
                {ICONS.regenerate}
                Regenerate
              </Button>
            )}
          </div>

          {isTrial && (
            <div className="space-y-2">
              <p className="text-xs text-orange-600">
                ⚠️ Regeneration is not available for trial keys. 
              </p>
              <p className="text-xs text-orange-600">
                Upgrade to premium for full access and key management features.
              </p>
            </div>
          )}

          {/* {showKYCWarning && (
            <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-700">
                ℹ️ KYC (Know Your Customer) verification is required for security and compliance purposes.
                This helps us ensure a safe environment for all users.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/settings?tab=kyc")}
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                Go to KYC Verification
              </Button>
            </div>
          )} */}

          {!apiKey && hasActiveSubscription && !showKYCWarning && (
            <p className="text-xs text-blue-600">
              You have an active subscription. Generate your premium API key.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKey;
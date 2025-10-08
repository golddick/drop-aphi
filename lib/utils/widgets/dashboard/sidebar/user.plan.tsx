"use client";

import { Slider } from "@nextui-org/slider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ICONS } from "@/lib/utils/icons";
import useSubscribersData from "@/lib/hooks/useSubscribersData";
import useGetMembership from "@/lib/hooks/useGetMembership";

const UserPlan = () => {
  const { subscribers, loading: subscribersLoading } = useSubscribersData();
  const { data: membership, loading: membershipLoading } = useGetMembership();
  const router = useRouter();

  console.log(subscribers, "sub data cart");
  console.log(membership, "membership data userplan");

  const handleManageSubscription = () => {
    if (!membership?.paystackCustomerId) {
      toast.error("No active subscription found");
      return;
    }
    router.push("/dashboard/settings?tab=Subscription");
  };

  const getSubscriberLimit = () => {
    if (!membership) return 500;
    return membership.subscriberLimit || 500;
  };

  return (
    <div className="w-full my-3 p-4 bg-red-700 text-white rounded-lg hover:shadow-xl transition-shadow">
      <div className="w-full flex items-center justify-between">
        <h5 className="text-lg font-medium text-white">
          {membershipLoading
            ? "Loading..."
            : `${membership?.plan || "FREE"} Plan`}
        </h5>


        {membership?.subscriptionStatus === "ACTIVE" && (
          <Button
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-black hover:bg-red-600 transition-colors"
            onClick={handleManageSubscription}
            disabled={membershipLoading}
          >
            <span className="text-white text-xl">{ICONS.electric}</span>
            <span className="text-white text-sm">
              {membership?.plan?.toUpperCase() === "FREE"
                ? "Upgrade"
                : "Manage"}
            </span>
          </Button>
        )}
      </div>

      <div className="mt-4">
        <h5 className="text-white mb-2">Total subscribers</h5>
        <Slider
          aria-label="Subscriber usage"
          value={subscribers?.length || 0}
          maxValue={getSubscriberLimit()}
          hideThumb={true}
          classNames={{
            base: "max-w-md",
            track: "bg-black",
            filler: "bg-white",
          }}
        />
        <h6 className="text-white mt-1">
          {subscribersLoading
            ? "Loading..."
            : subscribers?.length || 0}{" "}
          of {getSubscriberLimit().toLocaleString()} used
        </h6>
      </div>
    </div>
  );
};

export default UserPlan;

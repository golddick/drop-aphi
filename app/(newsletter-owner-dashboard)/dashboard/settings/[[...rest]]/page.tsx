


'use client';

import { Suspense } from "react";
import { useEffect } from "react";
import { SubscriptionSettings } from "../_component/Sub-management";
import KYCPage from "../_component/KYC";
import ApiKey from "../_component/ApiKey";
import { NotificationCenter } from "../_component/Notification-Management";
import { useSearchParams } from "next/navigation";
import useSettingsFilter from "@/lib/hooks/useSettingsFilter";
import SettingsTab from "@/configs/settings.tabs";
import Loader from "@/components/_component/Loader";
import UserProfile from "../_component/UserProfile";

function SettingsContent() {
  const { activeItem, setActiveItem } = useSettingsFilter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveItem(tab);
    }
  }, [searchParams, setActiveItem]);

  return (
    <div className="w-full  mx-auto px-4  lg:px-8 ">
      {/* Settings Tab - Responsive */}
      <div className="overflow-x-auto ">
        <SettingsTab />
      </div>

      {/* Content Area - Responsive */}
      <div className="mt-5 pb-10 ">
        {activeItem === "Customize Profile" && (
          <div className="w-full flex justify-center">
              <UserProfile />
          </div>
        )}
        
        {activeItem === "API Access" && (
          <div className="">
            <ApiKey />
          </div>
        )}
        
        {activeItem === "KYC" && (
          <div className="w-full ">
           
              <KYCPage />
              
          </div>
        )}
        
        {activeItem === "Subscription" && (
          <div className="w-full">
              <SubscriptionSettings />
          </div>
        )}
        
        {activeItem === "Notification" && (
          <div className="w-full ">
              <NotificationCenter />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div >
        <Loader/>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}







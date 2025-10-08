import { Tab, Tabs } from "@nextui-org/react";
import useSettingsFilter from "@/lib/hooks/useSettingsFilter";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

const SettingsTab = () => {
  const { activeItem, setActiveItem } = useSettingsFilter();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");

  return (
    <div className="w-full overflow-x-auto pb-2">
      <Tabs
        variant="underlined"
        aria-label="Settings tabs"
        selectedKey={activeItem}
        onSelectionChange={(key) => setActiveItem(String(key))}
        classNames={{
          base: "w-full",
          tabList: `flex-nowrap ${isMobile ? "gap-1" : "gap-4"}`,
          tab: `${isMobile ? "px-2 py-1 text-sm" : "px-4 py-2"}`,
          cursor: "bg-red-400", // underline color
          tabContent:
            "group-data-[selected=true]:text-red-600 group-data-[selected=true]:font-semibold", // active tab text
        }}
        size={isMobile ? "sm" : "md"}
      >
        <Tab
          key="API Access"
          title={isMobile ? "API" : " API Access"}
          className="whitespace-nowrap"
        />
        <Tab
          key="Customize Profile"
          title={isMobile ? "Profile" : " Profile"}
          className="whitespace-nowrap"
        />
        <Tab key="KYC" title="Kyc" className="whitespace-nowrap" />
        <Tab
          key="Subscription"
          title={isMobile ? "Subscription" : "Subscription"}
          className="whitespace-nowrap"
        />
        <Tab
          key="Notification"
          title={isMobile ? "Notification" : "Notification"}
          className="whitespace-nowrap"
        />
      </Tabs>
    </div>
  );
};

export default SettingsTab;

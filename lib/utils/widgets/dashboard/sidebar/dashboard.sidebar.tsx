"use client";

import DashboardItems from "./dashboard.items";
import UserPlan from "./user.plan";

interface DashboardSideBarProps {
  onNavigate?: () => void;
}

const DashboardSideBar = ({onNavigate}:DashboardSideBarProps) => {

  return (
    <div className="p-2  bg-black text-white h-full  fixed top-0 left-0 w-[250px] hidden lg:block overflow-y-scroll hidden-scrollbar">
      <div>
        <DashboardItems  onNavigate={onNavigate}/>
        <UserPlan />
        <DashboardItems bottomContent={true} />
      </div>
    </div>
  );
};

export default DashboardSideBar;

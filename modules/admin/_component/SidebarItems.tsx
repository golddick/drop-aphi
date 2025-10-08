'use client'

import { logoutUser } from "@/actions/auth/login";
import { AdminsideBarBottomItems, AdminsideBarItems } from "@/configs/constants";
import { DashboardSideBarTypes } from "@/configs/types";
import { useAuthUser } from "@/lib/auth/getClientAuth";
import useRouteChange from "@/lib/utils/hooks/useRouteChange";
import { ICONS } from "@/lib/utils/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";


interface DashboardSideBarProps {
  onNavigate?: () => void;
  bottomContent?: boolean;
}

const AdminSidebarItems = ({ onNavigate, bottomContent }: DashboardSideBarProps) => {
  const { activeRoute, setActiveRoute } = useRouteChange();
  const { user } = useAuthUser();
  const pathName = usePathname();

  const LogoutHandler = async () => {
    try {
      console.log("🔐 Initiating logout...");
      
      // Call the server action
      const result = await logoutUser();
      
      if (result.success) {
        console.log("✅ " + result.message);
        
        // Clear any client-side storage
        localStorage.removeItem("dropaphi-autosave");
        sessionStorage.clear();
        
        // Force a full page reload to ensure all state is cleared
        window.location.href = '/';
      } else {
        console.error("❌ Logout failed:", result.message);
        // Still redirect even if there was an error
        window.location.href = '/';
      }
    } catch (error) {
      console.error('❌ Logout handler error:', error);
      // Fallback redirect
      window.location.href = '/';
    }
  };

  useEffect(() => {
    setActiveRoute(pathName);
  }, [pathName, setActiveRoute]);

  return (
    <>
      {!bottomContent ? (
        <>
          {AdminsideBarItems.map((item: DashboardSideBarTypes, index: number) => (
            <Link
              key={index}
              href={item.url}
              onClick={onNavigate}
              className={`text-xl p-2 py-5 flex rounded-md gap-4 items-center w-full mr-2 font-playfair  ${
                 item.url === activeRoute ? ' text-red-700' : 'hover:bg-gray-200 hover:text-red-700'
              }`}
            >
              <span>
                {item.icon}
              </span>
              <span>
                {item.title}
              </span>
            </Link>
          ))}
        </>
      ) : (
        <>
          {AdminsideBarBottomItems.map(
            (item: DashboardSideBarTypes, index: number) => (
              <Link
                href={item.url}
                key={index}
                onClick={onNavigate}
                className={`text-xl p-2 py-5 flex rounded-md gap-4 items-center w-full mr-2 font-playfair  ${
                   item.url === activeRoute ? ' text-red-700' : 'hover:bg-gray-200 hover:text-red-700'
                }`}
              >
                <span>
                  {item.icon}
                </span>
                <span>
                  {item.title}
                </span>
              </Link>
            )
          )}
          {/* sign out */}
          <div 
            className="p-2 py-5 flex items-center cursor-pointer border-b hover:bg-gray-200"
            onClick={LogoutHandler}
          >
            <span className="text-3xl mr-2">{ICONS.logOut}</span>
            <span className="text-xl">Sign Out</span>
          </div>
          {/* footer */}
          <br />
          <br />
          <p className="text-sm text-center pt-5 pb-10">
            © 2024 SIXTHGRID. All rights reserved.
          </p>
        </>
      )}
    </>
  );
};

export default AdminSidebarItems;
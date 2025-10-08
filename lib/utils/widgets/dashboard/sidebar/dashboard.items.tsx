
import { sideBarBottomItems, sideBarItems } from "@/configs/constants";
import useRouteChange from "@/lib/utils/hooks/useRouteChange";
import { ICONS } from "@/lib/utils/icons";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { useEffect } from "react";
 
interface DashboardSideBarProps {
  onNavigate?: () => void;
  bottomContent?: boolean;
}

const DashboardItems = ({ onNavigate, bottomContent }: DashboardSideBarProps) => {
  const {  setActiveRoute } = useRouteChange();
  const pathName = usePathname();

  const LogoutHandler = () => {
    // signOut();
    redirect("/");
  };

  useEffect(() => {
    setActiveRoute(pathName);
  }, [pathName, setActiveRoute]);

  return (
    <>
      {!bottomContent ? (
        <>
          {sideBarItems.map((item, index) => {
            const isExactMatch = pathName === item.url;
            const isSubRoute = pathName.startsWith(item.url + "/");
            const isActive = isExactMatch || (isSubRoute && item.url !== "/dashboard");

            return (
              <Link
                key={index}
                href={item.url}
                onClick={onNavigate}
                className={`text-xl p-2 py-5 flex rounded-md gap-4 items-center w-full mr-2 font-playfair  mb-2 ${
                  isActive ? "bg-gold-100 text-red-700" : "hover:bg-gray-200"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            );
          })}
        </>
      ) : (
        <>
          {sideBarBottomItems.map((item, index) => {
            const isExactMatch = pathName === item.url;
            const isSubRoute = pathName.startsWith(item.url + "/");
            const isActive = isExactMatch || (isSubRoute && item.url !== "/dashboard");

            return (
              <Link
                key={index}
                href={item.url}
                onClick={onNavigate}
                className={`text-xl p-2 py-5 flex rounded-md gap-4 items-center w-full mr-2 font-playfair ${
                 isActive ? "bg-gold-100 text-red-700" : "hover:bg-gray-200"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            );
          })}

          {/* sign out */}
          <div className="p-2 py-5 flex items-center cursor-pointer border-b" onClick={LogoutHandler}>
            <span className="text-3xl mr-2">{ICONS.logOut}</span>
            <span className="text-xl">Sign Out</span>
          </div>

          {/* footer */}
          <br />
          <br />
          <p className="text-sm text-center pt-5 pb-10">
            © 2025 SIXTHGRID. All rights reserved.
          </p>
        </>
      )}
    </>
  );
};

export default DashboardItems;



"use client";


import { Button } from "@/components/ui/button";
import { navItems } from "@/configs/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileHeaderProps {
  onNavigate?: () => void;
}

const MobileNavItems = ({onNavigate}:MobileHeaderProps) => {
  const pathname = usePathname();

  return (
    <div className="w-full flex flex-col gap-4 md:hidden items-start">
      {navItems.map((item, index) => {
        // const isActive = pathname === item.link;
         const isActive = pathname.startsWith(item.link);

        return (
          <Link
            key={index}
            href={item.link}
            onClick={onNavigate}
           className="w-full"
          >
           <Button 
           variant={'secondary'}
            className={`px-5 text-lg transition-colors duration-200  w-full ${
              isActive ? "text-gold-700 font-semibold" : "text-gray-700 hover:text-red-600"
            }`}
           >
             {item.title}
           </Button>
          </Link>
        );
      })}
    </div>
  );
};

export default MobileNavItems;

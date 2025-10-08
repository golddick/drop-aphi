

"use client";


import { navItems } from "@/configs/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavItems = () => {
  const pathname = usePathname();

  return (
    <div className="w-full hidden md:flex items-center">
      {navItems.map((item, index) => {
        // const isActive = pathname === item.link;
         const isActive = pathname.startsWith(item.link);

        return (
          <Link
            key={index}
            href={item.link}
            className={`px-5 text-lg transition-colors duration-200 ${
              isActive ? "text-gold-700 font-semibold" : "text-gray-700 hover:text-red-600"
            }`}
          >
            {item.title}
          </Link>
        );
      })}
    </div>
  );
};

export default NavItems;

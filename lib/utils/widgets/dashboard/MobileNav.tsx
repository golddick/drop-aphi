"use client";


import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react";
import { useState } from "react"
import DashboardItems from "./sidebar/dashboard.items";
import UserPlan from "./sidebar/user.plan";
import Link from "next/link";
import Logo from "../header/logo";

export function MobileNav() {

    const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
           <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side={'left'} className="  bg-gray-100 w-[250px] min-h-screen overflow-y-auto">
        <SheetHeader>
          {/* <SheetTitle>Drop-Aphi</SheetTitle> */}
          <Link href={"/"}> 
            <Logo />
          </Link>
          <SheetDescription>
          Communicate with Aphi
          </SheetDescription>
        </SheetHeader> 
        <div className="w-full h-auto bg-gray-100">
          <DashboardItems  onNavigate={handleClose}/>
          <UserPlan /> 
          <DashboardItems bottomContent={true} />
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

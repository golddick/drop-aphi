"use client";

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { Menu } from "lucide-react";
import { useState } from "react"
import Logo from "./logo";
import MobileNavItems from "./mobile.Nav.item";

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = (): void => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">
           <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side={'left'} className="bg-white w-[250px] mt-[60px] flex flex-col gap-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="w-full flex items-center justify-center">
             <Logo />
          </SheetTitle>
          <SheetDescription>
            Where creators and code connect
          </SheetDescription>
        </SheetHeader> 
        <div className="w-full h-auto bg-transparent">
             <MobileNavItems onNavigate={handleClose} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
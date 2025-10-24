"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Smartphone, Tablet, Monitor } from "lucide-react"

interface ResponsivePreviewProps {
  html: string
  subject: string
}

export function ResponsivePreview({ html, subject }: ResponsivePreviewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop">("desktop")

  const deviceSizes = {
    mobile: { width: "375px", height: "667px" },
    tablet: { width: "768px", height: "1024px" },
    desktop: { width: "1200px", height: "800px" },
  }

  const deviceIcons = {
    mobile: Smartphone,
    tablet: Tablet,
    desktop: Monitor,
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Smartphone className="w-4 h-4 mr-1" />
          Responsive
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <DialogTitle>Responsive Preview</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">Subject: {subject}</p>
          </div>
          <div className="flex items-center gap-1 border border-border rounded-md">
            {(["mobile", "tablet", "desktop"] as const).map((deviceType) => {
              const Icon = deviceIcons[deviceType]
              return (
                <Button
                  key={deviceType}
                  size="sm"
                  variant={device === deviceType ? "default" : "ghost"}
                  onClick={() => setDevice(deviceType)}
                  className="h-8"
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}
                </Button>
              )
            })}
          </div>
        </DialogHeader>

        <div className="flex-1 flex items-center justify-center bg-muted/20 rounded-md p-8">
          <div
            className="bg-white border border-border rounded-md shadow-lg overflow-hidden transition-all duration-300"
            style={{
              width: deviceSizes[device].width,
              height: deviceSizes[device].height,
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          >
            <iframe srcDoc={html} className="w-full h-full border-0" title="Responsive Preview" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

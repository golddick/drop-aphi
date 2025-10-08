"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import NewslettersCard from "./newslettersCard"
import KycCard from "./KycCard"
import BlogCard from "./blogCard"
import OverViewStat from "./OverViewStat"

export function AdminDashboard() {
  const [timeRange, setTimeRange] = useState("7d")


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive analytics and system overview</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant={timeRange === "24h" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("24h")}>
            24h
          </Button>
          <Button variant={timeRange === "7d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("7d")}>
            7d
          </Button>
          <Button variant={timeRange === "30d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("30d")}>
            30d
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <OverViewStat/>

      {/* Detailed Analytics */}
      <Tabs defaultValue="newsletters" className="space-y-4">
        <TabsList>
          <TabsTrigger value="newsletters">Newsletter Analytics</TabsTrigger>
          <TabsTrigger value="kyc">KYC Analytics</TabsTrigger>
          <TabsTrigger value="blogs">Blog Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="newsletters" className="space-y-4">
          <NewslettersCard/>
        </TabsContent>

        <TabsContent value="kyc" className="space-y-4">
          <KycCard/>
        </TabsContent>

        <TabsContent value="blogs" className="space-y-4">

          <BlogCard/>
        </TabsContent>

        
      </Tabs>
    </div>
  )
}

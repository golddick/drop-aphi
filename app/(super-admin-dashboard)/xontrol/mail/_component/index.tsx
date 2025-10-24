// "use client"

// import { useState, useMemo } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Checkbox } from "@/components/ui/checkbox"
// import Link from "next/link"
// import { Icons } from "@/lib/utils/icons"
// import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BarChart, Grid, List, MoreHorizontal, Search, Trash } from "lucide-react"

// interface EmailCampaign {
//   id: string
//   title: string
//   subject: string
//   status: "draft" | "scheduled" | "sent" | "failed"
//   createdAt: string
//   sentAt?: string
//   opens: number
//   clicks: number
//   recipients: number
//   deliveryRate: number
//   openRate: number
//   clickRate: number
// }

// // Mock data for demonstration
// const mockCampaigns: EmailCampaign[] = [
//   {
//     id: "1",
//     title: "Welcome Series - Email 1",
//     subject: "Welcome to DropAphi Mail Studio!",
//     status: "sent",
//     createdAt: "2024-01-15T10:00:00Z",
//     sentAt: "2024-01-15T14:00:00Z",
//     opens: 1250,
//     clicks: 340,
//     recipients: 2500,
//     deliveryRate: 98.5,
//     openRate: 50.0,
//     clickRate: 13.6,
//   },
//   {
//     id: "2",
//     title: "Product Launch Announcement",
//     subject: "🚀 Introducing Our New Features",
//     status: "sent",
//     createdAt: "2024-01-14T09:30:00Z",
//     sentAt: "2024-01-14T16:00:00Z",
//     opens: 890,
//     clicks: 156,
//     recipients: 1800,
//     deliveryRate: 97.2,
//     openRate: 49.4,
//     clickRate: 8.7,
//   },
//   {
//     id: "3",
//     title: "Monthly Newsletter - January",
//     subject: "Your January Update is Here",
//     status: "scheduled",
//     createdAt: "2024-01-13T11:15:00Z",
//     opens: 0,
//     clicks: 0,
//     recipients: 3200,
//     deliveryRate: 0,
//     openRate: 0,
//     clickRate: 0,
//   },
//   {
//     id: "4",
//     title: "Holiday Sale Campaign",
//     subject: "Last Chance: 50% Off Everything!",
//     status: "failed",
//     createdAt: "2024-01-12T08:45:00Z",
//     opens: 0,
//     clicks: 0,
//     recipients: 2100,
//     deliveryRate: 0,
//     openRate: 0,
//     clickRate: 0,
//   },
//   {
//     id: "5",
//     title: "Customer Feedback Survey",
//     subject: "Help Us Improve - Quick Survey",
//     status: "draft",
//     createdAt: "2024-01-11T16:20:00Z",
//     opens: 0,
//     clicks: 0,
//     recipients: 0,
//     deliveryRate: 0,
//     openRate: 0,
//     clickRate: 0,
//   },
// ]

// export default function EmailsPage() {
//   const [campaigns, setCampaigns] = useState<EmailCampaign[]>(mockCampaigns)
//   const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([])
//   const [searchQuery, setSearchQuery] = useState("")
//   const [statusFilter, setStatusFilter] = useState<string>("all")
//   const [sortBy, setSortBy] = useState<string>("createdAt")
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
//   const [viewMode, setViewMode] = useState<"grid" | "list">("list")
//   const [currentPage, setCurrentPage] = useState(1)
//   const itemsPerPage = 20

//   // Filter and sort campaigns
//   const filteredAndSortedCampaigns = useMemo(() => {
//     const filtered = campaigns.filter((campaign) => {
//       const matchesSearch =
//         campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         campaign.subject.toLowerCase().includes(searchQuery.toLowerCase())
//       const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
//       return matchesSearch && matchesStatus
//     })

//     filtered.sort((a, b) => {
//       let aValue: any = a[sortBy as keyof EmailCampaign]
//       let bValue: any = b[sortBy as keyof EmailCampaign]

//       if (sortBy === "createdAt" || sortBy === "sentAt") {
//         aValue = new Date(aValue || 0).getTime()
//         bValue = new Date(bValue || 0).getTime()
//       }

//       if (sortOrder === "asc") {
//         return aValue > bValue ? 1 : -1
//       } else {
//         return aValue < bValue ? 1 : -1
//       }
//     })

//     return filtered
//   }, [campaigns, searchQuery, statusFilter, sortBy, sortOrder])

//   // Pagination
//   const totalPages = Math.ceil(filteredAndSortedCampaigns.length / itemsPerPage)
//   const paginatedCampaigns = filteredAndSortedCampaigns.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage,
//   )

//   const getStatusBadge = (status: EmailCampaign["status"]) => {
//     const variants = {
//       draft: "secondary",
//       scheduled: "default",
//       sent: "default",
//       failed: "destructive",
//     } as const

//     const colors = {
//       draft: "bg-gray-100 text-gray-800",
//       scheduled: "bg-blue-100 text-blue-800",
//       sent: "bg-green-100 text-green-800",
//       failed: "bg-red-100 text-red-800",
//     }

//     return (
//       <Badge variant={variants[status]} className={colors[status]}>
//         {status.charAt(0).toUpperCase() + status.slice(1)}
//       </Badge>
//     )
//   }

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     })
//   }

//   const handleSelectAll = (checked: boolean) => {
//     if (checked) {
//       setSelectedCampaigns(paginatedCampaigns.map((c) => c.id))
//     } else {
//       setSelectedCampaigns([])
//     }
//   }

//   const handleSelectCampaign = (campaignId: string, checked: boolean) => {
//     if (checked) {
//       setSelectedCampaigns([...selectedCampaigns, campaignId])
//     } else {
//       setSelectedCampaigns(selectedCampaigns.filter((id) => id !== campaignId))
//     }
//   }

//   const handleBulkAction = (action: string) => {
//     console.log(`Bulk action: ${action} on campaigns:`, selectedCampaigns)
//     // Implement bulk actions here
//   }

//   return (
//     <div className="flex flex-col h-full">
//       {/* Page Header */}
//       <div className="p-6 border-b border-border">
//         <div className="flex items-center justify-between mb-4">
//           <div>
//             <h1 className="text-2xl font-bold text-balance">Email Campaigns</h1>
//             <p className="text-muted-foreground">Manage and track your email campaigns</p>
//           </div>
//           <Button asChild>
//             <Link href="/xontrol/mail/write">
//               <Icons.Plus className="w-4 h-4 mr-2" />
//               Write Mail
//             </Link>
//           </Button>
//         </div>

//         {/* Filters and Search */}
//         <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
//           <div className="flex-1 max-w-md">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search campaigns..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//           </div>

//           <div className="flex gap-2">
//             <Select value={statusFilter} onValueChange={setStatusFilter}>
//               <SelectTrigger className="w-32">
//                 <SelectValue placeholder="Status" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Status</SelectItem>
//                 <SelectItem value="draft">Draft</SelectItem>
//                 <SelectItem value="scheduled">Scheduled</SelectItem>
//                 <SelectItem value="sent">Sent</SelectItem>
//                 <SelectItem value="failed">Failed</SelectItem>
//               </SelectContent>
//             </Select>

//             <Select value={sortBy} onValueChange={setSortBy}>
//               <SelectTrigger className="w-32">
//                 <SelectValue placeholder="Sort by" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="createdAt">Created</SelectItem>
//                 <SelectItem value="sentAt">Sent Date</SelectItem>
//                 <SelectItem value="opens">Opens</SelectItem>
//                 <SelectItem value="clicks">Clicks</SelectItem>
//                 <SelectItem value="openRate">Open Rate</SelectItem>
//               </SelectContent>
//             </Select>

//             <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
//               {sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
//             </Button>

//             <div className="flex border border-border rounded-md">
//               <Button
//                 variant={viewMode === "list" ? "default" : "ghost"}
//                 size="sm"
//                 onClick={() => setViewMode("list")}
//                 className="rounded-r-none"
//               >
//                 <List className="w-4 h-4" />
//               </Button>
//               <Button
//                 variant={viewMode === "grid" ? "default" : "ghost"}
//                 size="sm"
//                 onClick={() => setViewMode("grid")}
//                 className="rounded-l-none"
//               >
//                 <Grid className="w-4 h-4" />
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Bulk Actions */}
//         {selectedCampaigns.length > 0 && (
//           <div className="mt-4 p-3 bg-muted rounded-md flex items-center justify-between">
//             <span className="text-sm text-muted-foreground">
//               {selectedCampaigns.length} campaign{selectedCampaigns.length > 1 ? "s" : ""} selected
//             </span>
//             <div className="flex gap-2">
//               <Button variant="outline" size="sm" onClick={() => handleBulkAction("duplicate")}>
//                 <Icons.Copy className="w-4 h-4 mr-1" />
//                 Duplicate
//               </Button>
//               <Button variant="outline" size="sm" onClick={() => handleBulkAction("delete")}>
//                 <Trash className="w-4 h-4 mr-1" />
//                 Delete
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Campaign List/Grid */}
//       <div className="flex-1 overflow-auto p-6">
//         {viewMode === "list" ? (
//           <div className="space-y-4">
//             {/* Table Header */}
//             <div className="grid grid-cols-12 gap-4 p-4 bg-muted rounded-md text-sm font-medium text-muted-foreground">
//               <div className="col-span-1">
//                 <Checkbox
//                   checked={selectedCampaigns.length === paginatedCampaigns.length && paginatedCampaigns.length > 0}
//                   onCheckedChange={handleSelectAll}
//                 />
//               </div>
//               <div className="col-span-4">Campaign</div>
//               <div className="col-span-2">Status</div>
//               <div className="col-span-2">Recipients</div>
//               <div className="col-span-1">Opens</div>
//               <div className="col-span-1">Clicks</div>
//               <div className="col-span-1">Actions</div>
//             </div>

//             {/* Campaign Rows */}
//             {paginatedCampaigns.map((campaign) => (
//               <Card key={campaign.id} className="hover:shadow-md transition-shadow">
//                 <CardContent className="p-4">
//                   <div className="grid grid-cols-12 gap-4 items-center">
//                     <div className="col-span-1">
//                       <Checkbox
//                         checked={selectedCampaigns.includes(campaign.id)}
//                         onCheckedChange={(checked) => handleSelectCampaign(campaign.id, checked as boolean)}
//                       />
//                     </div>
//                     <div className="col-span-4">
//                       <div>
//                         <h3 className="font-medium text-balance">{campaign.title}</h3>
//                         <p className="text-sm text-muted-foreground text-pretty">{campaign.subject}</p>
//                         <p className="text-xs text-muted-foreground mt-1">Created {formatDate(campaign.createdAt)}</p>
//                       </div>
//                     </div>
//                     <div className="col-span-2">{getStatusBadge(campaign.status)}</div>
//                     <div className="col-span-2">
//                       <span className="font-medium">{campaign.recipients.toLocaleString()}</span>
//                       {campaign.deliveryRate > 0 && (
//                         <p className="text-xs text-muted-foreground">{campaign.deliveryRate}% delivered</p>
//                       )}
//                     </div>
//                     <div className="col-span-1">
//                       <span className="font-medium">{campaign.opens.toLocaleString()}</span>
//                       {campaign.openRate > 0 && <p className="text-xs text-muted-foreground">{campaign.openRate}%</p>}
//                     </div>
//                     <div className="col-span-1">
//                       <span className="font-medium">{campaign.clicks.toLocaleString()}</span>
//                       {campaign.clickRate > 0 && <p className="text-xs text-muted-foreground">{campaign.clickRate}%</p>}
//                     </div>
//                     <div className="col-span-1">
//                       <div className="flex gap-1">
//                         <Button variant="ghost" size="sm" asChild>
//                           <Link href={`/xontrol/mail/${campaign.id}/analytics`}>
//                             <BarChart className="w-4 h-4" />
//                           </Link>
//                         </Button>
//                         <Button variant="ghost" size="sm">
//                           <MoreHorizontal className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         ) : (
//           /* Grid View */
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {paginatedCampaigns.map((campaign) => (
//               <Card key={campaign.id} className="hover:shadow-md transition-shadow">
//                 <CardHeader className="pb-3">
//                   <div className="flex items-start justify-between">
//                     <Checkbox
//                       checked={selectedCampaigns.includes(campaign.id)}
//                       onCheckedChange={(checked) => handleSelectCampaign(campaign.id, checked as boolean)}
//                     />
//                     {getStatusBadge(campaign.status)}
//                   </div>
//                   <CardTitle className="text-lg text-balance">{campaign.title}</CardTitle>
//                   <p className="text-sm text-muted-foreground text-pretty">{campaign.subject}</p>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-3">
//                     <div className="flex justify-between text-sm">
//                       <span className="text-muted-foreground">Recipients</span>
//                       <span className="font-medium">{campaign.recipients.toLocaleString()}</span>
//                     </div>
//                     {campaign.status === "sent" && (
//                       <>
//                         <div className="flex justify-between text-sm">
//                           <span className="text-muted-foreground">Opens</span>
//                           <span className="font-medium">
//                             {campaign.opens.toLocaleString()} ({campaign.openRate}%)
//                           </span>
//                         </div>
//                         <div className="flex justify-between text-sm">
//                           <span className="text-muted-foreground">Clicks</span>
//                           <span className="font-medium">
//                             {campaign.clicks.toLocaleString()} ({campaign.clickRate}%)
//                           </span>
//                         </div>
//                       </>
//                     )}
//                     <div className="flex justify-between text-sm">
//                       <span className="text-muted-foreground">Created</span>
//                       <span className="font-medium">{formatDate(campaign.createdAt)}</span>
//                     </div>
//                     <div className="flex gap-2 pt-2">
//                       <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
//                         <Link href={`/dashboard/emails/${campaign.id}/analytics`}>
//                           <BarChart className="w-4 h-4 mr-1" />
//                           Analytics
//                         </Link>
//                       </Button>
//                       <Button variant="ghost" size="sm">
//                         <MoreHorizontal className="w-4 h-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         )}

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex items-center justify-between mt-8">
//             <p className="text-sm text-muted-foreground">
//               Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
//               {Math.min(currentPage * itemsPerPage, filteredAndSortedCampaigns.length)} of{" "}
//               {filteredAndSortedCampaigns.length} campaigns
//             </p>
//             <div className="flex gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setCurrentPage(currentPage - 1)}
//                 disabled={currentPage === 1}
//               >
//                 <ArrowLeft className="w-4 h-4" />
//                 Previous
//               </Button>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setCurrentPage(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//               >
//                 Next
//                 <ArrowRight className="w-4 h-4" />
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }








"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Icons } from "@/lib/utils/icons"
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BarChart, Grid, List, Loader2, MoreHorizontal, Search, Trash } from "lucide-react"
import { getEmailCampaignsAction } from "@/actions/superadmin/emails"

interface EmailCampaign {
  id: string
  title: string
  subject: string
  status: "draft" | "scheduled" | "sent" | "failed"
  createdAt: string
  sentAt?: string
  opens: number
  clicks: number
  recipients: number
  deliveryRate: number
  openRate: number
  clickRate: number
}

export default function EmailsPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 20

  // Fetch campaigns on component mount
  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true)
      const result = await getEmailCampaignsAction()
      if (result.success) {
        setCampaigns(result.campaigns || [])
      } else {
        console.error('Failed to fetch campaigns:', result.message)
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter and sort campaigns
  const filteredAndSortedCampaigns = useMemo(() => {
    const filtered = campaigns.filter((campaign) => {
      const matchesSearch =
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.subject.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof EmailCampaign]
      let bValue: any = b[sortBy as keyof EmailCampaign]

      if (sortBy === "createdAt" || sortBy === "sentAt") {
        aValue = new Date(aValue || 0).getTime()
        bValue = new Date(bValue || 0).getTime()
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [campaigns, searchQuery, statusFilter, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCampaigns.length / itemsPerPage)
  const paginatedCampaigns = filteredAndSortedCampaigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const getStatusBadge = (status: EmailCampaign["status"]) => {
    const variants = {
      draft: "secondary" as const,
      scheduled: "default" as const,
      sent: "default" as const,
      failed: "destructive" as const,
    }

    const colors = {
      draft: "bg-gray-100 text-gray-800",
      scheduled: "bg-blue-100 text-blue-800",
      sent: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    }

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCampaigns(paginatedCampaigns.map((c) => c.id))
    } else {
      setSelectedCampaigns([])
    }
  }

  const handleSelectCampaign = (campaignId: string, checked: boolean) => {
    if (checked) {
      setSelectedCampaigns([...selectedCampaigns, campaignId])
    } else {
      setSelectedCampaigns(selectedCampaigns.filter((id) => id !== campaignId))
    }
  }

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on campaigns:`, selectedCampaigns)
    // Implement bulk actions here
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-balance">Email Campaigns</h1>
              <p className="text-muted-foreground">Manage and track your email campaigns</p>
            </div>
            <Button disabled>
              <Icons.Plus className="w-4 h-4 mr-2" />
              Write Mail
            </Button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading campaigns...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-balance">Email Campaigns</h1>
            <p className="text-muted-foreground">Manage and track your email campaigns</p>
          </div>
          <Button asChild>
            <Link href="/xontrol/mail/write">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Write Mail
            </Link>
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created</SelectItem>
                <SelectItem value="sentAt">Sent Date</SelectItem>
                <SelectItem value="opens">Opens</SelectItem>
                <SelectItem value="clicks">Clicks</SelectItem>
                <SelectItem value="openRate">Open Rate</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
              {sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </Button>

            <div className="flex border border-border rounded-md">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-r-none"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-l-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCampaigns.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-md flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {selectedCampaigns.length} campaign{selectedCampaigns.length > 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleBulkAction("duplicate")}>
                <Icons.Copy className="w-4 h-4 mr-1" />
                Duplicate
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction("delete")}>
                <Trash className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Campaign List/Grid */}
      <div className="flex-1 overflow-auto p-6">
        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Icons.Mail className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No email campaigns yet</h3>
            <p className="text-muted-foreground mb-6">Create your first email campaign to get started</p>
            <Button asChild>
              <Link href="/xontrol/mail/write">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Create First Campaign
              </Link>
            </Button>
          </div>
        ) : viewMode === "list" ? (
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-muted rounded-md text-sm font-medium text-muted-foreground">
              <div className="col-span-1">
                <Checkbox
                  checked={selectedCampaigns.length === paginatedCampaigns.length && paginatedCampaigns.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </div>
              <div className="col-span-4">Campaign</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Recipients</div>
              <div className="col-span-1">Opens</div>
              <div className="col-span-1">Clicks</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Campaign Rows */}
            {paginatedCampaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1">
                      <Checkbox
                        checked={selectedCampaigns.includes(campaign.id)}
                        onCheckedChange={(checked) => handleSelectCampaign(campaign.id, checked as boolean)}
                      />
                    </div>
                    <div className="col-span-4">
                      <div>
                        <h3 className="font-medium text-balance">{campaign.title}</h3>
                        <p className="text-sm text-muted-foreground text-pretty">{campaign.subject}</p>
                        <p className="text-xs text-muted-foreground mt-1">Created {formatDate(campaign.createdAt)}</p>
                      </div>
                    </div>
                    <div className="col-span-2">{getStatusBadge(campaign.status)}</div>
                    <div className="col-span-2">
                      <span className="font-medium">{campaign.recipients.toLocaleString()}</span>
                      {campaign.deliveryRate > 0 && (
                        <p className="text-xs text-muted-foreground">{campaign.deliveryRate}% delivered</p>
                      )}
                    </div>
                    <div className="col-span-1">
                      <span className="font-medium">{campaign.opens.toLocaleString()}</span>
                      {campaign.openRate > 0 && <p className="text-xs text-muted-foreground">{campaign.openRate}%</p>}
                    </div>
                    <div className="col-span-1">
                      <span className="font-medium">{campaign.clicks.toLocaleString()}</span>
                      {campaign.clickRate > 0 && <p className="text-xs text-muted-foreground">{campaign.clickRate}%</p>}
                    </div>
                    <div className="col-span-1">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/xontrol/mail/${campaign.id}/analytics`}>
                            <BarChart className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedCampaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Checkbox
                      checked={selectedCampaigns.includes(campaign.id)}
                      onCheckedChange={(checked) => handleSelectCampaign(campaign.id, checked as boolean)}
                    />
                    {getStatusBadge(campaign.status)}
                  </div>
                  <CardTitle className="text-lg text-balance">{campaign.title}</CardTitle>
                  <p className="text-sm text-muted-foreground text-pretty">{campaign.subject}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Recipients</span>
                      <span className="font-medium">{campaign.recipients.toLocaleString()}</span>
                    </div>
                    {campaign.status === "sent" && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Opens</span>
                          <span className="font-medium">
                            {campaign.opens.toLocaleString()} ({campaign.openRate}%)
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Clicks</span>
                          <span className="font-medium">
                            {campaign.clicks.toLocaleString()} ({campaign.clickRate}%)
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Created</span>
                      <span className="font-medium">{formatDate(campaign.createdAt)}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                        <Link href={`/xontrol/mail/${campaign.id}/analytics`}>
                          <BarChart className="w-4 h-4 mr-1" />
                          Analytics
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredAndSortedCampaigns.length)} of{" "}
              {filteredAndSortedCampaigns.length} campaigns
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
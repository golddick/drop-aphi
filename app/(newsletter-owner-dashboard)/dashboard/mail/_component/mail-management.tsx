"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Mail,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Send,
  Users,
  TrendingUp,
  Bot,
  Zap,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  User,
  MousePointerClick,
} from "lucide-react"
import Link from "next/link"
import { EmailStats, getEmails, getEmailStats } from "@/actions/email/email-actions"
import { deleteEmail } from "@/actions/email/emails"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import { toast } from "sonner"
import { MdOpenInBrowser } from "react-icons/md"

// Types for our email data
interface Email {
  id: string
  subject: string
  previewText: string
  campaign: string
  type: string
  status: string
  recipients: number
  openRate: number
  clickRate: number
  deliveryRate: number
  sentDate: string
  fromName: string
  fromEmail: string
  title: string
  content: string
  builderMode: string
  trackOpens: boolean
  trackClicks: boolean
  scheduleDate: Date | null
  createdAt: Date
}

interface PaginationState {
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
} 

export function EmailsDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [emails, setEmails] = useState<Email[]>([])
  const [stats, setStats] = useState<EmailStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0
  })

  // Media queries for responsive pagination
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')

  // Adjust items per page based on screen size
  useEffect(() => {
    const itemsPerPage = isMobile ? 5 : isTablet ? 8 : 10
    setPagination(prev => ({
      ...prev,
      itemsPerPage,
      currentPage: 1 // Reset to first page when items per page changes
    }))
  }, [isMobile, isTablet])

  // Fetch emails and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [emailsData, statsData] = await Promise.all([
          getEmails({ searchTerm, statusFilter, typeFilter }),
          getEmailStats()
        ])
        setEmails(emailsData)
        setStats(statsData)
        
        // Update pagination with total items
        setPagination(prev => ({
          ...prev,
          totalItems: emailsData.length,
          totalPages: Math.ceil(emailsData.length / prev.itemsPerPage)
        }))
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message)
        } else {
          toast.error("An unknown error occurred")
        }
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    // Add debounce to search
    const timeoutId = setTimeout(() => {
      fetchData()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, statusFilter, typeFilter])

  // Get current page emails
  const getCurrentPageEmails = () => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage
    const endIndex = startIndex + pagination.itemsPerPage
    return emails.slice(startIndex, endIndex)
  }

  // Pagination handlers
  const goToPage = (page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: Math.max(1, Math.min(page, prev.totalPages))
    }))
  }

  const nextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))
    }
  }

  const prevPage = () => {
    if (pagination.currentPage > 1) {
      setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))
    }
  }

  const goToFirstPage = () => goToPage(1)
  const goToLastPage = () => goToPage(pagination.totalPages)

  const handleDeleteEmail = async (id: string) => {
    if (!confirm('Are you sure you want to delete this email?')) return
    
    try {
      setActionLoading(id)
      await deleteEmail(id)
      toast.success('Email deleted successfully')
      
      // Refresh data
      const [updatedEmails, updatedStats] = await Promise.all([
        getEmails({ searchTerm, statusFilter, typeFilter }),
        getEmailStats()
      ])
      setEmails(updatedEmails)
      setStats(updatedStats)
      
      // Update pagination
      setPagination(prev => ({
        ...prev,
        totalItems: updatedEmails.length,
        totalPages: Math.ceil(updatedEmails.length / prev.itemsPerPage),
        currentPage: Math.min(prev.currentPage, Math.ceil(updatedEmails.length / prev.itemsPerPage))
      }))
    } catch (error) {
      console.error('Error deleting email:', error)
      toast.error('Failed to delete email')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800 border-green-200",
      sent: "bg-blue-100 text-blue-800 border-blue-200",
      scheduled: "bg-yellow-100 text-yellow-800 border-yellow-200",
      draft: "bg-gray-100 text-gray-800 border-gray-200",
      paused: "bg-red-100 text-red-800 border-red-200",
    }
    return variants[status as keyof typeof variants] || variants.draft
  }

  const getTypeBadge = (type: string) => {
    return type === "automated"
      ? "bg-purple-100 text-purple-800 border-purple-200"
      : "bg-orange-100 text-orange-800 border-orange-200"
  }

  const getStatusDisplay = (status: string) => {
    const statusMap: { [key: string]: string } = {
      draft: "Draft",
      sent: "Sent",
      scheduled: "Scheduled",
      active: "Active",
      paused: "Paused"
    }
    return statusMap[status] || status
  }

  // Generate page numbers for pagination with ellipsis
  const getPageNumbers = () => {
    const { currentPage, totalPages } = pagination
    const delta = isMobile ? 1 : 2 // Show fewer pages on mobile
    const range = []
    const rangeWithDots = []

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i)
      }
    }

    let prev = 0
    for (const i of range) {
      if (i - prev > 1) {
        rangeWithDots.push('...')
      }
      rangeWithDots.push(i)
      prev = i
    }

    return rangeWithDots
  }

  const currentPageEmails = getCurrentPageEmails()

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading emails...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white text-black p-4 sm:p-6">
          <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Email Management</h1>
                <p className="text-black mt-2 text-sm sm:text-base">Create, manage, and track your email campaigns</p>
              </div>
              <Link href={"/dashboard/mail/write"}>
                <Button className="bg-black text-white hover:bg-white hover:text-black font-semibold w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Email
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="w-full p-4 sm:p-6">
        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <Card className="col-span-1">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Total Emails</p>
                      <p className="text-xl sm:text-2xl font-bold text-black">{stats.totalEmails}</p>
                    </div>
                    <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
                      <Mail className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Sent Emails</p>
                      <p className="text-xl sm:text-2xl font-bold text-black">{stats.sentEmails}</p>
                    </div>
                    <div className="bg-green-100 p-2 sm:p-3 rounded-full">
                      <Send className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Total Recipients</p>
                      <p className="text-xl sm:text-2xl font-bold text-black">{stats.totalRecipients.toLocaleString()}</p>
                    </div>
                    <div className="bg-purple-100 p-2 sm:p-3 rounded-full">
                      <Users className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Avg. Open Rate</p>
                      <p className="text-xl sm:text-2xl font-bold text-black">{stats.avgOpenRate}%</p>
                    </div>
                    <div className="bg-yellow-100 p-2 sm:p-3 rounded-full">
                      <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-lg sm:rounded-xl shadow-none border-none p-4 sm:p-6 mb-4 sm:mb-6"
        >
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="relative w-full">
              <Input
                placeholder="Search emails by subject or campaign..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-black focus:ring-black text-sm sm:text-base"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>

            {/* <div className="flex gap-2 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-32 border-gray-300 focus:border-black focus:ring-black text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-32 border-gray-300 focus:border-black focus:ring-black text-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="automated">Automated</SelectItem>
                  <SelectItem value="instant">Instant</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
          </div>
        </motion.div>

        {/* Emails List */}
        <Card>
          <CardHeader className="bg-black text-white p-4 sm:p-6">
            <CardTitle className="flex items-center justify-between text-sm sm:text-base">
              <div className="flex items-center">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Email Campaigns ({emails.length})
              </div>
              {pagination.totalPages > 1 && (
                <div className="text-xs sm:text-sm text-gray-300">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {currentPageEmails.map((email) => (
                <div key={email.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors ">
                  <div className=" grid grid-cols-[2fr_1fr] md:flex flex-col lg:flex-row lg:items-center lg:justify-between gap-1 md:gap-4">
                    <div className="flex-1 ">
                      <div className="flex flex-row sm:items-center  gap-2 ">
                        <h3 className="text-base sm:text-lg font-semibold text-black break-words capitalize">{email.subject}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={`text-xs ${getStatusBadge(email.status)}`}>
                            {getStatusDisplay(email.status)}
                          </Badge>
                        </div>
                      </div>

                        {
                            email.previewText && (
                                     <p className="text-gray-600 mb-3 text-sm sm:text-base line-clamp-2">{email.previewText}</p>
                            )
                        }
                 
                      <div className="flex flex-row sm:items-center md:space-x-6 gap-2 text-xs sm:text-sm text-gray-500">
                        <div>Campaign: {email.campaign}</div>
                        {email.sentDate && <div>Sent: {email.sentDate}</div>}
                        {email.scheduleDate && <div>Scheduled: {new Date(email.scheduleDate).toLocaleDateString()}</div>}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center  gap-4">
                      {email.status !== "draft" && (
                        <div className="text-right">
                          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                            <div className=" w-full justify-center flex items-center flex-col">
                              <p className="text-gray-500 hidden md:block">Recipients</p>
                              <User className=" flex size-5 md:hidden"/>
                              <p className="font-semibold text-black">{email.recipients.toLocaleString()}</p>
                            </div>
                            <div className=" w-full justify-center flex items-center flex-col">
                              <p className="text-gray-500  hidden md:block">Open Rate</p>
                              <Eye className=" flex size-5 md:hidden"/>
                              <p className="font-semibold text-black">{email.openRate.toFixed(1)}%</p>
                            </div>
                            <div className=" w-full justify-center flex items-center flex-col">
                              <p className="text-gray-500  hidden md:block">Click Rate</p>
                              <MousePointerClick className=" flex size-5 md:hidden"/>
                              <p className="font-semibold text-black">{email.clickRate.toFixed(1)}%</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 self-end sm:self-auto"
                            disabled={actionLoading === email.id}
                          >
                            {actionLoading === email.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/mail/${email.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/mail/edit/${email.id}`}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Email
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteEmail(email.id)}
                            disabled={actionLoading === email.id}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="border-t border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{" "}
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{" "}
                  {pagination.totalItems} emails
                </div>
                
                <div className="flex items-center space-x-1">
                  {/* First Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToFirstPage}
                    disabled={pagination.currentPage === 1}
                    className="hidden sm:flex h-8 w-8 p-0"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>

                  {/* Previous Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevPage}
                    disabled={pagination.currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-sm text-gray-500">
                          ...
                        </span>
                      ) : (
                        <Button
                          key={page}
                          variant={pagination.currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(page as number)}
                          className={`h-8 w-8 p-0 text-xs ${
                            pagination.currentPage === page 
                              ? "bg-black text-white hover:bg-black" 
                              : ""
                          }`}
                        >
                          {page}
                        </Button>
                      )
                    ))}
                  </div>

                  {/* Next Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextPage}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  {/* Last Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToLastPage}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="hidden sm:flex h-8 w-8 p-0"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Mobile pagination info */}
                <div className="sm:hidden text-xs text-gray-500 text-center">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
              </div>
            </div>
          )}
        </Card>

        {emails.length === 0 && !loading && (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No emails found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
            <Link href="/dashboard/mail/write">
              <Button className="bg-black hover:bg-gray-800 text-white font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Email
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
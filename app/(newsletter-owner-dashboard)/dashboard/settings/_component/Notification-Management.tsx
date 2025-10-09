
"use client"

import {  useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent} from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Mail,
  MoreHorizontal,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  Users,
  MousePointer,
  Copy,
  ExternalLink,
  FileText,
  Shield,
  CreditCard,
  Award,
  Zap,
  DollarSign,
  Activity,
  BookOpen,
  Megaphone,
  Target,
  TrendingUp,
  Bell,
  LucideIcon,
  Pen
} from "lucide-react"
import { useAuthUser } from "@/lib/auth/getClientAuth"
import { useNotifications } from "@/lib/hooks/useNotifications"
import { EmailNotification, NotificationPriority, NotificationStatus, NotificationType } from "@/lib/generated/prisma"
import { toast } from "sonner"
import Loader from "@/components/_component/Loader"



interface NotificationContent {
  title?: string;
  body?: string;
  ctaText?: string;
  ctaUrl?: string;
  features?: string[];
  // Add any other fields you expect in your notification content
}

export function NotificationCenter() {
 const { user } = useAuthUser()
  const userId = user?.userId

  const {
    notifications,
    loading,
    error,
    unreadCount,
    refreshNotifications,
    markAsRead, 
    deleteNotification,
    pagination
  } = useNotifications(userId || "")

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<EmailNotification['status'] | "all">("all")
  const [typeFilter, setTypeFilter] = useState<EmailNotification['type'] | "all">("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState<EmailNotification['priority'] | "all">("all")
  const [selectedNotification, setSelectedNotification] = useState<EmailNotification | null>(null)

  

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.textContent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.recipients
    const matchesStatus = statusFilter === "all" || notification.status === statusFilter
    const matchesType = typeFilter === "all" || notification.type === typeFilter
    const matchesCategory = categoryFilter === "all" || notification.category === categoryFilter
    const matchesPriority = priorityFilter === "all" || notification.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesType && matchesCategory && matchesPriority
  })

  const getStatusBadge = (status: NotificationStatus) => {
    const variants = {
      SENT: { class: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
      SENDING: { class: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
      DELIVERED: { class: "bg-blue-100 text-blue-800 border-blue-200", icon: CheckCircle },
      FAILED: { class: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
      PENDING: { class: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock },
      DRAFT: { class: "bg-gray-100 text-gray-800 border-gray-200", icon: FileText } ,
      READ: { class: "bg-gray-100 text-gray-800 border-gray-200", icon: Pen } 
    } satisfies Record<NotificationStatus, { class: string; icon: LucideIcon }>
    
    const variant = variants[status as keyof typeof variants] || variants.SENT
    const Icon = variant.icon
    
    return (
      <Badge className={`text-xs ${variant.class} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    )
  }

  const getTypeBadge = (type: NotificationType) => {
    const variants = {
      EMAIL: "bg-blue-100 text-blue-800 border-blue-200",
      SYSTEM: "bg-purple-100 text-purple-800 border-purple-200",
      PUSH: "bg-green-100 text-green-800 border-green-200",
      SMS: "bg-orange-100 text-orange-800 border-orange-200"
    }
    return variants[type]
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      WELCOME: Mail,
      NEWSLETTER: BookOpen,
      PROMOTIONAL: Megaphone,
      TRANSACTIONAL: CreditCard,
      BLOG_APPROVAL: FileText,
      KYC_APPROVAL: Shield,
      PAYMENT_SUCCESS: DollarSign,
      CAMPAIGN_ALERT: Target,
      SECURITY_ALERT: AlertCircle,
      INTEGRATION_SUCCESS: Zap,
      SUBSCRIPTION_REMINDER: Clock,
      ACHIEVEMENT: Award
    }
    return icons[category] || Bell
  }

  const getPriorityBadge = (priority: NotificationPriority) => {
    const variants = {
      HIGH: "bg-red-100 text-red-800 border-red-200",
      MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
      LOW: "bg-gray-100 text-gray-800 border-gray-200"
    }
    return variants[priority]
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId)
        toast.success("Notification deleted successfully")
    } catch (error) {
     toast.error(  error instanceof Error ? error.message : "Failed to delete notification")
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
      toast.success("Notification marked as read successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to mark notification as read")
    }
  }

  const handleCopyContent = (content: string | null) => {
    if (!content) {
      toast.error("Failed to copy content")
      return
    }
    
    navigator.clipboard.writeText(content)
   
    toast.success('Notification content has been copied to clipboard')
  }

  const calculateEngagementRate = (notification: EmailNotification) => {
    if (!notification.emailsSentCount || notification.emailsSentCount === 0) return "0"
    const openCount = notification.openCount || 0
    const clickCount = notification.clickCount || 0
    return (((openCount + clickCount) / notification.emailsSentCount) * 100).toFixed(1)
  }

  const calculateOpenRate = (notification: EmailNotification) => {
    if (!notification.emailsSentCount || notification.emailsSentCount === 0) return "0"
    return (((notification.openCount || 0) / notification.emailsSentCount) * 100).toFixed(1)
  }

  if (loading) {
    return <Loader />
  }


  if (error) {
    return (
      <div className="h-200 w-200 mx-auto bg-gray-50 flex items-center justify-center p-4 ">
        <div className="text-center max-w-md">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Error loading notifications</h3>
          <p className="text-gray-500 mt-2">{error}</p>
          <Button className="mt-4" onClick={refreshNotifications}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white space-y-8  w-full  ">

      <div className="max-w-7xl mb-4 mx-auto p-3  md:p-6">
        <Tabs defaultValue="notifications" className="w-full">

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4  ">
              <StatCard
                title="Total"
                value={notifications.length}
                icon={<Bell className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />}
                className="bg-blue-100"
              />
              <StatCard
                title="Unread"
                value={unreadCount}
                icon={<AlertCircle className="text-red-600 w-4 h-4 sm:w-5 sm:h-5" />}
                className="bg-red-100"
              />
              <StatCard
                title="Emails"
                value={notifications.filter(n => n.type === "EMAIL").length}
                icon={<Mail className="text-green-600 w-4 h-4 sm:w-5 sm:h-5" />}
                className="bg-green-100"
              />
              <StatCard
                title="System"
                value={notifications.filter(n => n.type === "SYSTEM").length}
                icon={<Activity className="text-purple-600 w-4 h-4 sm:w-5 sm:h-5" />}
                className="bg-purple-100"
              />
            </div>

            {/* Notifications List */}
            <div className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-4">
              {filteredNotifications.map((notification) => {
                const CategoryIcon = getCategoryIcon(notification.category)
                return (
                  <Card
                    key={notification.id}
                    className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                      !notification.read ? "border-l-4 border-l-gold-600 bg-yellow-50" : ""
                    }`}
                  >
                    <CardContent className="p-3 sm:p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div
                          className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${
                            notification.type === "EMAIL" ? "bg-blue-100" : "bg-purple-100"
                          }`}
                        >
                          <CategoryIcon
                            className={`w-4 h-4 sm:w-5 sm:h-5 ${
                              notification.type === "EMAIL" ? "text-blue-600" : "text-purple-600"
                            }`}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-green-600"> */}
                          <div className="flex items-center w-full justify-between gap-2 ">
                            <h3
                              className={`text-sm sm:text-base font-medium truncate ${
                                !notification.read ? "text-black" : "text-gray-800"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            <div className="flex gap-1 sm:gap-2 flex-wrap">
                              {getStatusBadge(notification.status)}
                              <Badge className={`text-xs hidden md:block ${getTypeBadge(notification.type)}`}>
                                {notification.type}
                              </Badge>
                              <Badge className={`text-xs hidden md:block ${getPriorityBadge(notification.priority)}`}>
                                {notification.priority}
                              </Badge>

                                <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 sm:h-8 w-7 sm:w-8 p-0">
                                <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="sr-only">More options</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="text-xs min-w-[150px]">
                              {notification.type === "EMAIL" && (
                                <DropdownMenuItem 
                                  onClick={() => setSelectedNotification(notification)}
                                  disabled={!notification.htmlContent}
                                >
                                  <Eye className="w-3 h-3 mr-2" />
                                  View Content
                                </DropdownMenuItem>
                              )}
                              {!notification.read || notification.type === 'EMAIL' && (
                                <DropdownMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                                  <CheckCircle className="w-3 h-3 mr-2" />
                                  Mark as Read
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDelete(notification.id)}
                              >
                                <Trash2 className="w-3 h-3 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm text-black mt-2 line-clamp-2">
                            {typeof notification.content === 'string' 
                                ? notification.content 
                                : (notification.content as NotificationContent)?.title || 
                                (notification.content as NotificationContent)?.body || 
                                notification.textContent || 
                                'No content available'}
                            </p>

                          <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                            {notification.sentAt && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(notification.sentAt).toLocaleString()}</span>
                              </div>
                            )}
                            
                            {notification.recipients && notification.recipients > 0 && (
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span className="truncate max-w-[120px] sm:max-w-[180px] md:max-w-none">
                                  {notification.recipients}
                                </span>
                              </div>
                            )}
                          </div>

                          {notification.type === "EMAIL" && notification.emailsSentCount && (
                            <div className="mt-2 sm:mt-3 grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 text-xs">
                              <MetricItem
                                icon={<Mail className="text-gray-500 w-3 h-3" />}
                                value={notification.emailsSentCount?.toLocaleString() || "0"}
                                label="Mail Sent"
                              />
                              <MetricItem
                                icon={<Eye className="text-blue-500 w-3 h-3" />}
                                value={`${calculateOpenRate(notification)}%`}
                                label="Opens"
                              />
                              <MetricItem
                                icon={<MousePointer className="text-purple-500 w-3 h-3" />}
                                value={notification.clickCount?.toLocaleString() || "0"}
                                label="Clicks"
                              />
                              <MetricItem
                                icon={<TrendingUp className="text-green-500 w-3 h-3" />}
                                value={`${calculateEngagementRate(notification)}%`}
                                label="Engagement"
                              />
                            </div>
                          )}

                          {(notification.type === "SYSTEM" || notification.type === "EMAIL") && notification.metadata && (
                            <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-gray-50 rounded-lg text-xs hidden lg:block">
                              <h4 className="font-semibold text-gray-700 mb-1 sm:mb-2">Additional Details:</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 ">
                                {Object.entries(notification.metadata).map(([key, value]) => (
                                  <div key={key} className="flex gap-2 ">
                                    <span className="text-gray-600 capitalize  max-w-[100px] truncate">
                                      {key.replace(/([A-Z])/g, " $1").toLowerCase()}:
                                    </span>
                                    <span className="font-medium text-gray-800  w-full  lg:max-w-[500px] truncate">
                                      {typeof value === "object" ? JSON.stringify(value) : String(value)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {filteredNotifications.length === 0 && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="py-8 text-center">
                    <Bell className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <h3 className="text-lg font-medium text-gray-900">No notifications found</h3>
                    <p className="text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

       
        </Tabs>
      </div>

      {/* Notification Detail Dialog */}
      {selectedNotification && (
        <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-sm sm:text-base md:text-lg">{selectedNotification.title}</span>
                <div className="flex gap-1 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm h-7 sm:h-8 md:h-9"
                    onClick={() => handleCopyContent(selectedNotification.htmlContent || null)}
                    disabled={!selectedNotification.htmlContent}
                  >
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Copy HTML
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm h-7 sm:h-8 md:h-9"
                    onClick={() => {
                      if (!selectedNotification.htmlContent) {
                        toast.error('There is no HTML content to open.')
                        return
                      }
                      window.open(
                        `data:text/html,${encodeURIComponent(selectedNotification.htmlContent)}`,
                        "_blank"
                      )
                    }}
                    disabled={!selectedNotification.htmlContent}
                  >
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Open in New Tab
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="mt-3 sm:mt-4">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <p className="text-gray-500">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedNotification.status)}</div>
                  </div>
                  <div>
                    <p className="text-gray-500">Type</p>
                    <Badge className={`text-xs mt-1 ${getTypeBadge(selectedNotification.type)}`}>
                      {selectedNotification.type}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-500">Recipients</p>
                    <p className="font-medium mt-1 truncate">{selectedNotification.recipients || 0}</p>
                  </div>
                  {selectedNotification.sentAt && (
                    <div>
                      <p className="text-gray-500">Sent</p>
                      <p className="font-medium mt-1">
                        {new Date(selectedNotification.sentAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 p-2 sm:p-3 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs sm:text-sm">
                    <div>
                      <p className="font-medium">Subject: {selectedNotification.title}</p>
                      <p className="text-gray-600">
                        From: TheNews &lt;hello@thenews.africa&gt;
                      </p>
                    </div>
                    {selectedNotification.sentAt && (
                      <div className="text-gray-500">
                        {new Date(selectedNotification.sentAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                {selectedNotification.htmlContent ? (
                  <div
                    className="bg-white p-6 rounded-md shadow-md"
                    dangerouslySetInnerHTML={{ __html: selectedNotification.htmlContent }}
                  />
                ) : (
                  <div className="bg-white p-4 text-center text-gray-500">
                    No HTML content available for this notification
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  className?: string
}

function StatCard({ title, value, icon, className }: StatCardProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-2 sm:p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">{title}</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold">{value}</p>
          </div>
          <div className={`p-2 rounded-full ${className}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface MetricItemProps {
  icon: React.ReactNode
  value: string
  label: string
}

function MetricItem({ icon, value, label }: MetricItemProps) {
  return (
    <div className="bg-gray-50 p-1 sm:p-2 rounded text-center">
      <div className="flex items-center justify-center gap-1">
        {icon}
        <span className="font-medium text-xs sm:text-sm">{value}</span>
      </div>
      <span className="text-gray-500 text-[10px] sm:text-xs">{label}</span>
    </div>
  )
}

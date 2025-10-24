"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mail, Trash2, Download, Search, RefreshCw, Send, AlertTriangle } from "lucide-react"
import { SubscriptionStatus } from "@prisma/client"
import { deleteSubscriber, getSubscribers, getSubscriberStats } from "@/actions/superadmin/newsletter-subscribers"
import { toast } from "sonner"
import { sendUserEmail } from "@/lib/email/send-platform-email"


interface Subscriber {
  id: string
  email: string
  name: string
  creatorId: string
  creatorName: string
  subscribedAt: string
  status: SubscriptionStatus
}

export default function SubscribersTable() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCreator, setFilterCreator] = useState("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "SUBSCRIBED" | "UNSUBSCRIBED">("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    unsubscribed: 0
  })

  // Email modal states
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Fetch subscribers from server
  const fetchSubscribers = async () => {
    try {
      setLoading(true)
      setError(null)
      const [subscribersData, statsData] = await Promise.all([
        getSubscribers(),
        getSubscriberStats()
      ])

      // Normalize incoming data to match local Subscriber type (ensure non-null strings)
      const normalizedSubscribers: Subscriber[] = (subscribersData || []).map((s: any) => ({
        id: s.id,
        email: s.email ?? "",
        name: s.name ?? "",
        creatorId: s.creatorId,
        creatorName: s.creatorName ?? "Unknown",
        subscribedAt: s.subscribedAt ?? "",
        status: s.status as SubscriptionStatus,
      }))

      setSubscribers(normalizedSubscribers)
      setStats(statsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch subscribers")
      console.error("Error fetching subscribers:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesSearch =
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.creatorName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCreator = filterCreator === "all" || sub.creatorId === filterCreator
    const matchesStatus = filterStatus === "all" || sub.status === filterStatus

    return matchesSearch && matchesCreator && matchesStatus
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentSubscribers = filteredSubscribers.slice(startIndex, endIndex)

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm("Are you sure you want to remove this subscriber?")) {
      return
    }

    try {
      setDeletingId(id)
      await deleteSubscriber(id)
      // Remove subscriber from local state and update stats
      setSubscribers((prev) => prev.filter((sub) => sub.id !== id))
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        active: prev.active - (subscribers.find(sub => sub.id === id)?.status === "SUBSCRIBED" ? 1 : 0),
        unsubscribed: prev.unsubscribed - (subscribers.find(sub => sub.id === id)?.status === "UNSUBSCRIBED" ? 1 : 0)
      }))
      toast.success("Subscriber removed successfully!")
    } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to remove subscriber")
      console.error("Error deleting subscriber:", err)
    } finally {
      setDeletingId(null)
    }
  }

  const handleExportCSV = () => {
    const csv = [
      ["Email", "Name", "Creator", "Subscribed At", "Status"],
      ...filteredSubscribers.map((sub) => [sub.email, sub.name, sub.creatorName, sub.subscribedAt, sub.status]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleSendEmail = async () => {
    if (!selectedSubscriber || !emailSubject.trim() || !emailBody.trim()) {
        toast.error("Please fill in both subject and message fields")
      return
    }

    // Show warning if subscriber is unsubscribed
    if (selectedSubscriber.status === "UNSUBSCRIBED") {
      if (!confirm("This subscriber has unsubscribed from emails. Are you sure you want to send them an email?")) {
        return
      }
    }

    try {
      setSendingEmail(true)
      setEmailSuccess(null)

      const result = await sendUserEmail({
        userEmail: selectedSubscriber.email,
        subject: emailSubject,
        content: emailBody
      })

      setEmailSuccess(result.message)
      
      // Reset form
      setShowEmailModal(false)
      setEmailSubject("")
      setEmailBody("")
      setSelectedSubscriber(null)
      
      // Clear success message after 5 seconds
      setTimeout(() => setEmailSuccess(null), 5000)
    } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to send email")
      console.error("Error sending email:", err)
    } finally {
      setSendingEmail(false)
    }
  }

  const openEmailModal = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber)
    setEmailSubject("")
    setEmailBody("")
    setShowEmailModal(true)
    setEmailSuccess(null)
  }

  const creators = Array.from(new Set(subscribers.map((sub) => sub.creatorId))).map((id) => ({
    id,
    name: subscribers.find((sub) => sub.creatorId === id)?.creatorName || "Unknown",
  }))

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterCreator, filterStatus])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchSubscribers} className="bg-red-600 text-white hover:bg-red-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {emailSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-slide-in-down">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Send className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{emailSuccess}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">Platform Subscribers</h1>
        <Button onClick={fetchSubscribers} className="bg-red-600 text-white hover:bg-red-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 animate-slide-in-up">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
          <p className="text-gray-600 text-sm mb-2">Total Subscribers</p>
          <p className="text-3xl font-bold text-black">{stats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
          <p className="text-gray-600 text-sm mb-2">Active</p>
          <p className="text-3xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
          <p className="text-gray-600 text-sm mb-2">Unsubscribed</p>
          <p className="text-3xl font-bold text-red-600">{stats.unsubscribed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg animate-slide-in-up space-y-4">
        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email, name, or creator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-black placeholder-gray-400"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Filter by Creator</label>
            <select
              value={filterCreator}
              onChange={(e) => setFilterCreator(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
            >
              <option value="all">All Creators</option>
              {creators.map((creator) => (
                <option key={creator.id} value={creator.id}>
                  {creator.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "all" | "SUBSCRIBED" | "UNSUBSCRIBED")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
            >
              <option value="all">All Status</option>
              <option value="SUBSCRIBED">Subscribed</option>
              <option value="UNSUBSCRIBED">Unsubscribed</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleExportCSV}
              disabled={filteredSubscribers.length === 0}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export CSV ({filteredSubscribers.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-slide-in-up">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Creator</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Subscribed</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {subscribers.length === 0 ? "No subscribers found" : "No subscribers match your search"}
                  </td>
                </tr>
              ) : (
                currentSubscribers.map((subscriber, index) => (
                  <tr
                    key={subscriber.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-black">{subscriber.email}</span>
                        {subscriber.status === "UNSUBSCRIBED" && (
                          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                            Unsubscribed
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{subscriber.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{subscriber.creatorName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{subscriber.subscribedAt}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          subscriber.status === "SUBSCRIBED" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {subscriber.status.charAt(0).toUpperCase() + subscriber.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => openEmailModal(subscriber)}
                          className="bg-blue-600 text-white hover:bg-blue-700 text-xs py-1 px-2 rounded flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3" />
                          Email
                        </Button>
                        <Button
                          onClick={() => handleDeleteSubscriber(subscriber.id)}
                          disabled={deletingId === subscriber.id}
                          className="bg-red-600 text-white hover:bg-red-700 text-xs py-1 px-2 rounded flex items-center gap-1 disabled:opacity-50"
                        >
                          {deletingId === subscriber.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredSubscribers.length)} of {filteredSubscribers.length} results
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-red-600"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
            <div className="flex gap-1">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm disabled:opacity-50"
                variant="outline"
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm ${
                      currentPage === pageNum 
                        ? 'bg-red-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </Button>
                )
              })}
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm disabled:opacity-50"
                variant="outline"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Email Modal */}
      {showEmailModal && selectedSubscriber && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full animate-slide-in-up">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-black">Send Email to Subscriber</h2>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {selectedSubscriber.email}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Name:</strong> {selectedSubscriber.name}
                </p>
                {selectedSubscriber.status === "UNSUBSCRIBED" && (
                  <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800 font-medium">
                      This subscriber has unsubscribed from emails
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Subject *</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  disabled={sendingEmail}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Message *</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Enter your message here..."
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 resize-none"
                  disabled={sendingEmail}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your message will be formatted as HTML and include tracking features
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button
                onClick={() => {
                  setShowEmailModal(false)
                  setSelectedSubscriber(null)
                }}
                disabled={sendingEmail}
                className="bg-gray-300 text-black hover:bg-gray-400 px-6 py-2 rounded disabled:opacity-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendEmail} 
                disabled={sendingEmail || !emailSubject.trim() || !emailBody.trim()}
                className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded flex items-center gap-2 disabled:opacity-50"
              >
                {sendingEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


// "use client"

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Mail, Trash2, Download, Search, RefreshCw } from "lucide-react"
// import { SubscriptionStatus } from "@prisma/client"
// import { deleteSubscriber, getSubscribers, getSubscriberStats } from "@/actions/superadmin/newsletter-subscribers"

// interface Subscriber {
//   id: string
//   email: string
//   name: string
//   creatorId: string
//   creatorName: string
//   subscribedAt: string
//   status: SubscriptionStatus
// }

// export default function SubscribersTable() {
//   const [subscribers, setSubscribers] = useState<Subscriber[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [filterCreator, setFilterCreator] = useState("all")
//   const [deletingId, setDeletingId] = useState<string | null>(null)
//   const [stats, setStats] = useState({
//     total: 0,
//     active: 0,
//     unsubscribed: 0
//   })

//   // Fetch subscribers from server
//   const fetchSubscribers = async () => {
//     try {
//       setLoading(true)
//       setError(null)
//       const [subscribersData, statsData] = await Promise.all([
//         getSubscribers(),
//         getSubscriberStats()
//       ])

//       // Normalize incoming data to match local Subscriber type (ensure non-null strings)
//       const normalizedSubscribers: Subscriber[] = (subscribersData || []).map((s: any) => ({
//         id: s.id,
//         email: s.email ?? "",
//         name: s.name ?? "",
//         creatorId: s.creatorId,
//         creatorName: s.creatorName ?? "Unknown",
//         subscribedAt: s.subscribedAt ?? "",
//         status: s.status as SubscriptionStatus,
//       }))

//       setSubscribers(normalizedSubscribers)
//       setStats(statsData)
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to fetch subscribers")
//       console.error("Error fetching subscribers:", err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchSubscribers()
//   }, [])

//   const filteredSubscribers = subscribers.filter((sub) => {
//     const matchesSearch =
//       sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       sub.creatorName.toLowerCase().includes(searchTerm.toLowerCase())
//     const matchesCreator = filterCreator === "all" || sub.creatorId === filterCreator

//     return matchesSearch && matchesCreator
//   })

//   const handleDeleteSubscriber = async (id: string) => {
//     if (!confirm("Are you sure you want to remove this subscriber?")) {
//       return
//     }

//     try {
//       setDeletingId(id)
//       await deleteSubscriber(id)
//       // Remove subscriber from local state and update stats
//       setSubscribers((prev) => prev.filter((sub) => sub.id !== id))
//       setStats(prev => ({
//         ...prev,
//         total: prev.total - 1,
//         active: prev.active - (subscribers.find(sub => sub.id === id)?.status === "SUBSCRIBED" ? 1 : 0),
//         unsubscribed: prev.unsubscribed - (subscribers.find(sub => sub.id === id)?.status === "UNSUBSCRIBED" ? 1 : 0)
//       }))
//       alert("Subscriber removed successfully!")
//     } catch (err) {
//       alert(err instanceof Error ? err.message : "Failed to remove subscriber")
//       console.error("Error deleting subscriber:", err)
//     } finally {
//       setDeletingId(null)
//     }
//   }

//   const handleExportCSV = () => {
//     const csv = [
//       ["Email", "Name", "Creator", "Subscribed At", "Status"],
//       ...filteredSubscribers.map((sub) => [sub.email, sub.name, sub.creatorName, sub.subscribedAt, sub.status]),
//     ]
//       .map((row) => row.join(","))
//       .join("\n")

//     const blob = new Blob([csv], { type: "text/csv" })
//     const url = window.URL.createObjectURL(blob)
//     const a = document.createElement("a")
//     a.href = url
//     a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`
//     a.click()
//     window.URL.revokeObjectURL(url)
//   }

//   const creators = Array.from(new Set(subscribers.map((sub) => sub.creatorId))).map((id) => ({
//     id,
//     name: subscribers.find((sub) => sub.creatorId === id)?.creatorName || "Unknown",
//   }))

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
//         <p className="text-red-600 mb-4">{error}</p>
//         <Button onClick={fetchSubscribers} className="bg-red-600 text-white hover:bg-red-700">
//           <RefreshCw className="w-4 h-4 mr-2" />
//           Try Again
//         </Button>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header with Refresh Button */}
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold text-black">Platform Subscribers</h1>
//         <Button onClick={fetchSubscribers} className="bg-red-600 text-white hover:bg-red-700">
//           <RefreshCw className="w-4 h-4 mr-2" />
//           Refresh
//         </Button>
//       </div>

//       {/* Stats */}
//       <div className="grid md:grid-cols-3 gap-4 animate-slide-in-up">
//         <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
//           <p className="text-gray-600 text-sm mb-2">Total Subscribers</p>
//           <p className="text-3xl font-bold text-black">{stats.total}</p>
//         </div>
//         <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
//           <p className="text-gray-600 text-sm mb-2">Active</p>
//           <p className="text-3xl font-bold text-green-600">{stats.active}</p>
//         </div>
//         <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
//           <p className="text-gray-600 text-sm mb-2">Unsubscribed</p>
//           <p className="text-3xl font-bold text-red-600">{stats.unsubscribed}</p>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg animate-slide-in-up space-y-4">
//         <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
//           <Search className="w-5 h-5 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search by email, name, or creator..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="flex-1 bg-transparent outline-none text-black placeholder-gray-400"
//           />
//         </div>

//         <div className="grid md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-black mb-2">Filter by Creator</label>
//             <select
//               value={filterCreator}
//               onChange={(e) => setFilterCreator(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
//             >
//               <option value="all">All Creators</option>
//               {creators.map((creator) => (
//                 <option key={creator.id} value={creator.id}>
//                   {creator.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex items-end">
//             <Button
//               onClick={handleExportCSV}
//               disabled={filteredSubscribers.length === 0}
//               className="w-full bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <Download className="w-4 h-4" />
//               Export CSV ({filteredSubscribers.length})
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Subscribers Table */}
//       <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-slide-in-up">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-black">Email</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-black">Name</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-black">Creator</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-black">Subscribed</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-black">Status</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-black">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredSubscribers.length === 0 ? (
//                 <tr>
//                   <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
//                     {subscribers.length === 0 ? "No subscribers found" : "No subscribers match your search"}
//                   </td>
//                 </tr>
//               ) : (
//                 filteredSubscribers.map((subscriber, index) => (
//                   <tr
//                     key={subscriber.id}
//                     className="border-b border-gray-200 hover:bg-gray-50 transition-colors animate-fade-in"
//                     style={{ animationDelay: `${index * 50}ms` }}
//                   >
//                     <td className="px-6 py-4 text-sm font-medium text-black">{subscriber.email}</td>
//                     <td className="px-6 py-4 text-sm text-gray-600">{subscriber.name}</td>
//                     <td className="px-6 py-4 text-sm text-gray-600">{subscriber.creatorName}</td>
//                     <td className="px-6 py-4 text-sm text-gray-600">{subscriber.subscribedAt}</td>
//                     <td className="px-6 py-4">
//                       <span
//                         className={`px-3 py-1 text-xs font-semibold rounded-full ${
//                           subscriber.status === "SUBSCRIBED" 
//                             ? "bg-green-100 text-green-800" 
//                             : "bg-gray-100 text-gray-800"
//                         }`}
//                       >
//                         {subscriber.status.charAt(0).toUpperCase() + subscriber.status.slice(1)}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex gap-2">
//                         <Button className="bg-blue-600 text-white hover:bg-blue-700 text-xs py-1 px-2 rounded flex items-center gap-1">
//                           <Mail className="w-3 h-3" />
//                           Email
//                         </Button>
//                         <Button
//                           onClick={() => handleDeleteSubscriber(subscriber.id)}
//                           disabled={deletingId === subscriber.id}
//                           className="bg-red-600 text-white hover:bg-red-700 text-xs py-1 px-2 rounded flex items-center gap-1 disabled:opacity-50"
//                         >
//                           {deletingId === subscriber.id ? (
//                             <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
//                           ) : (
//                             <Trash2 className="w-3 h-3" />
//                           )}
//                           Remove
//                         </Button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   )
// }
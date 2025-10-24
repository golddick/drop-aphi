"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mail, Trash2, Eye, Search, RefreshCw, Send } from "lucide-react"
import { deleteUser, getUsers } from "@/actions/superadmin/users"
import { sendUserEmail } from "@/lib/email/send-platform-email"


interface User {
  id: string
  fullName: string
  email: string
  userName: string
  plan: string
  subscriptionStatus: string
  createdAt: string
  organization?: string
  isEmailVerified: boolean
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null)

  // Fetch users from server
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const usersData = await getUsers()
      setUsers(usersData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users")
      console.error("Error fetching users:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return
    }

    try {
      setDeletingId(id)
      await deleteUser()
      setUsers((prev) => prev.filter((user) => user.id !== id))
      alert("User deleted successfully!")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user")
      console.error("Error deleting user:", err)
    } finally {
      setDeletingId(null)
    }
  }

  const handleSendEmail = async () => {
    if (!selectedUser || !emailSubject.trim() || !emailBody.trim()) {
      alert("Please fill in both subject and message fields")
      return
    }

    try {
      setSendingEmail(true)
      setEmailSuccess(null)

      const result = await sendUserEmail({
        userEmail: selectedUser.email,
        subject: emailSubject,
        content: emailBody
      })

      setEmailSuccess(result.message)
      
      // Reset form
      setShowEmailModal(false)
      setEmailSubject("")
      setEmailBody("")
      
      // Clear success message after 5 seconds
      setTimeout(() => setEmailSuccess(null), 5000)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send email")
      console.error("Error sending email:", err)
    } finally {
      setSendingEmail(false)
    }
  }

  const openEmailModal = (user: User) => {
    setSelectedUser(user)
    setEmailSubject("")
    setEmailBody("")
    setShowEmailModal(true)
    setEmailSuccess(null)
  }

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
        <Button onClick={fetchUsers} className="bg-red-600 text-white hover:bg-red-700">
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
        <h1 className="text-2xl font-bold text-black">Users Management</h1>
        <Button onClick={fetchUsers} className="bg-red-600 text-white hover:bg-red-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg animate-slide-in-up">
        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-black placeholder-gray-400"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-slide-in-up">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Plan</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {users.length === 0 ? "No users found" : "No users match your search"}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-black">{user.fullName}</p>
                        <p className="text-xs text-gray-500">@{user.userName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          user.subscriptionStatus === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.createdAt}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => openEmailModal(user)}
                          className="bg-blue-600 text-white hover:bg-blue-700 text-xs py-1 px-2 rounded flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3" />
                          Email
                        </Button>
                        <Button
                          onClick={() => setSelectedUser(user)}
                          className="bg-gray-600 text-white hover:bg-gray-700 text-xs py-1 px-2 rounded flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </Button>
                        <Button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={deletingId === user.id}
                          className="bg-red-600 text-white hover:bg-red-700 text-xs py-1 px-2 rounded flex items-center gap-1 disabled:opacity-50"
                        >
                          {deletingId === user.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full animate-slide-in-up">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-black">Send Email to {selectedUser.fullName}</h2>
              <p className="text-sm text-gray-600 mt-1">{selectedUser.email}</p>
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
                onClick={() => setShowEmailModal(false)}
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

      {/* User Details Modal (unchanged) */}
      {selectedUser && !showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full animate-slide-in-up">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-black">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-black text-2xl">
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-semibold text-black">{selectedUser.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Username</p>
                  <p className="font-semibold text-black">@{selectedUser.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-black">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email Verified</p>
                  <p className={`font-semibold ${selectedUser.isEmailVerified ? "text-green-600" : "text-red-600"}`}>
                    {selectedUser.isEmailVerified ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plan</p>
                  <p className="font-semibold text-black">{selectedUser.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Subscription Status</p>
                  <p className="font-semibold text-black">{selectedUser.subscriptionStatus}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Organization</p>
                  <p className="font-semibold text-black">{selectedUser.organization || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Joined</p>
                  <p className="font-semibold text-black">{selectedUser.createdAt}</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button
                onClick={() => setSelectedUser(null)}
                className="bg-gray-300 text-black hover:bg-gray-400 px-6 py-2 rounded"
              >
                Close
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
// import { Mail, Trash2, Eye, Search, RefreshCw } from "lucide-react"
// import { deleteUser, getUsers } from "@/actions/superadmin/users"

// interface User {
//   id: string
//   fullName: string
//   email: string
//   userName: string
//   plan: string
//   subscriptionStatus: string
//   createdAt: string
//   organization?: string
//   isEmailVerified: boolean
// }

// export default function UsersTable() {
//   const [users, setUsers] = useState<User[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [selectedUser, setSelectedUser] = useState<User | null>(null)
//   const [showEmailModal, setShowEmailModal] = useState(false)
//   const [emailSubject, setEmailSubject] = useState("")
//   const [emailBody, setEmailBody] = useState("")
//   const [deletingId, setDeletingId] = useState<string | null>(null)

//   // Fetch users from server
//   const fetchUsers = async () => {
//     try {
//       setLoading(true)
//       setError(null)
//       const usersData = await getUsers()
//       setUsers(usersData)
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to fetch users")
//       console.error("Error fetching users:", err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchUsers()
//   }, [])

//   const filteredUsers = users.filter(
//     (user) =>
//       user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.userName.toLowerCase().includes(searchTerm.toLowerCase()),
//   )

//   const handleDeleteUser = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this user?")) {
//       return
//     }

//     try {
//       setDeletingId(id)
//       await deleteUser()
//       // Remove user from local state
//       setUsers((prev) => prev.filter((user) => user.id !== id))
//       alert("User deleted successfully!")
//     } catch (err) {
//       alert(err instanceof Error ? err.message : "Failed to delete user")
//       console.error("Error deleting user:", err)
//     } finally {
//       setDeletingId(null)
//     }
//   }

//   const handleSendEmail = () => {
//     if (selectedUser && emailSubject && emailBody) {
//       console.log(`Email sent to ${selectedUser.email}:`, { subject: emailSubject, body: emailBody })
//       setShowEmailModal(false)
//       setEmailSubject("")
//       setEmailBody("")
//       alert("Email sent successfully!")
//     }
//   }

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
//         <Button onClick={fetchUsers} className="bg-red-600 text-white hover:bg-red-700">
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
//         <h1 className="text-2xl font-bold text-black">Users Management</h1>
//         <Button onClick={fetchUsers} className="bg-red-600 text-white hover:bg-red-700">
//           <RefreshCw className="w-4 h-4 mr-2" />
//           Refresh
//         </Button>
//       </div>

//       {/* Search Bar */}
//       <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg animate-slide-in-up">
//         <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
//           <Search className="w-5 h-5 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search by name, email, or username..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="flex-1 bg-transparent outline-none text-black placeholder-gray-400"
//           />
//         </div>
//       </div>

//       {/* Users Table */}
//       <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-slide-in-up">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-black">Name</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-black">Email</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-black">Plan</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-black">Status</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-black">Joined</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-black">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredUsers.length === 0 ? (
//                 <tr>
//                   <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
//                     {users.length === 0 ? "No users found" : "No users match your search"}
//                   </td>
//                 </tr>
//               ) : (
//                 filteredUsers.map((user, index) => (
//                   <tr
//                     key={user.id}
//                     className="border-b border-gray-200 hover:bg-gray-50 transition-colors animate-fade-in"
//                     style={{ animationDelay: `${index * 50}ms` }}
//                   >
//                     <td className="px-6 py-4">
//                       <div>
//                         <p className="font-medium text-black">{user.fullName}</p>
//                         <p className="text-xs text-gray-500">@{user.userName}</p>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
//                     <td className="px-6 py-4">
//                       <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
//                         {user.plan}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span
//                         className={`px-3 py-1 text-xs font-semibold rounded-full ${
//                           user.subscriptionStatus === "ACTIVE"
//                             ? "bg-green-100 text-green-800"
//                             : "bg-gray-100 text-gray-800"
//                         }`}
//                       >
//                         {user.subscriptionStatus}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-600">{user.createdAt}</td>
//                     <td className="px-6 py-4">
//                       <div className="flex gap-2">
//                         <Button
//                           onClick={() => {
//                             setSelectedUser(user)
//                             setShowEmailModal(true)
//                           }}
//                           className="bg-blue-600 text-white hover:bg-blue-700 text-xs py-1 px-2 rounded flex items-center gap-1"
//                         >
//                           <Mail className="w-3 h-3" />
//                           Email
//                         </Button>
//                         <Button
//                           onClick={() => setSelectedUser(user)}
//                           className="bg-gray-600 text-white hover:bg-gray-700 text-xs py-1 px-2 rounded flex items-center gap-1"
//                         >
//                           <Eye className="w-3 h-3" />
//                           View
//                         </Button>
//                         <Button
//                           onClick={() => handleDeleteUser(user.id)}
//                           disabled={deletingId === user.id}
//                           className="bg-red-600 text-white hover:bg-red-700 text-xs py-1 px-2 rounded flex items-center gap-1 disabled:opacity-50"
//                         >
//                           {deletingId === user.id ? (
//                             <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
//                           ) : (
//                             <Trash2 className="w-3 h-3" />
//                           )}
//                           Delete
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

//       {/* Rest of the modals remain the same */}
//       {/* Email Modal */}
//       {showEmailModal && selectedUser && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full animate-slide-in-up">
//             <div className="p-6 border-b border-gray-200">
//               <h2 className="text-2xl font-bold text-black">Send Email to {selectedUser.fullName}</h2>
//               <p className="text-sm text-gray-600 mt-1">{selectedUser.email}</p>
//             </div>

//             <div className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-black mb-2">Subject *</label>
//                 <input
//                   type="text"
//                   value={emailSubject}
//                   onChange={(e) => setEmailSubject(e.target.value)}
//                   placeholder="Email subject"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-black mb-2">Message *</label>
//                 <textarea
//                   value={emailBody}
//                   onChange={(e) => setEmailBody(e.target.value)}
//                   placeholder="Email message"
//                   rows={6}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 resize-none"
//                 />
//               </div>
//             </div>

//             <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
//               <Button
//                 onClick={() => setShowEmailModal(false)}
//                 className="bg-gray-300 text-black hover:bg-gray-400 px-6 py-2 rounded"
//               >
//                 Cancel
//               </Button>
//               <Button onClick={handleSendEmail} className="bg-red-600 text-white hover:bg-red-700 px-6 py-2 rounded">
//                 Send Email
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* User Details Modal */}
//       {selectedUser && !showEmailModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full animate-slide-in-up">
//             <div className="p-6 border-b border-gray-200 flex justify-between items-center">
//               <h2 className="text-2xl font-bold text-black">User Details</h2>
//               <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-black text-2xl">
//                 ×
//               </button>
//             </div>

//             <div className="p-6 space-y-4">
//               <div className="grid md:grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm text-gray-600">Full Name</p>
//                   <p className="font-semibold text-black">{selectedUser.fullName}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Username</p>
//                   <p className="font-semibold text-black">@{selectedUser.userName}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Email</p>
//                   <p className="font-semibold text-black">{selectedUser.email}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Email Verified</p>
//                   <p className={`font-semibold ${selectedUser.isEmailVerified ? "text-green-600" : "text-red-600"}`}>
//                     {selectedUser.isEmailVerified ? "Yes" : "No"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Plan</p>
//                   <p className="font-semibold text-black">{selectedUser.plan}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Subscription Status</p>
//                   <p className="font-semibold text-black">{selectedUser.subscriptionStatus}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Organization</p>
//                   <p className="font-semibold text-black">{selectedUser.organization || "N/A"}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Joined</p>
//                   <p className="font-semibold text-black">{selectedUser.createdAt}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
//               <Button
//                 onClick={() => setSelectedUser(null)}
//                 className="bg-gray-300 text-black hover:bg-gray-400 px-6 py-2 rounded"
//               >
//                 Close
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
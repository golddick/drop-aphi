









"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button" 
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, User } from "lucide-react"
import { getMembership, updateProfile } from "@/actions/membership/getMembership"
import { toast } from "sonner"
import { UploadButton } from "@/lib/uploadthing"
import Image from "next/image"

interface UserData {
  id: string
  userId: string
  fullName:string
  userName: string
  plan: string
  role: string
  subscriptionStatus: string
  paystackCustomerId: string | null
  email: string
  organization: string | null
  kycStatus: boolean
  senderName: string | null
  amount: number | null
  currency: string | null
  lastPaymentDate: string | null
  nextPaymentDate: string | null
  subscriberLimit: number | null
  emailLimit: number | null
  blogPostLimit: number | null
  aiGenerationLimit: number | null
  createdAt: string
  updatedAt: string
  termsAndConditionsAccepted: boolean
  profileImage?: string | null
}

interface FormData {
  fullName: string
  email: string
  userName: string
  organization: string
  website: string
  profileImage: string
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    userName: "",
    organization: "",
    website: "",
    profileImage: ""
  })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Fetch user data on component mount using server action
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setInitialLoading(true)
        const data = await getMembership()
        
        if (!data) {
          throw new Error('Failed to fetch user data')
        }
        
        setUserData(data)

        console.log(userData, "user data")
        
        // Populate form with user data
        setFormData({
          fullName: data.fullName ,
          email: data.email,
          userName: data.userName,
          organization: data.organization || "",
          website: "",
          profileImage: data.profileImage || ""
        })

        // Set image preview if profile image exists
        if (data.profileImage) {
          setImagePreview(data.profileImage)
        }
      } catch (err) {
        setError("Failed to load user data")
        console.error("Error fetching user data:", err)
      } finally {
        setInitialLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Function to automatically save profile when image is uploaded
  const handleAutoSaveProfile = async (imageUrl: string) => {
    try {
      setLoading(true)
      setError("")

      // Use server action to update profile with new image and current form data
      const result = await updateProfile({
        userName: formData.userName,
        organization: formData.organization,
        fullName: formData.fullName, // Full name
        profileImage: imageUrl,
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile')
      }
 
      // Update local user data
      if (userData) {
        setUserData({
          ...userData,
          userName: formData.userName,
          fullName: formData.fullName,
          profileImage: imageUrl,
        })
      }

      toast.success("Profile updated successfully!")
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    try {
      // Use server action to update profile
      const result = await updateProfile({
        userName: formData.userName,
        organization: formData.organization,
        fullName: formData.fullName, // Full name
        profileImage: formData.profileImage || imagePreview || undefined,
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile')
      }
 
      // Update local user data
      if (userData) {
        setUserData({
          ...userData,
          userName: formData.userName,
          senderName: formData.fullName,
          profileImage: formData.profileImage || imagePreview || null,
        })
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      toast.success("Profile updated successfully!")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white ">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-black">Profile Settings</h1>
          <p className="text-gray-600 text-sm">Update your account information</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">Profile updated successfully!</AlertDescription>
                </Alert>
              )}

              {/* Profile Image Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg relative">
                    {imagePreview ? (
                      <Image 
                        src={imagePreview} 
                        alt="Profile" 
                        fill
                        className="w-full h-full object-cover absolute"
                      />
                    ) : (
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                  <div className="w-full">
                    <UploadButton
                      endpoint="imageUploader"
                      onUploadBegin={() => setIsUploading(true)}
                      onClientUploadComplete={(res) => {
                        const uploadedUrl = res[0].ufsUrl || res[0].url;
                        
                        // Update local state
                        setFormData((prev) => ({...prev, profileImage: uploadedUrl }));
                        setImagePreview(uploadedUrl);
                        
                        // Automatically save to database with server action
                        handleAutoSaveProfile(uploadedUrl);
                        
                        setIsUploading(false);
                      }}
                      onUploadError={(error: Error) => {
                        toast.error(error.message || "Failed to upload image");
                        setIsUploading(false);
                      }}
                      appearance={{
                        button: `
                          bg-black hover:bg-gray-800 
                          ut-uploading:bg-gray-700/50 
                          rounded-md px-4 py-2 text-white
                          font-medium w-full
                        `,
                      }}
                      content={{
                        button: isUploading ? "Uploading..." : "Upload Image",
                        allowedContent: "Max 5MB",
                      }}
                    />
                  </div>
                  
                  {imagePreview && (
                    <Button
                      type="button"
                      onClick={() => {
                        setImagePreview(null)
                        setFormData(prev => ({ ...prev, profileImage: "" }))
                      }}
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove Image
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Full Name</label>
                  <Input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="border-gray-300"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Username</label>
                  <Input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    className="border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                  className="border-gray-300 bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Website</label>
                <Input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  disabled
                  className="border-gray-300 bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Update during KYC verification
                </p>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-black hover:bg-gray-900 text-white">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Status Card */}
        {userData && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Plan</span>
                <span className="font-semibold text-black">{userData.plan}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Subscription Status</span>
                <span className={`font-semibold ${
                  userData.subscriptionStatus === 'active' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {userData.subscriptionStatus}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">KYC Status</span>
                <span className={`font-semibold ${
                  userData.kycStatus ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {userData.kycStatus ? 'Verified' : 'Pending'}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
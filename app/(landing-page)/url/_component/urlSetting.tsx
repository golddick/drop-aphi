// "use client"

// import type React from "react"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Copy, Eye, Upload, X } from "lucide-react"

// export default function NewsletterSettingsPage() {
//   const [config, setConfig] = useState({
//     title: "Stay Updated with Latest Tech Insights",
//     description: "Get weekly updates on web development, APIs, and tech trends delivered to your inbox.",
//     type: "newsletter" as "newsletter" | "waitlist",
//     primaryColor: "#DC2626",
//     accentColor: "#FCD34D",
//     ctaText: "Subscribe Now",
//     successMessage: "Thanks for subscribing! Check your email for confirmation.",
//     logo: null as string | null,
//     backgroundImage: null as string | null,
//     galleryImages: [] as string[],
//   })

//   const [copied, setCopied] = useState(false)
//   const [showPreview, setShowPreview] = useState(false)
//   const creatorId = "creator-123" // Mock creator ID

//   const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/url/${creatorId}`

//   const handleCopyUrl = () => {
//     navigator.clipboard.writeText(shareUrl)
//     setCopied(true)
//     setTimeout(() => setCopied(false), 2000)
//   }

//   const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (file) {
//       const reader = new FileReader()
//       reader.onload = (event) => {
//         setConfig({ ...config, logo: event.target?.result as string })
//       }
//       reader.readAsDataURL(file)
//     }
//   }

//   const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (file) {
//       const reader = new FileReader()
//       reader.onload = (event) => {
//         setConfig({ ...config, backgroundImage: event.target?.result as string })
//       }
//       reader.readAsDataURL(file)
//     }
//   }

//   const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files
//     if (files) {
//       Array.from(files).forEach((file) => {
//         const reader = new FileReader()
//         reader.onload = (event) => {
//           setConfig((prev) => ({
//             ...prev,
//             galleryImages: [...prev.galleryImages, event.target?.result as string],
//           }))
//         }
//         reader.readAsDataURL(file)
//       })
//     }
//   }

//   const removeGalleryImage = (index: number) => {
//     setConfig((prev) => ({
//       ...prev,
//       galleryImages: prev.galleryImages.filter((_, i) => i !== index),
//     }))
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-6xl mx-auto px-4 py-8">
//         <h1 className="text-3xl font-bold text-black mb-8">Newsletter Settings</h1>

//         <div className="grid lg:grid-cols-3 gap-8">
//           {/* Settings Form */}
//           <div className="lg:col-span-2 space-y-6">
//             <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
//               <div>
//                 <label className="block text-sm font-semibold text-black mb-2">Newsletter Type</label>
//                 <select
//                   value={config.type}
//                   onChange={(e) => setConfig({ ...config, type: e.target.value as "newsletter" | "waitlist" })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
//                 >
//                   <option value="newsletter">Newsletter</option>
//                   <option value="waitlist">Waitlist</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-black mb-2">Logo</label>
//                 <div className="flex items-center gap-4">
//                   {config.logo && (
//                     <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
//                       <img src={config.logo || "/no-img.jpg"} alt="Logo" className="w-full h-full object-cover" />
//                       <button
//                         onClick={() => setConfig({ ...config, logo: null })}
//                         className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded hover:bg-red-700"
//                       >
//                         <X className="w-3 h-3" />
//                       </button>
//                     </div>
//                   )}
//                   <label className="flex-1 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-600 transition-colors">
//                     <div className="flex items-center justify-center gap-2 text-gray-600">
//                       <Upload className="w-4 h-4" />
//                       <span className="text-sm">Upload Logo</span>
//                     </div>
//                     <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
//                   </label>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-black mb-2">Title</label>
//                 <input
//                   type="text"
//                   value={config.title}
//                   onChange={(e) => setConfig({ ...config, title: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-black mb-2">Description</label>
//                 <textarea
//                   value={config.description}
//                   onChange={(e) => setConfig({ ...config, description: e.target.value })}
//                   rows={3}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 resize-none"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-black mb-2">Background Image (Optional)</label>
//                 <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-600 transition-colors text-gray-600">
//                   <Upload className="w-4 h-4" />
//                   <span className="text-sm">Upload Background Image</span>
//                   <input type="file" accept="image/*" onChange={handleBackgroundUpload} className="hidden" />
//                 </label>
//                 {config.backgroundImage && (
//                   <button
//                     onClick={() => setConfig({ ...config, backgroundImage: null })}
//                     className="mt-2 text-sm text-red-600 hover:text-red-700"
//                   >
//                     Remove Background Image
//                   </button>
//                 )}
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-semibold text-black mb-2">Primary Color</label>
//                   <div className="flex items-center gap-2">
//                     <input
//                       type="color"
//                       value={config.primaryColor}
//                       onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
//                       className="w-12 h-10 rounded cursor-pointer"
//                     />
//                     <input
//                       type="text"
//                       value={config.primaryColor}
//                       onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
//                       className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-black mb-2">Accent Color</label>
//                   <div className="flex items-center gap-2">
//                     <input
//                       type="color"
//                       value={config.accentColor}
//                       onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
//                       className="w-12 h-10 rounded cursor-pointer"
//                     />
//                     <input
//                       type="text"
//                       value={config.accentColor}
//                       onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
//                       className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-black mb-2">CTA Button Text</label>
//                 <input
//                   type="text"
//                   value={config.ctaText}
//                   onChange={(e) => setConfig({ ...config, ctaText: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-black mb-2">Success Message</label>
//                 <textarea
//                   value={config.successMessage}
//                   onChange={(e) => setConfig({ ...config, successMessage: e.target.value })}
//                   rows={2}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 resize-none"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-black mb-2">Gallery Images (Optional)</label>
//                 <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-600 transition-colors text-gray-600">
//                   <Upload className="w-4 h-4" />
//                   <span className="text-sm">Upload Multiple Images</span>
//                   <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
//                 </label>

//                 {config.galleryImages.length > 0 && (
//                   <div className="mt-4 grid grid-cols-3 gap-3">
//                     {config.galleryImages.map((image, index) => (
//                       <div key={index} className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
//                         <img
//                           src={image || "/placeholder.svg"}
//                           alt={`Gallery ${index}`}
//                           className="w-full h-full object-cover"
//                         />
//                         <button
//                           onClick={() => removeGalleryImage(index)}
//                           className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded hover:bg-red-700"
//                         >
//                           <X className="w-3 h-3" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <Button className="w-full bg-red-600 text-white hover:bg-red-700 py-2 rounded-lg font-semibold">
//                 Save Settings
//               </Button>
//             </div>
//           </div>

//           {/* Share & Preview Section */}
//           <div className="space-y-6">
//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <h2 className="text-xl font-bold text-black mb-4">Share Your Newsletter</h2>

//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-semibold text-black mb-2">Newsletter URL</label>
//                   <div className="flex gap-2">
//                     <input
//                       type="text"
//                       value={shareUrl}
//                       readOnly
//                       className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
//                     />
//                     <Button
//                       onClick={handleCopyUrl}
//                       className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2"
//                     >
//                       <Copy className="w-4 h-4" />
//                       {copied ? "Copied!" : "Copy"}
//                     </Button>
//                   </div>
//                 </div>

//                 <Button
//                   onClick={() => setShowPreview(!showPreview)}
//                   className="w-full bg-black text-white hover:bg-gray-900 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
//                 >
//                   <Eye className="w-4 h-4" />
//                   {showPreview ? "Hide Preview" : "Preview Newsletter"}
//                 </Button>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <h2 className="text-xl font-bold text-black mb-4">Embed Code</h2>
//               <p className="text-sm text-gray-600 mb-4">Add this code to your website to embed the newsletter form:</p>
//               <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
//                 <code className="text-xs text-gray-800 font-mono">
//                   {`<iframe src="${shareUrl}" width="100%" height="600" frameborder="0"></iframe>`}
//                 </code>
//               </div>
//             </div>

//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//               <p className="text-sm text-blue-800">
//                 <strong>Tip:</strong> Share your newsletter URL on social media, your website, or email to grow your
//                 subscriber list!
//               </p>
//             </div>
//           </div>
//         </div>

//         {showPreview && (
//           <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
//             <h2 className="text-2xl font-bold text-black mb-6">Live Preview</h2>
//             <div className="bg-gradient-to-br from-black via-gray-900 to-black rounded-lg p-8 flex items-center justify-center min-h-96">
//               <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
//                 <div
//                   className="px-8 py-12 text-white relative overflow-hidden"
//                   style={{
//                     backgroundColor: config.primaryColor,
//                     backgroundImage: config.backgroundImage ? `url(${config.backgroundImage})` : undefined,
//                     backgroundSize: "cover",
//                     backgroundPosition: "center",
//                   }}
//                 >
//                   <div className="absolute inset-0 opacity-10">
//                     <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20"></div>
//                     <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16"></div>
//                   </div>

//                   <div className="relative z-10">
//                     {config.logo && (
//                       <div className="mb-4 w-16 h-16 bg-white rounded-lg overflow-hidden">
//                         <img
//                           src={config.logo || "/no-img.jpg"}
//                           alt="Logo"
//                           className="w-full h-full object-cover"
//                         />
//                       </div>
//                     )}
//                     <h1 className="text-3xl font-bold mb-3 text-balance">{config.title}</h1>
//                     <p className="text-base opacity-90">{config.description}</p>
//                   </div>
//                 </div>

//                 <div className="px-8 py-8">
//                   {config.galleryImages.length > 0 && (
//                     <div className="mb-6 grid grid-cols-2 gap-2">
//                       {config.galleryImages.slice(0, 4).map((image, index) => (
//                         <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
//                           <img
//                             src={image || "/no-img.jpg"}
//                             alt={`Gallery ${index}`}
//                             className="w-full h-full object-cover"
//                           />
//                         </div>
//                       ))}
//                     </div>
//                   )}

//                   <div className="space-y-3">
//                     <input
//                       type="text"
//                       placeholder="Full Name"
//                       className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none"
//                     />
//                     <input
//                       type="email"
//                       placeholder="Email Address"
//                       className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none"
//                     />
//                     <button
//                       className="w-full py-2 rounded-lg font-semibold text-white transition-all"
//                       style={{ backgroundColor: config.primaryColor }}
//                     >
//                       {config.ctaText}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }







// app/newsletter-settings/page.tsx

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Eye, Upload, X } from "lucide-react"
import { UploadButton } from "@/lib/uploadthing"
import { NewsletterConfig } from "@/configs/types"
import { getNewsletterSettings, saveNewsletterSettings, updateNewsletterBackground, updateNewsletterGallery, updateNewsletterLogo } from "@/actions/newsletter/newsletter-actions"
import { useAuthUser } from "@/lib/auth/getClientAuth"
import { toast } from "sonner"

export default function NewsletterSettingsPage() {
  const [config, setConfig] = useState<NewsletterConfig>({
    title: "Stay Updated with Latest Tech Insights",
    description: "Get weekly updates on web development, APIs, and tech trends delivered to your inbox.",
    type: "newsletter",
    primaryColor: "#DC2626",
    accentColor: "#FCD34D",
    ctaText: "Subscribe Now",
    successMessage: "Thanks for subscribing! Check your email for confirmation.",
    logo: null,
    backgroundImage: null,
    galleryImages: [],
  })

  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingBackground, setIsUploadingBackground] = useState(false)
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const user = useAuthUser()
  
  const creatorId = user.user?.userId || ""

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/url/${creatorId}`

  // Load settings on component mount
  useEffect(() => {
    async function loadSettings() {
      const result = await getNewsletterSettings(creatorId)
      if (result.success && result.data) {
        setConfig(result.data)
      }
    }
    loadSettings()
  }, [creatorId])

  const handleSaveSettings = async () => {
    setIsLoading(true)
    setSaveStatus(null)

    const result = await saveNewsletterSettings(creatorId, config)
    
    if (result.success) {
      setSaveStatus({ type: "success", message: result.message || "Settings saved successfully!" })
      toast.success(result.message || "Settings saved successfully!")
    } else {
      toast.error(result.error || "Failed to save settings")
      setSaveStatus({ type: "error", message: result.error || "Failed to save settings" })
    }

    setIsLoading(false)
    setTimeout(() => setSaveStatus(null), 3000)
  }

  const handleLogoUpload = async (res: any[]) => {
    try {
      const uploadedUrl = res[0].url || res[0].ufsUrl;
      setConfig(prev => ({ ...prev, logo: uploadedUrl }))
      
      // Auto-save to database
      await updateNewsletterLogo(creatorId, uploadedUrl)
      toast.success("Logo uploaded successfully")
    } catch (error) {
      console.error("Error uploading logo:", error)
      toast.error("Failed to upload logo")
      setSaveStatus({ type: "error", message: "Failed to upload logo" })
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleBackgroundUpload = async (res: any[]) => {
    try {
      const uploadedUrl = res[0].url || res[0].ufsUrl;
      setConfig(prev => ({ ...prev, backgroundImage: uploadedUrl }))
      
      // Auto-save to database
      await updateNewsletterBackground(creatorId, uploadedUrl)
      toast.success("Background image uploaded successfully")
    } catch (error) {
      console.error("Error uploading background:", error)
      toast.error("Failed to upload background image")
      setSaveStatus({ type: "error", message: "Failed to upload background image" })
    } finally {
      setIsUploadingBackground(false)
    }
  }

  const handleGalleryUpload = async (res: any[]) => {
    try {
      const newImageUrls = res.map(file => file.url || file.ufsUrl)
      const updatedGallery = [...config.galleryImages, ...newImageUrls]
      
      setConfig(prev => ({ 
        ...prev, 
        galleryImages: updatedGallery
      }))
      
      // Auto-save to database
      await updateNewsletterGallery(creatorId, updatedGallery)
      toast.success("Gallery images uploaded successfully")
    } catch (error) {
      console.error("Error uploading gallery images:", error)
      toast.error("Failed to upload gallery images")
      setSaveStatus({ type: "error", message: "Failed to upload gallery images" })
    } finally {
      setIsUploadingGallery(false)
    }
  }

  const removeGalleryImage = async (index: number) => {
    try {
      const updatedGallery = config.galleryImages.filter((_, i) => i !== index)
      setConfig(prev => ({ ...prev, galleryImages: updatedGallery }))
      
      // Auto-save to database
      await updateNewsletterGallery(creatorId, updatedGallery)
      toast.success("Gallery image removed successfully")
    } catch (error) {
      console.error("Error removing gallery image:", error)
      toast.error("Failed to remove gallery image")
      setSaveStatus({ type: "error", message: "Failed to remove image" })
    }
  }

  const removeLogo = async () => {
    try {
      setConfig(prev => ({ ...prev, logo: null }))
      await updateNewsletterLogo(creatorId, "")
      toast.success("Logo removed successfully")
    } catch (error) {
      console.error("Error removing logo:", error)
      toast.error("Failed to remove logo")
      setSaveStatus({ type: "error", message: "Failed to remove logo" })
    }
  }

  const removeBackground = async () => {
    try {
      setConfig(prev => ({ ...prev, backgroundImage: null }))
      await updateNewsletterBackground(creatorId, "")
      toast.success("Background image removed successfully")
    } catch (error) {
      console.error("Error removing background:", error)
      toast.error("Failed to remove background image")
      setSaveStatus({ type: "error", message: "Failed to remove background image" })
    }
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto px-16 py-8">
        <h1 className="text-3xl font-bold text-black mb-8">Newsletter Settings</h1>

        {/* Save Status */}
        {saveStatus && (
          <div className={`mb-6 p-4 rounded-lg ${
            saveStatus.type === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          }`}>
            <p className={saveStatus.type === "success" ? "text-green-800" : "text-red-800"}>
              {saveStatus.message}
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Settings Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Newsletter Type</label>
                <select
                  value={config.type}
                  onChange={(e) => setConfig({ ...config, type: e.target.value as "newsletter" | "waitlist" })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                >
                  <option value="newsletter">Newsletter</option>
                  <option value="waitlist">Waitlist</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Logo</label>
                <div className="flex items-center gap-4">
                  {config.logo && (
                    <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <img src={config.logo} alt="Logo" className="w-full h-full object-cover" />
                      <button
                        onClick={removeLogo}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <UploadButton
                      endpoint="imageUploader"
                      onUploadBegin={() => setIsUploadingLogo(true)}
                      onClientUploadComplete={handleLogoUpload}
                      onUploadError={(error: Error) => {
                        console.error("Upload error:", error)
                        setSaveStatus({ type: "error", message: error.message || "Failed to upload logo" })
                        setIsUploadingLogo(false)
                      }}
                      appearance={{
                        button: `
                          w-full bg-black hover:bg-gray-800 
                          ut-uploading:bg-gray-700/50 
                          rounded-lg px-4 py-3 text-white
                          font-medium transition-colors
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `,
                      }}
                      content={{
                        button: isUploadingLogo ? (
                          <span className="flex items-center gap-2">
                            <Upload className="w-4 h-4 animate-pulse" />
                            Uploading...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Upload Logo
                          </span>
                        ),
                        allowedContent: "Max 5MB (PNG, JPG, WebP)",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Title</label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                  placeholder="Enter newsletter title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Description</label>
                <textarea
                  value={config.description}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 resize-none"
                  placeholder="Enter newsletter description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                    />
                    <input
                      type="text"
                      value={config.primaryColor}
                      onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                      placeholder="#DC2626"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.accentColor}
                      onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                    />
                    <input
                      type="text"
                      value={config.accentColor}
                      onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                      placeholder="#FCD34D"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">CTA Button Text</label>
                <input
                  type="text"
                  value={config.ctaText}
                  onChange={(e) => setConfig({ ...config, ctaText: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                  placeholder="Subscribe Now"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Success Message</label>
                <textarea
                  value={config.successMessage}
                  onChange={(e) => setConfig({ ...config, successMessage: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 resize-none"
                  placeholder="Thanks for subscribing! Check your email for confirmation."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Background Image (Optional)</label>
                {config.backgroundImage && (
                  <div className="mb-4 relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={config.backgroundImage} 
                      alt="Background" 
                      className="w-full h-full object-cover" 
                    />
                    <button
                      onClick={removeBackground}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <UploadButton
                  endpoint="imageUploader"
                  onUploadBegin={() => setIsUploadingBackground(true)}
                  onClientUploadComplete={handleBackgroundUpload}
                  onUploadError={(error: Error) => {
                    console.error("Upload error:", error)
                    setSaveStatus({ type: "error", message: error.message || "Failed to upload background image" })
                    setIsUploadingBackground(false)
                  }}
                  appearance={{
                    button: `
                      w-full bg-black hover:bg-gray-800 
                      ut-uploading:bg-gray-700/50 
                      rounded-lg px-4 py-3 text-white
                      font-medium transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `,
                  }}
                  content={{
                    button: isUploadingBackground ? (
                      <span className="flex items-center gap-2">
                        <Upload className="w-4 h-4 animate-pulse" />
                        Uploading...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload Background Image
                      </span>
                    ),
                    allowedContent: "Max 5MB (PNG, JPG, WebP)",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Gallery Images (Optional)</label>
                <UploadButton
                  endpoint="imageUploader"
                  onUploadBegin={() => setIsUploadingGallery(true)}
                  onClientUploadComplete={handleGalleryUpload}
                  onUploadError={(error: Error) => {
                    console.error("Upload error:", error)
                    setSaveStatus({ type: "error", message: error.message || "Failed to upload gallery images" })
                    setIsUploadingGallery(false)
                  }}
                  appearance={{
                    button: `
                      w-full bg-black hover:bg-gray-800 
                      ut-uploading:bg-gray-700/50 
                      rounded-lg px-4 py-3 text-white
                      font-medium transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `,
                  }}
                  content={{
                    button: isUploadingGallery ? (
                      <span className="flex items-center gap-2">
                        <Upload className="w-4 h-4 animate-pulse" />
                        Uploading...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload Gallery Images
                      </span>
                    ),
                    allowedContent: "Max 5MB each (PNG, JPG, WebP)",
                  }}
                />

                {config.galleryImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {config.galleryImages.map((image, index) => (
                      <div key={index} className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                        <img
                          src={image}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeGalleryImage(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="w-full bg-red-600 text-white hover:bg-red-700 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Save Settings"
                )}
              </Button>
            </div>
          </div>

          {/* Share & Preview Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-black mb-4">Share Your Newsletter</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Newsletter URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                    />
                    <Button
                      onClick={handleCopyUrl}
                      className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full bg-black text-white hover:bg-gray-900 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  {showPreview ? "Hide Preview" : "Preview Newsletter"}
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-black mb-4">Embed Code</h2>
              <p className="text-sm text-gray-600 mb-4">Add this code to your website to embed the newsletter form:</p>
              <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                <code className="text-xs text-gray-800 font-mono">
                  {`<iframe src="${shareUrl}" width="100%" height="600" frameBorder="0"></iframe>`}
                </code>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Share your newsletter URL on social media, your website, or email to grow your
                subscriber list!
              </p>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-black mb-6">Live Preview</h2>
            <div className="bg-gradient-to-br from-black via-gray-900 to-black rounded-lg p-8 flex items-center justify-center min-h-96">
              <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div
                  className="px-8 py-12 text-white relative overflow-hidden"
                  style={{
                    backgroundColor: config.primaryColor,
                    backgroundImage: config.backgroundImage ? `url(${config.backgroundImage})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-black/20"></div>
                  
                  <div className="relative z-10">
                    {config.logo && (
                      <div className="mb-4 w-16 h-16 bg-white rounded-lg overflow-hidden">
                        <img
                          src={config.logo}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h1 className="text-3xl font-bold mb-3 text-balance">{config.title}</h1>
                    <p className="text-base opacity-90">{config.description}</p>
                  </div>
                </div>

                <div className="px-8 py-8">
                  {config.galleryImages.length > 0 && (
                    <div className="mb-6 grid grid-cols-2 gap-2">
                      {config.galleryImages.slice(0, 4).map((image, index) => (
                        <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Full Name"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-300"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-300"
                    />
                    <button
                      className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      {config.ctaText}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
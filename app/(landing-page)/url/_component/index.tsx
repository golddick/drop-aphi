



// // app/url/[creatorId]/page.tsx

// "use client"

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Mail, CheckCircle, AlertCircle } from "lucide-react"
// import { useCreatorID } from "@/lib/hooks/get.creatorId"
// import { NewsletterConfig } from "@/configs/types"
// import { getNewsletterSettings } from "@/actions/newsletter/newsletter-actions"


// export default function NewsletterPage() {

//   const creatorId = useCreatorID()
  
//   const [config, setConfig] = useState<NewsletterConfig | null>(null)
//   const [email, setEmail] = useState("")
//   const [name, setName] = useState("")
//   const [submitted, setSubmitted] = useState(false)
//   const [error, setError] = useState("")
//   const [currentImageIndex, setCurrentImageIndex] = useState(0)
//   const [isLoading, setIsLoading] = useState(true)
//   const [loadError, setLoadError] = useState("")

//   // Fetch newsletter settings on component mount
//   useEffect(() => {
//     async function fetchNewsletterSettings() {
//       try {
//         setIsLoading(true)
//         setLoadError("")
        
//         const result = await getNewsletterSettings(creatorId)
        
//         if (result.success && result.data) {
//           setConfig(result.data)
//         } else {
//           setLoadError(result.error || "Failed to load newsletter")
//         }
//       } catch (error) {
//         console.error("Error fetching newsletter:", error)
//         setLoadError("An unexpected error occurred")
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     if (creatorId) {
//       fetchNewsletterSettings()
//     }
//   }, [creatorId])

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError("")

//     if (!email || !name) {
//       setError("Please fill in all fields")
//       return
//     }

//     if (!email.includes("@")) {
//       setError("Please enter a valid email address")
//       return
//     }

//     try {
//       // Here you would typically call your API to save the subscriber
//       console.log(`Subscriber saved: ${name} (${email}) for creator: ${creatorId}`)
      
//       setSubmitted(true)
//       setEmail("")
//       setName("")

//       // Reset after 5 seconds
//       setTimeout(() => setSubmitted(false), 5000)
//     } catch (error) {
//       console.error("Error submitting form:", error)
//       setError("Failed to subscribe. Please try again.")
//     }
//   }

//   // Show loading state
//   if (isLoading) {
//     return (
//       <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
//         <div className="w-full max-w-2xl">
//           <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-pulse">
//             <div className="px-8 py-12 bg-gray-300"></div>
//             <div className="px-8 py-12 space-y-4">
//               <div className="h-4 bg-gray-200 rounded w-3/4"></div>
//               <div className="h-4 bg-gray-200 rounded w-1/2"></div>
//               <div className="h-10 bg-gray-200 rounded"></div>
//             </div>
//           </div>
//         </div>
//       </main>
//     )
//   }

//   // Show error state
//   if (loadError || !config) {
//     return (
//       <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
//         <div className="w-full max-w-2xl">
//           <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
//             <div className="px-8 py-12 text-center">
//               <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//               <h1 className="text-2xl font-bold text-black mb-2">Newsletter Not Found</h1>
//               <p className="text-gray-600 mb-6">
//                 {loadError || "The newsletter you're looking for doesn't exist or has been removed."}
//               </p>
//               <Button 
//                 onClick={() => window.location.href = '/'}
//                 className="bg-black text-white hover:bg-gray-900"
//               >
//                 Go Home
//               </Button>
//             </div>
//           </div>
//         </div>
//       </main>
//     )
//   }

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
//       <div className="w-full max-w-2xl">
//         {/* Card */}
//         <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-in-up">
//           {/* Header */}
//           <div
//             className="px-8 py-12 text-white relative overflow-hidden"
//             style={{
//               backgroundColor: config.primaryColor,
//               backgroundImage: config.backgroundImage ? `url(${config.backgroundImage})` : undefined,
//               backgroundSize: "cover",
//               backgroundPosition: "center",
//             }}
//           >
//             <div className="absolute inset-0 bg-black/20"></div>

//             <div className="relative z-10">
//               {config.logo && (
//                 <div className="mb-4 w-16 h-16 bg-white rounded-lg overflow-hidden">
//                   <img src={config.logo} alt="Logo" className="w-full h-full object-cover" />
//                 </div>
//               )}
//               <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">{config.title}</h1>
//               <p className="text-lg opacity-90">{config.description}</p>
//             </div>
//           </div>

//           {/* Content */}
//           <div className="px-8 py-12">
//             {submitted ? (
//               <div className="text-center animate-fade-in">
//                 <div className="flex justify-center mb-4">
//                   <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
//                     <CheckCircle className="w-8 h-8 text-green-600" />
//                   </div>
//                 </div>
//                 <h2 className="text-2xl font-bold text-black mb-2">Success!</h2>
//                 <p className="text-gray-600 mb-6">{config.successMessage}</p>
//                 <Button 
//                   onClick={() => setSubmitted(false)}
//                   className="bg-black text-white hover:bg-gray-900"
//                 >
//                   Subscribe Another Email
//                 </Button>
//               </div>
//             ) : (
//               <>
//                 {config.galleryImages.length > 0 && (
//                   <div className="mb-8">
//                     <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
//                       <img
//                         src={config.galleryImages[currentImageIndex]}
//                         alt={`Gallery ${currentImageIndex + 1}`}
//                         className="w-full h-full object-cover"
//                       />
//                       {config.galleryImages.length > 1 && (
//                         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
//                           {config.galleryImages.map((_, index) => (
//                             <button
//                               key={index}
//                               onClick={() => setCurrentImageIndex(index)}
//                               className={`w-2 h-2 rounded-full transition-all ${
//                                 index === currentImageIndex ? "bg-white w-6" : "bg-white/50"
//                               }`}
//                             />
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 <form onSubmit={handleSubmit} className="space-y-4">
//                   {error && (
//                     <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg animate-shake">
//                       <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
//                       <p className="text-red-800 text-sm">{error}</p>
//                     </div>
//                   )}

//                   <div>
//                     <label className="block text-sm font-semibold text-black mb-2">Full Name *</label>
//                     <input
//                       type="text"
//                       value={name}
//                       onChange={(e) => setName(e.target.value)}
//                       placeholder="John Doe"
//                       className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 transition-colors"
//                       style={{ 
//                         borderColor: config.galleryImages.length > 0 ? config.accentColor : '#e5e7eb'
//                       }}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-semibold text-black mb-2">Email Address *</label>
//                     <input
//                       type="email"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       placeholder="you@example.com"
//                       className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 transition-colors"
//                       style={{ 
//                         borderColor: config.galleryImages.length > 0 ? config.accentColor : '#e5e7eb'
//                       }}
//                     />
//                   </div>
//                   <div className="pt-4">
//                     <Button
//                       type="submit"
//                       className="w-full py-3 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 hover:opacity-90"
//                       style={{ backgroundColor: config.primaryColor }}
//                     >
//                       <Mail className="w-5 h-5" />
//                       {config.ctaText}
//                     </Button>
//                   </div>

//                   <p className="text-xs text-gray-500 text-center">
//                     We respect your privacy. Unsubscribe at any time.
//                   </p>
//                 </form>
//               </>
//             )}
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="text-center mt-8 text-gray-400 text-sm">
//           <p>Powered by DropAphi Newsletter Platform</p>
//         </div>
//       </div>
//     </main>
//   )
// }










// app/newsletter/[creatorId]/page.tsx

"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle, AlertCircle } from "lucide-react"
import { useCreatorID } from "@/lib/hooks/get.creatorId"
import { NewsletterConfig } from "@/configs/types"
import { getNewsletterSettings } from "@/actions/newsletter/newsletter-actions"
import { addSubscriber } from "@/actions/subscriber/add.subscriber"



export default function NewsletterPage() {
  const creatorId = useCreatorID()
  
  const [config, setConfig] = useState<NewsletterConfig | null>(null)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch newsletter settings on component mount
  useEffect(() => {
    async function fetchNewsletterSettings() {
      try {
        setIsLoading(true)
        setLoadError("")
        
        const result = await getNewsletterSettings(creatorId)
        
        if (result.success && result.data) {
          setConfig(result.data)
        } else {
          setLoadError(result.error || "Failed to load newsletter")
        }
      } catch (error) {
        console.error("Error fetching newsletter:", error)
        setLoadError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    if (creatorId) {
      fetchNewsletterSettings()
    }
  }, [creatorId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    if (!email || !name) {
      setError("Please fill in all fields")
      setIsSubmitting(false)
      return
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      setIsSubmitting(false)
      return
    }

    try {
      const result = await addSubscriber({
        email,
        name,
        status: "SUBSCRIBED",
        source: 'url subscription page ',
        pageUrl: typeof window !== 'undefined' ? window.location.href : '',
      })

      if (result.success) {
        setSubmitted(true)
        setEmail("")
        setName("")
        // Reset after 5 seconds
        setTimeout(() => setSubmitted(false), 5000)
      } else {
        setError(result.error || "Failed to subscribe. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setError("Failed to subscribe. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auto-rotate gallery images
  useEffect(() => {
    if (config?.galleryImages && config.galleryImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => 
          prev === config.galleryImages.length - 1 ? 0 : prev + 1
        )
      }, 5000) // Change image every 5 seconds

      return () => clearInterval(interval)
    }
  }, [config?.galleryImages])

  // Show loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-pulse">
            <div className="px-8 py-12 bg-gray-300"></div>
            <div className="px-8 py-12 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Show error state
  if (loadError || !config) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-8 py-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-black mb-2">Newsletter Not Found</h1>
              <p className="text-gray-600 mb-6">
                {loadError || "The newsletter you're looking for doesn't exist or has been removed."}
              </p>
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-black text-white hover:bg-gray-900"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-in-up">
          {/* Header */}
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
                <div className="mb-4 w-16 h-16 bg-white rounded-lg overflow-hidden relative">
                  <Image 
                    src={config.logo} 
                    alt="Newsletter Logo" 
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              )}
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">{config.title}</h1>
              <p className="text-lg opacity-90">{config.description}</p>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-12">
            {submitted ? (
              <div className="text-center animate-fade-in">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-black mb-2">Success!</h2>
                <p className="text-gray-600 mb-6">{config.successMessage}</p>
                <Button 
                  onClick={() => setSubmitted(false)}
                  className="bg-black text-white hover:bg-gray-900"
                >
                  Subscribe Another Email
                </Button>
              </div>
            ) : (
              <>
                {config.galleryImages.length > 0 && (
                  <div className="mb-8">
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
                      <Image
                        src={config.galleryImages[currentImageIndex]}
                        alt={`Gallery image ${currentImageIndex + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 672px"
                        priority={currentImageIndex === 0}
                      />
                      {config.galleryImages.length > 1 && (
                        <>
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                            {config.galleryImages.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  index === currentImageIndex ? "bg-white w-6" : "bg-white/50"
                                }`}
                                aria-label={`View image ${index + 1}`}
                              />
                            ))}
                          </div>
                          <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                            {currentImageIndex + 1} / {config.galleryImages.length}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg animate-shake">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-black mb-2">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 transition-colors"
                      style={{ 
                        borderColor: config.galleryImages.length > 0 ? config.accentColor : '#e5e7eb'
                      }}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-black mb-2">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 transition-colors"
                      style={{ 
                        borderColor: config.galleryImages.length > 0 ? config.accentColor : '#e5e7eb'
                      }}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Subscribing...
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5" />
                          {config.ctaText}
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    We respect your privacy. Unsubscribe at any time.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>Powered by Drop-Aphi Platform</p>
        </div>
      </div>
    </main>
  )
}
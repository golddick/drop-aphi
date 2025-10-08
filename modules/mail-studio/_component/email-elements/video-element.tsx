// "use client"

// import type React from "react"

// import { useState, useRef } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Slider } from "@/components/ui/slider"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Upload, Link, Video } from "lucide-react"

// interface VideoElementProps {
//   id: string
//   properties?: {
//     src?: string
//     poster?: string
//     width?: number
//     height?: number
//     alignment?: "left" | "center" | "right"
//     autoplay?: boolean
//     controls?: boolean
//     muted?: boolean
//     loop?: boolean
//   }
//   isSelected?: boolean
//   onSelect?: () => void
//   onUpdate?: (properties: any) => void
// }

// export function VideoElement({ id, properties = {}, isSelected, onSelect, onUpdate }: VideoElementProps) {
//   const [showUpload, setShowUpload] = useState(!properties.src)
//   const [videoUrl, setVideoUrl] = useState(properties.src || "")
//   const [posterUrl, setPosterUrl] = useState(properties.poster || "")
//   const [isConfiguring, setIsConfiguring] = useState(false)
//   const fileInputRef = useRef<HTMLInputElement>(null)

//   const handleVideoUpload = () => {
//     if (videoUrl) {
//       onUpdate?.({
//         ...properties,
//         src: videoUrl,
//         poster: posterUrl,
//         width: properties.width || 560,
//         height: properties.height || 315,
//         controls: properties.controls !== false,
//         autoplay: properties.autoplay || false,
//         muted: properties.muted || false,
//         loop: properties.loop || false,
//       })
//       setShowUpload(false)
//     }
//   }

//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0]
//     if (file && file.type.startsWith("video/")) {
//       // In a real app, this would upload to a server/database
//       // For now, we'll create a local URL
//       const url = URL.createObjectURL(file)
//       setVideoUrl(url)
//       onUpdate?.({
//         ...properties,
//         src: url,
//         poster: posterUrl,
//         width: properties.width || 560,
//         height: properties.height || 315,
//         controls: properties.controls !== false,
//         autoplay: properties.autoplay || false,
//         muted: properties.muted || false,
//         loop: properties.loop || false,
//       })
//       setShowUpload(false)
//     }
//   }

//   const alignmentClass = {
//     left: "justify-start",
//     center: "justify-center",
//     right: "justify-end",
//   }[properties.alignment || "center"]

//   return (
//     <div
//       className={`p-4 border rounded-md cursor-pointer transition-colors ${
//         isSelected ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
//       }`}
//       onClick={onSelect}
//     >
//       {showUpload || !properties.src ? (
//         <div className="space-y-3">
//           <div className="flex items-center justify-center h-40 bg-muted rounded-md border-2 border-dashed border-border">
//             <div className="text-center">
//               <Video className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
//               <p className="text-sm text-muted-foreground mb-2">Add a video</p>
//               <p className="text-xs text-muted-foreground">Upload from device or paste URL</p>
//             </div>
//           </div>
//           <div className="space-y-2">
//             <Input
//               placeholder="Video URL (YouTube, Vimeo, or direct link)"
//               value={videoUrl}
//               onChange={(e) => setVideoUrl(e.target.value)}
//             />
//             <Input
//               placeholder="Poster image URL (optional)"
//               value={posterUrl}
//               onChange={(e) => setPosterUrl(e.target.value)}
//             />
//             <div className="flex gap-2">
//               <Button size="sm" onClick={handleVideoUpload} disabled={!videoUrl}>
//                 <Link className="w-3 h-3 mr-1" />
//                 Add Video
//               </Button>
//               <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
//                 <Upload className="w-3 h-3 mr-1" />
//                 Upload File
//               </Button>
//             </div>
//             <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
//           </div>
//         </div>
//       ) : isConfiguring ? (
//         <div className="space-y-4">
//           <div>
//             <label className="text-sm font-medium mb-2 block">Width: {properties.width || 560}px</label>
//             <Slider
//               value={[properties.width || 560]}
//               onValueChange={([value]) => onUpdate?.({ ...properties, width: value })}
//               max={800}
//               min={200}
//               step={20}
//             />
//           </div>
//           <div>
//             <label className="text-sm font-medium mb-2 block">Height: {properties.height || 315}px</label>
//             <Slider
//               value={[properties.height || 315]}
//               onValueChange={([value]) => onUpdate?.({ ...properties, height: value })}
//               max={600}
//               min={150}
//               step={15}
//             />
//           </div>
//           <div>
//             <label className="text-sm font-medium mb-2 block">Alignment</label>
//             <Select
//               value={properties.alignment || "center"}
//               onValueChange={(value) => onUpdate?.({ ...properties, alignment: value })}
//             >
//               <SelectTrigger>
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="left">Left</SelectItem>
//                 <SelectItem value="center">Center</SelectItem>
//                 <SelectItem value="right">Right</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="flex gap-2">
//             <Button
//               size="sm"
//               variant={properties.controls !== false ? "default" : "outline"}
//               onClick={() => onUpdate?.({ ...properties, controls: properties.controls === false })}
//               className="flex-1"
//             >
//               Controls
//             </Button>
//             <Button
//               size="sm"
//               variant={properties.autoplay ? "default" : "outline"}
//               onClick={() => onUpdate?.({ ...properties, autoplay: !properties.autoplay })}
//               className="flex-1"
//             >
//               Autoplay
//             </Button>
//           </div>
//           <div className="flex gap-2">
//             <Button
//               size="sm"
//               variant={properties.muted ? "default" : "outline"}
//               onClick={() => onUpdate?.({ ...properties, muted: !properties.muted })}
//               className="flex-1"
//             >
//               Muted
//             </Button>
//             <Button
//               size="sm"
//               variant={properties.loop ? "default" : "outline"}
//               onClick={() => onUpdate?.({ ...properties, loop: !properties.loop })}
//               className="flex-1"
//             >
//               Loop
//             </Button>
//           </div>
//           <div className="flex gap-2">
//             <Button size="sm" onClick={() => setIsConfiguring(false)}>
//               Done
//             </Button>
//             <Button size="sm" variant="outline" onClick={() => setShowUpload(true)}>
//               Change Video
//             </Button>
//           </div>
//         </div>
//       ) : (
//         <div className={`flex ${alignmentClass}`}>
//           <div className="relative">
//             {properties.src ? (
//               <video
//                 src={properties.src}
//                 poster={properties.poster}
//                 controls={properties.controls !== false}
//                 autoPlay={properties.autoplay}
//                 muted={properties.muted}
//                 loop={properties.loop}
//                 style={{
//                   width: properties.width ? `${properties.width}px` : "560px",
//                   height: properties.height ? `${properties.height}px` : "315px",
//                   maxWidth: "100%",
//                 }}
//                 className="rounded-md bg-muted"
//                 onDoubleClick={() => setIsConfiguring(true)}
//               >
//                 Your browser does not support the video tag.
//               </video>
//             ) : (
//               <div
//                 className="bg-muted rounded-md flex items-center justify-center"
//                 style={{
//                   width: properties.width ? `${properties.width}px` : "560px",
//                   height: properties.height ? `${properties.height}px` : "315px",
//                   maxWidth: "100%",
//                 }}
//                 onDoubleClick={() => setIsConfiguring(true)}
//               >
//                 <div className="text-center">
//                   <Video className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
//                   <p className="text-sm text-muted-foreground">Video element</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   ) 
// }







// "use client"

// import type React from "react"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Slider } from "@/components/ui/slider"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Upload, Link, Video, Loader2 } from "lucide-react"
// import { UploadButton } from "@/lib/uploadthing"
// import { toast } from "sonner"

// interface VideoElementProps {
//   id: string
//   properties?: {
//     src?: string
//     poster?: string
//     width?: number
//     height?: number
//     alignment?: "left" | "center" | "right"
//     autoplay?: boolean
//     controls?: boolean
//     muted?: boolean
//     loop?: boolean
//   }
//   isSelected?: boolean
//   onSelect?: () => void
//   onUpdate?: (properties: any) => void
//   onVideoUpload?: (uploadData: {
//     url: string
//     fileType: string
//     filename: string
//     fileSize: number
//   }) => void
// }

// export function VideoElement({ 
//   id, 
//   properties = {}, 
//   isSelected, 
//   onSelect, 
//   onUpdate,
//   onVideoUpload 
// }: VideoElementProps) {
//   const [showUpload, setShowUpload] = useState(!properties.src)
//   const [videoUrl, setVideoUrl] = useState(properties.src || "")
//   const [posterUrl, setPosterUrl] = useState(properties.poster || "")
//   const [isConfiguring, setIsConfiguring] = useState(false)
//   const [isUploading, setIsUploading] = useState(false)

//   const handleVideoUpload = () => {
//     if (videoUrl) {
//       onUpdate?.({
//         ...properties,
//         src: videoUrl,
//         poster: posterUrl,
//         width: properties.width || 560,
//         height: properties.height || 315,
//         controls: properties.controls !== false,
//         autoplay: properties.autoplay || false,
//         muted: properties.muted || false,
//         loop: properties.loop || false,
//       })
//       setShowUpload(false)
//       toast.success("Video added successfully!")
//     }
//   }

//   const handleUploadSuccess = (res: any[]) => {
//     if (res && res.length > 0) {
//       const uploadedFile = res[0]
//       const url = uploadedFile.url || uploadedFile.ufsUrl
      
//       if (!url) {
//         console.error("No URL in upload response:", uploadedFile)
//         toast.error("Upload completed but no URL returned")
//         return
//       }

//       console.log("✅ Video upload successful! URL:", url)
      
//       // Update the video element with the uploaded URL
//       setVideoUrl(url)
      
//       // Call the callback with upload data for later database association
//       if (onVideoUpload) {
//         onVideoUpload({
//           url: url,
//           fileType: uploadedFile.type || "video/mp4",
//           filename: uploadedFile.name,
//           fileSize: uploadedFile.size,
//         })
//       }

//       // Update the element properties
//       onUpdate?.({
//         ...properties,
//         src: url,
//         poster: posterUrl,
//         width: properties.width || 560,
//         height: properties.height || 315,
//         controls: properties.controls !== false,
//         autoplay: properties.autoplay || false,
//         muted: properties.muted || false,
//         loop: properties.loop || false,
//       })
//       setShowUpload(false)
      
//       toast.success("Video uploaded successfully!")
//     }
//   }

//   const handleUploadError = (error: Error) => {
//     console.error("Upload error:", error)
//     toast.error(`Upload failed: ${error.message}`)
//   }

//   const handleUploadBegin = () => {
//     console.log("Upload beginning...")
//     setIsUploading(true)
//   }

//   const alignmentClass = {
//     left: "justify-start",
//     center: "justify-center",
//     right: "justify-end",
//   }[properties.alignment || "center"]

//   return (
//     <div
//       className={`p-4 border rounded-md cursor-pointer transition-colors ${
//         isSelected ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
//       }`}
//       onClick={onSelect}
//     >
//       {showUpload || !properties.src ? (
//         <div className="space-y-3">
//           <div className="flex items-center justify-center h-40 bg-muted rounded-md border-2 border-dashed border-border hover:border-accent transition-colors">
//             {isUploading ? (
//               <div className="text-center">
//                 <Loader2 className="w-12 h-12 text-muted-foreground mx-auto mb-2 animate-spin" />
//                 <p className="text-sm text-muted-foreground">Uploading video...</p>
//                 <p className="text-xs text-muted-foreground">This may take a moment</p>
//               </div>
//             ) : (
//               <div className="text-center">
//                 <Video className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
//                 <p className="text-sm text-muted-foreground mb-2">Add a video</p>
//                 <p className="text-xs text-muted-foreground">Upload from device or paste URL</p>
//               </div>
//             )}
//           </div>
//           <div className="space-y-2">
//             <Input
//               placeholder="Video URL (YouTube, Vimeo, or direct link)"
//               value={videoUrl}
//               onChange={(e) => setVideoUrl(e.target.value)}
//               disabled={isUploading}
//             />
//             <Input
//               placeholder="Poster image URL (optional)"
//               value={posterUrl}
//               onChange={(e) => setPosterUrl(e.target.value)}
//               disabled={isUploading}
//             />
//             <div className="flex gap-2">
//               <Button 
//                 size="sm" 
//                 onClick={handleVideoUpload} 
//                 disabled={!videoUrl || isUploading}
//               >
//                 <Link className="w-3 h-3 mr-1" />
//                 Add Video
//               </Button>
              
//               <div className="flex-1">
//                 <UploadButton
//                   endpoint="videoUploader"
//                   onClientUploadComplete={(res) => {
//                     setIsUploading(false)
//                     handleUploadSuccess(res)
//                   }}
//                   onUploadError={(error: Error) => {
//                     setIsUploading(false)
//                     handleUploadError(error)
//                   }}
//                   onUploadBegin={handleUploadBegin}
//                   appearance={{
//                     button: `
//                       w-full
//                       bg-primary 
//                       hover:bg-primary/90 
//                       ut-ready:bg-primary 
//                       ut-uploading:bg-primary/70 
//                       ut-uploading:cursor-not-allowed
//                       ut-ready:border-primary
//                       ut-uploading:border-primary/70
//                       rounded-md
//                       px-3
//                       py-2
//                       text-white
//                       text-sm
//                       font-medium
//                       transition-colors
//                       duration-200
//                       flex
//                       items-center
//                       justify-center
//                     `,
//                     allowedContent: `
//                       text-muted-foreground 
//                       text-xs 
//                       mt-1
//                       text-center
//                     `,
//                     container: `
//                       w-full
//                       flex 
//                       flex-col 
//                       items-center 
//                       justify-center
//                     `,
//                   }}
//                   content={{
//                     button: (
//                       <span className="flex items-center justify-center">
//                         <Upload className="w-3 h-3 mr-1" />
//                         Upload Video
//                       </span>
//                     ),
//                     allowedContent: "Max 100MB (MP4, WebM, MOV)",
//                   }}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       ) : isConfiguring ? (
//         <div className="space-y-4">
//           <div>
//             <label className="text-sm font-medium mb-2 block">Width: {properties.width || 560}px</label>
//             <Slider
//               value={[properties.width || 560]}
//               onValueChange={([value]) => onUpdate?.({ ...properties, width: value })}
//               max={800}
//               min={200}
//               step={20}
//             />
//           </div>
//           <div>
//             <label className="text-sm font-medium mb-2 block">Height: {properties.height || 315}px</label>
//             <Slider
//               value={[properties.height || 315]}
//               onValueChange={([value]) => onUpdate?.({ ...properties, height: value })}
//               max={600}
//               min={150}
//               step={15}
//             />
//           </div>
//           <div>
//             <label className="text-sm font-medium mb-2 block">Alignment</label>
//             <Select
//               value={properties.alignment || "center"}
//               onValueChange={(value) => onUpdate?.({ ...properties, alignment: value })}
//             >
//               <SelectTrigger>
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="left">Left</SelectItem>
//                 <SelectItem value="center">Center</SelectItem>
//                 <SelectItem value="right">Right</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="flex gap-2">
//             <Button
//               size="sm"
//               variant={properties.controls !== false ? "default" : "outline"}
//               onClick={() => onUpdate?.({ ...properties, controls: properties.controls === false })}
//               className="flex-1"
//             >
//               Controls
//             </Button>
//             <Button
//               size="sm"
//               variant={properties.autoplay ? "default" : "outline"}
//               onClick={() => onUpdate?.({ ...properties, autoplay: !properties.autoplay })}
//               className="flex-1"
//             >
//               Autoplay
//             </Button>
//           </div>
//           <div className="flex gap-2">
//             <Button
//               size="sm"
//               variant={properties.muted ? "default" : "outline"}
//               onClick={() => onUpdate?.({ ...properties, muted: !properties.muted })}
//               className="flex-1"
//             >
//               Muted
//             </Button>
//             <Button
//               size="sm"
//               variant={properties.loop ? "default" : "outline"}
//               onClick={() => onUpdate?.({ ...properties, loop: !properties.loop })}
//               className="flex-1"
//             >
//               Loop
//             </Button>
//           </div>
//           <div className="flex gap-2">
//             <Button size="sm" onClick={() => setIsConfiguring(false)}>
//               Done
//             </Button>
//             <Button size="sm" variant="outline" onClick={() => setShowUpload(true)}>
//               Change Video
//             </Button>
//           </div>
//         </div>
//       ) : (
//         <div className={`flex ${alignmentClass}`}>
//           <div className="relative">
//             {properties.src ? (
//               <video
//                 src={properties.src}
//                 poster={properties.poster}
//                 controls={properties.controls !== false}
//                 autoPlay={properties.autoplay}
//                 muted={properties.muted}
//                 loop={properties.loop}
//                 style={{
//                   width: properties.width ? `${properties.width}px` : "560px",
//                   height: properties.height ? `${properties.height}px` : "315px",
//                   maxWidth: "100%",
//                 }}
//                 className="rounded-md bg-muted"
//                 onDoubleClick={() => setIsConfiguring(true)}
//               >
//                 Your browser does not support the video tag.
//               </video>
//             ) : (
//               <div
//                 className="bg-muted rounded-md flex items-center justify-center"
//                 style={{
//                   width: properties.width ? `${properties.width}px` : "560px",
//                   height: properties.height ? `${properties.height}px` : "315px",
//                   maxWidth: "100%",
//                 }}
//                 onDoubleClick={() => setIsConfiguring(true)}
//               >
//                 <div className="text-center">
//                   <Video className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
//                   <p className="text-sm text-muted-foreground">Video element</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }


"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Link, Video, Loader2, AlertTriangle, Info } from "lucide-react"
import { UploadButton } from "@/lib/uploadthing"
import { toast } from "sonner"

interface VideoElementProps {
  id: string
  properties?: {
    src?: string
    poster?: string
    width?: number
    height?: number
    alignment?: "left" | "center" | "right"
    autoplay?: boolean
    controls?: boolean
    muted?: boolean
    loop?: boolean
  }
  isSelected?: boolean
  onSelect?: () => void
  onUpdate?: (properties: any) => void
  onVideoUpload?: (uploadData: {
    url: string
    fileType: string
    filename: string
    fileSize: number
  }) => void
}

export function VideoElement({ 
  id, 
  properties = {}, 
  isSelected, 
  onSelect, 
  onUpdate,
  onVideoUpload 
}: VideoElementProps) {
  const [showUpload, setShowUpload] = useState(!properties.src)
  const [videoUrl, setVideoUrl] = useState(properties.src || "")
  const [posterUrl, setPosterUrl] = useState(properties.poster || "")
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showEmailWarning, setShowEmailWarning] = useState(true)

  const handleVideoUpload = () => {
    if (videoUrl) {
      onUpdate?.({
        ...properties,
        src: videoUrl,
        poster: posterUrl,
        width: properties.width || 560,
        height: properties.height || 315,
        controls: properties.controls !== false,
        autoplay: properties.autoplay || false,
        muted: properties.muted || false,
        loop: properties.loop || false,
      })
      setShowUpload(false)
      toast.success("Video added successfully!", {
        description: "Note: Embedded video may not work in all email clients"
      })
    }
  }

  const handleUploadSuccess = (res: any[]) => {
    if (res && res.length > 0) {
      const uploadedFile = res[0]
      const url = uploadedFile.url || uploadedFile.ufsUrl
      
      if (!url) {
        console.error("No URL in upload response:", uploadedFile)
        toast.error("Upload completed but no URL returned")
        return
      }

      console.log("✅ Video upload successful! URL:", url)
      
      // Update the video element with the uploaded URL
      setVideoUrl(url)
      
      // Call the callback with upload data for later database association
      if (onVideoUpload) {
        onVideoUpload({
          url: url,
          fileType: uploadedFile.type || "video/mp4",
          filename: uploadedFile.name,
          fileSize: uploadedFile.size,
        })
      }

      // Update the element properties
      onUpdate?.({
        ...properties,
        src: url,
        poster: posterUrl,
        width: properties.width || 560,
        height: properties.height || 315,
        controls: properties.controls !== false,
        autoplay: properties.autoplay || false,
        muted: properties.muted || false,
        loop: properties.loop || false,
      })
      setShowUpload(false)
      
      toast.success("Video uploaded successfully!", {
        description: "Note: Embedded video has limited email client support"
      })
    }
  }

  const handleUploadError = (error: Error) => {
    console.error("Upload error:", error)
    toast.error(`Upload failed: ${error.message}`)
  }

  const handleUploadBegin = () => {
    console.log("Upload beginning...")
    setIsUploading(true)
  }

  const alignmentClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[properties.alignment || "center"]

  // Email compatibility warning component
  const EmailCompatibilityWarning = () => (
    <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-amber-800 text-xs font-medium">
            Email Compatibility Warning
          </p>
          <p className="text-amber-700 text-xs mt-1">
            Embedded video is blocked in Gmail, Outlook, and many other email clients. 
            For better compatibility, consider using:
          </p>
          <ul className="text-amber-700 text-xs mt-1 list-disc list-inside space-y-0.5">
            <li>Animated GIFs (universal support)</li>
            <li>Video thumbnail with play button linking to hosted video</li>
            <li>Static image with "Watch Video" call-to-action</li>
          </ul>
          <div className="flex items-center justify-between mt-2">
            <button 
              onClick={() => setShowEmailWarning(false)}
              className="text-amber-600 hover:text-amber-800 text-xs underline"
            >
              Dismiss
            </button>
            <div className="flex items-center gap-1 text-amber-600">
              <Info className="w-3 h-3" />
              <span className="text-xs">Limited support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div
      className={`p-4 border rounded-md cursor-pointer transition-colors ${
        isSelected ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
      }`}
      onClick={onSelect}
    >
      {showUpload || !properties.src ? (
        <div className="space-y-3">
          {/* Email Compatibility Warning */}
          {showEmailWarning && <EmailCompatibilityWarning />}
          
          <div className="flex items-center justify-center h-40 bg-muted rounded-md border-2 border-dashed border-border hover:border-accent transition-colors">
            {isUploading ? (
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-muted-foreground mx-auto mb-2 animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading video...</p>
                <p className="text-xs text-muted-foreground">This may take a moment</p>
              </div>
            ) : (
              <div className="text-center">
                <Video className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">Add a video</p>
                <p className="text-xs text-muted-foreground">Upload from device or paste URL</p>
                <div className="mt-2 flex items-center justify-center gap-1 text-amber-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-xs">Limited email support</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Input
              placeholder="Video URL (YouTube, Vimeo, or direct link)"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              disabled={isUploading}
            />
            <Input
              placeholder="Poster image URL (optional)"
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              disabled={isUploading}
            />
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleVideoUpload} 
                disabled={!videoUrl || isUploading}
              >
                <Link className="w-3 h-3 mr-1" />
                Add Video
              </Button>
              
              <div className="flex-1">
                <UploadButton
                  endpoint="videoUploader"
                  onClientUploadComplete={(res) => {
                    setIsUploading(false)
                    handleUploadSuccess(res)
                  }}
                  onUploadError={(error: Error) => {
                    setIsUploading(false)
                    handleUploadError(error)
                  }}
                  onUploadBegin={handleUploadBegin}
                  appearance={{
                    button: `
                      w-full
                      bg-primary 
                      hover:bg-primary/90 
                      ut-ready:bg-primary 
                      ut-uploading:bg-primary/70 
                      ut-uploading:cursor-not-allowed
                      ut-ready:border-primary
                      ut-uploading:border-primary/70
                      rounded-md
                      px-3
                      py-2
                      text-white
                      text-sm
                      font-medium
                      transition-colors
                      duration-200
                      flex
                      items-center
                      justify-center
                    `,
                    allowedContent: `
                      text-muted-foreground 
                      text-xs 
                      mt-1
                      text-center
                    `,
                    container: `
                      w-full
                      flex 
                      flex-col 
                      items-center 
                      justify-center
                    `,
                  }}
                  content={{
                    button: (
                      <span className="flex items-center justify-center">
                        <Upload className="w-3 h-3 mr-1" />
                        Upload Video
                      </span>
                    ),
                    allowedContent: "For email: Max 10MB recommended (MP4)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : isConfiguring ? (
        <div className="space-y-4">
          {/* Configuration Warning */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-800 text-xs font-medium">
                  Video Playback Notes
                </p>
                <p className="text-blue-700 text-xs mt-1">
                  These settings work in supported clients (Apple Mail, some mobile apps). 
                  Most webmail clients will show a static image or broken video.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Width: {properties.width || 560}px</label>
            <Slider
              value={[properties.width || 560]}
              onValueChange={([value]) => onUpdate?.({ ...properties, width: value })}
              max={800}
              min={200}
              step={20}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Height: {properties.height || 315}px</label>
            <Slider
              value={[properties.height || 315]}
              onValueChange={([value]) => onUpdate?.({ ...properties, height: value })}
              max={600}
              min={150}
              step={15}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Alignment</label>
            <Select
              value={properties.alignment || "center"}
              onValueChange={(value) => onUpdate?.({ ...properties, alignment: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={properties.controls !== false ? "default" : "outline"}
              onClick={() => onUpdate?.({ ...properties, controls: properties.controls === false })}
              className="flex-1"
            >
              Controls
            </Button>
            <Button
              size="sm"
              variant={properties.autoplay ? "default" : "outline"}
              onClick={() => onUpdate?.({ ...properties, autoplay: !properties.autoplay })}
              className="flex-1"
            >
              Autoplay
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={properties.muted ? "default" : "outline"}
              onClick={() => onUpdate?.({ ...properties, muted: !properties.muted })}
              className="flex-1"
            >
              Muted
            </Button>
            <Button
              size="sm"
              variant={properties.loop ? "default" : "outline"}
              onClick={() => onUpdate?.({ ...properties, loop: !properties.loop })}
              className="flex-1"
            >
              Loop
            </Button>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setIsConfiguring(false)}>
              Done
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowUpload(true)}>
              Change Video
            </Button>
          </div>
        </div>
      ) : (
        <div className={`flex ${alignmentClass}`}>
          <div className="relative">
            {properties.src ? (
              <>
                <video
                  src={properties.src}
                  poster={properties.poster}
                  controls={properties.controls !== false}
                  autoPlay={properties.autoplay}
                  muted={properties.muted}
                  loop={properties.loop}
                  style={{
                    width: properties.width ? `${properties.width}px` : "560px",
                    height: properties.height ? `${properties.height}px` : "315px",
                    maxWidth: "100%",
                  }}
                  className="rounded-md bg-muted"
                  onDoubleClick={() => setIsConfiguring(true)}
                >
                  Your browser does not support the video tag.
                </video>
                {/* Email compatibility badge */}
                <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Limited Email Support</span>
                </div>
              </>
            ) : (
              <div
                className="bg-muted rounded-md flex items-center justify-center"
                style={{
                  width: properties.width ? `${properties.width}px` : "560px",
                  height: properties.height ? `${properties.height}px` : "315px",
                  maxWidth: "100%",
                }}
                onDoubleClick={() => setIsConfiguring(true)}
              >
                <div className="text-center">
                  <Video className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Video element</p>
                  <div className="mt-1 flex items-center justify-center gap-1 text-amber-600">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="text-xs">Limited email support</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
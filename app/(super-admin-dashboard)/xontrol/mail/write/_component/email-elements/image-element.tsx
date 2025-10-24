// "use client"

// import type React from "react"

// import { useState, useRef } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Upload, Link, ImageIcon } from "lucide-react"
// import { Slider } from "@/components/ui/slider"
// import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

// interface ImageElementProps {
//   id: string
//   properties?: {
//     src?: string
//     alt?: string
//     width?: number
//     height?: number
//     alignment?: "left" | "center" | "right"
//     borderRadius?: number
//     opacity?: number
//     rotation?: number
//     objectFit?: "cover" | "contain" | "fill" | "scale-down"
//   }
//   isSelected?: boolean
//   onSelect?: () => void
//   onUpdate?: (properties: any) => void
// }

// export function ImageElement({ id, properties = {}, isSelected, onSelect, onUpdate }: ImageElementProps) {
//   const [showUpload, setShowUpload] = useState(!properties.src)
//   const [imageUrl, setImageUrl] = useState(properties.src || "")
//   const [altText, setAltText] = useState(properties.alt || "")
//   const [isConfiguring, setIsConfiguring] = useState(false)
//   const fileInputRef = useRef<HTMLInputElement>(null)

//   const handleImageUpload = () => {
//     if (imageUrl) {
//       onUpdate?.({
//         src: imageUrl,
//         alt: altText,
//         width: properties.width || 400,
//         height: properties.height || 200,
//         borderRadius: properties.borderRadius || 0,
//         opacity: properties.opacity || 100,
//         rotation: properties.rotation || 0,
//         objectFit: properties.objectFit || "cover",
//       })
//       setShowUpload(false)
//     }
//   }

//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0]
//     if (file && file.type.startsWith("image/")) {
//       const url = URL.createObjectURL(file)
//       setImageUrl(url)
//       onUpdate?.({
//         src: url,
//         alt: altText || file.name,
//         width: properties.width || 400,
//         height: properties.height || 200,
//         borderRadius: properties.borderRadius || 0,
//         opacity: properties.opacity || 100,
//         rotation: properties.rotation || 0,
//         objectFit: properties.objectFit || "cover",
//       })
//       setShowUpload(false)
//     }
//   }

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault()
//   }

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault()
//     const files = Array.from(e.dataTransfer.files)
//     const imageFile = files.find((file) => file.type.startsWith("image/"))

//     if (imageFile) {
//       const url = URL.createObjectURL(imageFile)
//       setImageUrl(url)
//       onUpdate?.({
//         src: url,
//         alt: altText || imageFile.name,
//         width: properties.width || 400,
//         height: properties.height || 200,
//         borderRadius: properties.borderRadius || 0,
//         opacity: properties.opacity || 100,
//         rotation: properties.rotation || 0,
//         objectFit: properties.objectFit || "cover",
//       })
//       setShowUpload(false)
//     }
//   }

//   const alignmentClass = {
//     left: "justify-start",
//     center: "justify-center",
//     right: "justify-end",
//   }[properties.alignment || "center"]

//   const imageStyle = {
//     width: properties.width ? `${properties.width}px` : "auto",
//     height: properties.height ? `${properties.height}px` : "auto",
//     maxWidth: "100%",
//     borderRadius: `${properties.borderRadius || 0}px`,
//     opacity: (properties.opacity || 100) / 100,
//     transform: `rotate(${properties.rotation || 0}deg)`,
//     objectFit: properties.objectFit || "cover",
//   }

//   return (
//     <div
//       className={`p-4 border rounded-md cursor-pointer transition-colors ${
//         isSelected ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
//       }`}
//       onClick={onSelect}
//     >
//       {showUpload || !properties.src ? (
//         <div className="space-y-3" onDragOver={handleDragOver} onDrop={handleDrop}>
//           <div className="flex items-center justify-center h-32 bg-muted rounded-md border-2 border-dashed border-border hover:border-accent transition-colors">
//             <div className="text-center">
//               <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
//               <p className="text-sm text-muted-foreground mb-1">Add an image</p>
//               <p className="text-xs text-muted-foreground">Drag & drop or click to upload</p>
//             </div>
//           </div>
//           <div className="space-y-2">
//             <Input placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
//             <Input placeholder="Alt text (optional)" value={altText} onChange={(e) => setAltText(e.target.value)} />
//             <div className="flex gap-2">
//               <Button size="sm" onClick={handleImageUpload} disabled={!imageUrl}>
//                 <Link className="w-3 h-3 mr-1" />
//                 Add Image
//               </Button>
//               <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
//                 <Upload className="w-3 h-3 mr-1" />
//                 Upload File
//               </Button>
//             </div>
//             <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
//           </div>
//         </div>
//       ) : (
//         <div className="space-y-3">
//           <div className={`flex ${alignmentClass}`}>
//             <div className="relative group">
//               <img
//                 src={properties.src || "/placeholder.svg"}
//                 alt={properties.alt || "Email image"}
//                 style={imageStyle}
//                 onDoubleClick={() => setShowUpload(true)}
//               />
//               {isSelected && (
//                 <div className="absolute inset-0 border-2 border-accent rounded-md pointer-events-none">
//                   <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></div>
//                   <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-accent rounded-full"></div>
//                   <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-accent rounded-full"></div>
//                   <div className="absolute -top-1 -left-1 w-3 h-3 bg-accent rounded-full"></div>
//                 </div>
//               )}
//             </div>
//           </div>
//           <Button
//             size="sm"
//             variant="outline"
//             className="w-full bg-transparent"
//             onClick={() => setIsConfiguring(!isConfiguring)}
//           >
//             Configure Image
//           </Button>
//           {isConfiguring && (
//             <div className="space-y-2 p-2 bg-muted rounded">
//               <div>
//                 <label className="text-xs font-medium">Width: {properties.width}px</label>
//                 <Slider
//                   value={[properties.width || 400]}
//                   onValueChange={([value]) => onUpdate?.({ ...properties, width: value })}
//                   max={600}
//                   min={50}
//                   step={10}
//                 />
//               </div>
//               <div>
//                 <label className="text-xs font-medium">Height: {properties.height}px</label>
//                 <Slider
//                   value={[properties.height || 200]}
//                   onValueChange={([value]) => onUpdate?.({ ...properties, height: value })}
//                   max={400}
//                   min={50}
//                   step={10}
//                 />
//               </div>
//               <div>
//                 <label className="text-xs font-medium">Border Radius: {properties.borderRadius || 0}px</label>
//                 <Slider
//                   value={[properties.borderRadius || 0]}
//                   onValueChange={([value]) => onUpdate?.({ ...properties, borderRadius: value })}
//                   max={100}
//                   min={0}
//                   step={5}
//                 />
//               </div>
//               <div>
//                 <label className="text-xs font-medium">Object Fit</label>
//                 <Select
//                   value={properties.objectFit || "cover"}
//                   onValueChange={(value) => onUpdate?.({ ...properties, objectFit: value })}
//                 >
//                   <SelectTrigger className="h-8">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="cover">Cover</SelectItem>
//                     <SelectItem value="contain">Contain</SelectItem>
//                     <SelectItem value="fill">Fill</SelectItem>
//                     <SelectItem value="scale-down">Scale Down</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }







"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Link, ImageIcon, Loader2 } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { UploadButton } from "@/lib/uploadthing"
import { toast } from "sonner"

interface ImageElementProps {
  id: string
  properties?: {
    src?: string
    alt?: string
    width?: number
    height?: number
    alignment?: "left" | "center" | "right"
    borderRadius?: number
    opacity?: number
    rotation?: number
    objectFit?: "cover" | "contain" | "fill" | "scale-down"
  }
  isSelected?: boolean
  onSelect?: () => void
  onUpdate?: (properties: any) => void
  onImageUpload?: (uploadData: {
    url: string
    fileType: string
    filename: string
    fileSize: number
  }) => void
}

export function ImageElement({ 
  id, 
  properties = {}, 
  isSelected, 
  onSelect, 
  onUpdate,
  onImageUpload 
}: ImageElementProps) {
  const [showUpload, setShowUpload] = useState(!properties.src)
  const [imageUrl, setImageUrl] = useState(properties.src || "")
  const [altText, setAltText] = useState(properties.alt || "")
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = () => {
    if (imageUrl) {
      onUpdate?.({
        src: imageUrl,
        alt: altText,
        width: properties.width || 400,
        height: properties.height || 200,
        borderRadius: properties.borderRadius || 0,
        opacity: properties.opacity || 100,
        rotation: properties.rotation || 0,
        objectFit: properties.objectFit || "cover",
      })
      setShowUpload(false)
      toast.success("Image added successfully!")
    }
  }

  // const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0]
  //   if (file && file.type.startsWith("image/")) {
  //     // For local file uploads, we'll use UploadThing instead of creating object URLs
  //     // This maintains consistency with the UploadThing approach
  //     toast.info("Please use the Upload Image button for file uploads")
  //     // Clear the file input
  //     if (fileInputRef.current) {
  //       fileInputRef.current.value = ""
  //     }
  //   }
  // }

  const handleUploadSuccess = (res: any[]) => {
    if (res && res.length > 0) {
      const uploadedFile = res[0]
      const url = uploadedFile.url || uploadedFile.ufsUrl
      
      if (!url) {
        console.error("No URL in upload response:", uploadedFile)
        toast.error("Upload completed but no URL returned")
        return
      }

      console.log("✅ Upload successful! URL:", url)
      
      // Update the image element with the uploaded URL
      setImageUrl(url)
      
      // Call the callback with upload data for later database association
      if (onImageUpload) {
        onImageUpload({
          url: url,
          fileType: uploadedFile.type || "image/jpeg",
          filename: uploadedFile.name,
          fileSize: uploadedFile.size,
        })
      }

      // Update the element properties
      onUpdate?.({
        src: url,
        alt: altText || uploadedFile.name,
        width: properties.width || 400,
        height: properties.height || 200,
        borderRadius: properties.borderRadius || 0,
        opacity: properties.opacity || 100,
        rotation: properties.rotation || 0,
        objectFit: properties.objectFit || "cover",
      })
      setShowUpload(false)
      
      toast.success("Image uploaded successfully!")
    }
  }

  const handleUploadError = (error: Error) => {
    console.error("Upload error:", error)
    toast.error(`Upload failed: ${error.message}`)
    setIsUploading(false)
  }

  const handleUploadBegin = () => {
    console.log("Upload beginning...")
    setIsUploading(true)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    // For drag & drop, we'll also use UploadThing
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find((file) => file.type.startsWith("image/"))

    if (imageFile) {
      toast.info("Please use the Upload Image button for file uploads")
    }
  }

  const alignmentClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[properties.alignment || "center"]

  const imageStyle = {
    width: properties.width ? `${properties.width}px` : "auto",
    height: properties.height ? `${properties.height}px` : "auto",
    maxWidth: "100%",
    borderRadius: `${properties.borderRadius || 0}px`,
    opacity: (properties.opacity || 100) / 100,
    transform: `rotate(${properties.rotation || 0}deg)`,
    objectFit: properties.objectFit || "cover",
  }

  return (
    <div
      className={`p-4 border rounded-md cursor-pointer transition-colors ${
        isSelected ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
      }`}
      onClick={onSelect}
    >
      {showUpload || !properties.src ? (
        <div className="space-y-3" onDragOver={handleDragOver} onDrop={handleDrop}>
          <div className="flex items-center justify-center h-32 bg-muted rounded-md border-2 border-dashed border-border hover:border-accent transition-colors">
            {isUploading ? (
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-2 animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading image...</p>
                <p className="text-xs text-muted-foreground">Please wait</p>
              </div>
            ) : (
              <div className="text-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Add an image</p>
                <p className="text-xs text-muted-foreground">Drag & drop or click to upload</p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Input 
              placeholder="Image URL" 
              value={imageUrl} 
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={isUploading}
            />
            <Input 
              placeholder="Alt text (optional)" 
              value={altText} 
              onChange={(e) => setAltText(e.target.value)}
              disabled={isUploading}
            />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleImageUpload} 
                disabled={!imageUrl || isUploading}
              >
                <Link className="w-3 h-3 mr-1" />
                Add Image
              </Button>
              <div className="flex-1">
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    setIsUploading(false)
                    handleUploadSuccess(res)
                  }}
                  onUploadError={handleUploadError}
                  onUploadBegin={handleUploadBegin}
                  appearance={{
                    button: `
                      w-full
                      h-9
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
                      <div className="flex items-center justify-center">
                        <Upload className="w-3 h-3 mr-1" />
                        Upload File
                      </div>
                    ),
                    allowedContent: "Max 4MB (PNG, JPG, GIF)",
                  }}
                />
              </div>
            </div>
            {/* <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              className="hidden" 
              disabled={isUploading}
            /> */}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className={`flex ${alignmentClass}`}>
            <div className="relative group">
              <img
                src={properties.src || "/placeholder.svg"}
                alt={properties.alt || "Email image"}
                style={imageStyle}
                onDoubleClick={() => setShowUpload(true)}
              />
              {isSelected && (
                <div className="absolute inset-0 border-2 border-accent rounded-md pointer-events-none">
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-accent rounded-full"></div>
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-accent rounded-full"></div>
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-accent rounded-full"></div>
                </div>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => setIsConfiguring(!isConfiguring)}
          >
            Configure Image
          </Button>
          {isConfiguring && (
            <div className="space-y-2 p-2 bg-muted rounded">
              <div>
                <label className="text-xs font-medium">Width: {properties.width}px</label>
                <Slider
                  value={[properties.width || 400]}
                  onValueChange={([value]) => onUpdate?.({ ...properties, width: value })}
                  max={600}
                  min={50}
                  step={10}
                />
              </div>
              <div>
                <label className="text-xs font-medium">Height: {properties.height}px</label>
                <Slider
                  value={[properties.height || 200]}
                  onValueChange={([value]) => onUpdate?.({ ...properties, height: value })}
                  max={400}
                  min={50}
                  step={10}
                />
              </div>
              <div>
                <label className="text-xs font-medium">Border Radius: {properties.borderRadius || 0}px</label>
                <Slider
                  value={[properties.borderRadius || 0]}
                  onValueChange={([value]) => onUpdate?.({ ...properties, borderRadius: value })}
                  max={100}
                  min={0}
                  step={5}
                />
              </div>
              <div>
                <label className="text-xs font-medium">Object Fit</label>
                <Select
                  value={properties.objectFit || "cover"}
                  onValueChange={(value) => onUpdate?.({ ...properties, objectFit: value })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cover">Cover</SelectItem>
                    <SelectItem value="contain">Contain</SelectItem>
                    <SelectItem value="fill">Fill</SelectItem>
                    <SelectItem value="scale-down">Scale Down</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
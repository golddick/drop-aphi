"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link, ImageIcon, Loader2 } from "lucide-react"
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
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = () => {
    if (imageUrl) {
      // For URL-based images, we don't need to upload anything
      // Just update the properties
      onUpdate?.({
        src: imageUrl,
        alt: altText,
        width: properties.width || 400,
        height: properties.height || 200,
        borderRadius: properties.borderRadius || 0,
        opacity: properties.opacity || 100,
        rotation: properties.rotation || 0,
      })
      setShowUpload(false)
      toast.success("Image added successfully!")
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
      })
      setShowUpload(false)
      
      toast.success("Image uploaded successfully!")
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

  const imageStyle = {
    width: properties.width ? `${properties.width}px` : "auto",
    height: properties.height ? `${properties.height}px` : "auto",
    maxWidth: "100%",
    borderRadius: `${properties.borderRadius || 0}px`,
    opacity: (properties.opacity || 100) / 100,
    transform: `rotate(${properties.rotation || 0}deg)`,
  }

  return (
    <div
      className={`p-4 border rounded-md cursor-pointer transition-colors ${
        isSelected ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
      }`}
      onClick={onSelect}
    >
      {showUpload || !properties.src ? (
        <div className="space-y-3">
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
                <p className="text-xs text-muted-foreground">Click the upload button below</p>
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
                    button: "Upload Image",
                    allowedContent: "Max 4MB (PNG, JPG, GIF)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  )
}





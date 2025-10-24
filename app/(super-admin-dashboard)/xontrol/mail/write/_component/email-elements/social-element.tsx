// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Plus, X } from "lucide-react"

// interface SocialLink {
//   id: string
//   platform: string
//   url: string
//   iconColor?: string
//   backgroundColor?: string
// }

// interface SocialElementProps {
//   id: string
//   properties?: {
//     links?: SocialLink[]
//     alignment?: "left" | "center" | "right"
//     style?: "icons" | "buttons"
//     iconSize?: number
//     borderRadius?: number
//     spacing?: number
//   }
//   isSelected?: boolean
//   onSelect?: () => void
//   onUpdate?: (properties: any) => void
// }

// const socialPlatforms = [
//   { id: "facebook", name: "Facebook", icon: Facebook, color: "#1877F2" },
//   { id: "twitter", name: "Twitter", icon: Twitter, color: "#1DA1F2" },
//   { id: "instagram", name: "Instagram", icon: Instagram, color: "#E4405F" },
//   { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "#0A66C2" },
//   { id: "youtube", name: "YouTube", icon: Youtube, color: "#FF0000" },
//   { id: "email", name: "Email", icon: Mail, color: "#666666" },
// ]

// export function SocialElement({ id, properties = {}, isSelected, onSelect, onUpdate }: SocialElementProps) {
//   const [isEditing, setIsEditing] = useState(!properties.links || properties.links.length === 0)
//   const [links, setLinks] = useState<SocialLink[]>(properties.links || [])
//   const [newPlatform, setNewPlatform] = useState("")
//   const [newUrl, setNewUrl] = useState("")
//   const [editingLinkId, setEditingLinkId] = useState<string | null>(null)
//   const [editingIconColor, setEditingIconColor] = useState("")
//   const [editingBgColor, setEditingBgColor] = useState("")

//   const addLink = () => {
//     if (newPlatform && newUrl) {
//       const platform = socialPlatforms.find((p) => p.id === newPlatform)
//       const newLink: SocialLink = {
//         id: `${newPlatform}-${Date.now()}`,
//         platform: newPlatform,
//         url: newUrl,
//         iconColor: platform?.color,
//         backgroundColor: properties.style === "buttons" ? platform?.color : undefined,
//       }
//       const updatedLinks = [...links, newLink]
//       setLinks(updatedLinks)
//       setNewPlatform("")
//       setNewUrl("")
//     }
//   }

//   const removeLink = (linkId: string) => {
//     const updatedLinks = links.filter((link) => link.id !== linkId)
//     setLinks(updatedLinks)
//   }

//   const updateLinkColors = (linkId: string, iconColor: string, bgColor: string) => {
//     const updatedLinks = links.map((link) =>
//       link.id === linkId ? { ...link, iconColor, backgroundColor: bgColor } : link,
//     )
//     setLinks(updatedLinks)
//     setEditingLinkId(null)
//   }

//   const handleSave = () => {
//     setIsEditing(false)
//     onUpdate?.({
//       links,
//       alignment: properties.alignment || "center",
//       style: properties.style || "icons",
//       iconSize: properties.iconSize || 20,
//       borderRadius: properties.borderRadius || 8,
//       spacing: properties.spacing || 8,
//     })
//   }

//   const alignmentClass = {
//     left: "justify-start",
//     center: "justify-center",
//     right: "justify-end",
//   }[properties.alignment || "center"]

//   const iconStyle = {
//     width: `${properties.iconSize || 20}px`,
//     height: `${properties.iconSize || 20}px`,
//   }

//   return (
//     <div
//       className={`p-4 border rounded-md cursor-pointer transition-colors ${
//         isSelected ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
//       }`}
//       onClick={onSelect}
//     >
//       {isEditing ? (
//         <div className="space-y-3">
//           <div className="space-y-2">
//             <h4 className="text-sm font-medium">Social Links</h4>
//             {links.map((link) => {
//               const platform = socialPlatforms.find((p) => p.id === link.platform)
//               return (
//                 <div key={link.id} className="space-y-2 p-2 bg-muted rounded">
//                   <div className="flex items-center gap-2">
//                     {platform && (
//                       <platform.icon className="w-4 h-4" style={{ color: link.iconColor || platform.color }} />
//                     )}
//                     <span className="text-sm flex-1">{platform?.name}</span>
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       className="h-6 px-2 text-xs bg-transparent"
//                       onClick={() => {
//                         setEditingLinkId(link.id)
//                         setEditingIconColor(link.iconColor || platform?.color || "#000000")
//                         setEditingBgColor(link.backgroundColor || "#ffffff")
//                       }}
//                     >
//                       Colors
//                     </Button>
//                     <Button size="sm" variant="ghost" onClick={() => removeLink(link.id)} className="h-6 w-6 p-0">
//                       <X className="w-3 h-3" />
//                     </Button>
//                   </div>
//                   {editingLinkId === link.id && (
//                     <div className="flex gap-2 items-center">
//                       <div className="flex items-center gap-1">
//                         <label className="text-xs">Icon:</label>
//                         <input
//                           type="color"
//                           value={editingIconColor}
//                           onChange={(e) => setEditingIconColor(e.target.value)}
//                           className="w-6 h-6 border border-border rounded cursor-pointer"
//                         />
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <label className="text-xs">BG:</label>
//                         <input
//                           type="color"
//                           value={editingBgColor}
//                           onChange={(e) => setEditingBgColor(e.target.value)}
//                           className="w-6 h-6 border border-border rounded cursor-pointer"
//                         />
//                       </div>
//                       <Button
//                         size="sm"
//                         className="h-6 px-2 text-xs"
//                         onClick={() => updateLinkColors(link.id, editingIconColor, editingBgColor)}
//                       >
//                         Save
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               )
//             })}
//           </div>

//           <div className="space-y-2">
//             <Select value={newPlatform} onValueChange={setNewPlatform}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Add platform" />
//               </SelectTrigger>
//               <SelectContent>
//                 {socialPlatforms
//                   .filter((platform) => !links.some((link) => link.platform === platform.id))
//                   .map((platform) => (
//                     <SelectItem key={platform.id} value={platform.id}>
//                       <div className="flex items-center gap-2">
//                         <platform.icon className="w-4 h-4" style={{ color: platform.color }} />
//                         {platform.name}
//                       </div>
//                     </SelectItem>
//                   ))}
//               </SelectContent>
//             </Select>
//             <Input placeholder="Profile URL" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
//             <Button size="sm" onClick={addLink} disabled={!newPlatform || !newUrl} className="w-full">
//               <Plus className="w-4 h-4 mr-1" />
//               Add Link
//             </Button>
//           </div>

//           <div className="flex gap-2">
//             <Button size="sm" onClick={handleSave} disabled={links.length === 0}>
//               Save
//             </Button>
//             <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
//               Cancel
//             </Button>
//           </div>
//         </div>
//       ) : links.length > 0 ? (
//         <div className={`flex ${alignmentClass} gap-${properties.spacing || 2} flex-wrap`}>
//           {links.map((link) => {
//             const platform = socialPlatforms.find((p) => p.id === link.platform)
//             if (!platform) return null

//             const buttonStyle = {
//               backgroundColor: link.backgroundColor || platform.color,
//               borderRadius: `${properties.borderRadius || 8}px`,
//               padding: `${properties.spacing || 8}px ${(properties.spacing || 8) * 1.5}px`,
//             }

//             return (
//               <a
//                 key={link.id}
//                 href={link.url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="inline-flex items-center gap-2 transition-colors hover:opacity-80"
//                 style={properties.style === "buttons" ? buttonStyle : {}}
//                 onDoubleClick={(e) => {
//                   e.preventDefault()
//                   setIsEditing(true)
//                 }}
//               >
//                 <platform.icon
//                   style={{
//                     ...iconStyle,
//                     color: link.iconColor || (properties.style === "buttons" ? "#ffffff" : platform.color),
//                   }}
//                 />
//                 {properties.style === "buttons" && (
//                   <span style={{ color: link.iconColor || "#ffffff" }}>{platform.name}</span>
//                 )}
//               </a>
//             )
//           })}
//         </div>
//       ) : (
//         <div className="text-center text-muted-foreground py-4">
//           <p className="text-sm">Click to configure social links</p>
//         </div>
//       )}
//     </div>
//   )
// }



"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Plus, X, Globe } from "lucide-react"

interface SocialLink {
  id: string
  platform: string
  url: string
  iconColor?: string
  backgroundColor?: string
}

interface SocialElementProps {
  id: string
  properties?: {
    platforms?: Array<{
      name: string
      url: string
      iconColor?: string
      backgroundColor?: string
    }>
    alignment?: "left" | "center" | "right"
    style?: "icons" | "buttons"
    iconSize?: number
    borderRadius?: number
    spacing?: number
  }
  isSelected?: boolean
  onSelect?: () => void
  onUpdate?: (properties: any) => void
}

const socialPlatforms = [
  { id: "facebook", name: "Facebook", icon: Facebook, color: "#1877F2" },
  { id: "twitter", name: "Twitter", icon: Twitter, color: "#1DA1F2" },
  { id: "instagram", name: "Instagram", icon: Instagram, color: "#E4405F" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "#0A66C2" },
  { id: "youtube", name: "YouTube", icon: Youtube, color: "#FF0000" },
  { id: "whatsapp", name: "WhatsApp", icon: null, color: "#25D366" },
  { id: "tiktok", name: "TikTok", icon: null, color: "#000000" },
  { id: "pinterest", name: "Pinterest", icon: null, color: "#E60023" },
  { id: "email", name: "Email", icon: Mail, color: "#666666" },
  { id: "website", name: "Website", icon: Globe, color: "#333333" },
]

export function SocialElement({ id, properties = {}, isSelected, onSelect, onUpdate }: SocialElementProps) {
  const [isEditing, setIsEditing] = useState(!properties.platforms || properties.platforms.length === 0)
  const [platforms, setPlatforms] = useState<Array<{
    name: string
    url: string
    iconColor?: string
    backgroundColor?: string
  }>>(properties.platforms || [])
  const [newPlatform, setNewPlatform] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [editingPlatformIndex, setEditingPlatformIndex] = useState<number | null>(null)
  const [editingIconColor, setEditingIconColor] = useState("")
  const [editingBgColor, setEditingBgColor] = useState("")

  const addPlatform = () => {
    if (newPlatform && newUrl) {
      const platform = socialPlatforms.find((p) => p.id === newPlatform)
      const newPlatformObj = {
        name: newPlatform,
        url: newUrl,
        iconColor: platform?.color,
        backgroundColor: properties.style === "buttons" ? platform?.color : undefined,
      }
      const updatedPlatforms = [...platforms, newPlatformObj]
      setPlatforms(updatedPlatforms)
      setNewPlatform("")
      setNewUrl("")
    }
  }

  const removePlatform = (index: number) => {
    const updatedPlatforms = platforms.filter((_, i) => i !== index)
    setPlatforms(updatedPlatforms)
  }

  const updatePlatformColors = (index: number, iconColor: string, bgColor: string) => {
    const updatedPlatforms = platforms.map((platform, i) =>
      i === index ? { ...platform, iconColor, backgroundColor: bgColor } : platform,
    )
    setPlatforms(updatedPlatforms)
    setEditingPlatformIndex(null)
  }

  const handleSave = () => {
    setIsEditing(false)
    onUpdate?.({
      platforms,
      alignment: properties.alignment || "center",
      style: properties.style || "icons",
      iconSize: properties.iconSize || 24,
      borderRadius: properties.borderRadius || 8,
      spacing: properties.spacing || 8,
    })
  }

  const alignmentClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[properties.alignment || "center"]

  const iconStyle = {
    width: `${properties.iconSize || 24}px`,
    height: `${properties.iconSize || 24}px`,
  }

  const getPlatformIcon = (platformName: string) => {
    const platform = socialPlatforms.find((p) => p.id === platformName)
    return platform?.icon || Globe
  }

  const getPlatformColor = (platformName: string) => {
    const platform = socialPlatforms.find((p) => p.id === platformName)
    return platform?.color || "#666666"
  }

  return (
    <div
      className={`p-4 border rounded-md cursor-pointer transition-colors ${
        isSelected ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
      }`}
      onClick={onSelect}
    >
      {isEditing ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Social Platforms</h4>
            {platforms.map((platform, index) => {
              const IconComponent = getPlatformIcon(platform.name)
              const defaultColor = getPlatformColor(platform.name)
              
              return (
                <div key={index} className="space-y-2 p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    {IconComponent && (
                      <IconComponent 
                        className="w-4 h-4" 
                        style={{ color: platform.iconColor || defaultColor }} 
                      />
                    )}
                    <span className="text-sm flex-1 capitalize">{platform.name}</span>
                    <span className="text-xs text-muted-foreground truncate flex-1">{platform.url}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs bg-transparent"
                      onClick={() => {
                        setEditingPlatformIndex(index)
                        setEditingIconColor(platform.iconColor || defaultColor)
                        setEditingBgColor(platform.backgroundColor || "#ffffff")
                      }}
                    >
                      Colors
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => removePlatform(index)} 
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  {editingPlatformIndex === index && (
                    <div className="flex gap-2 items-center">
                      <div className="flex items-center gap-1">
                        <label className="text-xs">Icon:</label>
                        <input
                          type="color"
                          value={editingIconColor}
                          onChange={(e) => setEditingIconColor(e.target.value)}
                          className="w-6 h-6 border border-border rounded cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="text-xs">BG:</label>
                        <input
                          type="color"
                          value={editingBgColor}
                          onChange={(e) => setEditingBgColor(e.target.value)}
                          className="w-6 h-6 border border-border rounded cursor-pointer"
                        />
                      </div>
                      <Button
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => updatePlatformColors(index, editingIconColor, editingBgColor)}
                      >
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="space-y-2">
            <Select value={newPlatform} onValueChange={setNewPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {socialPlatforms
                  .filter((platform) => !platforms.some((p) => p.name === platform.id))
                  .map((platform) => (
                    <SelectItem key={platform.id} value={platform.id}>
                      <div className="flex items-center gap-2">
                        {platform.icon ? (
                          <platform.icon className="w-4 h-4" style={{ color: platform.color }} />
                        ) : (
                          <div 
                            className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs"
                            style={{ backgroundColor: platform.color }}
                          >
                            {platform.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {platform.name}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Input 
              placeholder="Profile URL" 
              value={newUrl} 
              onChange={(e) => setNewUrl(e.target.value)} 
            />
            <Button 
              size="sm" 
              onClick={addPlatform} 
              disabled={!newPlatform || !newUrl} 
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Platform
            </Button>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={platforms.length === 0}>
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : platforms.length > 0 ? (
        <div className={`flex ${alignmentClass} gap-${properties.spacing || 2} flex-wrap`}>
          {platforms.map((platform, index) => {
            const IconComponent = getPlatformIcon(platform.name)
            const defaultColor = getPlatformColor(platform.name)
            
            const buttonStyle = {
              backgroundColor: platform.backgroundColor || (properties.style === "buttons" ? defaultColor : "transparent"),
              borderRadius: `${properties.borderRadius || 8}px`,
              padding: properties.style === "buttons" 
                ? `${(properties.spacing || 8)}px ${(properties.spacing || 8) * 1.5}px` 
                : "0",
            }

            return (
              <a
                key={index}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:opacity-80"
                style={buttonStyle}
                onDoubleClick={(e) => {
                  e.preventDefault()
                  setIsEditing(true)
                }}
              >
                {IconComponent && (
                  <IconComponent
                    style={{
                      ...iconStyle,
                      color: platform.iconColor || (properties.style === "buttons" ? "#ffffff" : defaultColor),
                    }}
                  />
                )}
                {properties.style === "buttons" && (
                  <span 
                    style={{ 
                      color: platform.iconColor || "#ffffff",
                      fontSize: `${(properties.iconSize || 24) * 0.6}px`
                    }}
                  >
                    {socialPlatforms.find(p => p.id === platform.name)?.name || platform.name}
                  </span>
                )}
              </a>
            )
          })}
        </div>
      ) : (
        <div 
          className="text-center text-muted-foreground py-4 cursor-pointer"
          onDoubleClick={() => setIsEditing(true)}
        >
          <p className="text-sm">Double click to add social links</p>
        </div>
      )}
    </div>
  )
}
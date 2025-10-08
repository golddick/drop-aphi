"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Plus, X } from "lucide-react"

interface SocialLink {
  id: string
  platform: string
  url: string
}

interface SocialElementProps {
  id: string
  properties?: {
    links?: SocialLink[]
    alignment?: "left" | "center" | "right"
    style?: "icons" | "buttons"
    iconColor?: string
    iconSize?: number
    backgroundColor?: string
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
  { id: "email", name: "Email", icon: Mail, color: "#666666" },
]

export function SocialElement({ id, properties = {}, isSelected, onSelect, onUpdate }: SocialElementProps) {
  const [isEditing, setIsEditing] = useState(!properties.links || properties.links.length === 0)
  const [links, setLinks] = useState<SocialLink[]>(properties.links || [])
  const [newPlatform, setNewPlatform] = useState("")
  const [newUrl, setNewUrl] = useState("")

  const addLink = () => {
    if (newPlatform && newUrl) {
      const newLink: SocialLink = {
        id: `${newPlatform}-${Date.now()}`,
        platform: newPlatform,
        url: newUrl,
      }
      const updatedLinks = [...links, newLink]
      setLinks(updatedLinks)
      setNewPlatform("")
      setNewUrl("")
    }
  }

  const removeLink = (linkId: string) => {
    const updatedLinks = links.filter((link) => link.id !== linkId)
    setLinks(updatedLinks)
  }

  const handleSave = () => {
    setIsEditing(false)
    onUpdate?.({
      links,
      alignment: properties.alignment || "center",
      style: properties.style || "icons",
      iconColor: properties.iconColor,
      iconSize: properties.iconSize || 20,
      backgroundColor: properties.backgroundColor,
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
    width: `${properties.iconSize || 20}px`,
    height: `${properties.iconSize || 20}px`,
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
            <h4 className="text-sm font-medium">Social Links</h4>
            {links.map((link) => {
              const platform = socialPlatforms.find((p) => p.id === link.platform)
              return (
                <div key={link.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                  {platform && <platform.icon className="w-4 h-4" style={{ color: platform.color }} />}
                  <span className="text-sm flex-1">{platform?.name}</span>
                  <Button size="sm" variant="ghost" onClick={() => removeLink(link.id)} className="h-6 w-6 p-0">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )
            })}
          </div>

          <div className="space-y-2">
            <Select value={newPlatform} onValueChange={setNewPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Add platform" />
              </SelectTrigger>
              <SelectContent>
                {socialPlatforms
                  .filter((platform) => !links.some((link) => link.platform === platform.id))
                  .map((platform) => (
                    <SelectItem key={platform.id} value={platform.id}>
                      <div className="flex items-center gap-2">
                        <platform.icon className="w-4 h-4" style={{ color: platform.color }} />
                        {platform.name}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Input placeholder="Profile URL" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
            <Button size="sm" onClick={addLink} disabled={!newPlatform || !newUrl} className="w-full">
              <Plus className="w-4 h-4 mr-1" />
              Add Link
            </Button>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={links.length === 0}>
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : links.length > 0 ? (
        <div className={`flex ${alignmentClass} gap-${properties.spacing || 2}`}>
          {links.map((link) => {
            const platform = socialPlatforms.find((p) => p.id === link.platform)
            if (!platform) return null

            const buttonStyle = {
              backgroundColor: properties.backgroundColor || platform.color,
              borderRadius: `${properties.borderRadius || 8}px`,
              padding: `${properties.spacing || 8}px ${(properties.spacing || 8) * 1.5}px`,
            }

            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:opacity-80"
                style={properties.style === "buttons" ? buttonStyle : {}}
                onDoubleClick={(e) => {
                  e.preventDefault()
                  setIsEditing(true)
                }}
              >
                <platform.icon
                  style={{
                    ...iconStyle,
                    color: properties.iconColor || (properties.style === "buttons" ? "#ffffff" : platform.color),
                  }}
                />
                {properties.style === "buttons" && (
                  <span style={{ color: properties.iconColor || "#ffffff" }}>{platform.name}</span>
                )}
              </a>
            )
          })}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-4">
          <p className="text-sm">Click to configure social links</p>
        </div>
      )}
    </div>
  )
}

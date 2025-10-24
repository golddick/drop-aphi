

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Calendar, Users, BarChart, Plus, Search } from "lucide-react"
import { sendNewsletterAction } from "@/actions/superadmin/send-newsletter"
import { getCampaignsAction, createCampaignAction } from "@/actions/superadmin/campaigns"

interface EmailElement {
  id: string
  type: "text" | "button" | "image" | "video" | "social" | "divider" | "columns" | "logo"
  content?: string
  properties?: Record<string, any>
}

interface Campaign {
  id: string
  name: string
  description?: string | null
  status: string
  createdAt: string
}

interface SendNewsletterFormProps {
  emailContent: string
  emailSubject: string
  elements: EmailElement[]
  previewText?: string
  title: string
  templateUsed?: string
  builderData?: Record<string, any>
  onSuccess?: () => void
  onCancel?: () => void
}

export function SendNewsletterForm({
  emailContent,
  emailSubject,
  elements,
  previewText = "",
  title,
  templateUsed,
  builderData,
  onSuccess,
  onCancel
}: SendNewsletterFormProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("")
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [showNewCampaign, setShowNewCampaign] = useState(false)
  const [newCampaignName, setNewCampaignName] = useState("")
  const [newCampaignDescription, setNewCampaignDescription] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false)
  const [result, setResult] = useState<any>(null)

  // Fetch campaigns on component mount
  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    setIsLoadingCampaigns(true)
    try {
      const result = await getCampaignsAction()
      if (result.success) {
        setCampaigns(result.campaigns || [])
      } else {
        console.error('Failed to fetch campaigns:', result.message)
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
    } finally {
      setIsLoadingCampaigns(false)
    }
  }

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateCampaign = async () => {
    if (!newCampaignName.trim()) {
      alert("Please enter a campaign name")
      return
    }
    
    try {
      const result = await createCampaignAction({
        name: newCampaignName,
        description: newCampaignDescription
      })
      
      if (result.success && result.campaign) {
        // Add the new campaign to the list and select it
        const newCampaign: Campaign = {
          id: result.campaign.id,
          name: result.campaign.name,
          description: result.campaign.description,
          status: result.campaign.status,
          createdAt: result.campaign.createdAt
        }
        
        setCampaigns(prev => [newCampaign, ...prev])
        setSelectedCampaign(newCampaign.name)
        setShowNewCampaign(false)
        setNewCampaignName("")
        setNewCampaignDescription("")
      } else {
        alert(result.message || "Failed to create campaign")
      }
    } catch (error) {
      console.error('Failed to create campaign:', error)
      alert("Failed to create campaign")
    }
  }

  const handleSendNewsletter = async () => {
    if (!title.trim()) {
      alert("Please enter an email title")
      return
    }

    if (!emailSubject.trim()) {
      alert("Please enter an email subject")
      return
    }

    setIsLoading(true)
    try {
      const result = await sendNewsletterAction({
        title,
        content: emailContent,
        emailSubject,
        previewText,
        elements,
        campaignName: selectedCampaign || undefined,
        campaignDescription: newCampaignDescription,
        scheduleDate: scheduleDate ? new Date(scheduleDate) : undefined,
        scheduleTime: scheduleTime || undefined,
        templateUsed,
        builderData
      })

      setResult(result)
      
      if (result.success) {
        if (onSuccess) onSuccess()
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error("Failed to send newsletter:", error)
      alert("Failed to send newsletter")
    } finally {
      setIsLoading(false)
    }
  }

  const getMinDate = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }

  return (
    <Card className="w-full border-none shadow-none">
      <CardContent className="p-6 space-y-4">
        {/* Campaign Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <h3 className="font-medium">Campaign</h3>
          </div>
          
          {!showNewCampaign ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewCampaign(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New
                </Button>
              </div>

              {isLoadingCampaigns ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Loading campaigns...</p>
                </div>
              ) : filteredCampaigns.length > 0 ? (
                <div className="max-h-40 overflow-y-auto border rounded-md">
                  {filteredCampaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className={`p-2 cursor-pointer hover:bg-muted transition-colors ${
                        selectedCampaign === campaign.name ? 'bg-accent/10 border-l-2 border-l-accent' : ''
                      }`}
                      onClick={() => setSelectedCampaign(campaign.name)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{campaign.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {campaign.status}
                        </Badge>
                      </div>
                      {campaign.description && (
                        <p className="text-xs text-muted-foreground mt-1">{campaign.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? 'No campaigns found' : 'No campaigns available'}
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setShowNewCampaign(true)}
                    className="mt-1"
                  >
                    Create new campaign
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 p-3 border rounded-md bg-muted/20">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Create New Campaign</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewCampaign(false)}
                >
                  Cancel
                </Button>
              </div>
              
              <div className="space-y-2">
                <Input
                  placeholder="Campaign Name *"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  className="w-full"
                />
                <Textarea
                  placeholder="Campaign Description (optional)"
                  value={newCampaignDescription}
                  onChange={(e) => setNewCampaignDescription(e.target.value)}
                  rows={2}
                />
                <Button
                  size="sm"
                  onClick={handleCreateCampaign}
                  disabled={!newCampaignName.trim()}
                >
                  Create Campaign
                </Button>
              </div>
            </div>
          )}
          
          {selectedCampaign && !showNewCampaign && (
            <Badge variant="secondary" className="text-xs">
              Selected: {selectedCampaign}
            </Badge>
          )}
        </div>

        {/* Scheduling Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <h3 className="font-medium">Schedule (Optional)</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              min={getMinDate()}
            />
          </div>
          
          <Badge variant="secondary" className="text-xs">
            Leave empty to send immediately
          </Badge>
        </div>

        {/* Summary Section */}
        <div className="space-y-3 p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            <h3 className="font-medium">Send Summary</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Title:</span>
              <p className="font-medium truncate">{title}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Subject:</span>
              <p className="font-medium truncate">{emailSubject}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Campaign:</span>
              <p className="font-medium truncate">
                {selectedCampaign || "No campaign selected"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Elements:</span>
              <p className="font-medium">{elements.length}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Content Length:</span>
              <p className="font-medium">{emailContent.length} chars</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <p className="font-medium">
                {scheduleDate ? "Scheduled" : "Ready to send"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendNewsletter}
            disabled={isLoading || !title.trim() || !emailSubject.trim()}
            className="flex-1"
          >
            {isLoading ? (
              <>Sending...</>
            ) : scheduleDate ? (
              <>Schedule Newsletter</>
            ) : (
              <>Send Newsletter Now</>
            )}
          </Button>
        </div>

        {/* Result Display */}
        {result && (
          <div className={`p-3 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`text-sm ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              {result.message}
            </p>
            {result.success && result.data && (
              <div className="mt-2 text-xs text-muted-foreground">
                <p>Email ID: {result.data.emailId}</p>
                {result.data.campaignId && <p>Campaign ID: {result.data.campaign}</p>}
                <p>Recipients: {result.data.recipients}</p>
                <p>Status: {result.data.scheduled ? 'Scheduled' : 'Sent'}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
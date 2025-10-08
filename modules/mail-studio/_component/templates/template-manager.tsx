"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Save, FolderOpen, Trash2, Download, Upload, Send, Users, Plus, ChevronDown, X } from "lucide-react"
import { createEmail, sendTestEmail, getTemplates, deleteTemplate } from "@/actions/email/emails"
import { prepareAndSendEmail } from "@/lib/email/sendMail"
import { toast } from "sonner"
import { useAuthUser } from "@/lib/auth/getClientAuth"
import { getCampaigns } from "@/actions/campaign/campaign"

// Type definitions for email elements
interface EmailElement {
  id: string
  type: "text" | "image" | "video" | "button" | "social" | "divider" | "columns"
  content?: string
  properties?: Record<string, any>
}

// Type definitions for uploaded images
interface UploadedImage {
  url: string
  fileType: string
  filename: string
  fileSize: number
}

// Type definitions for templates
interface Template {
  id: string
  name: string
  subject: string
  elements: EmailElement[]
  createdAt: string
  thumbnail?: string
}

// Type definitions for campaigns
interface Campaign {
  id: string
  name: string
  description?: string
  status: string
  createdAt: string
}

// Type definitions that match your actual backend responses
interface BackendTemplate {
  id: string
  name: string
  subject: string
  elements: any // JsonValue from Prisma
  createdAt: Date
  updatedAt: Date
  userId: string | null
  description: string | null
  thumbnail: string | null
  category: string
  tags: string[]
  isPublic: boolean
  usageCount: number
}

// Generic API response types that match your actual backend structure
interface BaseApiResponse {
  success: boolean
  error?: string
}

interface EmailSendResponse extends BaseApiResponse {
  emailId?: string
  messageId?: string
  trackingId?: string
  stats?: {
    total: number
    accepted: number
    rejected: number
    failedRecipients?: string[]
    batches: number
    timeTaken: number
  }
}

interface CreateEmailResponse extends BaseApiResponse {
  data?: {
    id: string
    title: string
    emailSubject:string
    status: string // EmailStatus from Prisma
    createdAt: Date
    templateId: string | null // Matches your actual null type
  }
}

interface TemplateResponse extends BaseApiResponse {
  data?: BackendTemplate[]
}

interface SendTestEmailResponse extends BaseApiResponse {}

interface DeleteTemplateResponse extends BaseApiResponse {}

// Component props interface
interface TemplateManagerProps {
  currentElements: EmailElement[]
  currentSubject: string
  currentContent: string
  selectedCampaign?: string
  campaignName: string // Changed from currentTitle to campaignName
  currentPreviewText?: string
  currentBuilderData?: any
  uploadedImages?: UploadedImage[] // Add uploaded images prop
  onLoadTemplate: (elements: EmailElement[], subject: string, campaignName?: string, previewText?: string) => void
  onNewTemplate: () => void // New callback for creating new template
  onEmailSaved?: (emailData: { id: string; title: string; status: string; templateId?: string }) => void
  onImageUpload?: (uploadData: UploadedImage) => void // Callback for image uploads
  onCampaignChange?: (campaignId: string, campaignName: string) => void // Callback for campaign changes
  userId: string
  newsLetterOwnerId: string
  adminEmail: string
  builderMode: 'visual' | 'code' // Add builderMode prop
}

// Helper function to convert frontend element types to backend types
const convertElementTypeToBackend = (type: string): "TEXT" | "IMAGE" | "VIDEO" | "BUTTON" | "SOCIAL" | "DIVIDER" | "COLUMNS" => {
  const typeMap = {
    text: "TEXT" as const,
    image: "IMAGE" as const,
    video: "VIDEO" as const,
    button: "BUTTON" as const,
    social: "SOCIAL" as const,
    divider: "DIVIDER" as const,
    columns: "COLUMNS" as const,
  }
  return typeMap[type as keyof typeof typeMap] || "TEXT"
}

// Type guard functions that match your actual backend responses
const isEmailSendSuccessResponse = (response: EmailSendResponse): response is EmailSendResponse & { success: true; emailId: string; stats: { total: number } } => {
  return response.success === true && 
         typeof response.emailId === 'string' && 
         response.stats !== undefined
}

const isTemplateResponseSuccess = (response: TemplateResponse): response is TemplateResponse & { success: true; data: BackendTemplate[] } => {
  return response.success === true && Array.isArray(response.data)
}

const isCreateEmailResponseSuccess = (response: CreateEmailResponse): response is CreateEmailResponse & { success: true; data: { id: string } } => {
  return response.success === true && 
         response.data !== undefined && 
         typeof response.data.id === 'string'
}

const isSendTestEmailResponseSuccess = (response: SendTestEmailResponse): response is SendTestEmailResponse & { success: true } => {
  return response.success === true
}

const isDeleteTemplateResponseSuccess = (response: DeleteTemplateResponse): response is DeleteTemplateResponse & { success: true } => {
  return response.success === true
}

// Helper function to safely parse JSON elements from backend
const parseTemplateElements = (elements: any): EmailElement[] => {
  try {
    if (!elements) return []
    
    // If elements is already an array, use it directly
    if (Array.isArray(elements)) {
      return elements.map((element: any) => ({
        id: element.id || `element-${Math.random().toString(36).substr(2, 9)}`,
        type: (element.type?.toLowerCase() || 'text') as EmailElement["type"],
        content: element.content || '',
        properties: element.properties || {}
      }))
    }
    
    // If elements is a JSON string, parse it
    if (typeof elements === 'string') {
      const parsed = JSON.parse(elements)
      return Array.isArray(parsed) ? parsed.map((element: any) => ({
        id: element.id || `element-${Math.random().toString(36).substr(2, 9)}`,
        type: (element.type?.toLowerCase() || 'text') as EmailElement["type"],
        content: element.content || '',
        properties: element.properties || {}
      })) : []
    }
    
    return []
  } catch (error) {
    console.error('Error parsing template elements:', error)
    return []
  }
}

export function TemplateManager({ 
  currentElements, 
  currentSubject, 
  selectedCampaign: propSelectedCampaign,
  campaignName: propCampaignName, // Changed from currentTitle to campaignName
  currentContent,
  currentPreviewText,
  currentBuilderData,
  uploadedImages = [], // Default to empty array
  onLoadTemplate, 
  onNewTemplate, // New prop for handling new template creation
  onEmailSaved,
  onImageUpload,
  onCampaignChange,
  userId,
  newsLetterOwnerId,
  adminEmail,
  builderMode = 'visual' // Default to drag-drop for backward compatibility
}: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isOpen, setIsOpen] = useState(false) 
  const [templateName, setTemplateName] = useState("")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [showBulkSendDialog, setShowBulkSendDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isBulkSending, setIsBulkSending] = useState(false)
  const [saveAsTemplate, setSaveAsTemplate] = useState(builderMode === 'visual') // Auto-set based on builder mode
  const [campaignName, setCampaignName] = useState(propCampaignName || "") // Changed from emailTitle to campaignName with default value
  const [previewText, setPreviewText] = useState(currentPreviewText || "")
  const [testEmail, setTestEmail] = useState("")
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false)
  const [savedEmailId, setSavedEmailId] = useState<string | null>(null)
  const [localUploadedImages, setLocalUploadedImages] = useState<UploadedImage[]>(uploadedImages)
  const [localSelectedCampaign, setLocalSelectedCampaign] = useState<string>(propSelectedCampaign || "")
  const [showCampaignSelect, setShowCampaignSelect] = useState(false)
  const { user } = useAuthUser();

  const fromApplication = user?.SenderName || "Drop-Aphi"

  // Load templates and campaigns from database on component mount
  useEffect(() => {
    loadTemplatesFromDB()
    loadCampaignsFromDB()
  }, [])

  // Update local state when props change
  useEffect(() => {
    setCampaignName(propCampaignName || "") // Added default value
    setPreviewText(currentPreviewText || "")
  }, [propCampaignName, currentPreviewText])

  // Update local selected campaign when prop changes
  useEffect(() => {
    if (propSelectedCampaign) {
      setLocalSelectedCampaign(propSelectedCampaign)
    }
  }, [propSelectedCampaign])

  // Update local uploaded images when prop changes
  useEffect(() => {
    if (uploadedImages && uploadedImages.length > 0) {
      // Only update if different
      const isDifferent =
        uploadedImages.length !== localUploadedImages.length ||
        uploadedImages.some((img, idx) => img.url !== localUploadedImages[idx]?.url)

      if (isDifferent) {
        setLocalUploadedImages(uploadedImages)
      }
    }
  }, [uploadedImages])

  // Update saveAsTemplate when builderMode changes
  useEffect(() => {
    setSaveAsTemplate(builderMode === 'visual')
  }, [builderMode])

  // Reset campaign selection when dialog opens
  useEffect(() => {
    if (showSaveDialog) {
      // Reset to the current prop value when dialog opens
      setLocalSelectedCampaign(propSelectedCampaign || "")
      setCampaignName(propCampaignName || "") // Added default value
    }
  }, [showSaveDialog, propSelectedCampaign, propCampaignName])

  const loadTemplatesFromDB = async (): Promise<void> => {
    setIsLoadingTemplates(true)
    try {
      const result: TemplateResponse = await getTemplates()
      
      if (isTemplateResponseSuccess(result)) {
        // Convert backend template format to frontend format with proper type handling
        const convertedTemplates: Template[] = result.data.map(template => {
          const elements = parseTemplateElements(template.elements)
          
          return {
            id: template.id,
            name: template.name,
            subject: template.subject,
            elements,
            createdAt: template.createdAt.toISOString(),
            thumbnail: template.thumbnail || undefined
          }
        })

        setTemplates(convertedTemplates)
      } else {
        toast.error(result.error || "Failed to load templates")
      }
    } catch (error) {
      console.error("Error loading templates:", error)
      toast.error("Failed to load templates from database")
    } finally {
      setIsLoadingTemplates(false)
    }
  }

  const loadCampaignsFromDB = async (): Promise<void> => {
    setIsLoadingCampaigns(true)
    try {
      const result = await getCampaigns()
      if (result.success && result.data) {
        setCampaigns(result.data)
      } else {
        toast.error(result.error || "Failed to load campaigns")
        console.error("Failed to load campaigns:", result.error)
      }
    } catch (error) {
      toast.error("Failed to load campaigns from database")
      console.error("Error loading campaigns:", error)
    } finally {
      setIsLoadingCampaigns(false)
    }
  }

  // Handle campaign selection
  const handleCampaignSelect = (campaignId: string) => {
    const selectedCampaign = campaigns.find(c => c.id === campaignId)
    if (selectedCampaign) {
      setLocalSelectedCampaign(campaignId)
      setCampaignName(selectedCampaign.name)
      setShowCampaignSelect(false)
      
      // Notify parent component about campaign change
      if (onCampaignChange) {
        onCampaignChange(campaignId, selectedCampaign.name)
      }
    }
  }

  // Handle removing campaign
  const handleRemoveCampaign = () => {
    setLocalSelectedCampaign("")
    setCampaignName("")
    
    // Notify parent component about campaign removal
    if (onCampaignChange) {
      onCampaignChange("", "")
    }
  }

  // New function to handle creating a new template
  const handleNewTemplate = (): void => {
    // Clear template from local storage
    const templateKeys = Object.keys(localStorage).filter(key => 
      key.includes('template') || key.includes('email-builder') || key.includes('newsletter')
    )
    
    templateKeys.forEach(key => {
      localStorage.removeItem(key)
    })

    // Clear uploaded images from local state
    setLocalUploadedImages([])

    // Reset form fields
    setTemplateName("")
    setCampaignName("")
    setPreviewText("")
    setSavedEmailId(null)
    setLocalSelectedCampaign("")

    // Call parent component's new template handler
    onNewTemplate()

    toast.success("Started new email template")
  }

  const saveTemplateAndEmail = async (): Promise<void> => {
    if (!campaignName.trim()) { // Changed from emailTitle to campaignName
      toast.error("Please enter a campaign name")
      return
    }

    // Only require template name if saving as template AND in drag-drop mode
    if (saveAsTemplate && builderMode === 'visual' && !templateName.trim()) {
      toast.error("Please enter a template name")
      return
    }

    setIsSaving(true)

    try {
      // Prepare data for the createEmail action with proper type conversion
      const emailData = {
        title: campaignName.trim(), // Use campaign name as title
        content: currentContent,
        emailSubject: currentSubject,
        previewText: previewText.trim(),
        builderData: currentBuilderData || { 
          elements: currentElements,
          subject: currentSubject,
          title: campaignName, // Use campaign name
          previewText: previewText,
          html: currentContent,
          createdAt: new Date().toISOString(),
          version: "1.0"
        },
        builderMode: builderMode, // Pass the builder mode
        elements: currentElements.map((element) => ({
          id: element.id,
          type: convertElementTypeToBackend(element.type),
          content: element.content,
          properties: element.properties || {},
        })),
        attachments: localUploadedImages, // Pass uploaded images as attachments
        emailType: "NEWSLETTER" as const,
        trackOpens: true,
        trackClicks: true,
        enableUnsubscribe: true,
        createTemplateFromEmail: saveAsTemplate && builderMode === 'visual', // Only allow template creation in drag-drop mode
        templateName: saveAsTemplate && builderMode === 'visual' ? templateName.trim() : undefined,
        scheduleDate: undefined,
        scheduleTime: undefined,
        campaignId: localSelectedCampaign || propSelectedCampaign || undefined, // Use local or prop campaign
        // The backend will automatically create a campaign using the campaign name if no campaign is selected
      }

      console.log("Saving email with data:", {
        campaignName: emailData.title,
        subject: emailData.emailSubject,
        previewText: emailData.previewText,
        builderMode: emailData.builderMode,
        createTemplate: emailData.createTemplateFromEmail,
        campaignId: localSelectedCampaign || propSelectedCampaign
      })

      // Call the server action
      const result: CreateEmailResponse = await createEmail(emailData)
 
      if (isCreateEmailResponseSuccess(result)) {
        // Store the saved email ID for bulk sending
        setSavedEmailId(result.data.id)
        
        // Clear uploaded images after successful save
        setLocalUploadedImages([])
        
        // If template was created, reload templates from DB
        if (saveAsTemplate && result.data.templateId) {
          await loadTemplatesFromDB()
        }

        // Reload campaigns in case a new one was created
        await loadCampaignsFromDB()

        // Reset form
        setTemplateName("")
        setShowSaveDialog(false)
        
        // Notify parent component - handle null templateId
        if (onEmailSaved) {
          onEmailSaved({
            id: result.data.id,
            title: result.data.title,
            status: result.data.status,
            templateId: result.data.templateId || undefined // Convert null to undefined
          })
        }

        toast.success(`Email "${result.data.emailSubject}" saved successfully as ${result.data.status.toLowerCase()}`)
      } else {
        const errorMessage = result.error || "Failed to save email"
        toast.error(errorMessage)
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error("Error saving email and template:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save email and template")
    } finally {
      setIsSaving(false)
    }
  }

  const sendTestEmailHandler = async (): Promise<void> => {
    if (!testEmail.trim()) {
      toast.error("Please enter a test email address")
      return
    }

    if (!campaignName.trim() || !currentContent.trim()) { // Changed from emailTitle to campaignName
      toast.error("Please save the email first before sending a test")
      return
    }

    setIsSending(true)
    try {
      const result: SendTestEmailResponse = await sendTestEmail({
        to: testEmail.trim(),
        subject: currentSubject,
        htmlContent: currentContent,
        title: campaignName.trim(), // Changed from emailTitle to campaignName
        previewText: previewText.trim()
      })

      if (isSendTestEmailResponseSuccess(result)) {
        toast.success("Test email sent successfully!")
        setShowSendDialog(false)
        setTestEmail("")
      } else {
        toast.error(result.error || "Failed to send test email")
      }
    } catch (error) {
      console.error("Error sending test email:", error)
      toast.error("Failed to send test email")
    } finally {
      setIsSending(false)
    }
  }

  const sendBulkEmailHandler = async (): Promise<void> => {
    if (!campaignName.trim() || !currentContent.trim()) { // Changed from emailTitle to campaignName
      toast.error("Please save the email first before sending to subscribers")
      return
    }

    if (!userId || !newsLetterOwnerId || !adminEmail) {
      toast.error("Missing required configuration for sending emails")
      return
    }

    setIsBulkSending(true)
    try {
      console.log("Sending bulk email")

      const result: EmailSendResponse = await prepareAndSendEmail({
        subject: currentSubject,
        content: currentContent,
        contentJson: JSON.stringify(currentContent),
        newsLetterOwnerId,
        adminEmail,
        fromApplication: fromApplication,
        userId,
        emailTitle: campaignName, // Use campaign name
        previewText: previewText,
        builderData: {
          ...currentBuilderData,
          elements: currentElements,
          subject: currentSubject,
          title: campaignName, // Use campaign name
          previewText: previewText,
          html: currentContent
        },
        elements: currentElements,
        createTemplate: saveAsTemplate && builderMode === 'visual', // Only create template in drag-drop mode
        emailId: savedEmailId || undefined,
      })

      if (isEmailSendSuccessResponse(result)) {
        toast.success(`Email "${currentSubject}" sent successfully to ${result.stats.total} subscribers!`) 
        setShowBulkSendDialog(false)
        setSavedEmailId(result.emailId)
      } else {
        toast.error(result.error || "Failed to send email to subscribers")
      }
    } catch (error) {
      console.error("Error sending bulk email:", error)
      toast.error("Failed to send email to subscribers")
    } finally {
      setIsBulkSending(false)
    }
  }

  const loadTemplate = (template: Template): void => {
    onLoadTemplate(template.elements, template.subject)
    setIsOpen(false)
  }

  const deleteTemplateHandler = async (templateId: string): Promise<void> => {
    try {
      const result: DeleteTemplateResponse = await deleteTemplate(templateId)
      if (isDeleteTemplateResponseSuccess(result)) {
        setTemplates(templates.filter(t => t.id !== templateId))
        toast.success("Template deleted successfully")
      } else {
        toast.error(result.error || "Failed to delete template")
      }
    } catch (error) {
      console.error("Error deleting template:", error)
      toast.error("Failed to delete template")
    }
  }


  return (
    <>
      <div className="flex gap-2">
        {/* Campaign Selector */}
        <div className="relative">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowCampaignSelect(!showCampaignSelect)}
            className="flex items-center gap-1"
          >
            <span className="max-w-[120px] truncate">
              {campaignName || "Select Campaign"}
            </span>
            <ChevronDown className="w-4 h-4" />
          </Button>

          {showCampaignSelect && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
              <div className="p-2 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Select Campaign</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCampaignSelect(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              {isLoadingCampaigns ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
                  <p className="text-xs text-muted-foreground mt-1">Loading campaigns...</p>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">No campaigns found</p>
                </div>
              ) : (
                <div className="py-1">
                  {campaigns.map((campaign) => (
                    <button
                      key={campaign.id}
                      onClick={() => handleCampaignSelect(campaign.id)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                        localSelectedCampaign === campaign.id ? 'bg-blue-50 text-blue-700' : ''
                      }`}
                    >
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Created {new Date(campaign.createdAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {localSelectedCampaign && (
                <div className="p-2 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveCampaign}
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Remove Campaign
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* New Template Button */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleNewTemplate}
          className="bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          New
        </Button>

        {/* Save Email Button */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Save className="w-4 h-4 mr-1" />
              Save Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Save Email {builderMode === 'visual' ? '& Template' : ''}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="campaign-name">Campaign Name *</Label>
                <Input
                  id="campaign-name"
                  value={campaignName} // Changed from emailTitle to campaignName
                  onChange={(e) => setCampaignName(e.target.value)} // Changed from setEmailTitle to setCampaignName
                  placeholder="Enter campaign name..."
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This will be used as the campaign name for organizing your emails
                </p>
              </div>
              
              {/* Campaign Selection - Optional */}
              <div>
                <Label htmlFor="campaign">Link to Existing Campaign (Optional)</Label>
                <div className="mt-1">
                  {isLoadingCampaigns ? (
                    <div className="flex items-center justify-center p-4 border border-border rounded-md">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="ml-2 text-sm text-muted-foreground">Loading campaigns...</span>
                    </div>
                  ) : campaigns.length === 0 ? (
                    <div className="p-3 border border-border rounded-md bg-muted/50 text-center">
                      <p className="text-sm text-muted-foreground">No campaigns found</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        A new campaign will be created automatically using the campaign name
                      </p>
                    </div>
                  ) : (
                    <select
                      value={localSelectedCampaign}
                      onChange={(e) => setLocalSelectedCampaign(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Create new campaign</option>
                      {campaigns.map((campaign) => (
                        <option key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {localSelectedCampaign 
                    ? "Email will be added to the selected campaign" 
                    : "A new campaign will be created automatically"
                  }
                </p>
              </div>
              
              <div>
                <Label htmlFor="email-subject">Email Subject *</Label>
                <Input
                  id="email-subject"
                  value={currentSubject}
                  readOnly
                  className="mt-1 bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">Subject is set in the main editor</p>
              </div>
              
              <div>
                <Label htmlFor="preview-text">Preview Text</Label>
                <Textarea
                  id="preview-text"
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  placeholder="Enter preview text (shown in email inbox)..."
                  className="mt-1"
                  rows={2}
                />
              </div>

              {/* Show uploaded images count */}
              {localUploadedImages.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center text-sm text-blue-800">
                    <span className="font-medium">{localUploadedImages.length}</span>
                    <span className="ml-1">image(s) will be attached to this email</span>
                  </div>
                </div>
              )}

              {/* Only show template options in drag-drop mode */}
              {builderMode === 'visual' && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="save-template"
                    checked={saveAsTemplate}
                    onCheckedChange={setSaveAsTemplate}
                  />
                  <Label htmlFor="save-template">Save as reusable template</Label>
                </div>
              )}

              {saveAsTemplate && builderMode === 'visual' && (
                <div>
                  <Label htmlFor="template-name">Template Name *</Label>
                  <Input
                    id="template-name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter template name..."
                    className="mt-1"
                  />
                </div>
              )}

              {/* Show info message for code mode */}
              {builderMode === 'code' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-center text-sm text-amber-800">
                    <span>Emails created in code mode cannot be saved as templates.</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSaveDialog(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveTemplateAndEmail} 
                  disabled={
                    isSaving || 
                    !campaignName.trim() || // Changed from emailTitle to campaignName
                    (saveAsTemplate && builderMode === 'visual' && !templateName.trim())
                  }
                >
                  {isSaving ? "Saving..." : "Save Email"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Send Test Email Button */}
        <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Send className="w-4 h-4 mr-1" />
              Send Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Send Test Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="test-email">Test Email Address *</Label>
                <Input
                  id="test-email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter test email address..."
                  className="mt-1"
                />
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Campaign:</strong> {campaignName}</p> {/* Changed from emailTitle to campaignName */}
                <p><strong>Subject:</strong> {currentSubject}</p>
                <p><strong>Preview Text:</strong> {previewText || "Not set"}</p>
                <p className="mt-2">This will send a test email to verify how your email looks.</p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSendDialog(false)}
                  disabled={isSending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={sendTestEmailHandler} 
                  disabled={isSending || !testEmail.trim()}
                >
                  {isSending ? "Sending..." : "Send Test"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Send to Subscribers Button */}
        <Dialog open={showBulkSendDialog} onOpenChange={setShowBulkSendDialog}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
              <Users className="w-4 h-4 mr-1" />
              Send to Subscribers
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Send to All Subscribers</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">Important</h3>
                    <div className="mt-1 text-sm text-amber-700">
                      <p>This will send this email to all your active subscribers.</p>
                      <p className="mt-1">Make sure your email is properly formatted before sending.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Campaign:</strong> {propSelectedCampaign ? campaigns.find(c => c.id === propSelectedCampaign)?.name || campaignName : campaignName}</p> {/* Changed from emailTitle to campaignName */}
                <p><strong>Email Subject:</strong> {currentSubject}</p>
                <p><strong>Preview Text:</strong> {previewText || "Not set"}</p>
                <p><strong>Builder Mode:</strong> {builderMode === 'visual' ? 'Visual' : 'Code'}</p>
                {localUploadedImages.length > 0 && (
                  <p><strong>Attachments:</strong> {localUploadedImages.length} image(s)</p>
                )}
                <p className="mt-2">The email will be sent using Nodemailer with tracking enabled.</p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowBulkSendDialog(false)}
                  disabled={isBulkSending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={sendBulkEmailHandler} 
                  disabled={isBulkSending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isBulkSending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-1" />
                      Send to Subscribers
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Load Templates Button */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <FolderOpen className="w-4 h-4 mr-1" />
              Templates
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
            <DialogHeader className="flex flex-row items-center justify-between space-y-0">
              <DialogTitle>Email Templates</DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto">
              {isLoadingTemplates ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading templates...</p>
                </div>
              ) : templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <FolderOpen className="w-12 h-12 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-2">No Templates Yet</h3>
                  <p className="text-sm text-muted-foreground">Save your first template to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-sm">{template.name}</h3>
                          <p className="text-xs text-muted-foreground">{template.subject}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteTemplateHandler(template.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.elements.slice(0, 2).map((element, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {element.type}
                          </Badge>
                        ))}
                        {template.elements.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.elements.length - 2}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(template.createdAt).toLocaleDateString()}
                        </span>
                        <Button size="sm" onClick={() => loadTemplate(template)}>
                          Load
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}









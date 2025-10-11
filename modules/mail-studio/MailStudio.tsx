"use client"

import { useState, useEffect, useCallback } from "react"
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useHistory } from "@/lib/utils/hooks/mail/use-history"
import { Icons } from "@/lib/utils/icons"
import { generateEmailHTML } from "./_component/code-editor/html-generator"
import { toast } from "sonner"
import { TextElement } from "./_component/email-elements/text-element"
import { ImageElement } from "./_component/email-elements/image-element"
import { VideoElement } from "./_component/email-elements/video-element"
import { ButtonElement } from "./_component/email-elements/button-element"
import { SocialElement } from "./_component/email-elements/social-element"
import { DividerElement } from "./_component/email-elements/divider-element"
import { ColumnsElement } from "./_component/email-elements/columns-element"
import { SortableElement } from "./_component/drag-drop/sortable-element"
import { TemplateManager } from "./_component/templates/template-manager"
import { DraggableComponent } from "./_component/drag-drop/draggable-component"
import { DroppableCanvas } from "./_component/drag-drop/droppable-canvas"
import { PropertiesPanel } from "./_component/properties/properties-panel"
import { CodeEditor } from "./_component/code-editor/code-editor"
import { EmailPreview } from "./_component/preview/email-preview"
import { useAuthUser } from "@/lib/auth/getClientAuth"
import Loader from "@/components/_component/Loader"

interface EmailElement {
  id: string
  type: "text" | "image" | "video" | "button" | "social" | "divider" | "columns"
  content?: string
  properties?: Record<string, any>
}

interface EmailState {
  elements: EmailElement[]
  subject: string
}

// Mobile Banner Component
function MobileBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-yellow-900 p-3 z-50 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">
            For the best UI experience, please open this page on a desktop computer.
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => window.close()}
          className="text-yellow-900 hover:bg-yellow-600 hover:text-yellow-950"
        >
          <Icons.X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

// Safe hook wrapper with proper typing
function useSafeHistory<T>(initialState: T) {
  try {
    const history = useHistory<T>(initialState);
    return {
      state: history?.state || initialState,
      set: history?.set || ((() => {}) as any),
      undo: history?.undo || (() => {}),
      redo: history?.redo || (() => {}),
      canUndo: history?.canUndo || false,
      canRedo: history?.canRedo || false,
    };
  } catch (error) {
    console.error('useHistory error:', error);
    return {
      state: initialState,
      set: (() => {}) as any,
      undo: () => {},
      redo: () => {},
      canUndo: false,
      canRedo: false,
    };
  }
}

// Safe useCallback wrapper
function useSafeCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]) {
  try {
    return useCallback(callback, deps);
  } catch (error) {
    console.error('useCallback error:', error);
    return callback;
  }
}

export default function MailStudio() {
  // All hooks must be declared unconditionally at the top
  const {
    state: emailState,
    set: setEmailState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useSafeHistory<EmailState>({
    elements: [],
    subject: "Your Email Subject",
  })

  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [mode, setMode] = useState<"visual" | "code">("visual")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [customHTML, setCustomHTML] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [campaignName, setCampaignName] = useState("My Email Campaign") 
  const [previewText, setPreviewText] = useState("") 
  const [selectedCampaign, setSelectedCampaign] = useState<string>("")
  
  // Auth hook - must be called unconditionally
  const { user, loading } = useAuthUser();

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      
      const viewport = document.querySelector('meta[name="viewport"]')
      if (window.innerWidth < 768) {
        document.body.style.zoom = "0.8"
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=0.8, maximum-scale=1.0, user-scalable=no')
        }
      } else {
        document.body.style.zoom = "1"
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes')
        }
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => {
      window.removeEventListener("resize", checkMobile)
      document.body.style.zoom = "1"
    }
  }, [])

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (emailState.elements.length > 0) {
        const autoSaveData = {
          ...emailState,
          campaignName,
          previewText,
          selectedCampaign
        }
        localStorage.setItem("dropaphi-autosave", JSON.stringify(autoSaveData))
      }
    }, 2000)

    return () => clearTimeout(autoSave)
  }, [emailState, campaignName, previewText, selectedCampaign])

  // Load auto-saved data on mount
  useEffect(() => {
    const autoSaved = localStorage.getItem("dropaphi-autosave")
    if (autoSaved) {
      try {
        const savedState = JSON.parse(autoSaved)
        setEmailState({
          elements: savedState.elements || [],
          subject: savedState.subject || "Your Email Subject"
        })
        setCampaignName(savedState.campaignName || "My Email Campaign")
        setPreviewText(savedState.previewText || "")
        setSelectedCampaign(savedState.selectedCampaign || "")
        toast.success("Auto-saved data restored. Your previous work has been restored.")
      } catch (error) {
        console.error("Failed to restore auto-saved data:", error)
      }
    }
  }, [setEmailState])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo])

  // Now declare all variables and callbacks after hooks
  const userId = user?.userId
  const userEmail = user?.email

  const componentLibrary = [
    { id: "text", icon: Icons.Type, label: "Text", category: "Basics" },
    { id: "image", icon: Icons.Image, label: "Image", category: "Media" },
    { id: "video", icon: Icons.Video, label: "Video", category: "Media" },
    { id: "button", icon: Icons.Button, label: "Button", category: "Basics" },
    { id: "social", icon: Icons.Social, label: "Social", category: "Basics" },
    { id: "divider", icon: Icons.Divider, label: "Divider", category: "Layout" },
    { id: "columns-1", icon: Icons.Columns, label: "1 Column", category: "Layout" },
    { id: "columns-2", icon: Icons.Columns, label: "2 Columns", category: "Layout" },
  ]

  const categories = ["Basics", "Layout", "Media"]

  const generatedHTML = generateEmailHTML(emailState.elements, emailState.subject)
  const currentHTML = customHTML || generatedHTML

  // Use safe callbacks to prevent undefined returns
  const handleDragStart = useSafeCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useSafeCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    if (over.id === "email-canvas" && active.data.current?.type) {
      const componentType = active.data.current.type.replace(/-(1|2)$/, "")
      const newElement: EmailElement = {
        id: `${componentType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: componentType as EmailElement["type"],
        properties: active.data.current.type.includes("columns")
          ? { columns: active.data.current.type.includes("2") ? 2 : 1 }
          : {},
      }
      const newElements = [...emailState.elements, newElement]
      setEmailState({ ...emailState, elements: newElements })
      setSelectedElement(newElement.id)
      return
    }

    if (active.id !== over.id) {
      const oldIndex = emailState.elements.findIndex((el) => el.id === active.id)
      const newIndex = emailState.elements.findIndex((el) => el.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newElements = arrayMove(emailState.elements, oldIndex, newIndex)
        setEmailState({ ...emailState, elements: newElements })
      }
    }
  }, [emailState, setEmailState, setSelectedElement])

  const updateElement = useSafeCallback((id: string, updates: any) => {
    const newElements = emailState.elements.map((el) =>
      el.id === id ? { ...el, ...updates, properties: { ...el.properties, ...updates } } : el,
    )
    setEmailState({ ...emailState, elements: newElements })

    if (showPreview) {
      const newHTML = generateEmailHTML(newElements, emailState.subject)
      setCustomHTML(newHTML)
    }
  }, [emailState, setEmailState, showPreview, setCustomHTML])

  const deleteElement = useSafeCallback((id: string) => {
    const newElements = emailState.elements.filter((el) => el.id !== id)
    setEmailState({ ...emailState, elements: newElements })
    if (selectedElement === id) {
      setSelectedElement(null)
    }
  }, [emailState, setEmailState, selectedElement, setSelectedElement])

  const updateSubject = useSafeCallback((subject: string) => {
    setEmailState({ ...emailState, subject })
  }, [emailState, setEmailState])

  const loadTemplate = useSafeCallback((elements: EmailElement[], subject: string, loadedCampaignName?: string, loadedPreviewText?: string) => {
    setEmailState({ elements, subject })
    if (loadedCampaignName) {
      setCampaignName(loadedCampaignName)
    }
    if (loadedPreviewText) {
      setPreviewText(loadedPreviewText)
    }
    setSelectedElement(null)
    toast.success("Template loaded successfully.")
  }, [setEmailState, setCampaignName, setPreviewText, setSelectedElement])

  const handleCampaignChange = useSafeCallback((campaignId: string, newCampaignName: string) => {
    setSelectedCampaign(campaignId)
    setCampaignName(newCampaignName)
  }, [setSelectedCampaign, setCampaignName])

  const handleNewTemplate = useSafeCallback(() => {
    setEmailState({
      elements: [],
      subject: "Your Email Subject"
    })
    setSelectedElement(null)
    setCampaignName("My Email Campaign")
    setPreviewText("")
    setCustomHTML("")
    setSelectedCampaign("")
    localStorage.removeItem("dropaphi-autosave")
    toast.success("Started new email template")
  }, [setEmailState, setSelectedElement, setCampaignName, setPreviewText, setCustomHTML, setSelectedCampaign])

  const handleEmailSaved = useSafeCallback((emailData: { id: string; title: string; status: string; templateId?: string }) => {
    toast.success(`Email "${emailData.title}" saved successfully!`)
    if (emailData.templateId) {
      toast.success("Template created successfully!")
    }
    setCampaignName(emailData.title)
  }, [setCampaignName])

  const getBuilderData = useSafeCallback(() => {
    return {
      elements: emailState.elements,
      subject: emailState.subject,
      title: campaignName,
      previewText: previewText,
      html: currentHTML,
      createdAt: new Date().toISOString(),
      version: "1.0"
    }
  }, [emailState.elements, emailState.subject, campaignName, previewText, currentHTML])

  const handleModeChange = useSafeCallback((newMode: "visual" | "code") => {
    if (newMode === "code" && mode === "visual") {
      setCustomHTML(generatedHTML)
    }
    setMode(newMode)
  }, [mode, generatedHTML, setCustomHTML, setMode])

  const handleHTMLChange = useSafeCallback((html: string) => {
    setCustomHTML(html)
  }, [setCustomHTML])

  const renderElement = useSafeCallback((element: EmailElement, inOverlay = false) => {
    const commonProps = {
      id: element.id,
      isSelected: selectedElement === element.id && !inOverlay,
      onSelect: () => !inOverlay && setSelectedElement(element.id),
      onUpdate: (updates: any) => updateElement(element.id, updates),
      properties: element.properties,
    }

    const elementComponent = (() => {
      switch (element.type) {
        case "text":
          return <TextElement key={element.id} {...commonProps} content={element.content} />
        case "image":
          return <ImageElement key={element.id} {...commonProps} />
        case "video":
          return <VideoElement key={element.id} {...commonProps} />
        case "button":
          return <ButtonElement key={element.id} {...commonProps} content={element.content} />
        case "social":
          return <SocialElement key={element.id} {...commonProps} />
        case "divider":
          return <DividerElement key={element.id} {...commonProps} />
        case "columns":
          return <ColumnsElement key={element.id} {...commonProps} />
        default:
          return null
      }
    })()

    if (inOverlay) {
      return elementComponent
    }

    return (
      <SortableElement key={element.id} id={element.id} onDelete={() => deleteElement(element.id)}>
        {elementComponent}
      </SortableElement>
    )
  }, [selectedElement, updateElement, deleteElement, setSelectedElement])

  const activeDragComponent = activeId ? componentLibrary.find((c) => c.id === activeId) : null
  const selectedElementData = selectedElement ? emailState.elements.find((el) => el.id === selectedElement) : null

  // Conditional rendering AFTER all hooks and callbacks
  if (loading) {
    return <Loader/>
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground mb-4">Please log in to access the email builder.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={`h-screen px-4 flex flex-col bg-background ${isMobile ? "mobile-stack text-xs" : ""}`}>
        {/* Mobile Banner */}
        {isMobile && <MobileBanner />}
        
        {/* Header */}
        <header
          className={`${isMobile ? "h-12 px-3 text-xs mt-12" : "h-16 px-6"} border-b border-border bg-card flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`${isMobile ? "w-6 h-6" : "w-8 h-8"} bg-primary rounded-md flex items-center justify-center`}>
                <span className={`text-primary-foreground font-bold ${isMobile ? "text-xs" : "text-sm"}`}>D</span>
              </div>
              <div className={isMobile ? "mobile-hide" : ""}>
              </div>
            </div>
            {!isMobile && <Separator orientation="vertical" className="h-8" />}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className={`px-2 py-1 border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring ${isMobile ? "w-24 text-xs" : "w-48 text-sm"}`}
                placeholder="Campaign Name"
                title="Campaign Name"
              />
              <input
                type="text"
                value={emailState.subject}
                onChange={(e) => updateSubject(e.target.value)}
                className={`px-2 py-1 border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring ${isMobile ? "w-24 text-xs" : "text-sm"}`}
                placeholder="Email Subject"
                title="Email Subject"
              />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex items-center border border-border rounded-md">
              <Button
                variant={mode === "visual" ? "default" : "ghost"}
                size={isMobile ? "sm" : "default"}
                onClick={() => handleModeChange("visual")}
                className={`rounded-r-none ${isMobile ? "h-7 px-2" : ""}`}
              >
                <Icons.Eye className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} mr-1`} />
                {!isMobile && "Visual"}
              </Button>
              <Button
                variant={mode === "code" ? "default" : "ghost"}
                size={isMobile ? "sm" : "default"}
                onClick={() => handleModeChange("code")}
                className={`rounded-l-none ${isMobile ? "h-7 px-2" : ""}`}
              >
                <Icons.Type className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} mr-1`} />
                {!isMobile && "Code"}
              </Button>
            </div>
            {!isMobile && <Separator orientation="vertical" className="h-8" />}
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"} 
              onClick={undo} 
              disabled={!canUndo} 
              title="Undo (Ctrl+Z)"
              className={isMobile ? "h-7 w-7 p-0" : ""}
            >
              <Icons.Undo className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
            </Button>
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"} 
              onClick={redo} 
              disabled={!canRedo} 
              title="Redo (Ctrl+Y)"
              className={isMobile ? "h-7 w-7 p-0" : ""}
            >
              <Icons.Redo className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
            </Button>
            {!isMobile && <Separator orientation="vertical" className="h-8" />}
            <TemplateManager
              currentElements={emailState.elements}
              currentSubject={emailState.subject}
              currentContent={currentHTML}
              selectedCampaign={selectedCampaign}
              campaignName={campaignName}
              currentPreviewText={previewText}
              currentBuilderData={getBuilderData()}
              onLoadTemplate={loadTemplate}
              onNewTemplate={handleNewTemplate}
              onEmailSaved={handleEmailSaved}
              onCampaignChange={handleCampaignChange}
              userId={userId ?? ""}
              newsLetterOwnerId={userId ?? ""} 
              adminEmail={userEmail ?? ""}
              builderMode={mode}
            />
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"} 
              onClick={() => setShowPreview(true)}
              className={isMobile ? "h-7 px-2" : ""}
            >
              <Icons.Play className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} mr-1`} />
              {!isMobile && "Preview"}
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className={`flex-1 flex ${isMobile ? "mobile-stack" : ""}`}>
          {mode === "visual" ? (
            <>
              {/* Left Sidebar - Component Library */}
              <aside
                className={`${isMobile ? "w-full h-24 overflow-x-auto p-2" : "w-64 p-4"} bg-sidebar border-r border-sidebar-border flex flex-col`}
              >
                <div className={`${isMobile ? "mb-2" : "mb-3 border-b border-sidebar-border pb-3"}`}>
                  <h2 className={`font-semibold text-sidebar-foreground ${isMobile ? "text-xs mb-1" : "text-sm mb-3"}`}>Components</h2>
                </div>

                <div className={`flex-1 ${isMobile ? "flex flex-row gap-3 overflow-x-auto" : "space-y-6 overflow-y-auto"}`}>
                  {categories.map((category) => (
                    <div key={category} className={isMobile ? "flex-shrink-0" : ""}>
                      <h3 className={`text-sidebar-foreground/70 uppercase tracking-wider ${isMobile ? "text-[10px] mb-1 font-medium" : "text-xs font-medium mb-3"}`}>
                        {category}
                      </h3>
                      <div className={`${isMobile ? "flex gap-1" : "space-y-2"}`}>
                        {componentLibrary
                          .filter((component) => component.category === category)
                          .map((component) => (
                            <DraggableComponent
                              key={component.id}
                              id={component.id}
                              icon={component.icon}
                              label={component.label}
                              category={component.category}
                              isMobile={isMobile}
                            />
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </aside>

              {/* Center Canvas */}
              <main className={`flex-1 bg-canvas canvas-grid overflow-auto ${isMobile ? "p-2" : "p-8"}`}>
                <div className={`${isMobile ? "w-full" : "max-w-2xl mx-auto"}`}>
                  <SortableContext
                    items={emailState.elements.map((el) => el.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <DroppableCanvas isEmpty={emailState.elements.length === 0}>
                      {emailState.elements.map((element) => renderElement(element))}
                    </DroppableCanvas>
                  </SortableContext>
                </div>
              </main>

              {/* Right Sidebar - Properties Panel */}
              <aside className={`${isMobile ? "w-full p-3" : "w-80 p-4"} bg-properties border-l border-border flex flex-col`}>
                <div className={`${isMobile ? "mb-2" : "mb-3 border-b border-border pb-3"}`}>
                  <h2 className={`font-semibold ${isMobile ? "text-xs mb-0.5" : "text-sm mb-1"}`}>Properties</h2>
                  <p className={`text-muted-foreground ${isMobile ? "text-[10px]" : "text-xs"}`}>
                    {selectedElement ? "Configure selected element" : "Select an element to edit properties"}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <PropertiesPanel
                    selectedElement={selectedElementData || null}
                    onUpdate={(updates) => selectedElement && updateElement(selectedElement, updates)}
                    isMobile={isMobile}
                  />
                </div>
              </aside>
            </>
          ) : (
            /* Code Editor Mode */
            <div className="flex-1">
              <CodeEditor html={currentHTML} onHTMLChange={handleHTMLChange} onPreview={() => setShowPreview(true)} />
            </div>
          )}
        </div>

        <DragOverlay>
          {activeDragComponent ? (
            <div className={`p-2 bg-sidebar-accent border border-sidebar-border rounded-md shadow-lg ${isMobile ? "text-xs" : "text-sm"}`}>
              <div className="flex items-center gap-2">
                <activeDragComponent.icon className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} text-sidebar-primary`} />
                <span className="text-sidebar-foreground">{activeDragComponent.label}</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>

        {/* Email Preview Modal */}
        <EmailPreview
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          html={currentHTML}
          subject={emailState.subject}
        />
      </div>
    </DndContext>
  )
}



// "use client"

// import { useState, useEffect, useCallback } from "react"
// import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, closestCenter } from "@dnd-kit/core"
// import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
// import { Button } from "@/components/ui/button"
// import { Separator } from "@/components/ui/separator"
// import { useHistory } from "@/lib/utils/hooks/mail/use-history"
// import { Icons } from "@/lib/utils/icons"
// import { generateEmailHTML } from "./_component/code-editor/html-generator"
// import { toast } from "sonner"
// import { TextElement } from "./_component/email-elements/text-element"
// import { ImageElement } from "./_component/email-elements/image-element"
// import { VideoElement } from "./_component/email-elements/video-element"
// import { ButtonElement } from "./_component/email-elements/button-element"
// import { SocialElement } from "./_component/email-elements/social-element"
// import { DividerElement } from "./_component/email-elements/divider-element"
// import { ColumnsElement } from "./_component/email-elements/columns-element"
// import { SortableElement } from "./_component/drag-drop/sortable-element"
// import { TemplateManager } from "./_component/templates/template-manager"
// import { DraggableComponent } from "./_component/drag-drop/draggable-component"
// import { DroppableCanvas } from "./_component/drag-drop/droppable-canvas"
// import { PropertiesPanel } from "./_component/properties/properties-panel"
// import { CodeEditor } from "./_component/code-editor/code-editor"
// import { EmailPreview } from "./_component/preview/email-preview"
// import { useAuthUser } from "@/lib/auth/getClientAuth"
// import Loader from "@/components/_component/Loader"

// interface EmailElement {
//   id: string
//   type: "text" | "image" | "video" | "button" | "social" | "divider" | "columns"
//   content?: string
//   properties?: Record<string, any>
// }

// interface EmailState {
//   elements: EmailElement[]
//   subject: string
// }

// // Safe hook wrapper with proper typing
// function useSafeHistory<T>(initialState: T) {
//   try {
//     const history = useHistory<T>(initialState);
//     return {
//       state: history?.state || initialState,
//       set: history?.set || ((() => {}) as any),
//       undo: history?.undo || (() => {}),
//       redo: history?.redo || (() => {}),
//       canUndo: history?.canUndo || false,
//       canRedo: history?.canRedo || false,
//     };
//   } catch (error) {
//     console.error('useHistory error:', error);
//     return {
//       state: initialState,
//       set: (() => {}) as any,
//       undo: () => {},
//       redo: () => {},
//       canUndo: false,
//       canRedo: false,
//     };
//   }
// }

// // Safe useCallback wrapper
// function useSafeCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]) {
//   try {
//     return useCallback(callback, deps);
//   } catch (error) {
//     console.error('useCallback error:', error);
//     return callback;
//   }
// }

// export default function MailStudio() {
//   // All hooks must be declared unconditionally at the top
//   const {
//     state: emailState,
//     set: setEmailState,
//     undo,
//     redo,
//     canUndo,
//     canRedo,
//   } = useSafeHistory<EmailState>({
//     elements: [],
//     subject: "Your Email Subject",
//   })

//   const [selectedElement, setSelectedElement] = useState<string | null>(null)
//   const [mode, setMode] = useState<"visual" | "code">("visual")
//   const [activeId, setActiveId] = useState<string | null>(null)
//   const [showPreview, setShowPreview] = useState(false)
//   const [customHTML, setCustomHTML] = useState("")
//   const [isMobile, setIsMobile] = useState(false)
//   const [campaignName, setCampaignName] = useState("My Email Campaign") 
//   const [previewText, setPreviewText] = useState("") 
//   const [selectedCampaign, setSelectedCampaign] = useState<string>("")
  
//   // Auth hook - must be called unconditionally
//   const { user, loading } = useAuthUser();

//   // Check if device is mobile
//   useEffect(() => {
//     const checkMobile = () => {
//       const mobile = window.innerWidth < 768
//       setIsMobile(mobile)
      
//       const viewport = document.querySelector('meta[name="viewport"]')
//       if (window.innerWidth < 768) {
//         document.body.style.zoom = "0.8"
//         if (viewport) {
//           viewport.setAttribute('content', 'width=device-width, initial-scale=0.8, maximum-scale=1.0, user-scalable=no')
//         }
//       } else {
//         document.body.style.zoom = "1"
//         if (viewport) {
//           viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes')
//         }
//       }
//     }

//     checkMobile()
//     window.addEventListener("resize", checkMobile)
//     return () => {
//       window.removeEventListener("resize", checkMobile)
//       document.body.style.zoom = "1"
//     }
//   }, [])

//   // Auto-save functionality
//   useEffect(() => {
//     const autoSave = setTimeout(() => {
//       if (emailState.elements.length > 0) {
//         const autoSaveData = {
//           ...emailState,
//           campaignName,
//           previewText,
//           selectedCampaign
//         }
//         localStorage.setItem("dropaphi-autosave", JSON.stringify(autoSaveData))
//       }
//     }, 2000)

//     return () => clearTimeout(autoSave)
//   }, [emailState, campaignName, previewText, selectedCampaign])

//   // Load auto-saved data on mount
//   useEffect(() => {
//     const autoSaved = localStorage.getItem("dropaphi-autosave")
//     if (autoSaved) {
//       try {
//         const savedState = JSON.parse(autoSaved)
//         setEmailState({
//           elements: savedState.elements || [],
//           subject: savedState.subject || "Your Email Subject"
//         })
//         setCampaignName(savedState.campaignName || "My Email Campaign")
//         setPreviewText(savedState.previewText || "")
//         setSelectedCampaign(savedState.selectedCampaign || "")
//         toast.success("Auto-saved data restored. Your previous work has been restored.")
//       } catch (error) {
//         console.error("Failed to restore auto-saved data:", error)
//       }
//     }
//   }, [setEmailState])

//   // Keyboard shortcuts
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
//         e.preventDefault()
//         undo()
//       } else if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
//         e.preventDefault()
//         redo()
//       }
//     }

//     window.addEventListener("keydown", handleKeyDown)
//     return () => window.removeEventListener("keydown", handleKeyDown)
//   }, [undo, redo])

//   // Now declare all variables and callbacks after hooks
//   const userId = user?.userId
//   const userEmail = user?.email

//   const componentLibrary = [
//     { id: "text", icon: Icons.Type, label: "Text", category: "Basics" },
//     { id: "image", icon: Icons.Image, label: "Image", category: "Media" },
//     { id: "video", icon: Icons.Video, label: "Video", category: "Media" },
//     { id: "button", icon: Icons.Button, label: "Button", category: "Basics" },
//     { id: "social", icon: Icons.Social, label: "Social", category: "Basics" },
//     { id: "divider", icon: Icons.Divider, label: "Divider", category: "Layout" },
//     { id: "columns-1", icon: Icons.Columns, label: "1 Column", category: "Layout" },
//     { id: "columns-2", icon: Icons.Columns, label: "2 Columns", category: "Layout" },
//   ]

//   const categories = ["Basics", "Layout", "Media"]

//   const generatedHTML = generateEmailHTML(emailState.elements, emailState.subject)
//   const currentHTML = customHTML || generatedHTML

//   // Use safe callbacks to prevent undefined returns
//   const handleDragStart = useSafeCallback((event: DragStartEvent) => {
//     setActiveId(event.active.id as string)
//   }, [])

//   const handleDragEnd = useSafeCallback((event: DragEndEvent) => {
//     const { active, over } = event
//     setActiveId(null)

//     if (!over) return

//     if (over.id === "email-canvas" && active.data.current?.type) {
//       const componentType = active.data.current.type.replace(/-(1|2)$/, "")
//       const newElement: EmailElement = {
//         id: `${componentType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
//         type: componentType as EmailElement["type"],
//         properties: active.data.current.type.includes("columns")
//           ? { columns: active.data.current.type.includes("2") ? 2 : 1 }
//           : {},
//       }
//       const newElements = [...emailState.elements, newElement]
//       setEmailState({ ...emailState, elements: newElements })
//       setSelectedElement(newElement.id)
//       return
//     }

//     if (active.id !== over.id) {
//       const oldIndex = emailState.elements.findIndex((el) => el.id === active.id)
//       const newIndex = emailState.elements.findIndex((el) => el.id === over.id)

//       if (oldIndex !== -1 && newIndex !== -1) {
//         const newElements = arrayMove(emailState.elements, oldIndex, newIndex)
//         setEmailState({ ...emailState, elements: newElements })
//       }
//     }
//   }, [emailState, setEmailState, setSelectedElement])

//   const updateElement = useSafeCallback((id: string, updates: any) => {
//     const newElements = emailState.elements.map((el) =>
//       el.id === id ? { ...el, ...updates, properties: { ...el.properties, ...updates } } : el,
//     )
//     setEmailState({ ...emailState, elements: newElements })

//     if (showPreview) {
//       const newHTML = generateEmailHTML(newElements, emailState.subject)
//       setCustomHTML(newHTML)
//     }
//   }, [emailState, setEmailState, showPreview, setCustomHTML])

//   const deleteElement = useSafeCallback((id: string) => {
//     const newElements = emailState.elements.filter((el) => el.id !== id)
//     setEmailState({ ...emailState, elements: newElements })
//     if (selectedElement === id) {
//       setSelectedElement(null)
//     }
//   }, [emailState, setEmailState, selectedElement, setSelectedElement])

//   const updateSubject = useSafeCallback((subject: string) => {
//     setEmailState({ ...emailState, subject })
//   }, [emailState, setEmailState])

//   const loadTemplate = useSafeCallback((elements: EmailElement[], subject: string, loadedCampaignName?: string, loadedPreviewText?: string) => {
//     setEmailState({ elements, subject })
//     if (loadedCampaignName) {
//       setCampaignName(loadedCampaignName)
//     }
//     if (loadedPreviewText) {
//       setPreviewText(loadedPreviewText)
//     }
//     setSelectedElement(null)
//     toast.success("Template loaded successfully.")
//   }, [setEmailState, setCampaignName, setPreviewText, setSelectedElement])

//   const handleCampaignChange = useSafeCallback((campaignId: string, newCampaignName: string) => {
//     setSelectedCampaign(campaignId)
//     setCampaignName(newCampaignName)
//   }, [setSelectedCampaign, setCampaignName])

//   const handleNewTemplate = useSafeCallback(() => {
//     setEmailState({
//       elements: [],
//       subject: "Your Email Subject"
//     })
//     setSelectedElement(null)
//     setCampaignName("My Email Campaign")
//     setPreviewText("")
//     setCustomHTML("")
//     setSelectedCampaign("")
//     localStorage.removeItem("dropaphi-autosave")
//     toast.success("Started new email template")
//   }, [setEmailState, setSelectedElement, setCampaignName, setPreviewText, setCustomHTML, setSelectedCampaign])

//   const handleEmailSaved = useSafeCallback((emailData: { id: string; title: string; status: string; templateId?: string }) => {
//     toast.success(`Email "${emailData.title}" saved successfully!`)
//     if (emailData.templateId) {
//       toast.success("Template created successfully!")
//     }
//     setCampaignName(emailData.title)
//   }, [setCampaignName])

//   const getBuilderData = useSafeCallback(() => {
//     return {
//       elements: emailState.elements,
//       subject: emailState.subject,
//       title: campaignName,
//       previewText: previewText,
//       html: currentHTML,
//       createdAt: new Date().toISOString(),
//       version: "1.0"
//     }
//   }, [emailState.elements, emailState.subject, campaignName, previewText, currentHTML])

//   const handleModeChange = useSafeCallback((newMode: "visual" | "code") => {
//     if (newMode === "code" && mode === "visual") {
//       setCustomHTML(generatedHTML)
//     }
//     setMode(newMode)
//   }, [mode, generatedHTML, setCustomHTML, setMode])

//   const handleHTMLChange = useSafeCallback((html: string) => {
//     setCustomHTML(html)
//   }, [setCustomHTML])

//   const renderElement = useSafeCallback((element: EmailElement, inOverlay = false) => {
//     const commonProps = {
//       id: element.id,
//       isSelected: selectedElement === element.id && !inOverlay,
//       onSelect: () => !inOverlay && setSelectedElement(element.id),
//       onUpdate: (updates: any) => updateElement(element.id, updates),
//       properties: element.properties,
//     }

//     const elementComponent = (() => {
//       switch (element.type) {
//         case "text":
//           return <TextElement key={element.id} {...commonProps} content={element.content} />
//         case "image":
//           return <ImageElement key={element.id} {...commonProps} />
//         case "video":
//           return <VideoElement key={element.id} {...commonProps} />
//         case "button":
//           return <ButtonElement key={element.id} {...commonProps} content={element.content} />
//         case "social":
//           return <SocialElement key={element.id} {...commonProps} />
//         case "divider":
//           return <DividerElement key={element.id} {...commonProps} />
//         case "columns":
//           return <ColumnsElement key={element.id} {...commonProps} />
//         default:
//           return null
//       }
//     })()

//     if (inOverlay) {
//       return elementComponent
//     }

//     return (
//       <SortableElement key={element.id} id={element.id} onDelete={() => deleteElement(element.id)}>
//         {elementComponent}
//       </SortableElement>
//     )
//   }, [selectedElement, updateElement, deleteElement, setSelectedElement])

//   const activeDragComponent = activeId ? componentLibrary.find((c) => c.id === activeId) : null
//   const selectedElementData = selectedElement ? emailState.elements.find((el) => el.id === selectedElement) : null

//   // Conditional rendering AFTER all hooks and callbacks
//   if (loading) {
//     return <Loader/>
//   }

//   if (!user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-background">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
//           <p className="text-muted-foreground mb-4">Please log in to access the email builder.</p>
//           <Button onClick={() => window.location.reload()}>Retry</Button>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
//       <div className={`h-screen px-4 flex flex-col bg-background ${isMobile ? "mobile-stack text-xs" : ""}`}>
//         {/* Header */}
//         <header
//           className={`${isMobile ? "h-12 px-3 text-xs" : "h-16 px-6"} border-b border-border bg-card flex items-center justify-between`}
//         >
//           <div className="flex items-center gap-3">
//             <div className="flex items-center gap-2">
//               <div className={`${isMobile ? "w-6 h-6" : "w-8 h-8"} bg-primary rounded-md flex items-center justify-center`}>
//                 <span className={`text-primary-foreground font-bold ${isMobile ? "text-xs" : "text-sm"}`}>D</span>
//               </div>
//               <div className={isMobile ? "mobile-hide" : ""}>
//               </div>
//             </div>
//             {!isMobile && <Separator orientation="vertical" className="h-8" />}
//             <div className="flex items-center gap-2">
//               <input
//                 type="text"
//                 value={campaignName}
//                 onChange={(e) => setCampaignName(e.target.value)}
//                 className={`px-2 py-1 border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring ${isMobile ? "w-24 text-xs" : "w-48 text-sm"}`}
//                 placeholder="Campaign Name"
//                 title="Campaign Name"
//               />
//               <input
//                 type="text"
//                 value={emailState.subject}
//                 onChange={(e) => updateSubject(e.target.value)}
//                 className={`px-2 py-1 border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring ${isMobile ? "w-24 text-xs" : "text-sm"}`}
//                 placeholder="Email Subject"
//                 title="Email Subject"
//               />
//             </div>
//           </div>

//           <div className="flex items-center gap-1">
//             <div className="flex items-center border border-border rounded-md">
//               <Button
//                 variant={mode === "visual" ? "default" : "ghost"}
//                 size={isMobile ? "sm" : "default"}
//                 onClick={() => handleModeChange("visual")}
//                 className={`rounded-r-none ${isMobile ? "h-7 px-2" : ""}`}
//               >
//                 <Icons.Eye className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} mr-1`} />
//                 {!isMobile && "Visual"}
//               </Button>
//               <Button
//                 variant={mode === "code" ? "default" : "ghost"}
//                 size={isMobile ? "sm" : "default"}
//                 onClick={() => handleModeChange("code")}
//                 className={`rounded-l-none ${isMobile ? "h-7 px-2" : ""}`}
//               >
//                 <Icons.Type className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} mr-1`} />
//                 {!isMobile && "Code"}
//               </Button>
//             </div>
//             {!isMobile && <Separator orientation="vertical" className="h-8" />}
//             <Button 
//               variant="outline" 
//               size={isMobile ? "sm" : "default"} 
//               onClick={undo} 
//               disabled={!canUndo} 
//               title="Undo (Ctrl+Z)"
//               className={isMobile ? "h-7 w-7 p-0" : ""}
//             >
//               <Icons.Undo className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
//             </Button>
//             <Button 
//               variant="outline" 
//               size={isMobile ? "sm" : "default"} 
//               onClick={redo} 
//               disabled={!canRedo} 
//               title="Redo (Ctrl+Y)"
//               className={isMobile ? "h-7 w-7 p-0" : ""}
//             >
//               <Icons.Redo className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
//             </Button>
//             {!isMobile && <Separator orientation="vertical" className="h-8" />}
//             <TemplateManager
//               currentElements={emailState.elements}
//               currentSubject={emailState.subject}
//               currentContent={currentHTML}
//               selectedCampaign={selectedCampaign}
//               campaignName={campaignName}
//               currentPreviewText={previewText}
//               currentBuilderData={getBuilderData()}
//               onLoadTemplate={loadTemplate}
//               onNewTemplate={handleNewTemplate}
//               onEmailSaved={handleEmailSaved}
//               onCampaignChange={handleCampaignChange}
//               userId={userId ?? ""}
//               newsLetterOwnerId={userId ?? ""} 
//               adminEmail={userEmail ?? ""}
//               builderMode={mode}
//             />
//             <Button 
//               variant="outline" 
//               size={isMobile ? "sm" : "default"} 
//               onClick={() => setShowPreview(true)}
//               className={isMobile ? "h-7 px-2" : ""}
//             >
//               <Icons.Play className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} mr-1`} />
//               {!isMobile && "Preview"}
//             </Button>
//           </div>
//         </header>

//         {/* Main Content */}
//         <div className={`flex-1 flex ${isMobile ? "mobile-stack" : ""}`}>
//           {mode === "visual" ? (
//             <>
//               {/* Left Sidebar - Component Library */}
//               <aside
//                 className={`${isMobile ? "w-full h-24 overflow-x-auto p-2" : "w-64 p-4"} bg-sidebar border-r border-sidebar-border flex flex-col`}
//               >
//                 <div className={`${isMobile ? "mb-2" : "mb-3 border-b border-sidebar-border pb-3"}`}>
//                   <h2 className={`font-semibold text-sidebar-foreground ${isMobile ? "text-xs mb-1" : "text-sm mb-3"}`}>Components</h2>
//                 </div>

//                 <div className={`flex-1 ${isMobile ? "flex flex-row gap-3 overflow-x-auto" : "space-y-6 overflow-y-auto"}`}>
//                   {categories.map((category) => (
//                     <div key={category} className={isMobile ? "flex-shrink-0" : ""}>
//                       <h3 className={`text-sidebar-foreground/70 uppercase tracking-wider ${isMobile ? "text-[10px] mb-1 font-medium" : "text-xs font-medium mb-3"}`}>
//                         {category}
//                       </h3>
//                       <div className={`${isMobile ? "flex gap-1" : "space-y-2"}`}>
//                         {componentLibrary
//                           .filter((component) => component.category === category)
//                           .map((component) => (
//                             <DraggableComponent
//                               key={component.id}
//                               id={component.id}
//                               icon={component.icon}
//                               label={component.label}
//                               category={component.category}
//                               isMobile={isMobile}
//                             />
//                           ))}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </aside>

//               {/* Center Canvas */}
//               <main className={`flex-1 bg-canvas canvas-grid overflow-auto ${isMobile ? "p-2" : "p-8"}`}>
//                 <div className={`${isMobile ? "w-full" : "max-w-2xl mx-auto"}`}>
//                   <SortableContext
//                     items={emailState.elements.map((el) => el.id)}
//                     strategy={verticalListSortingStrategy}
//                   >
//                     <DroppableCanvas isEmpty={emailState.elements.length === 0}>
//                       {emailState.elements.map((element) => renderElement(element))}
//                     </DroppableCanvas>
//                   </SortableContext>
//                 </div>
//               </main>

//               {/* Right Sidebar - Properties Panel */}
//               <aside className={`${isMobile ? "w-full p-3" : "w-80 p-4"} bg-properties border-l border-border flex flex-col`}>
//                 <div className={`${isMobile ? "mb-2" : "mb-3 border-b border-border pb-3"}`}>
//                   <h2 className={`font-semibold ${isMobile ? "text-xs mb-0.5" : "text-sm mb-1"}`}>Properties</h2>
//                   <p className={`text-muted-foreground ${isMobile ? "text-[10px]" : "text-xs"}`}>
//                     {selectedElement ? "Configure selected element" : "Select an element to edit properties"}
//                   </p>
//                 </div>

//                 <div className="flex-1 overflow-y-auto">
//                   <PropertiesPanel
//                     selectedElement={selectedElementData || null}
//                     onUpdate={(updates) => selectedElement && updateElement(selectedElement, updates)}
//                     isMobile={isMobile}
//                   />
//                 </div>
//               </aside>
//             </>
//           ) : (
//             /* Code Editor Mode */
//             <div className="flex-1">
//               <CodeEditor html={currentHTML} onHTMLChange={handleHTMLChange} onPreview={() => setShowPreview(true)} />
//             </div>
//           )}
//         </div>

//         <DragOverlay>
//           {activeDragComponent ? (
//             <div className={`p-2 bg-sidebar-accent border border-sidebar-border rounded-md shadow-lg ${isMobile ? "text-xs" : "text-sm"}`}>
//               <div className="flex items-center gap-2">
//                 <activeDragComponent.icon className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} text-sidebar-primary`} />
//                 <span className="text-sidebar-foreground">{activeDragComponent.label}</span>
//               </div>
//             </div>
//           ) : null}
//         </DragOverlay>

//         {/* Email Preview Modal */}
//         <EmailPreview
//           isOpen={showPreview}
//           onClose={() => setShowPreview(false)}
//           html={currentHTML}
//           subject={emailState.subject}
//         />
//       </div>
//     </DndContext>
//   )
// }
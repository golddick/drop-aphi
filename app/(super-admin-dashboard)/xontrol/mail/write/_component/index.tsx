"use client"

import { useState, useEffect } from "react"
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useHistory } from "@/lib/utils/hooks/mail/use-history"
import { Icons } from "@/lib/utils/icons"
import { generateEmailHTML } from "./code-editor/html-generator"
import { toast } from "sonner"
import { TextElement } from "./email-elements/text-element"
import { ImageElement } from "./email-elements/image-element"
import { VideoElement } from "./email-elements/video-element"
import { ButtonElement } from "./email-elements/button-element"
import { SocialElement } from "./email-elements/social-element"
import { DividerElement } from "./email-elements/divider-element"
import { ColumnsElement } from "./email-elements/columns-element"
import { LogoElement } from "./email-elements/logo-element"
import { SortableElement } from "./drag-drop/sortable-element"
import { TemplateManager } from "./templates/template-manager"
import { ResponsivePreview } from "./responsive/responsive-preview"
import { DraggableComponent } from "./drag-drop/draggable-component"
import { DroppableCanvas } from "./drag-drop/droppable-canvas"
import { PropertiesPanel } from "./properties/properties-panel"
import { CodeEditor } from "./code-editor/code-editor"
import { EmailPreview } from "@/modules/mail-studio/_component/preview/email-preview"
import { SendNewsletterForm } from "./send-newsletter-form"


interface EmailElement {
  id: string
  type: "text" | "image" | "video" | "button" | "social" | "divider" | "columns" | "logo"
  content?: string
  properties?: Record<string, any>
}

interface EmailState {
  elements: EmailElement[]
  subject: string
  bodyBackgroundColor?: string
}

export default function DropAphiMailStudio() {
  const {
    state: emailState,
    set: setEmailState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<EmailState>({
    elements: [],
    subject: "Your Email Subject",
    bodyBackgroundColor: "#ffffff",
  })

  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [mode, setMode] = useState<"visual" | "code">("visual")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [customHTML, setCustomHTML] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const componentLibrary = [
    { id: "text", icon: Icons.Type, label: "Text", category: "Basics" },
    { id: "image", icon: Icons.Image, label: "Image", category: "Media" },
    { id: "video", icon: Icons.Video, label: "Video", category: "Media" },
    { id: "button", icon: Icons.Button, label: "Button", category: "Basics" },
    { id: "social", icon: Icons.Social, label: "Social", category: "Basics" },
    { id: "divider", icon: Icons.Divider, label: "Divider", category: "Layout" },
    { id: "columns-1", icon: Icons.Columns, label: "1 Column", category: "Layout" },
    { id: "columns-2", icon: Icons.Columns, label: "2 Columns", category: "Layout" },
    { id: "logo", icon: Icons.Image, label: "Logo", category: "Media" },
  ]

  const categories = ["Basics", "Layout", "Media"]

  const generatedHTML = generateEmailHTML(emailState.elements, emailState.subject)
  const currentHTML = customHTML || generatedHTML


  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (emailState.elements.length > 0) {
        localStorage.setItem("dropaphi-autosave", JSON.stringify(emailState))
      }
    }, 2000)

    return () => clearTimeout(autoSave)
  }, [emailState])

  // Load auto-saved data on mount
  useEffect(() => {
    const autoSaved = localStorage.getItem("dropaphi-autosave")
    if (autoSaved) {
      try {
        const savedState = JSON.parse(autoSaved)
        setEmailState(savedState)
        toast.success("Your previous work has been restored.")
      } catch (error) {
        console.error("Failed to restore auto-saved data:", error)
      }
    }
  }, [setEmailState])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
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
  }

  const updateElement = (id: string, updates: any) => {
    const newElements = emailState.elements.map((el) =>
      el.id === id ? { ...el, ...updates, properties: { ...el.properties, ...updates } } : el,
    )
    setEmailState({ ...emailState, elements: newElements })

    // Real-time preview update
    if (showPreview) {
      const newHTML = generateEmailHTML(newElements, emailState.subject)
      setCustomHTML(newHTML)
    }
  }

  const deleteElement = (id: string) => {
    const newElements = emailState.elements.filter((el) => el.id !== id)
    setEmailState({ ...emailState, elements: newElements })
    if (selectedElement === id) {
      setSelectedElement(null)
    }
  }

  const updateSubject = (subject: string) => {
    setEmailState({ ...emailState, subject })
  }

  const loadTemplate = (elements: EmailElement[], subject: string) => {
    setEmailState({ elements, subject })
    setSelectedElement(null)
    toast.success("The template has been loaded successfully.")
  }


  const renderElement = (element: EmailElement, inOverlay = false) => {
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
        case "logo":
          return <LogoElement key={element.id} {...commonProps} />
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
  }

  const activeDragComponent = activeId ? componentLibrary.find((c) => c.id === activeId) : null
  const selectedElementData = selectedElement ? emailState.elements.find((el) => el.id === selectedElement) : null

  const handleModeChange = (newMode: "visual" | "code") => {
    if (newMode === "code" && mode === "visual") {
      setCustomHTML(generatedHTML)
    }
    setMode(newMode)
  }

  const handleHTMLChange = (html: string) => {
    setCustomHTML(html)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        redo()
      } else if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        setShowSendDialog(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo])

  return (
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={`h-screen flex flex-col bg-background ${isMobile ? "mobile-stack" : ""}`}>
        {/* Header */}
        <header
          className={`h-16 border-b border-border bg-card flex items-center justify-between px-6 ${isMobile ? "px-4" : ""}`}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">D</span>
              </div>
              <div className={isMobile ? "mobile-hide" : ""}>
                <h1 className="text-lg font-semibold text-balance">DropAphi Mail Studio</h1>
                <p className="text-xs text-muted-foreground">Professional Email Builder</p>
              </div>
            </div>
            {!isMobile && <Separator orientation="vertical" className="h-8" />}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={emailState.subject}
                onChange={(e) => updateSubject(e.target.value)}
                className={`px-3 py-1 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring ${isMobile ? "w-32" : ""}`}
                placeholder="Email Subject"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border rounded-md">
              <Button
                variant={mode === "visual" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModeChange("visual")}
                className="rounded-r-none"
              >
                <Icons.Eye className="w-4 h-4 mr-1" />
                {!isMobile && "Visual"}
              </Button>
              <Button
                variant={mode === "code" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModeChange("code")}
                className="rounded-l-none"
              >
                <Icons.Type className="w-4 h-4 mr-1" />
                {!isMobile && "Code"}
              </Button>
            </div>
            {!isMobile && <Separator orientation="vertical" className="h-8" />}
            <Button variant="outline" size="sm" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
              <Icons.Undo className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
              <Icons.Redo className="w-4 h-4" />
            </Button>
            {!isMobile && <Separator orientation="vertical" className="h-8" />}
            <TemplateManager
              currentElements={emailState.elements}
              currentSubject={emailState.subject}
              onLoadTemplate={loadTemplate}
              onSendNewsletter={() => setShowSendDialog(true)}
              builderMode={mode}
            />
            <ResponsivePreview html={currentHTML} subject={emailState.subject} />
            <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
              <Icons.Play className="w-4 h-4 mr-1" />
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
                className={`${isMobile ? "w-full h-32 overflow-x-auto" : "w-64"} bg-sidebar border-r border-sidebar-border flex flex-col`}
              >
                <div className="p-4 border-b border-sidebar-border">
                  <h2 className="text-sm font-semibold text-sidebar-foreground mb-3">Components</h2>
                </div>

                <div className={`flex-1 overflow-y-auto p-4 ${isMobile ? "flex flex-row gap-4" : "space-y-6"}`}>
                  {categories.map((category) => (
                    <div key={category} className={isMobile ? "flex-shrink-0" : ""}>
                      <h3 className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider mb-3">
                        {category}
                      </h3>
                      <div className={`${isMobile ? "flex gap-2" : "space-y-2"}`}>
                        {componentLibrary
                          .filter((component) => component.category === category)
                          .map((component) => (
                            <DraggableComponent
                              key={component.id}
                              id={component.id}
                              icon={component.icon}
                              label={component.label}
                              category={component.category}
                            />
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </aside>

              {/* Center Canvas */}
              <main
                className={`flex-1 bg-canvas canvas-grid p-8 overflow-auto ${isMobile ? "p-4" : ""}`}
                style={{ backgroundColor: emailState.bodyBackgroundColor || "#ffffff" }}
              >
                <div className={`max-w-2xl mx-auto ${isMobile ? "max-w-full" : ""}`}>
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
              <aside className={`${isMobile ? "w-full" : "w-80"} bg-properties border-l border-border flex flex-col`}>
                <div className="p-4 border-b border-border">
                  <h2 className="text-sm font-semibold mb-1">Properties</h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedElement ? "Configure selected element" : "Select an element to edit properties"}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <PropertiesPanel
                    selectedElement={selectedElementData || null}
                    onUpdate={(updates) => selectedElement && updateElement(selectedElement, updates)}
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
            <div className="p-3 bg-sidebar-accent border border-sidebar-border rounded-md shadow-lg">
              <div className="flex items-center gap-3">
                <activeDragComponent.icon className="w-4 h-4 text-sidebar-primary" />
                <span className="text-sm text-sidebar-foreground">{activeDragComponent.label}</span>
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

        {/* Send Newsletter Dialog */}
        {showSendDialog && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg border shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Send Newsletter</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSendDialog(false)}
                  >
                    <Icons.X className="w-4 h-4" />
                  </Button>
                </div>
                
                <SendNewsletterForm
                  emailContent={currentHTML}
                  emailSubject={emailState.subject}
                  elements={emailState.elements}
                  title={emailState.subject}
                  builderData={{
                    bodyBackgroundColor: emailState.bodyBackgroundColor,
                    mode: mode
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  )
}


















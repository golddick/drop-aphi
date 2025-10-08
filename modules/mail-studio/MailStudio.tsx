// // "use client"

// // import { useState, useEffect } from "react"
// // import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, closestCenter } from "@dnd-kit/core"
// // import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
// // import { Button } from "@/components/ui/button"
// // import { Separator } from "@/components/ui/separator"
// // import { useHistory } from "@/lib/utils/hooks/mail/use-history"
// // import { Icons } from "@/lib/utils/icons"
// // import { generateEmailHTML } from "./_component/code-editor/html-generator"
// // import { toast } from "sonner"
// // import { TextElement } from "./_component/email-elements/text-element"
// // import { ImageElement } from "./_component/email-elements/image-element"
// // import { VideoElement } from "./_component/email-elements/video-element"
// // import { ButtonElement } from "./_component/email-elements/button-element"
// // import { SocialElement } from "./_component/email-elements/social-element"
// // import { DividerElement } from "./_component/email-elements/divider-element"
// // import { ColumnsElement } from "./_component/email-elements/columns-element"
// // import { SortableElement } from "./_component/drag-drop/sortable-element"
// // import { TemplateManager } from "./_component/templates/template-manager"
// // import { ResponsivePreview } from "./_component/responsive/responsive-preview"
// // import { DraggableComponent } from "./_component/drag-drop/draggable-component"
// // import { DroppableCanvas } from "./_component/drag-drop/droppable-canvas"
// // import { PropertiesPanel } from "./_component/properties/properties-panel"
// // import { CodeEditor } from "./_component/code-editor/code-editor"
// // import { EmailPreview } from "./_component/preview/email-preview"
// // import { getServerAuth } from "@/lib/auth/getauth"
// // import { useAuthUser } from "@/lib/auth/getClientAuth"

// // interface EmailElement {
// //   id: string
// //   type: "text" | "image" | "video" | "button" | "social" | "divider" | "columns"
// //   content?: string
// //   properties?: Record<string, any>
// // }

// // interface EmailState {
// //   elements: EmailElement[]
// //   subject: string
// // }

// // export default function MailStudio() {
// //   const {
// //     state: emailState,
// //     set: setEmailState,
// //     undo,
// //     redo,
// //     canUndo,
// //     canRedo,
// //   } = useHistory<EmailState>({
// //     elements: [],
// //     subject: "Your Email Subject",
// //   })

// //   const [selectedElement, setSelectedElement] = useState<string | null>(null)
// //   const [mode, setMode] = useState<"visual" | "code">("visual")
// //   const [activeId, setActiveId] = useState<string | null>(null)
// //   const [showPreview, setShowPreview] = useState(false)
// //   const [customHTML, setCustomHTML] = useState("")
// //   const [isMobile, setIsMobile] = useState(false)
// //   const [campaignName, setCampaignName] = useState("My Email Campaign") 
// //   const [previewText, setPreviewText] = useState("") 
// //   const [selectedCampaign, setSelectedCampaign] = useState<string>("") // Added selected campaign state
// //   const { user } = useAuthUser();

// //   const userId = user?.userId
// //   const userEmail = user?.email

// //   const componentLibrary = [
// //     { id: "text", icon: Icons.Type, label: "Text", category: "Basics" },
// //     { id: "image", icon: Icons.Image, label: "Image", category: "Media" },
// //     { id: "video", icon: Icons.Video, label: "Video", category: "Media" },
// //     { id: "button", icon: Icons.Button, label: "Button", category: "Basics" },
// //     { id: "social", icon: Icons.Social, label: "Social", category: "Basics" },
// //     { id: "divider", icon: Icons.Divider, label: "Divider", category: "Layout" },
// //     { id: "columns-1", icon: Icons.Columns, label: "1 Column", category: "Layout" },
// //     { id: "columns-2", icon: Icons.Columns, label: "2 Columns", category: "Layout" },
// //   ]

// //   const categories = ["Basics", "Layout", "Media"]

// //   const generatedHTML = generateEmailHTML(emailState.elements, emailState.subject)
// //   const currentHTML = customHTML || generatedHTML

// //   // Auto-save functionality
// //   useEffect(() => {
// //     const autoSave = setTimeout(() => {
// //       if (emailState.elements.length > 0) {
// //         const autoSaveData = {
// //           ...emailState,
// //           campaignName,
// //           previewText,
// //           selectedCampaign
// //         }
// //         localStorage.setItem("dropaphi-autosave", JSON.stringify(autoSaveData))
// //       }
// //     }, 2000)

// //     return () => clearTimeout(autoSave)
// //   }, [emailState, campaignName, previewText, selectedCampaign])

// //   // Load auto-saved data on mount
// //   useEffect(() => {
// //     const autoSaved = localStorage.getItem("dropaphi-autosave")
// //     if (autoSaved) {
// //       try {
// //         const savedState = JSON.parse(autoSaved)
// //         setEmailState({
// //           elements: savedState.elements || [],
// //           subject: savedState.subject || "Your Email Subject"
// //         })
// //         setCampaignName(savedState.campaignName || "My Email Campaign")
// //         setPreviewText(savedState.previewText || "")
// //         setSelectedCampaign(savedState.selectedCampaign || "")
// //         toast.success("Auto-saved data restored. Your previous work has been restored.")
// //       } catch (error) {
// //         console.error("Failed to restore auto-saved data:", error)
// //       }
// //     }
// //   }, [setEmailState])

// //   useEffect(() => {
// //     const checkMobile = () => {
// //       setIsMobile(window.innerWidth < 768)
// //     }

// //     checkMobile()
// //     window.addEventListener("resize", checkMobile)
// //     return () => window.removeEventListener("resize", checkMobile)
// //   }, [])

// //   const handleDragStart = (event: DragStartEvent) => {
// //     setActiveId(event.active.id as string)
// //   }

// //   const handleDragEnd = (event: DragEndEvent) => {
// //     const { active, over } = event
// //     setActiveId(null)

// //     if (!over) return

// //     if (over.id === "email-canvas" && active.data.current?.type) {
// //       const componentType = active.data.current.type.replace(/-(1|2)$/, "")
// //       const newElement: EmailElement = {
// //         id: `${componentType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
// //         type: componentType as EmailElement["type"],
// //         properties: active.data.current.type.includes("columns")
// //           ? { columns: active.data.current.type.includes("2") ? 2 : 1 }
// //           : {},
// //       }
// //       const newElements = [...emailState.elements, newElement]
// //       setEmailState({ ...emailState, elements: newElements })
// //       setSelectedElement(newElement.id)
// //       return
// //     }

// //     if (active.id !== over.id) {
// //       const oldIndex = emailState.elements.findIndex((el) => el.id === active.id)
// //       const newIndex = emailState.elements.findIndex((el) => el.id === over.id)

// //       if (oldIndex !== -1 && newIndex !== -1) {
// //         const newElements = arrayMove(emailState.elements, oldIndex, newIndex)
// //         setEmailState({ ...emailState, elements: newElements })
// //       }
// //     }
// //   }

// //   const updateElement = (id: string, updates: any) => {
// //     const newElements = emailState.elements.map((el) =>
// //       el.id === id ? { ...el, ...updates, properties: { ...el.properties, ...updates } } : el,
// //     )
// //     setEmailState({ ...emailState, elements: newElements })

// //     // Real-time preview update
// //     if (showPreview) {
// //       const newHTML = generateEmailHTML(newElements, emailState.subject)
// //       setCustomHTML(newHTML)
// //     }
// //   }

// //   const deleteElement = (id: string) => {
// //     const newElements = emailState.elements.filter((el) => el.id !== id)
// //     setEmailState({ ...emailState, elements: newElements })
// //     if (selectedElement === id) {
// //       setSelectedElement(null)
// //     }
// //   }

// //   const updateSubject = (subject: string) => {
// //     setEmailState({ ...emailState, subject })
// //   }

// //   const loadTemplate = (elements: EmailElement[], subject: string, loadedCampaignName?: string, loadedPreviewText?: string) => {
// //     setEmailState({ elements, subject })
// //     if (loadedCampaignName) {
// //       setCampaignName(loadedCampaignName)
// //     }
// //     if (loadedPreviewText) {
// //       setPreviewText(loadedPreviewText)
// //     }
// //     setSelectedElement(null)
// //     toast.success("Template loaded successfully.")
// //   }

// //   // Handle campaign change from TemplateManager
// //   const handleCampaignChange = (campaignId: string, newCampaignName: string) => {
// //     setSelectedCampaign(campaignId)
// //     setCampaignName(newCampaignName)
// //   }

// //   // New function to handle new template creation
// //   const handleNewTemplate = () => {
// //     // Clear all email state
// //     setEmailState({
// //       elements: [],
// //       subject: "Your Email Subject"
// //     })
    
// //     // Reset other states
// //     setSelectedElement(null)
// //     setCampaignName("My Email Campaign")
// //     setPreviewText("")
// //     setCustomHTML("")
// //     setSelectedCampaign("")
    
// //     // Clear auto-save data
// //     localStorage.removeItem("dropaphi-autosave")
    
// //     toast.success("Started new email template")
// //   }

// //   const handleEmailSaved = (emailData: { id: string; title: string; status: string; templateId?: string }) => {
// //     toast.success(`Email "${emailData.title}" saved successfully!`)
// //     if (emailData.templateId) {
// //       toast.success("Template created successfully!")
// //     }
    
// //     // Update the campaign name with the saved title
// //     setCampaignName(emailData.title)
// //   }

// //   // Prepare builder data for the template
// //   const getBuilderData = () => {
// //     return {
// //       elements: emailState.elements,
// //       subject: emailState.subject,
// //       title: campaignName, // Use campaign name as title for backward compatibility
// //       previewText: previewText,
// //       html: currentHTML,
// //       createdAt: new Date().toISOString(),
// //       version: "1.0"
// //     }
// //   }

// //   const renderElement = (element: EmailElement, inOverlay = false) => {
// //     const commonProps = {
// //       id: element.id,
// //       isSelected: selectedElement === element.id && !inOverlay,
// //       onSelect: () => !inOverlay && setSelectedElement(element.id),
// //       onUpdate: (updates: any) => updateElement(element.id, updates),
// //       properties: element.properties,
// //     }

// //     const elementComponent = (() => {
// //       switch (element.type) {
// //         case "text":
// //           return <TextElement key={element.id} {...commonProps} content={element.content} />
// //         case "image":
// //           return <ImageElement key={element.id} {...commonProps} />
// //         case "video":
// //           return <VideoElement key={element.id} {...commonProps} />
// //         case "button":
// //           return <ButtonElement key={element.id} {...commonProps} content={element.content} />
// //         case "social":
// //           return <SocialElement key={element.id} {...commonProps} />
// //         case "divider":
// //           return <DividerElement key={element.id} {...commonProps} />
// //         case "columns":
// //           return <ColumnsElement key={element.id} {...commonProps} />
// //         default:
// //           return null
// //       }
// //     })()

// //     if (inOverlay) {
// //       return elementComponent
// //     }

// //     return (
// //       <SortableElement key={element.id} id={element.id} onDelete={() => deleteElement(element.id)}>
// //         {elementComponent}
// //       </SortableElement>
// //     )
// //   }

// //   const activeDragComponent = activeId ? componentLibrary.find((c) => c.id === activeId) : null
// //   const selectedElementData = selectedElement ? emailState.elements.find((el) => el.id === selectedElement) : null

// //   const handleModeChange = (newMode: "visual" | "code") => {
// //     if (newMode === "code" && mode === "visual") {
// //       setCustomHTML(generatedHTML)
// //     }
// //     setMode(newMode)
// //   }

// //   const handleHTMLChange = (html: string) => {
// //     setCustomHTML(html)
// //   }

// //   // Keyboard shortcuts
// //   useEffect(() => {
// //     const handleKeyDown = (e: KeyboardEvent) => {
// //       if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
// //         e.preventDefault()
// //         undo()
// //       } else if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
// //         e.preventDefault()
// //         redo()
// //       }
// //     }

// //     window.addEventListener("keydown", handleKeyDown)
// //     return () => window.removeEventListener("keydown", handleKeyDown)
// //   }, [undo, redo])

// //   return (
// //     <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
// //       <div className={`h-screen flex flex-col bg-background ${isMobile ? "mobile-stack" : ""}`}>
// //         {/* Header */}
// //         <header
// //           className={`h-16 border-b border-border bg-card flex items-center justify-between px-6 ${isMobile ? "px-4" : ""}`}
// //         >
// //           <div className="flex items-center gap-4">
// //             <div className="flex items-center gap-2">
// //               <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
// //                 <span className="text-primary-foreground font-bold text-sm">D</span>
// //               </div>
// //               <div className={isMobile ? "mobile-hide" : ""}>
// //               </div>
// //             </div>
// //             {!isMobile && <Separator orientation="vertical" className="h-8" />}
// //             <div className="flex items-center gap-2">
// //               <input
// //                 type="text"
// //                 value={campaignName} // Changed from emailTitle to campaignName
// //                 onChange={(e) => setCampaignName(e.target.value)}
// //                 className={`px-3 py-1 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring ${isMobile ? "w-32" : "w-48"}`}
// //                 placeholder="Campaign Name" // Updated placeholder
// //                 title="Campaign Name" // Updated title
// //               />
// //               <input
// //                 type="text"
// //                 value={emailState.subject}
// //                 onChange={(e) => updateSubject(e.target.value)}
// //                 className={`px-3 py-1 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring ${isMobile ? "w-32" : ""}`}
// //                 placeholder="Email Subject"
// //                 title="Email Subject"
// //               />
// //             </div>
// //           </div>

// //           <div className="flex items-center gap-2">
// //             <div className="flex items-center border border-border rounded-md">
// //               <Button
// //                 variant={mode === "visual" ? "default" : "ghost"}
// //                 size="sm"
// //                 onClick={() => handleModeChange("visual")}
// //                 className="rounded-r-none"
// //               >
// //                 <Icons.Eye className="w-4 h-4 mr-1" />
// //                 {!isMobile && "Visual"}
// //               </Button>
// //               <Button
// //                 variant={mode === "code" ? "default" : "ghost"}
// //                 size="sm"
// //                 onClick={() => handleModeChange("code")}
// //                 className="rounded-l-none"
// //               >
// //                 <Icons.Type className="w-4 h-4 mr-1" />
// //                 {!isMobile && "Code"}
// //               </Button>
// //             </div>
// //             {!isMobile && <Separator orientation="vertical" className="h-8" />}
// //             <Button variant="outline" size="sm" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
// //               <Icons.Undo className="w-4 h-4" />
// //             </Button>
// //             <Button variant="outline" size="sm" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
// //               <Icons.Redo className="w-4 h-4" />
// //             </Button>
// //             {!isMobile && <Separator orientation="vertical" className="h-8" />}
// //             <TemplateManager
// //               currentElements={emailState.elements}
// //               currentSubject={emailState.subject}
// //               currentContent={currentHTML}
// //               selectedCampaign={selectedCampaign}
// //               campaignName={campaignName} // Pass campaign name instead of title
// //               currentPreviewText={previewText}
// //               currentBuilderData={getBuilderData()}
// //               onLoadTemplate={loadTemplate}
// //               onNewTemplate={handleNewTemplate}
// //               onEmailSaved={handleEmailSaved}
// //               onCampaignChange={handleCampaignChange} // Added campaign change handler
// //               userId={userId}
// //               newsLetterOwnerId={userId} 
// //               adminEmail={userEmail}
// //               builderMode={mode}
// //             />
// //             {/* <ResponsivePreview html={currentHTML} subject={emailState.subject} /> */}
// //             <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
// //               <Icons.Play className="w-4 h-4 mr-1" />
// //               {!isMobile && "Preview"}
// //             </Button>
// //           </div>
// //         </header>

// //         {/* Main Content */}
// //         <div className={`flex-1 flex ${isMobile ? "mobile-stack" : ""}`}>
// //           {mode === "visual" ? (
// //             <>
// //               {/* Left Sidebar - Component Library */}
// //               <aside
// //                 className={`${isMobile ? "w-full h-32 overflow-x-auto" : "w-64"} bg-sidebar border-r border-sidebar-border flex flex-col`}
// //               >
// //                 <div className="p-4 border-b border-sidebar-border">
// //                   <h2 className="text-sm font-semibold text-sidebar-foreground mb-3">Components</h2>
// //                 </div>

// //                 <div className={`flex-1 overflow-y-auto p-4 ${isMobile ? "flex flex-row gap-4" : "space-y-6"}`}>
// //                   {categories.map((category) => (
// //                     <div key={category} className={isMobile ? "flex-shrink-0" : ""}>
// //                       <h3 className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider mb-3">
// //                         {category}
// //                       </h3>
// //                       <div className={`${isMobile ? "flex gap-2" : "space-y-2"}`}>
// //                         {componentLibrary
// //                           .filter((component) => component.category === category)
// //                           .map((component) => (
// //                             <DraggableComponent
// //                               key={component.id}
// //                               id={component.id}
// //                               icon={component.icon}
// //                               label={component.label}
// //                               category={component.category}
// //                             />
// //                           ))}
// //                       </div>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </aside>

// //               {/* Center Canvas */}
// //               <main className={`flex-1 bg-canvas canvas-grid p-8 overflow-auto ${isMobile ? "p-4" : ""}`}>
// //                 <div className={`max-w-2xl mx-auto ${isMobile ? "max-w-full" : ""}`}>
// //                   <SortableContext
// //                     items={emailState.elements.map((el) => el.id)}
// //                     strategy={verticalListSortingStrategy}
// //                   >
// //                     <DroppableCanvas isEmpty={emailState.elements.length === 0}>
// //                       {emailState.elements.map((element) => renderElement(element))}
// //                     </DroppableCanvas>
// //                   </SortableContext>
// //                 </div>
// //               </main>

// //               {/* Right Sidebar - Properties Panel */}
// //               <aside className={`${isMobile ? "w-full" : "w-80"} bg-properties border-l border-border flex flex-col`}>
// //                 <div className="p-4 border-b border-border">
// //                   <h2 className="text-sm font-semibold mb-1">Properties</h2>
// //                   <p className="text-xs text-muted-foreground">
// //                     {selectedElement ? "Configure selected element" : "Select an element to edit properties"}
// //                   </p>
// //                 </div>

// //                 <div className="flex-1 overflow-y-auto p-4">
// //                   <PropertiesPanel
// //                     selectedElement={selectedElementData || null}
// //                     onUpdate={(updates) => selectedElement && updateElement(selectedElement, updates)}
// //                   />
// //                 </div>
// //               </aside>
// //             </>
// //           ) : (
// //             /* Code Editor Mode */
// //             <div className="flex-1">
// //               <CodeEditor html={currentHTML} onHTMLChange={handleHTMLChange} onPreview={() => setShowPreview(true)} />
// //             </div>
// //           )}
// //         </div>

// //         <DragOverlay>
// //           {activeDragComponent ? (
// //             <div className="p-3 bg-sidebar-accent border border-sidebar-border rounded-md shadow-lg">
// //               <div className="flex items-center gap-3">
// //                 <activeDragComponent.icon className="w-4 h-4 text-sidebar-primary" />
// //                 <span className="text-sm text-sidebar-foreground">{activeDragComponent.label}</span>
// //               </div>
// //             </div>
// //           ) : null}
// //         </DragOverlay>

// //         {/* Email Preview Modal */}
// //         <EmailPreview
// //           isOpen={showPreview}
// //           onClose={() => setShowPreview(false)}
// //           html={currentHTML}
// //           subject={emailState.subject}
// //         />
// //       </div>
// //     </DndContext>
// //   )
// // }













// "use client"

// import { useState, useEffect } from "react"
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
// import { ResponsivePreview } from "./_component/responsive/responsive-preview"
// import { DraggableComponent } from "./_component/drag-drop/draggable-component"
// import { DroppableCanvas } from "./_component/drag-drop/droppable-canvas"
// import { PropertiesPanel } from "./_component/properties/properties-panel"
// import { CodeEditor } from "./_component/code-editor/code-editor"
// import { EmailPreview } from "./_component/preview/email-preview"
// import { getServerAuth } from "@/lib/auth/getauth"
// import { useAuthUser } from "@/lib/auth/getClientAuth"

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

// export default function MailStudio() {
//   const {
//     state: emailState,
//     set: setEmailState,
//     undo,
//     redo,
//     canUndo,
//     canRedo,
//   } = useHistory<EmailState>({
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
//   const [selectedCampaign, setSelectedCampaign] = useState<string>("") // Added selected campaign state
//   const { user } = useAuthUser();

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

//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768)
      
//       // Set viewport meta tag to prevent zoom and maintain small scale
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

//   const handleDragStart = (event: DragStartEvent) => {
//     setActiveId(event.active.id as string)
//   }

//   const handleDragEnd = (event: DragEndEvent) => {
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
//   }

//   const updateElement = (id: string, updates: any) => {
//     const newElements = emailState.elements.map((el) =>
//       el.id === id ? { ...el, ...updates, properties: { ...el.properties, ...updates } } : el,
//     )
//     setEmailState({ ...emailState, elements: newElements })

//     // Real-time preview update
//     if (showPreview) {
//       const newHTML = generateEmailHTML(newElements, emailState.subject)
//       setCustomHTML(newHTML)
//     }
//   }

//   const deleteElement = (id: string) => {
//     const newElements = emailState.elements.filter((el) => el.id !== id)
//     setEmailState({ ...emailState, elements: newElements })
//     if (selectedElement === id) {
//       setSelectedElement(null)
//     }
//   }

//   const updateSubject = (subject: string) => {
//     setEmailState({ ...emailState, subject })
//   }

//   const loadTemplate = (elements: EmailElement[], subject: string, loadedCampaignName?: string, loadedPreviewText?: string) => {
//     setEmailState({ elements, subject })
//     if (loadedCampaignName) {
//       setCampaignName(loadedCampaignName)
//     }
//     if (loadedPreviewText) {
//       setPreviewText(loadedPreviewText)
//     }
//     setSelectedElement(null)
//     toast.success("Template loaded successfully.")
//   }

//   // Handle campaign change from TemplateManager
//   const handleCampaignChange = (campaignId: string, newCampaignName: string) => {
//     setSelectedCampaign(campaignId)
//     setCampaignName(newCampaignName)
//   }

//   // New function to handle new template creation
//   const handleNewTemplate = () => {
//     // Clear all email state
//     setEmailState({
//       elements: [],
//       subject: "Your Email Subject"
//     })
    
//     // Reset other states
//     setSelectedElement(null)
//     setCampaignName("My Email Campaign")
//     setPreviewText("")
//     setCustomHTML("")
//     setSelectedCampaign("")
    
//     // Clear auto-save data
//     localStorage.removeItem("dropaphi-autosave")
    
//     toast.success("Started new email template")
//   }

//   const handleEmailSaved = (emailData: { id: string; title: string; status: string; templateId?: string }) => {
//     toast.success(`Email "${emailData.title}" saved successfully!`)
//     if (emailData.templateId) {
//       toast.success("Template created successfully!")
//     }
    
//     // Update the campaign name with the saved title
//     setCampaignName(emailData.title)
//   }

//   // Prepare builder data for the template
//   const getBuilderData = () => {
//     return {
//       elements: emailState.elements,
//       subject: emailState.subject,
//       title: campaignName, // Use campaign name as title for backward compatibility
//       previewText: previewText,
//       html: currentHTML,
//       createdAt: new Date().toISOString(),
//       version: "1.0"
//     }
//   }

//   const renderElement = (element: EmailElement, inOverlay = false) => {
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
//   }

//   const activeDragComponent = activeId ? componentLibrary.find((c) => c.id === activeId) : null
//   const selectedElementData = selectedElement ? emailState.elements.find((el) => el.id === selectedElement) : null

//   const handleModeChange = (newMode: "visual" | "code") => {
//     if (newMode === "code" && mode === "visual") {
//       setCustomHTML(generatedHTML)
//     }
//     setMode(newMode)
//   }

//   const handleHTMLChange = (html: string) => {
//     setCustomHTML(html)
//   }

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

//   return (
//     <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
//       <div className={`h-screen flex flex-col bg-background ${isMobile ? "mobile-stack text-xs" : ""}`}>
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
//               userId={userId}
//               newsLetterOwnerId={userId} 
//               adminEmail={userEmail}
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
//                     <DroppableCanvas isEmpty={emailState.elements.length === 0} 
//                     // isMobile={isMobile}
//                     >
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









"use client"

import { useState, useEffect } from "react"
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
import { ResponsivePreview } from "./_component/responsive/responsive-preview"
import { DraggableComponent } from "./_component/drag-drop/draggable-component"
import { DroppableCanvas } from "./_component/drag-drop/droppable-canvas"
import { PropertiesPanel } from "./_component/properties/properties-panel"
import { CodeEditor } from "./_component/code-editor/code-editor"
import { EmailPreview } from "./_component/preview/email-preview"
import { getServerAuth } from "@/lib/auth/getauth"
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

export default function MailStudio() {
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
  const { user,loading } = useAuthUser();

  if (!user || loading) {
    return <Loader/>
  }

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

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024 // Using 1024px as breakpoint for better mobile detection
      setIsMobile(mobile)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Auto-save functionality - only on desktop
  useEffect(() => {
    if (isMobile) return;

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
  }, [emailState, campaignName, previewText, selectedCampaign, isMobile])

  // Load auto-saved data on mount - only on desktop
  useEffect(() => {
    if (isMobile) return;

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
  }, [setEmailState, isMobile])

  const handleDragStart = (event: DragStartEvent) => {
    if (isMobile) return;
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (isMobile) return;
    
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
    if (isMobile) return;
    
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
    if (isMobile) return;
    
    const newElements = emailState.elements.filter((el) => el.id !== id)
    setEmailState({ ...emailState, elements: newElements })
    if (selectedElement === id) {
      setSelectedElement(null)
    }
  }

  const updateSubject = (subject: string) => {
    if (isMobile) return;
    setEmailState({ ...emailState, subject })
  }

  const loadTemplate = (elements: EmailElement[], subject: string, loadedCampaignName?: string, loadedPreviewText?: string) => {
    if (isMobile) return;
    
    setEmailState({ elements, subject })
    if (loadedCampaignName) {
      setCampaignName(loadedCampaignName)
    }
    if (loadedPreviewText) {
      setPreviewText(loadedPreviewText)
    }
    setSelectedElement(null)
    toast.success("Template loaded successfully.")
  }

  // Handle campaign change from TemplateManager
  const handleCampaignChange = (campaignId: string, newCampaignName: string) => {
    if (isMobile) return;
    setSelectedCampaign(campaignId)
    setCampaignName(newCampaignName)
  }

  // New function to handle new template creation
  const handleNewTemplate = () => {
    if (isMobile) return;
    
    // Clear all email state
    setEmailState({
      elements: [],
      subject: "Your Email Subject"
    })
    
    // Reset other states
    setSelectedElement(null)
    setCampaignName("My Email Campaign")
    setPreviewText("")
    setCustomHTML("")
    setSelectedCampaign("")
    
    // Clear auto-save data
    localStorage.removeItem("dropaphi-autosave")
    
    toast.success("Started new email template")
  }

  const handleEmailSaved = (emailData: { id: string; title: string; status: string; templateId?: string }) => {
    if (isMobile) return;
    
    toast.success(`Email "${emailData.title}" saved successfully!`)
    if (emailData.templateId) {
      toast.success("Template created successfully!")
    }
    
    // Update the campaign name with the saved title
    setCampaignName(emailData.title)
  }

  // Prepare builder data for the template
  const getBuilderData = () => {
    return {
      elements: emailState.elements,
      subject: emailState.subject,
      title: campaignName,
      previewText: previewText,
      html: currentHTML,
      createdAt: new Date().toISOString(),
      version: "1.0"
    }
  }

  const renderElement = (element: EmailElement, inOverlay = false) => {
    const commonProps = {
      id: element.id,
      isSelected: selectedElement === element.id && !inOverlay,
      onSelect: () => !inOverlay && !isMobile && setSelectedElement(element.id),
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
  }

  const activeDragComponent = activeId ? componentLibrary.find((c) => c.id === activeId) : null
  const selectedElementData = selectedElement ? emailState.elements.find((el) => el.id === selectedElement) : null

  const handleModeChange = (newMode: "visual" | "code") => {
    if (isMobile) return;
    
    if (newMode === "code" && mode === "visual") {
      setCustomHTML(generatedHTML)
    }
    setMode(newMode)
  }

  const handleHTMLChange = (html: string) => {
    if (isMobile) return;
    setCustomHTML(html)
  }

  // Keyboard shortcuts - only on desktop
  useEffect(() => {
    if (isMobile) return;
    
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
  }, [undo, redo, isMobile])

  // Mobile blocked message component
  if (isMobile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card rounded-lg border border-border shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.Smartphone className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-card-foreground mb-2">
            Mobile Access Restricted
          </h1>
          <p className="text-muted-foreground mb-4">
            The Email Builder is optimized for larger screens and requires more space for the best editing experience.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <p className="text-sm text-muted-foreground">
              Please open this page on a desktop computer or tablet with a larger screen to access the full functionality.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="w-full"
            >
              Go Back
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Try Anyway (Not Recommended)
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Desktop version
  return (
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 py-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="px-3 py-1 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring w-48"
                placeholder="Campaign Name"
                title="Campaign Name"
              />
              <input
                type="text"
                value={emailState.subject}
                onChange={(e) => updateSubject(e.target.value)}
                className="px-3 py-1 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Email Subject"
                title="Email Subject"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border rounded-md ">
              <Button
                variant={mode === "visual" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModeChange("visual")}
                className="rounded-r-none"
              >
                <Icons.Eye className="w-4 h-4 mr-1" />
                Visual
              </Button>
              <Button
                variant={mode === "code" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModeChange("code")}
                className="rounded-l-none"
              >
                <Icons.Type className="w-4 h-4 mr-1" />
                Code
              </Button>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <Button variant="outline" size="sm" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
              <Icons.Undo className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
              <Icons.Redo className="w-4 h-4" />
            </Button>
            <Separator orientation="vertical" className="h-8" />
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
              userId={userId}
              newsLetterOwnerId={userId} 
              adminEmail={userEmail}
              builderMode={mode}
            />
            <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
              <Icons.Play className="w-4 h-4 mr-1" />
              Preview
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex">
          {mode === "visual" ? (
            <>
              {/* Left Sidebar - Component Library */}
              <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
                <div className="p-4 border-b border-sidebar-border">
                  <h2 className="text-sm font-semibold text-sidebar-foreground mb-3">Components</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {categories.map((category) => (
                    <div key={category}>
                      <h3 className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider mb-3">
                        {category}
                      </h3>
                      <div className="space-y-2">
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
              <main className="flex-1 bg-canvas canvas-grid p-8 overflow-auto">
                <div className="max-w-2xl mx-auto">
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
              <aside className="w-80 bg-properties border-l border-border flex flex-col">
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
      </div>
    </DndContext>
  )
}
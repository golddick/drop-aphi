




// // templates/template-manager.tsx
// "use client"

// import { useState, useEffect } from "react"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Save, FolderOpen, Trash2, Download, Upload, Send, Star } from "lucide-react"

// interface EmailElement {
//   id: string
//   type: "text" | "button" | "image" | "video" | "social" | "divider" | "columns" | "logo"
//   content?: string
//   properties?: Record<string, any>
// }

// interface Template {
//   id: string
//   name: string
//   subject: string
//   elements: EmailElement[]
//   createdAt: string
//   thumbnail?: string
//   isPublic?: boolean
//   isFeatured?: boolean
//   category?: string
//   description?: string
// }

// interface TemplateManagerProps {
//   currentElements: EmailElement[]
//   currentSubject: string
//   onLoadTemplate: (elements: EmailElement[], subject: string) => void
//   onSendNewsletter: () => void
// }

// // Server action to fetch templates from database
// async function getTemplatesFromDB() {
//   try {
//     const response = await fetch('/api/templates', {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     })

//     const result = await response.json()
    
//     if (!response.ok) {
//       throw new Error(result.message || 'Failed to fetch templates')
//     }

//     return result.data
//   } catch (error) {
//     console.error('Error fetching templates:', error)
//     return []
//   }
// }

// // Server action to save template to database
// async function saveTemplateToDB(template: {
//   name: string
//   subject: string
//   elements: EmailElement[]
//   description?: string
//   category?: string
//   isPublic?: boolean
// }) {
//   try {
//     const response = await fetch('/api/templates', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(template),
//     })

//     const result = await response.json()
    
//     if (!response.ok) {
//       throw new Error(result.message || 'Failed to save template')
//     }

//     return result
//   } catch (error) {
//     console.error('Error saving template:', error)
//     throw error
//   }
// }

// export function TemplateManager({ 
//   currentElements, 
//   currentSubject, 
//   onLoadTemplate, 
//   onSendNewsletter 
// }: TemplateManagerProps) {
//   const [localTemplates, setLocalTemplates] = useState<Template[]>(() => {
//     if (typeof window !== "undefined") {
//       const saved = localStorage.getItem("dropaphi-templates")
//       return saved ? JSON.parse(saved) : []
//     }
//     return []
//   })
//   const [dbTemplates, setDbTemplates] = useState<Template[]>([])
//   const [isOpen, setIsOpen] = useState(false)
//   const [templateName, setTemplateName] = useState("")
//   const [showSaveDialog, setShowSaveDialog] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [activeTab, setActiveTab] = useState<"local" | "database">("local")

//   // Fetch templates from database on component mount
//   useEffect(() => {
//     if (isOpen) {
//       fetchDatabaseTemplates()
//     }
//   }, [isOpen])

//   const fetchDatabaseTemplates = async () => {
//     setIsLoading(true)
//     try {
//       const templates = await getTemplatesFromDB()
//       setDbTemplates(templates)
//     } catch (error) {
//       console.error("Failed to fetch database templates:", error)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const saveTemplate = async () => {
//     if (!templateName.trim()) return

//     setIsLoading(true)
//     try {
//       // Save to database
//       const result = await saveTemplateToDB({
//         name: templateName.trim(),
//         subject: currentSubject,
//         elements: currentElements,
//         description: `Template created from Mail Studio`,
//         category: "Custom"
//       })

//       if (result.success) {
//         // Also save to local storage for quick access
//         const newTemplate: Template = {
//           id: `template-${Date.now()}`,
//           name: templateName.trim(),
//           subject: currentSubject,
//           elements: currentElements,
//           createdAt: new Date().toISOString(),
//         }

//         const updatedTemplates = [...localTemplates, newTemplate]
//         setLocalTemplates(updatedTemplates)
//         localStorage.setItem("dropaphi-templates", JSON.stringify(updatedTemplates))
        
//         setTemplateName("")
//         setShowSaveDialog(false)
//       }
//     } catch (error) {
//       console.error("Failed to save template to database:", error)
//       // Fallback to local storage only
//       const newTemplate: Template = {
//         id: `template-${Date.now()}`,
//         name: templateName.trim(),
//         subject: currentSubject,
//         elements: currentElements,
//         createdAt: new Date().toISOString(),
//       }

//       const updatedTemplates = [...localTemplates, newTemplate]
//       setLocalTemplates(updatedTemplates)
//       localStorage.setItem("dropaphi-templates", JSON.stringify(updatedTemplates))
      
//       setTemplateName("")
//       setShowSaveDialog(false)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const loadTemplate = (template: Template) => {
//     onLoadTemplate(template.elements, template.subject)
//     setIsOpen(false)
//   }

//   const deleteTemplate = (templateId: string) => {
//     const updatedTemplates = localTemplates.filter((t) => t.id !== templateId)
//     setLocalTemplates(updatedTemplates)
//     localStorage.setItem("dropaphi-templates", JSON.stringify(updatedTemplates))
//   }

//   const exportTemplates = () => {
//     const dataStr = JSON.stringify(localTemplates, null, 2)
//     const dataBlob = new Blob([dataStr], { type: "application/json" })
//     const url = URL.createObjectURL(dataBlob)
//     const link = document.createElement("a")
//     link.href = url
//     link.download = "dropaphi-templates.json"
//     link.click()
//     URL.revokeObjectURL(url)
//   }

//   const importTemplates = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0]
//     if (!file) return

//     const reader = new FileReader()
//     reader.onload = (e) => {
//       try {
//         const importedTemplates = JSON.parse(e.target?.result as string)
//         const updatedTemplates = [...localTemplates, ...importedTemplates]
//         setLocalTemplates(updatedTemplates)
//         localStorage.setItem("dropaphi-templates", JSON.stringify(updatedTemplates))
//       } catch (error) {
//         console.error("Failed to import templates:", error)
//       }
//     }
//     reader.readAsText(file)
//     event.target.value = ""
//   }

//   const allTemplates = activeTab === "local" ? localTemplates : dbTemplates
//   const isEmpty = allTemplates.length === 0

//   return (
//     <>
//       {/* Send Newsletter Button */}
//       <Button 
//         variant="default" 
//         size="sm" 
//         onClick={onSendNewsletter}
//         disabled={currentElements.length === 0}
//       >
//         <Send className="w-4 h-4 mr-1" />
//         Send
//       </Button>

//       {/* Save Template Dialog */}
//       <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
//         <DialogTrigger asChild>
//           <Button variant="outline" size="sm">
//             <Save className="w-4 h-4 mr-1" />
//             Save Template
//           </Button>
//         </DialogTrigger>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Save Template</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div>
//               <label className="text-sm font-medium">Template Name</label>
//               <Input
//                 value={templateName}
//                 onChange={(e) => setTemplateName(e.target.value)}
//                 placeholder="Enter template name..."
//                 className="mt-1"
//               />
//             </div>
//             <div className="flex justify-end gap-2">
//               <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
//                 Cancel
//               </Button>
//               <Button onClick={saveTemplate} disabled={!templateName.trim() || isLoading}>
//                 {isLoading ? "Saving..." : "Save Template"}
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Load Templates Dialog */}
//       <Dialog open={isOpen} onOpenChange={setIsOpen}>
//         <DialogTrigger asChild>
//           <Button variant="outline" size="sm">
//             <FolderOpen className="w-4 h-4 mr-1" />
//             Templates
//           </Button>
//         </DialogTrigger>
//         <DialogContent className="max-w-6xl max-h-[80vh] flex flex-col">
//           <DialogHeader className="flex flex-row items-center justify-between space-y-0">
//             <DialogTitle>Email Templates</DialogTitle>
//           </DialogHeader>

//           {/* Tabs */}
//           <div className="flex border-b">
//             <button
//               className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
//                 activeTab === "local"
//                   ? "border-primary text-primary"
//                   : "border-transparent text-muted-foreground hover:text-foreground"
//               }`}
//               onClick={() => setActiveTab("local")}
//             >
//               Local Templates ({localTemplates.length})
//             </button>
//             <button
//               className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
//                 activeTab === "database"
//                   ? "border-primary text-primary"
//                   : "border-transparent text-muted-foreground hover:text-foreground"
//               }`}
//               onClick={() => setActiveTab("database")}
//             >
//               Database Templates ({dbTemplates.length})
//             </button>
//           </div>

//           <div className="flex-1 overflow-y-auto">
//             {isLoading ? (
//               <div className="flex items-center justify-center h-64">
//                 <div className="text-center">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
//                   <p className="text-sm text-muted-foreground">Loading templates...</p>
//                 </div>
//               </div>
//             ) : isEmpty ? (
//               <div className="flex flex-col items-center justify-center h-64 text-center">
//                 <FolderOpen className="w-12 h-12 text-muted-foreground mb-3" />
//                 <h3 className="text-lg font-medium mb-2">
//                   {activeTab === "local" ? "No Local Templates" : "No Database Templates"}
//                 </h3>
//                 <p className="text-sm text-muted-foreground">
//                   {activeTab === "local" 
//                     ? "Save your first template to get started." 
//                     : "No templates found in the database."}
//                 </p>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4">
//                 {allTemplates.map((template) => (
//                   <Card key={template.id} className="p-4 hover:shadow-md transition-shadow group">
//                     <div className="flex items-start justify-between mb-3">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2">
//                           <h3 className="font-medium text-sm">{template.name}</h3>
//                           {template.isFeatured && (
//                             <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
//                           )}
//                         </div>
//                         <p className="text-xs text-muted-foreground">{template.subject}</p>
//                         {template.category && (
//                           <Badge variant="outline" className="text-xs mt-1">
//                             {template.category}
//                           </Badge>
//                         )}
//                       </div>
//                       {activeTab === "local" && (
//                         <Button
//                           size="sm"
//                           variant="ghost"
//                           onClick={() => deleteTemplate(template.id)}
//                           className="h-6 w-6 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
//                         >
//                           <Trash2 className="w-3 h-3" />
//                         </Button>
//                       )}
//                     </div>

//                     {template.description && (
//                       <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
//                         {template.description}
//                       </p>
//                     )}

//                     <div className="flex flex-wrap gap-1 mb-3">
//                       {template.elements.slice(0, 3).map((element, index) => (
//                         <Badge key={index} variant="secondary" className="text-xs">
//                           {element.type}
//                         </Badge>
//                       ))}
//                       {template.elements.length > 3 && (
//                         <Badge variant="secondary" className="text-xs">
//                           +{template.elements.length - 3}
//                         </Badge>
//                       )}
//                     </div>

//                     <div className="flex items-center justify-between">
//                       <span className="text-xs text-muted-foreground">
//                         {new Date(template.createdAt).toLocaleDateString()}
//                       </span>
//                       <Button size="sm" onClick={() => loadTemplate(template)}>
//                         Load
//                       </Button>
//                     </div>
//                   </Card>
//                 ))}
//               </div>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   )
// }






// templates/template-manager.tsx
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Save, FolderOpen, Trash2, Download, Upload, Send, Star, Code, Eye } from "lucide-react"
import { toast } from "sonner"

interface EmailElement {
  id: string
  type: "text" | "button" | "image" | "video" | "social" | "divider" | "columns" | "logo"
  content?: string
  properties?: Record<string, any>
}

interface Template {
  id: string
  name: string
  subject: string
  elements: EmailElement[]
  createdAt: string
  thumbnail?: string
  isPublic?: boolean
  isFeatured?: boolean
  category?: string
  description?: string
}

interface TemplateManagerProps {
  currentElements: EmailElement[]
  currentSubject: string
  onLoadTemplate: (elements: EmailElement[], subject: string) => void
  onSendNewsletter: () => void
  builderMode?: "visual" | "code"
}

// Server action to fetch templates from database
async function getTemplatesFromDB() {
  try {
    const response = await fetch('/api/templates', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch templates')
    }

    return result.data
  } catch (error) {
    console.error('Error fetching templates:', error)
    return []
  }
}

// Server action to save template to database
async function saveTemplateToDB(template: {
  name: string
  subject: string
  elements: EmailElement[]
  description?: string
  category?: string
  isPublic?: boolean
}) {
  try {
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to save template')
    }

    return result
  } catch (error) {
    console.error('Error saving template:', error)
    throw error
  }
}

export function TemplateManager({ 
  currentElements, 
  currentSubject, 
  onLoadTemplate, 
  onSendNewsletter,
  builderMode = "visual"
}: TemplateManagerProps) {
  const [localTemplates, setLocalTemplates] = useState<Template[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dropaphi-templates")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [dbTemplates, setDbTemplates] = useState<Template[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"local" | "database">("local")

  const isCodeMode = builderMode === "code"
  const canSaveTemplate = !isCodeMode && currentElements.length > 0

  // Fetch templates from database on component mount
  useEffect(() => {
    if (isOpen) {
      fetchDatabaseTemplates()
    }
  }, [isOpen])

  const fetchDatabaseTemplates = async () => {
    setIsLoading(true)
    try {
      const templates = await getTemplatesFromDB()
      setDbTemplates(templates)
    } catch (error) {
      console.error("Failed to fetch database templates:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveTemplate = async () => {
    if (!templateName.trim()) return

    // Double check if in code mode (shouldn't happen due to disabled state, but just in case)
    if (isCodeMode) {
      toast.error("Cannot save templates in code mode")
      return
    }

    setIsLoading(true)
    try {
      // Save to database
      const result = await saveTemplateToDB({
        name: templateName.trim(),
        subject: currentSubject,
        elements: currentElements,
        description: `Template created from Mail Studio`,
        category: "Custom"
      })

      if (result.success) {
        // Also save to local storage for quick access
        const newTemplate: Template = {
          id: `template-${Date.now()}`,
          name: templateName.trim(),
          subject: currentSubject,
          elements: currentElements,
          createdAt: new Date().toISOString(),
        }

        const updatedTemplates = [...localTemplates, newTemplate]
        setLocalTemplates(updatedTemplates)
        localStorage.setItem("dropaphi-templates", JSON.stringify(updatedTemplates))
        
        setTemplateName("")
        setShowSaveDialog(false)
        toast.success("Template saved successfully!")
      }
    } catch (error) {
      console.error("Failed to save template to database:", error)
      // Fallback to local storage only
      const newTemplate: Template = {
        id: `template-${Date.now()}`,
        name: templateName.trim(),
        subject: currentSubject,
        elements: currentElements,
        createdAt: new Date().toISOString(),
      }

      const updatedTemplates = [...localTemplates, newTemplate]
      setLocalTemplates(updatedTemplates)
      localStorage.setItem("dropaphi-templates", JSON.stringify(updatedTemplates))
      
      setTemplateName("")
      setShowSaveDialog(false)
      toast.success("Template saved locally!")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveClick = () => {
    if (isCodeMode) {
      toast.error("Template saving is disabled in code mode", {
        description: "Switch to drag & drop mode to save templates",
        action: {
          label: "Understand",
          onClick: () => {},
        },
      })
      return
    }

    if (currentElements.length === 0) {
      toast.error("No content to save", {
        description: "Add some elements to your email before saving as template"
      })
      return
    }

    setShowSaveDialog(true)
  }

  const loadTemplate = (template: Template) => {
    onLoadTemplate(template.elements, template.subject)
    setIsOpen(false)
    toast.success(`Template "${template.name}" loaded`)
  }

  const deleteTemplate = (templateId: string) => {
    const updatedTemplates = localTemplates.filter((t) => t.id !== templateId)
    setLocalTemplates(updatedTemplates)
    localStorage.setItem("dropaphi-templates", JSON.stringify(updatedTemplates))
    toast.success("Template deleted")
  }

  const exportTemplates = () => {
    const dataStr = JSON.stringify(localTemplates, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "dropaphi-templates.json"
    link.click()
    URL.revokeObjectURL(url)
    toast.success("Templates exported successfully")
  }

  const importTemplates = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedTemplates = JSON.parse(e.target?.result as string)
        const updatedTemplates = [...localTemplates, ...importedTemplates]
        setLocalTemplates(updatedTemplates)
        localStorage.setItem("dropaphi-templates", JSON.stringify(updatedTemplates))
        toast.success(`${importedTemplates.length} templates imported successfully`)
      } catch (error) {
        console.error("Failed to import templates:", error)
        toast.error("Failed to import templates", {
          description: "The file format is invalid"
        })
      }
    }
    reader.readAsText(file)
    event.target.value = ""
  }

  const allTemplates = activeTab === "local" ? localTemplates : dbTemplates
  const isEmpty = allTemplates.length === 0

  return (
    <>
      {/* Send Newsletter Button */}
      <Button 
        variant="default" 
        size="sm" 
        onClick={onSendNewsletter}
        disabled={currentElements.length === 0}
      >
        <Send className="w-4 h-4 mr-1" />
        Send
      </Button>

      {/* Save Template Button with Code Mode Detection */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSaveClick}
            disabled={!canSaveTemplate}
            title={
              isCodeMode 
                ? "Template saving disabled in code mode" 
                : currentElements.length === 0 
                  ? "No content to save" 
                  : "Save current design as template"
            }
          >
            <Save className="w-4 h-4 mr-1" />
            Save Template
            {isCodeMode && (
              <Code className="w-3 h-3 ml-1 text-muted-foreground" />
            )}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Save Template
              {isCodeMode && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  Code Mode
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {isCodeMode ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 border border-destructive/20 bg-destructive/10 rounded-lg">
                <Code className="w-5 h-5 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Template Saving Disabled</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Template saving is not available in code mode. Switch to drag & drop mode to save your design as a reusable template.
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setShowSaveDialog(false)}>
                  Understand
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Template Name</label>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name..."
                  className="mt-1"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                <p>Elements to save: {currentElements.length}</p>
                <p>Subject: {currentSubject || "No subject"}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={saveTemplate} disabled={!templateName.trim() || isLoading}>
                  {isLoading ? "Saving..." : "Save Template"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Load Templates Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FolderOpen className="w-4 h-4 mr-1" />
            Templates
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[80vh] flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <DialogTitle>Email Templates</DialogTitle>
            <div className="flex gap-2">
              {activeTab === "local" && (
                <>
                  <Button variant="outline" size="sm" onClick={exportTemplates}>
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <label>
                      <Upload className="w-4 h-4 mr-1" />
                      Import
                      <input
                        type="file"
                        accept=".json"
                        onChange={importTemplates}
                        className="hidden"
                      />
                    </label>
                  </Button>
                </>
              )}
            </div>
          </DialogHeader>

          {/* Mode Indicator */}
          {isCodeMode && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Code className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Code Mode Active</p>
                <p className="text-xs text-yellow-700">
                  You can load templates, but saving is disabled in code mode.
                </p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b">
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "local"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("local")}
            >
              Local Templates ({localTemplates.length})
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "database"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("database")}
            >
              Database Templates ({dbTemplates.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading templates...</p>
                </div>
              </div>
            ) : isEmpty ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <FolderOpen className="w-12 h-12 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-2">
                  {activeTab === "local" ? "No Local Templates" : "No Database Templates"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "local" 
                    ? isCodeMode 
                      ? "Switch to drag & drop mode to create and save templates"
                      : "Save your first template to get started."
                    : "No templates found in the database."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4">
                {allTemplates.map((template) => (
                  <Card key={template.id} className="p-4 hover:shadow-md transition-shadow group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm">{template.name}</h3>
                          {template.isFeatured && (
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{template.subject}</p>
                        {template.category && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {template.category}
                          </Badge>
                        )}
                      </div>
                      {activeTab === "local" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteTemplate(template.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>

                    {template.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {template.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.elements.slice(0, 3).map((element, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {element.type}
                        </Badge>
                      ))}
                      {template.elements.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.elements.length - 3}
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
    </>
  )
}





// "use client"

// import type React from "react"

// import { useState } from "react"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Save, FolderOpen, Trash2, Download, Upload } from "lucide-react"
// import { saveTemplateWithCampaign } from "@/actions/superadmin/email-templates"

// interface EmailElement {
//   id: string
//   type: "text" | "button" | "image" | "video" | "social" | "divider" | "columns" | "logo"
//   content?: string
//   properties?: Record<string, any>
// }

// interface Template {
//   id: string
//   name: string
//   subject: string
//   elements: EmailElement[]
//   createdAt: string
//   thumbnail?: string
// }

// interface TemplateManagerProps {
//   currentElements: EmailElement[]
//   currentSubject: string
//   onLoadTemplate: (elements: EmailElement[], subject: string) => void
// }

// export function TemplateManager({ currentElements, currentSubject, onLoadTemplate }: TemplateManagerProps) {
//   const [templates, setTemplates] = useState<Template[]>(() => {
//     if (typeof window !== "undefined") {
//       const saved = localStorage.getItem("dropaphi-templates")
//       return saved ? JSON.parse(saved) : []
//     }
//     return []
//   })
//   const [isOpen, setIsOpen] = useState(false)
//   const [templateName, setTemplateName] = useState("")
//   const [campaignName, setCampaignName] = useState("")
//   const [showSaveDialog, setShowSaveDialog] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)

//   const saveTemplate = async () => {
//     if (!templateName.trim() || !campaignName.trim()) return

//     setIsLoading(true)
//     try {
//       const result = await saveTemplateWithCampaign({
//         templateName: templateName.trim(),
//         campaignName: campaignName.trim(),
//         subject: currentSubject,
//         elements: currentElements
//       })

//       if (result.success) {
//         // Also save to local storage for quick access
//         const newTemplate: Template = {
//           id: `template-${Date.now()}`,
//           name: templateName.trim(),
//           subject: currentSubject,
//           elements: currentElements,
//           createdAt: new Date().toISOString(),
//         }

//         const updatedTemplates = [...templates, newTemplate]
//         setTemplates(updatedTemplates)
//         localStorage.setItem("dropaphi-templates", JSON.stringify(updatedTemplates))
        
//         setTemplateName("")
//         setCampaignName("")
//         setShowSaveDialog(false)
//       } else {
//         alert(result.message)
//       }
//     } catch (error) {
//       console.error("Failed to save template:", error)
//       alert("Failed to save template")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const loadTemplate = (template: Template) => {
//     onLoadTemplate(template.elements, template.subject)
//     setIsOpen(false)
//   }

//   const deleteTemplate = (templateId: string) => {
//     const updatedTemplates = templates.filter((t) => t.id !== templateId)
//     setTemplates(updatedTemplates)
//     localStorage.setItem("dropaphi-templates", JSON.stringify(updatedTemplates))
//   }

//   const exportTemplates = () => {
//     const dataStr = JSON.stringify(templates, null, 2)
//     const dataBlob = new Blob([dataStr], { type: "application/json" })
//     const url = URL.createObjectURL(dataBlob)
//     const link = document.createElement("a")
//     link.href = url
//     link.download = "dropaphi-templates.json"
//     link.click()
//     URL.revokeObjectURL(url)
//   }

//   const importTemplates = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0]
//     if (!file) return

//     const reader = new FileReader()
//     reader.onload = (e) => {
//       try {
//         const importedTemplates = JSON.parse(e.target?.result as string)
//         const updatedTemplates = [...templates, ...importedTemplates]
//         setTemplates(updatedTemplates)
//         localStorage.setItem("dropaphi-templates", JSON.stringify(updatedTemplates))
//       } catch (error) {
//         console.error("Failed to import templates:", error)
//       }
//     }
//     reader.readAsText(file)
//     event.target.value = ""
//   }

//   return (
//     <>
//       {/* Save Template Dialog */}
//       <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
//         <DialogTrigger asChild>
//           <Button variant="outline" size="sm">
//             <Save className="w-4 h-4 mr-1" />
//             Save Template
//           </Button>
//         </DialogTrigger>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Save Template & Create Campaign</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div>
//               <label className="text-sm font-medium">Template Name</label>
//               <Input
//                 value={templateName}
//                 onChange={(e) => setTemplateName(e.target.value)}
//                 placeholder="Enter template name..."
//                 className="mt-1"
//               />
//             </div>
//             <div>
//               <label className="text-sm font-medium">Campaign Name</label>
//               <Input
//                 value={campaignName}
//                 onChange={(e) => setCampaignName(e.target.value)}
//                 placeholder="Enter campaign name..."
//                 className="mt-1"
//               />
//               <p className="text-xs text-muted-foreground mt-1">
//                 A new campaign will be created with this name
//               </p>
//             </div>
//             <div className="flex justify-end gap-2">
//               <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
//                 Cancel
//               </Button>
//               <Button 
//                 onClick={saveTemplate} 
//                 disabled={!templateName.trim() || !campaignName.trim() || isLoading}
//               >
//                 {isLoading ? "Saving..." : "Save Template & Create Campaign"}
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Load Templates Dialog */}
//       <Dialog open={isOpen} onOpenChange={setIsOpen}>
//         <DialogTrigger asChild>
//           <Button variant="outline" size="sm">
//             <FolderOpen className="w-4 h-4 mr-1" />
//             Templates
//           </Button>
//         </DialogTrigger>
//         <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
//           <DialogHeader className="flex flex-row items-center justify-between space-y-0">
//             <DialogTitle>Email Templates</DialogTitle>
//             <div className="flex gap-2">
//               <Button size="sm" variant="outline" onClick={exportTemplates} disabled={templates.length === 0}>
//                 <Download className="w-3 h-3 mr-1" />
//                 Export
//               </Button>
//               <label>
//                 <Button size="sm" variant="outline" asChild>
//                   <span>
//                     <Upload className="w-3 h-3 mr-1" />
//                     Import
//                   </span>
//                 </Button>
//                 <input type="file" accept=".json" onChange={importTemplates} className="hidden" />
//               </label>
//             </div>
//           </DialogHeader>

//           <div className="flex-1 overflow-y-auto">
//             {templates.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-64 text-center">
//                 <FolderOpen className="w-12 h-12 text-muted-foreground mb-3" />
//                 <h3 className="text-lg font-medium mb-2">No Templates Yet</h3>
//                 <p className="text-sm text-muted-foreground">Save your first template to get started.</p>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
//                 {templates.map((template) => (
//                   <Card key={template.id} className="p-4 hover:shadow-md transition-shadow">
//                     <div className="flex items-start justify-between mb-3">
//                       <div>
//                         <h3 className="font-medium text-sm">{template.name}</h3>
//                         <p className="text-xs text-muted-foreground">{template.subject}</p>
//                       </div>
//                       <Button
//                         size="sm"
//                         variant="ghost"
//                         onClick={() => deleteTemplate(template.id)}
//                         className="h-6 w-6 p-0 text-destructive hover:text-destructive"
//                       >
//                         <Trash2 className="w-3 h-3" />
//                       </Button>
//                     </div>

//                     <div className="flex flex-wrap gap-1 mb-3">
//                       {template.elements.slice(0, 3).map((element, index) => (
//                         <Badge key={index} variant="secondary" className="text-xs">
//                           {element.type}
//                         </Badge>
//                       ))}
//                       {template.elements.length > 3 && (
//                         <Badge variant="secondary" className="text-xs">
//                           +{template.elements.length - 3}
//                         </Badge>
//                       )}
//                     </div>

//                     <div className="flex items-center justify-between">
//                       <span className="text-xs text-muted-foreground">
//                         {new Date(template.createdAt).toLocaleDateString()}
//                       </span>
//                       <Button size="sm" onClick={() => loadTemplate(template)}>
//                         Load
//                       </Button>
//                     </div>
//                   </Card>
//                 ))}
//               </div>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   )
// }
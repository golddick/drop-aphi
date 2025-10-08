


"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Download, Eye } from "lucide-react"

interface CodeEditorProps {
  html: string
  onHTMLChange: (html: string) => void
  onPreview: () => void
}

// Helper function to extract just the email body from full HTML documents
const extractEmailBody = (html: string): string => {
  if (!html) return html;
  
  // If it's already just body content (no html/head tags), return as-is
  if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
    return html;
  }
  
  try {
    // Extract content between <body> tags, or return the whole thing if no body tags
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) {
      return bodyMatch[1].trim();
    }
    
    return html;
  } catch (error) {
    console.error('Error extracting email body:', error);
    return html;
  }
}

// Helper function to wrap content in a proper email HTML structure
const wrapEmailContent = (content: string): string => {
  if (content.includes('<html') || content.includes('<!DOCTYPE')) {
    return content; // Already a full document
  }
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            margin: 0; 
            padding: 20px; 
            background-color: #f4f4f4;
        }
        .email-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="email-container">
        ${content}
    </div>
</body>
</html>`;
}

export function CodeEditor({ html, onHTMLChange, onPreview }: CodeEditorProps) {
  const [code, setCode] = useState(html)
  const [copied, setCopied] = useState(false)
  const [isFullDocument, setIsFullDocument] = useState(false)

  useEffect(() => {
    setCode(html)
    // Check if the HTML is a full document or just body content
    setIsFullDocument(html.includes('<html') || html.includes('<!DOCTYPE'))
  }, [html])

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value
    setCode(newCode)
    setIsFullDocument(newCode.includes('<html') || newCode.includes('<!DOCTYPE'))
    
    // Send the cleaned HTML to parent
    const cleanedHtml = extractEmailBody(newCode)
    onHTMLChange(cleanedHtml)
  }

  const wrapInDocument = () => {
    const wrappedCode = wrapEmailContent(code)
    setCode(wrappedCode)
    setIsFullDocument(true)
    onHTMLChange(extractEmailBody(wrappedCode))
  }

  const extractBodyOnly = () => {
    const bodyOnly = extractEmailBody(code)
    setCode(bodyOnly)
    setIsFullDocument(false)
    onHTMLChange(bodyOnly)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  const downloadHTML = () => {
    const blob = new Blob([code], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "email-template.html"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Code Editor Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div>
          <h3 className="text-sm font-medium">HTML Code</h3>
          <p className="text-xs text-muted-foreground">
            {isFullDocument ? "Full HTML document" : "Email body content only"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={isFullDocument ? extractBodyOnly : wrapInDocument}>
            {isFullDocument ? "Extract Body Only" : "Wrap in Document"}
          </Button>
          <Button size="sm" variant="outline" onClick={copyToClipboard}>
            <Copy className="w-3 h-3 mr-1" />
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button size="sm" variant="outline" onClick={downloadHTML}>
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
          <Button size="sm" variant="outline" onClick={onPreview}>
            <Eye className="w-3 h-3 mr-1" />
            Preview
          </Button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 flex">
        {/* Editor */}
        <div className="flex-1 relative">
          <textarea
            value={code}
            onChange={handleCodeChange}
            className="w-full h-full p-4 font-mono text-sm bg-background border-0 resize-none focus:outline-none"
            placeholder="Enter your HTML code here..."
            spellCheck={false}
            style={{ paddingLeft: '3rem' }}
          />
          {/* Line numbers */}
          <div className="absolute left-0 top-0 p-4 pointer-events-none select-none">
            <div className="font-mono text-sm text-muted-foreground/50 leading-[1.5]">
              {code.split("\n").map((_, index) => (
                <div key={index} className="text-right pr-2 min-w-[2rem]">
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="w-1/2 border-l border-border">
          <div className="p-4 border-b border-border bg-muted/50">
            <h4 className="text-sm font-medium">Live Preview</h4>
            <p className="text-xs text-muted-foreground">See how your email will look</p>
          </div>
          <div className="h-full overflow-auto bg-white">
            <iframe
              srcDoc={wrapEmailContent(code)}
              className="w-full h-full border-0"
              title="Email Preview"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

































// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Copy, Download, Eye, PanelLeft, PanelRight } from "lucide-react"
// import { useMediaQuery } from "@/lib/hooks/use-media-query"

// interface CodeEditorProps {
//   html: string
//   onHTMLChange: (html: string) => void
//   onPreview: () => void
//   isMobile?: boolean
// }

// const extractEmailBody = (html: string): string => {
//   if (!html) return html;
  
//   if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
//     return html;
//   }
  
//   try {
//     const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
//     if (bodyMatch && bodyMatch[1]) {
//       return bodyMatch[1].trim();
//     }
    
//     return html;
//   } catch (error) {
//     console.error('Error extracting email body:', error);
//     return html;
//   }
// }

// const wrapEmailContent = (content: string): string => {
//   if (content.includes('<html') || content.includes('<!DOCTYPE')) {
//     return content;
//   }
  
//   return `<!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Email Template</title>
//     <style>
//         body { 
//             font-family: Arial, sans-serif; 
//             line-height: 1.6; 
//             margin: 0; 
//             padding: 20px; 
//             background-color: #f4f4f4;
//         }
//         .email-container { 
//             max-width: 600px; 
//             margin: 0 auto; 
//             background: white; 
//             padding: 20px; 
//             border-radius: 8px; 
//             box-shadow: 0 2px 4px rgba(0,0,0,0.1);
//         }
//     </style>
// </head>
// <body>
//     <div class="email-container">
//         ${content}
//     </div>
// </body>
// </html>`;
// }

// export function CodeEditor({ html, onHTMLChange, onPreview, isMobile = false }: CodeEditorProps) {
//   const [code, setCode] = useState(html)
//   const [copied, setCopied] = useState(false)
//   const [isFullDocument, setIsFullDocument] = useState(false)
//   const [showPreview, setShowPreview] = useState(!isMobile)
  
//   const isSmallMobile = useMediaQuery('(max-width: 480px)')
//   const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)')

//   useEffect(() => {
//     setCode(html)
//     setIsFullDocument(html.includes('<html') || html.includes('<!DOCTYPE'))
    
//     // Auto-hide preview on mobile for better UX
//     if (isMobile) {
//       setShowPreview(false)
//     }
//   }, [html, isMobile])

//   const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     const newCode = e.target.value
//     setCode(newCode)
//     setIsFullDocument(newCode.includes('<html') || newCode.includes('<!DOCTYPE'))
    
//     const cleanedHtml = extractEmailBody(newCode)
//     onHTMLChange(cleanedHtml)
//   }

//   const wrapInDocument = () => {
//     const wrappedCode = wrapEmailContent(code)
//     setCode(wrappedCode)
//     setIsFullDocument(true)
//     onHTMLChange(extractEmailBody(wrappedCode))
//   }

//   const extractBodyOnly = () => {
//     const bodyOnly = extractEmailBody(code)
//     setCode(bodyOnly)
//     setIsFullDocument(false)
//     onHTMLChange(bodyOnly)
//   }

//   const copyToClipboard = async () => {
//     try {
//       await navigator.clipboard.writeText(code)
//       setCopied(true)
//       setTimeout(() => setCopied(false), 2000)
//     } catch (err) {
//       console.error("Failed to copy code:", err)
//     }
//   }

//   const downloadHTML = () => {
//     const blob = new Blob([code], { type: "text/html" })
//     const url = URL.createObjectURL(blob)
//     const a = document.createElement("a")
//     a.href = url
//     a.download = "email-template.html"
//     document.body.appendChild(a)
//     a.click()
//     document.body.removeChild(a)
//     URL.revokeObjectURL(url)
//   }

//   const getButtonSize = () => {
//     if (isSmallMobile) return 'sm'
//     if (isMobile) return 'sm'
//     return 'default'
//   }

//   const getIconSize = () => {
//     if (isSmallMobile) return 'w-3 h-3'
//     if (isMobile) return 'w-3 h-3'
//     return 'w-4 h-4'
//   }

//   const getTextSize = () => {
//     if (isSmallMobile) return 'text-xs'
//     if (isMobile) return 'text-xs'
//     return 'text-sm'
//   }

//   const getEditorLayout = () => {
//     if (isMobile && !showPreview) return 'full-editor'
//     if (isMobile && showPreview) return 'full-preview'
//     return 'split-view'
//   }

//   const editorLayout = getEditorLayout()

//   return (
//     <div className="h-full flex flex-col">
//       {/* Code Editor Header */}
//       <div className={`flex items-center justify-between border-b border-border bg-card ${
//         isSmallMobile ? 'p-2' : 'p-4'
//       }`}>
//         <div>
//           <h3 className={`font-medium ${getTextSize()}`}>HTML Code</h3>
//           <p className={`text-muted-foreground ${getTextSize()}`}>
//             {isFullDocument ? "Full HTML document" : "Email body content only"}
//           </p>
//         </div>
        
//         <div className="flex items-center gap-1 sm:gap-2">
//           {/* Mobile preview toggle */}
//           {isMobile && (
//             <Button
//               size={getButtonSize()}
//               variant="outline"
//               onClick={() => setShowPreview(!showPreview)}
//               className="flex items-center gap-1"
//             >
//               {showPreview ? (
//                 <>
//                   <PanelLeft className={getIconSize()} />
//                   {!isSmallMobile && "Code"}
//                 </>
//               ) : (
//                 <>
//                   <PanelRight className={getIconSize()} />
//                   {!isSmallMobile && "Preview"}
//                 </>
//               )}
//             </Button>
//           )}

//           {/* Document wrapper buttons - hide on very small mobile */}
//           {!isSmallMobile && (
//             <Button 
//               size={getButtonSize()} 
//               variant="outline" 
//               onClick={isFullDocument ? extractBodyOnly : wrapInDocument}
//             >
//               {isFullDocument ? "Body Only" : "Full Document"}
//             </Button>
//           )}

//           <Button size={getButtonSize()} variant="outline" onClick={copyToClipboard}>
//             <Copy className={`${getIconSize()} ${isSmallMobile ? '' : 'mr-1'}`} />
//             {!isSmallMobile && (copied ? "Copied!" : "Copy")}
//           </Button>

//           <Button size={getButtonSize()} variant="outline" onClick={downloadHTML}>
//             <Download className={`${getIconSize()} ${isSmallMobile ? '' : 'mr-1'}`} />
//             {!isSmallMobile && "Download"}
//           </Button>

//           <Button size={getButtonSize()} variant="outline" onClick={onPreview}>
//             <Eye className={`${getIconSize()} ${isSmallMobile ? '' : 'mr-1'}`} />
//             {!isSmallMobile && "Preview"}
//           </Button>
//         </div>
//       </div>

//       {/* Code Editor Content */}
//       <div className={`flex-1 flex ${
//         editorLayout === 'full-editor' ? 'flex-col' : 
//         editorLayout === 'full-preview' ? 'flex-col' : 
//         'flex-col md:flex-row'
//       }`}>
//         {/* Editor - Hidden on mobile when preview is shown */}
//         {(editorLayout === 'full-editor' || editorLayout === 'split-view') && (
//           <div className={`relative ${
//             editorLayout === 'split-view' ? 'md:w-1/2' : 'flex-1'
//           } ${showPreview ? 'flex' : 'hidden md:flex'}`}>
//             <textarea
//               value={code}
//               onChange={handleCodeChange}
//               className={`w-full font-mono bg-background border-0 resize-none focus:outline-none ${
//                 isSmallMobile ? 'p-2 text-xs' : 'p-4 text-sm'
//               }`}
//               placeholder="Enter your HTML code here..."
//               spellCheck={false}
//               style={{ 
//                 paddingLeft: isSmallMobile ? '2.5rem' : '3rem',
//                 lineHeight: '1.5'
//               }}
//             />
//             {/* Line numbers */}
//             <div className={`absolute left-0 top-0 pointer-events-none select-none ${
//               isSmallMobile ? 'p-2' : 'p-4'
//             }`}>
//               <div className={`font-mono text-muted-foreground/50 leading-[1.5] ${
//                 isSmallMobile ? 'text-xs' : 'text-sm'
//               }`}>
//                 {code.split("\n").map((_, index) => (
//                   <div key={index} className={`text-right ${
//                     isSmallMobile ? 'pr-2 min-w-[2rem]' : 'pr-2 min-w-[2.5rem]'
//                   }`}>
//                     {index + 1}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Live Preview - Hidden on mobile when editor is shown */}
//         {(editorLayout === 'full-preview' || editorLayout === 'split-view') && (
//           <div className={`border-border ${
//             editorLayout === 'split-view' ? 'md:w-1/2 md:border-l' : 'flex-1'
//           } ${!showPreview ? 'hidden md:flex' : 'flex'} flex-col`}>
//             <div className={`border-b border-border bg-muted/50 ${
//               isSmallMobile ? 'p-2' : 'p-4'
//             }`}>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h4 className={`font-medium ${getTextSize()}`}>Live Preview</h4>
//                   <p className={`text-muted-foreground ${getTextSize()}`}>
//                     See how your email will look
//                   </p>
//                 </div>
                
//                 {/* Mobile action buttons in preview mode */}
//                 {isMobile && showPreview && (
//                   <div className="flex gap-1">
//                     <Button
//                       size={getButtonSize()}
//                       variant="outline"
//                       onClick={copyToClipboard}
//                       className="h-7 w-7 p-0"
//                     >
//                       <Copy className={getIconSize()} />
//                     </Button>
//                     <Button
//                       size={getButtonSize()}
//                       variant="outline"
//                       onClick={downloadHTML}
//                       className="h-7 w-7 p-0"
//                     >
//                       <Download className={getIconSize()} />
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             </div>
            
//             <div className="flex-1 overflow-auto bg-white">
//               <iframe
//                 srcDoc={wrapEmailContent(code)}
//                 className="w-full h-full border-0"
//                 title="Email Preview"
//                 sandbox="allow-same-origin"
//               />
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Mobile bottom bar for quick actions */}
//       {isMobile && (
//         <div className="border-t border-border bg-card p-2">
//           <div className="flex justify-between items-center">
//             <div className="flex gap-1">
//               <Button
//                 size="sm"
//                 variant="ghost"
//                 onClick={isFullDocument ? extractBodyOnly : wrapInDocument}
//                 className="text-xs"
//               >
//                 {isFullDocument ? "Body Only" : "Full Doc"}
//               </Button>
//             </div>
            
//             <div className="flex gap-1">
//               <Button
//                 size="sm"
//                 variant="ghost"
//                 onClick={copyToClipboard}
//                 className="text-xs"
//               >
//                 <Copy className="w-3 h-3 mr-1" />
//                 {copied ? "Copied!" : "Copy"}
//               </Button>
//               <Button
//                 size="sm"
//                 variant="ghost"
//                 onClick={downloadHTML}
//                 className="text-xs"
//               >
//                 <Download className="w-3 h-3 mr-1" />
//                 Save
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Icons } from "@/lib/utils/icons"

interface EmailPreviewProps {
  isOpen: boolean
  onClose: () => void
  html: string
  subject: string
}

export function EmailPreview({ isOpen, onClose, html, subject }: EmailPreviewProps) {
  const downloadHTML = () => {
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "email-template.html"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const sendTestEmail = () => {
    console.log("[v0] Sending test email with HTML:", html)
    // In a real implementation, this would send the email via API
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <DialogTitle>Email Preview</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">Subject: {subject}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={downloadHTML}>
              <Icons.Download className="w-3 h-3 mr-1" />
              Download
            </Button>
            <Button size="sm" variant="outline" onClick={sendTestEmail}>
              <Icons.Send className="w-3 h-3 mr-1" />
              Send Test
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <Icons.X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 border border-border rounded-md overflow-hidden bg-white">
          <iframe
            srcDoc={html}
            className="w-full h-full border-0"
            title="Email Preview"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}




// "use client"

// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Download, Send, X, Smartphone, Monitor } from "lucide-react"
// import { useState } from "react"
// import { useMediaQuery } from "@/lib/hooks/use-media-query"

// interface EmailPreviewProps {
//   isOpen: boolean
//   onClose: () => void
//   html: string
//   subject: string
//   isMobile?: boolean
// }

// export function EmailPreview({ isOpen, onClose, html, subject, isMobile = false }: EmailPreviewProps) {
//   const isSmallMobile = useMediaQuery('(max-width: 480px)')
//   const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
//   const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('desktop')

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

//   const getDialogSize = () => {
//     if (isSmallMobile) return 'max-w-[95vw] w-[95vw] h-[90vh] mx-2'
//     if (isMobile) return 'max-w-[95vw] w-[95vw] h-[85vh] mx-4'
//     if (isTablet) return 'max-w-4xl h-[80vh]'
//     return 'max-w-6xl h-[80vh]'
//   }

//   const getPreviewWrapperClass = () => {
//     if (previewMode === 'mobile') {
//       return 'max-w-[375px] mx-auto border-x-8 border-t-8 border-b-16 border-gray-400 rounded-[2rem] bg-gray-400 overflow-hidden'
//     }
//     return 'w-full h-full'
//   }

//   const getPreviewIframeClass = () => {
//     if (previewMode === 'mobile') {
//       return 'w-full h-[600px] border-0'
//     }
//     return 'w-full h-full border-0'
//   }

//   const downloadHTML = () => {
//     const blob = new Blob([html], { type: "text/html" })
//     const url = URL.createObjectURL(blob)
//     const a = document.createElement("a")
//     a.href = url
//     a.download = "email-template.html"
//     document.body.appendChild(a)
//     a.click()
//     document.body.removeChild(a)
//     URL.revokeObjectURL(url)
//   }

//   const sendTestEmail = () => {
//     console.log("[v0] Sending test email with HTML:", html)
//   }

//   const wrapEmailContent = (content: string): string => {
//     if (content.includes('<html') || content.includes('<!DOCTYPE')) {
//       return content
//     }
    
//     return `<!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>${subject}</title>
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
//         @media (max-width: 600px) {
//             body { padding: 10px; }
//             .email-container { padding: 15px; }
//         }
//     </style>
// </head>
// <body>
//     <div class="email-container">
//         ${content}
//     </div>
// </body>
// </html>`
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className={`flex flex-col ${getDialogSize()}`}>
//         <DialogHeader className={`flex flex-row items-center justify-between space-y-0 pb-4 ${
//           isSmallMobile ? 'px-2' : 'px-6'
//         }`}>
//           <div className="flex-1 min-w-0">
//             <DialogTitle className={`truncate ${isSmallMobile ? 'text-base' : ''}`}>
//               Email Preview
//             </DialogTitle>
//             <p className={`text-muted-foreground mt-1 truncate ${getTextSize()}`}>
//               Subject: {subject}
//             </p>
//           </div>
          
//           <div className="flex items-center gap-1 flex-shrink-0">
//             {/* Preview Mode Toggle - Hide on very small mobile */}
//             {!isSmallMobile && (
//               <div className="flex items-center border border-border rounded-md mr-2">
//                 <Button
//                   size={getButtonSize()}
//                   variant={previewMode === 'mobile' ? 'default' : 'ghost'}
//                   onClick={() => setPreviewMode('mobile')}
//                   className="rounded-r-none px-2"
//                 >
//                   <Smartphone className={getIconSize()} />
//                 </Button>
//                 <Button
//                   size={getButtonSize()}
//                   variant={previewMode === 'desktop' ? 'default' : 'ghost'}
//                   onClick={() => setPreviewMode('desktop')}
//                   className="rounded-l-none px-2"
//                 >
//                   <Monitor className={getIconSize()} />
//                 </Button>
//               </div>
//             )}

//             <Button 
//               size={getButtonSize()} 
//               variant="outline" 
//               onClick={downloadHTML}
//               className={isSmallMobile ? 'px-2' : ''}
//             >
//               <Download className={`${getIconSize()} ${isSmallMobile ? '' : 'mr-1'}`} />
//               {!isSmallMobile && "Download"}
//             </Button>

//             <Button 
//               size={getButtonSize()} 
//               variant="outline" 
//               onClick={sendTestEmail}
//               className={isSmallMobile ? 'px-2' : ''}
//             >
//               <Send className={`${getIconSize()} ${isSmallMobile ? '' : 'mr-1'}`} />
//               {!isSmallMobile && "Test"}
//             </Button>

//             <Button 
//               size={getButtonSize()} 
//               variant="ghost" 
//               onClick={onClose}
//               className={isSmallMobile ? 'px-2' : ''}
//             >
//               <X className={getIconSize()} />
//             </Button>
//           </div>
//         </DialogHeader>

//         <div className={`flex-1 border border-border rounded-md overflow-hidden bg-white ${
//           isSmallMobile ? 'mx-2 mb-2' : 'mx-6 mb-6'
//         }`}>
//           <div className={getPreviewWrapperClass()}>
//             <iframe
//               srcDoc={wrapEmailContent(html)}
//               className={getPreviewIframeClass()}
//               title="Email Preview"
//               sandbox="allow-same-origin allow-scripts"
//             />
//           </div>
//         </div>

//         {/* Mobile preview mode indicator */}
//         {isMobile && (
//           <div className="border-t border-border bg-muted/50 p-2">
//             <div className="flex items-center justify-center gap-4">
//               <Button
//                 size="sm"
//                 variant={previewMode === 'mobile' ? 'default' : 'outline'}
//                 onClick={() => setPreviewMode('mobile')}
//                 className="flex items-center gap-1"
//               >
//                 <Smartphone className="w-3 h-3" />
//                 <span className="text-xs">Mobile</span>
//               </Button>
//               <Button
//                 size="sm"
//                 variant={previewMode === 'desktop' ? 'default' : 'outline'}
//                 onClick={() => setPreviewMode('desktop')}
//                 className="flex items-center gap-1"
//               >
//                 <Monitor className="w-3 h-3" />
//                 <span className="text-xs">Desktop</span>
//               </Button>
//             </div>
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   )
// }
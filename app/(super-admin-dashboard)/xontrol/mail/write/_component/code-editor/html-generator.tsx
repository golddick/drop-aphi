// "use client"

// interface EmailElement {
//   id: string
//   type: "text" | "image" | "video" | "button" | "social" | "divider" | "columns" | "logo"
//   content?: string
//   properties?: Record<string, any>
//   children?: EmailElement[]
// }

// const renderElement = (element: EmailElement): string => {
//   const props = element.properties || {}

//   switch (element.type) {
//     case "text":
//       const textStyle = {
//         fontSize: `${props.fontSize || 16}px`,
//         color: props.color || "#000000",
//         textAlign: props.alignment || "left",
//         fontWeight: props.bold ? "bold" : "normal",
//         fontStyle: props.italic ? "italic" : "normal",
//         margin: "16px 0",
//       }
//       const textContent = element.content || "Sample text"
//       const processedContent = textContent
//         .split("\n")
//         .map((line) => line.trim())
//         .filter((line) => line)
//         .join("<br />")

//       const textElement = props.link
//         ? `<a href="${props.link}" style="color: inherit; text-decoration: underline;">${processedContent}</a>`
//         : processedContent

//       return `<p style="${Object.entries(textStyle)
//         .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
//         .join("; ")}">${textElement}</p>`

//     case "image":
//       const imgStyle: Record<string, any> = {
//         maxWidth: "100%",
//         height: "auto",
//         display: "block",
//         margin: props.alignment === "center" ? "0 auto" : props.alignment === "right" ? "0 0 0 auto" : "0",
//         borderRadius: props.borderRadius ? `${props.borderRadius}px` : "0",
//         opacity: props.opacity ? props.opacity / 100 : 1,
//         transform: props.rotation ? `rotate(${props.rotation}deg)` : "none",
//       }
//       if (props.width) imgStyle.width = `${props.width}px`
//       if (props.height) imgStyle.height = `${props.height}px`

//       return `<img src="${props.src || "/placeholder.svg?height=200&width=400"}" alt="${props.alt || "Email image"}" style="${Object.entries(
//         imgStyle,
//       )
//         .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
//         .join("; ")}" />`

//     case "video":
//       const videoStyle: Record<string, any> = {
//         maxWidth: "100%",
//         height: "auto",
//         display: "block",
//         margin: props.alignment === "center" ? "0 auto" : props.alignment === "right" ? "0 0 0 auto" : "0",
//         borderRadius: props.borderRadius ? `${props.borderRadius}px` : "0",
//       }
//       if (props.width) videoStyle.width = `${props.width}px`
//       if (props.height) videoStyle.height = `${props.height}px`

//       const videoAttributes = []
//       if (props.controls !== false) videoAttributes.push("controls")
//       if (props.autoplay) videoAttributes.push("autoplay")
//       if (props.muted) videoAttributes.push("muted")
//       if (props.loop) videoAttributes.push("loop")
//       if (props.poster) videoAttributes.push(`poster="${props.poster}"`)

//       return `<video src="${props.src || ""}" ${videoAttributes.join(" ")} style="${Object.entries(videoStyle)
//         .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
//         .join("; ")}">
//         Your email client does not support video playback.
//       </video>`

//     case "button":
//       const buttonStyle = {
//         backgroundColor: props.backgroundColor || "#000000",
//         color: props.textColor || "#ffffff",
//         padding: props.size === "sm" ? "8px 16px" : props.size === "lg" ? "16px 32px" : "12px 24px",
//         fontSize: props.size === "sm" ? "14px" : props.size === "lg" ? "18px" : "16px",
//         border: "none",
//         borderRadius: "4px",
//         textDecoration: "none",
//         display: "inline-block",
//         margin: "16px 0",
//         fontWeight: "500", // Added consistent font weight
//       }
//       const buttonContainer =
//         props.alignment === "center"
//           ? "text-align: center;"
//           : props.alignment === "right"
//             ? "text-align: right;"
//             : "text-align: left;"

//       return `<div style="${buttonContainer}"><a href="${props.link || "#"}" style="${Object.entries(buttonStyle)
//         .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
//         .join("; ")}">${props.text || element.content || "Click me"}</a></div>`

//     case "social":
//       if (!props.platform) return ""
//       const socialColors = {
//         facebook: "#1877F2",
//         twitter: "#1DA1F2",
//         instagram: "#E4405F",
//         linkedin: "#0A66C2",
//         youtube: "#FF0000",
//         email: "#666666",
//       }

//       // cast the platform to the keys of socialColors to satisfy TypeScript indexing
//       const platformKey = props.platform as keyof typeof socialColors

//       const iconSize = props.iconSize || 24
//       const socialIconStyle = {
//         width: `${iconSize}px`,
//         height: `${iconSize}px`,
//         backgroundColor: props.backgroundColor || socialColors[platformKey] || "#666666",
//         borderRadius: props.borderRadius ? `${props.borderRadius}px` : "50%",
//         display: "inline-flex",
//         alignItems: "center",
//         justifyContent: "center",
//         margin: `${props.spacing || 8}px 4px`,
//         textDecoration: "none",
//       }

//       const socialContainer =
//         props.alignment === "center"
//           ? "text-align: center;"
//           : props.alignment === "right"
//             ? "text-align: right;"
//             : "text-align: left;"

//       const platformIcons: Record<string, string> = {
//         facebook: "f",
//         twitter: "t",
//         instagram: "i",
//         linkedin: "in",
//         youtube: "▶",
//         email: "@",
//       }

//       return `<div style="${socialContainer}"><a href="${props.url || "#"}" style="${Object.entries(socialIconStyle)
//         .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
//         .join(
//           "; ",
//         )}"><span style="color: ${props.iconColor || "white"}; font-size: ${iconSize / 2}px; font-weight: bold;">${platformIcons[platformKey] || "?"}</span></a></div>`

//     case "divider":
//       const dividerStyle = {
//         border: "none",
//         borderTop: `${props.thickness || 1}px ${props.style || "solid"} ${props.color || "#e5e5e5"}`,
//         margin: `${props.margin || 16}px 0`,
//       }

//       return `<hr style="${Object.entries(dividerStyle)
//         .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
//         .join("; ")}" />`

//     case "columns":
//       const { columns = 2, gap = 16, alignment = "top", columnElements = [] } = element.properties || {}

//       const alignmentKey = (alignment as "top" | "center" | "bottom") || "top"

//       const alignmentStyle = {
//         top: "vertical-align: top;",
//         center: "vertical-align: middle;",
//         bottom: "vertical-align: bottom;",
//       }[alignmentKey]

//       const columnWidth = `${Math.floor((100 - (columns - 1) * 2) / columns)}%`
//       const gapStyle = gap > 0 ? `padding-right: ${gap}px;` : ""

//       const columnsHTML = Array.from({ length: columns }, (_, index) => {
//         const columnContent = columnElements[index] || []
//         const elementsHTML = columnContent.map((el: any) => renderElement(el)).join("")

//         return `
//           <td style="width: ${columnWidth}; ${alignmentStyle} ${index < columns - 1 ? gapStyle : ""}" class="column">
//             ${elementsHTML || `<p style="color: #666; font-size: 14px; text-align: center; padding: 20px;">Column ${index + 1}</p>`}
//           </td>
//         `
//       }).join("")

//       return `
//         <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
//           <tr>
//             ${columnsHTML}
//           </tr>
//         </table>
//       `

//     case "logo":
//       const logoStyle: Record<string, any> = {
//         maxWidth: "100%",
//         height: "auto",
//         display: "block",
//         margin: props.alignment === "center" ? "0 auto" : props.alignment === "right" ? "0 0 0 auto" : "0",
//         borderRadius: props.borderRadius ? `${props.borderRadius}px` : "0",
//       }
//       if (props.width) logoStyle.width = `${props.width}px`
//       if (props.height) logoStyle.height = `${props.height}px`

//       return `<img src="${props.src || "/placeholder.svg?height=60&width=120"}" alt="Logo" style="${Object.entries(
//         logoStyle,
//       )
//         .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
//         .join("; ")}" />`

//     default:
//       return ` ${element.type} element `
//   }
// }

// export function generateEmailHTML(elements: EmailElement[], subject: string, bodyBackgroundColor?: string): string {
//   const emailHTML = `<!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>${subject}</title>
//     <style>
//         body {
//             font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//             line-height: 1.6;
//             color: #333;
//             max-width: 600px;
//             margin: 0 auto;
//             padding: 20px;
//             background-color: ${bodyBackgroundColor || "#ffffff"};
//         }
//         * {
//             box-sizing: border-box;
//         }
//         img {
//             max-width: 100%;
//             height: auto;
//         }
//         a {
//             color: #007bff;
//         }
//         table {
//             border-collapse: collapse;
//         }
//         video {
//             max-width: 100%;
//             height: auto;
//         }
//     </style>
// </head>
// <body>
// ${elements.map(renderElement).join("\n")}
// </body>
// </html>`

//   return emailHTML
// }

// export function parseHTMLToElements(html: string): EmailElement[] {
//   // This is a simplified parser - in a real implementation, you'd use a proper HTML parser
//   // For now, return empty array as parsing HTML back to elements is complex
//   return []
// }





"use client"

interface EmailElement {
  id: string
  type: "text" | "image" | "video" | "button" | "social" | "divider" | "columns" | "logo"
  content?: string
  properties?: Record<string, any>
  children?: EmailElement[]
}

const renderElement = (element: EmailElement): string => {
  const props = element.properties || {}

  switch (element.type) {
    case "text":
      const textStyle = {
        fontSize: `${props.fontSize || 16}px`,
        color: props.color || "#000000",
        textAlign: props.alignment || "left",
        fontWeight: props.bold ? "bold" : "normal",
        fontStyle: props.italic ? "italic" : "normal",
        margin: "16px 0",
      }
      const textContent = element.content || "Sample text"
      const processedContent = textContent
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line)
        .join("<br />")

      const textElement = props.link
        ? `<a href="${props.link}" style="color: inherit; text-decoration: underline;">${processedContent}</a>`
        : processedContent

      return `<p style="${Object.entries(textStyle)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
        .join("; ")}">${textElement}</p>`

    case "image":
      const imgStyle: Record<string, any> = {
        maxWidth: "100%",
        height: "auto",
        display: "block",
        margin: props.alignment === "center" ? "0 auto" : props.alignment === "right" ? "0 0 0 auto" : "0",
        borderRadius: props.borderRadius ? `${props.borderRadius}px` : "0",
        opacity: props.opacity ? props.opacity / 100 : 1,
        transform: props.rotation ? `rotate(${props.rotation}deg)` : "none",
      }
      if (props.width) imgStyle.width = `${props.width}px`
      if (props.height) imgStyle.height = `${props.height}px`

      return `<img src="${props.src || "/placeholder.svg?height=200&width=400"}" alt="${props.alt || "Email image"}" style="${Object.entries(
        imgStyle,
      )
        .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
        .join("; ")}" />`

    case "video":
      const videoStyle: Record<string, any> = {
        maxWidth: "100%",
        height: "auto",
        display: "block",
        margin: props.alignment === "center" ? "0 auto" : props.alignment === "right" ? "0 0 0 auto" : "0",
        borderRadius: props.borderRadius ? `${props.borderRadius}px` : "0",
      }
      if (props.width) videoStyle.width = `${props.width}px`
      if (props.height) videoStyle.height = `${props.height}px`

      const videoAttributes = []
      if (props.controls !== false) videoAttributes.push("controls")
      if (props.autoplay) videoAttributes.push("autoplay")
      if (props.muted) videoAttributes.push("muted")
      if (props.loop) videoAttributes.push("loop")
      if (props.poster) videoAttributes.push(`poster="${props.poster}"`)

      return `<video src="${props.src || ""}" ${videoAttributes.join(" ")} style="${Object.entries(videoStyle)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
        .join("; ")}">
        Your email client does not support video playback.
      </video>`

    case "button":
      const buttonStyle = {
        backgroundColor: props.backgroundColor || "#000000",
        color: props.textColor || "#ffffff",
        padding: props.size === "sm" ? "8px 16px" : props.size === "lg" ? "16px 32px" : "12px 24px",
        fontSize: props.size === "sm" ? "14px" : props.size === "lg" ? "18px" : "16px",
        border: "none",
        borderRadius: "4px",
        textDecoration: "none",
        display: "inline-block",
        margin: "16px 0",
        fontWeight: "500",
      }
      const buttonContainer =
        props.alignment === "center"
          ? "text-align: center;"
          : props.alignment === "right"
            ? "text-align: right;"
            : "text-align: left;"

      return `<div style="${buttonContainer}"><a href="${props.link || "#"}" style="${Object.entries(buttonStyle)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
        .join("; ")}">${props.text || element.content || "Click me"}</a></div>`

    // case "social":
    //   if (!props.platform) return ""
    //   const socialColors = {
    //     facebook: "#1877F2",
    //     twitter: "#1DA1F2",
    //     instagram: "#E4405F",
    //     linkedin: "#0A66C2",
    //     youtube: "#FF0000",
    //     email: "#666666",
    //   }

    //   const platformKey = props.platform as keyof typeof socialColors

    //   const iconSize = props.iconSize || 24
    //   const socialIconStyle = {
    //     width: `${iconSize}px`,
    //     height: `${iconSize}px`,
    //     backgroundColor: props.backgroundColor || socialColors[platformKey] || "#666666",
    //     borderRadius: props.borderRadius ? `${props.borderRadius}px` : "50%",
    //     display: "inline-flex",
    //     alignItems: "center",
    //     justifyContent: "center",
    //     margin: `${props.spacing || 8}px 4px`,
    //     textDecoration: "none",
    //   }

    //   const socialContainer =
    //     props.alignment === "center"
    //       ? "text-align: center;"
    //       : props.alignment === "right"
    //         ? "text-align: right;"
    //         : "text-align: left;"

    //   const platformIcons: Record<string, string> = {
    //     facebook: "f",
    //     twitter: "t",
    //     instagram: "i",
    //     linkedin: "in",
    //     youtube: "▶",
    //     email: "@",
    //   }

    //   return `<div style="${socialContainer}"><a href="${props.url || "#"}" style="${Object.entries(socialIconStyle)
    //     .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
    //     .join(
    //       "; ",
    //     )}"><span style="color: ${props.iconColor || "white"}; font-size: ${iconSize / 2}px; font-weight: bold;">${platformIcons[platformKey] || "?"}</span></a></div>`

    case "social":
  if (!props.platforms || !Array.isArray(props.platforms) || props.platforms.length === 0) return ""
  
  const socialColors = {
    facebook: "#1877F2",
    twitter: "#1DA1F2",
    instagram: "#E4405F",
    linkedin: "#0A66C2",
    youtube: "#FF0000",
    whatsapp: "#25D366",
    tiktok: "#000000",
    pinterest: "#E60023",
    snapchat: "#FFFC00",
    email: "#666666",
    website: "#333333",
  }

  const platformIcons: Record<string, string> = {
    facebook: `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>`,
    twitter: `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>`,
    instagram: `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>`,
    linkedin: `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>`,
    youtube: `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>`,
    whatsapp: `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893-.001-3.189-1.262-6.187-3.55-8.444"/>
      </svg>`,
    tiktok: `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"/>
      </svg>`,
    pinterest: `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.017 12.014 0z"/>
      </svg>`,
    email: `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12.713l-11.985-9.713h23.97l-11.985 9.713zm0 2.574l-12-9.725v15.438h24v-15.438l-12 9.725z"/>
      </svg>`,
    website: `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm10 12c0 .685-.07 1.354-.202 2h-3.853c.119-1.014.182-2.031.182-3s-.063-1.986-.182-3h3.853c.132.646.202 1.315.202 2zm-.834 4h-3.145c-.385 1.011-.899 1.964-1.525 2.832 2.357.975 4.169 2.713 5.032 4.768.477-1.168.75-2.437.75-3.768 0-1.303-.256-2.543-.712-3.692zm-7.166-10c-1.044 0-2.063.066-3.047.188.119 1.014.182 2.031.182 3s-.063 1.986-.182 3h6.094c-.119-1.014-.182-2.031-.182-3s.063-1.986.182-3h-6.094c.984-.122 2.003-.188 3.047-.188zm0-2c-1.923 0-3.78.33-5.514.943.632 2.401 1.017 4.889 1.017 7.057 0 2.168-.385 4.656-1.017 7.057 1.734.613 3.591.943 5.514.943s3.78-.33 5.514-.943c-.632-2.401-1.017-4.889-1.017-7.057 0-2.168.385-4.656 1.017-7.057-1.734-.613-3.591-.943-5.514-.943zm-7.348 13.768c.863-2.055 2.675-3.793 5.032-4.768-.626-.868-1.14-1.821-1.525-2.832h-3.145c-.456 1.149-.712 2.389-.712 3.692 0 1.331.273 2.6.75 3.768zm-1.977-9.768h3.853c-.119 1.014-.182 2.031-.182 3s.063 1.986.182 3h-3.853c-.132-.646-.202-1.315-.202-2s.07-1.354.202-2z"/>
      </svg>`,
  }

  const iconSize = props.iconSize || 24
  const spacing = props.spacing || 8
  
  const socialContainer = props.alignment === "center" 
    ? "text-align: center;" 
    : props.alignment === "right" 
      ? "text-align: right;" 
      : "text-align: left;"

  const socialIconsHTML = props.platforms.map((platform: any) => {
    const platformKey = platform.name as keyof typeof socialColors
    const backgroundColor = platform.backgroundColor || socialColors[platformKey] || "#666666"
    const iconColor = platform.iconColor || "white"
    const url = platform.url || "#"
    
    const socialIconStyle = {
      width: `${iconSize}px`,
      height: `${iconSize}px`,
      backgroundColor: backgroundColor,
      borderRadius: props.borderRadius ? `${props.borderRadius}px` : "50%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      margin: `0 ${spacing}px`,
      textDecoration: "none",
      transition: "all 0.2s ease",
    }

    return `
      <a href="${url}" target="_blank" style="${Object.entries(socialIconStyle)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
        .join("; ")}" 
        onmouseover="this.style.opacity='0.8'" 
        onmouseout="this.style.opacity='1'">
        ${platformIcons[platformKey] || `<span style="color: ${iconColor}; font-size: ${iconSize / 2}px; font-weight: bold;">?</span>`}
      </a>
    `
  }).join("")

  return `
    <div style="${socialContainer} margin: 16px 0;">
      <div style="display: inline-block;">
        ${socialIconsHTML}
      </div>
    </div>
  `



    case "divider":
      const dividerStyle = {
        border: "none",
        borderTop: `${props.thickness || 1}px ${props.style || "solid"} ${props.color || "#e5e5e5"}`,
        margin: `${props.margin || 16}px 0`,
      }

      return `<hr style="${Object.entries(dividerStyle)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
        .join("; ")}" />`

    case "columns":
      const { columns = 2, gap = 16, alignment = "top", columnElements = [] } = element.properties || {}

      const alignmentKey = (alignment as "top" | "center" | "bottom") || "top"

      const alignmentStyle = {
        top: "vertical-align: top;",
        center: "vertical-align: middle;",
        bottom: "vertical-align: bottom;",
      }[alignmentKey]

      const columnWidth = `${Math.floor((100 - (columns - 1) * 2) / columns)}%`
      const gapStyle = gap > 0 ? `padding-right: ${gap}px;` : ""

      const columnsHTML = Array.from({ length: columns }, (_, index) => {
        const columnContent = columnElements[index] || []
        const elementsHTML = columnContent.map((el: any) => renderElement(el)).join("")

        return `
          <td style="width: ${columnWidth}; ${alignmentStyle} ${index < columns - 1 ? gapStyle : ""}" class="column">
            ${elementsHTML || `<p style="color: #666; font-size: 14px; text-align: center; padding: 20px;">Column ${index + 1}</p>`}
          </td>
        `
      }).join("")

      return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
          <tr>
            ${columnsHTML}
          </tr>
        </table>
      `

    case "logo":
      const logoStyle: Record<string, any> = {
        maxWidth: "100%",
        height: "auto",
        display: "block",
        margin: props.alignment === "center" ? "0 auto" : props.alignment === "right" ? "0 0 0 auto" : "0",
        borderRadius: props.borderRadius ? `${props.borderRadius}px` : "0",
      }
      if (props.width) logoStyle.width = `${props.width}px`
      if (props.height) logoStyle.height = `${props.height}px`

      return `<img src="${props.src || "/placeholder.svg?height=60&width=120"}" alt="Logo" style="${Object.entries(
        logoStyle,
      )
        .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
        .join("; ")}" />`

    default:
      return ` ${element.type} element `
  }
}

export function generateEmailHTML(elements: EmailElement[], subject: string, bodyBackgroundColor?: string): string {
  const emailHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        /* Base styles for mobile-first approach */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0 auto;
            padding: 20px;
            background-color: ${bodyBackgroundColor || "#ffffff"};
            width: 100%;
            max-width: 80%; /* 80% on small devices */
        }

        /* Responsive container for email content */
        .email-container {
            width: 100%;
            max-width: 80%; /* Default for mobile */
            margin: 0 auto;
        }

        * {
            box-sizing: border-box;
        }
        img {
            max-width: 100%;
            height: auto;
        }
        a {
            color: #007bff;
        }
        table {
            border-collapse: collapse;
            width: 100%;
        }
        video {
            max-width: 100%;
            height: auto;
        }

        /* Media query for larger screens */
        @media (min-width: 768px) {
            body {
                max-width: 600px; /* 600px on larger screens */
                padding: 40px 20px;
            }
            
            .email-container {
                max-width: 600px;
            }
        }

        /* Media query for very small screens */
        @media (max-width: 480px) {
            body {
                max-width: 90%; /* Slightly more width on very small screens */
                padding: 16px 12px;
            }
            
            .email-container {
                max-width: 90%;
            }
        }

        /* Ensure tables are responsive on mobile */
        @media (max-width: 767px) {
            table.column-layout td {
                display: block;
                width: 100% !important;
                padding-right: 0 !important;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        ${elements.map(renderElement).join("\n")}
    </div>
</body>
</html>`

  return emailHTML
}

// export function parseHTMLToElements(html: string): EmailElement[] {
//   // This is a simplified parser - in a real implementation, you'd use a proper HTML parser
//   // For now, return empty array as parsing HTML back to elements is complex
//   return []
// }
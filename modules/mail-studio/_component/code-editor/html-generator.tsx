



"use client"

interface EmailElement {
  id: string
  type: "text" | "image" | "video" | "button" | "social" | "divider" | "columns"
  content?: string
  properties?: Record<string, any>
  children?: EmailElement[]
}

const renderElement = (element: EmailElement): string => {
  const props = element.properties || {}

  switch (element.type) {
    case "text":
      const textStyle = {
        "font-size": `${props.fontSize || 16}px`,
        "color": props.color || "#000000",
        "text-align": props.alignment || "left",
        "font-weight": props.bold ? "bold" : "normal",
        "font-style": props.italic ? "italic" : "normal",
        "margin":  props.backgroundColor ? "4px 4px" : "0",
        "line-height": props.lineHeight || 1.6,
        "font-family": props.fontFamily || "Arial, sans-serif,Comic Sans MS, cursive,Impact, sans-serif, 'Times New Roman', serif",
        "text-decoration": props.underline ? "underline" : "none",
        "background-color": props.backgroundColor || "transparent",
        "padding": props.backgroundColor ? "4px 4px" : "0",
        "border-radius": props.backgroundColor ? "4px" : "0",
      }
      
      const textContent = element.content || "Sample text"
      
      return `<div style="${Object.entries(textStyle)
        .map(([key, value]) => `${key}: ${value}`)
        .join("; ")}">${textContent}</div>`

    case "image":
      const imgStyle: Record<string, string> = {
        "max-width": "100%",
        "height": props.height ? `${props.height}px` : "auto",
        "display": "block",
        "margin": props.alignment === "center" ? "0 auto" : 
                 props.alignment === "right" ? "0 0 0 auto" : "0",
        "border-radius": props.borderRadius ? `${props.borderRadius}px` : "0",
        "opacity": props.opacity ? `${props.opacity / 100}` : "1",
        "transform": props.rotation ? `rotate(${props.rotation}deg)` : "none",
      }
      
      if (props.width) imgStyle.width = `${props.width}px`

      return `<div style="text-align: ${props.alignment || "left"};">
        <img src="${props.src || "/placeholder.svg?height=200&width=400"}" 
             alt="${props.alt || "Email image"}" 
             style="${Object.entries(imgStyle)
               .map(([key, value]) => `${key}: ${value}`)
               .join("; ")}" />
      </div>`

    case "video":
      const videoStyle: Record<string, string> = {
        "max-width": "100%",
        "height": props.height ? `${props.height}px` : "auto",
        "display": "block",
        "margin": props.alignment === "center" ? "0 auto" : 
                 props.alignment === "right" ? "0 0 0 auto" : "0",
        "border-radius": props.borderRadius ? `${props.borderRadius}px` : "0",
      }
      
      if (props.width) videoStyle.width = `${props.width}px`

      const videoAttributes = []
      if (props.controls !== false) videoAttributes.push("controls")
      if (props.autoplay) videoAttributes.push("autoplay")
      if (props.muted) videoAttributes.push("muted")
      if (props.loop) videoAttributes.push("loop")
      if (props.poster) videoAttributes.push(`poster="${props.poster}"`)

      return `<div style="text-align: ${props.alignment || "left"};">
        <video src="${props.src || ""}" ${videoAttributes.join(" ")} 
               style="${Object.entries(videoStyle)
                 .map(([key, value]) => `${key}: ${value}`)
                 .join("; ")}">
          Your email client does not support video playback.
        </video>
      </div>`

    case "button":
      const buttonStyle = {
        "background-color": props.backgroundColor || "#000000",
        "color": props.textColor || "#ffffff",
        "padding": props.size === "sm" ? "2px 2px" : props.size === "lg" ? "4px 4px" : "8px 8px",
        "font-size": props.size === "sm" ? "14px" : props.size === "lg" ? "18px" : "16px",
        "border": "none",
        "border-radius": "4px",
        "text-decoration": "none",
        "display": "inline-block",
        "margin": "2px 2px",
        "font-weight": props.bold ? "bold" : "500",
        "font-family": props.fontFamily || "inherit",
        "text-align": "center",
      }

      return `<div style="text-align: ${props.alignment || "left"};">
        <a href="${props.link || "#"}" 
           style="${Object.entries(buttonStyle)
             .map(([key, value]) => `${key}: ${value}`)
             .join("; ")}">
          ${props.text || element.content || "Click me"}
        </a>
      </div>`

      case "social": {
  const links =
    props.links || (props.platform ? [{ platform: props.platform, url: props.url }] : [])
  if (!links || links.length === 0) {
    return `<div style="text-align: center; color: #666; padding: 8px; margin: 4px 0;">
      No social links configured
    </div>`
  }

  const socialColors: Record<string, string> = {
    facebook: "#1877F2",
    twitter: "#1DA1F2",
    instagram: "#E4405F",
    linkedin: "#0A66C2",
    youtube: "#FF0000",
    email: "#666666",
  }

  const platformIcons: Record<string, string> = {
    facebook: "F",
    twitter: "X",
    instagram: "📷",
    linkedin: "in",
    youtube: "▶",
    email: "@",
  }

  const socialAlignment =
    props.alignment === "center"
      ? "text-align: center;"
      : props.alignment === "right"
      ? "text-align: right;"
      : "text-align: left;"

  const iconSize = props.iconSize || 32
  const spacing = props.spacing || 8

  const socialLinksHTML = links
    .map((link: any) => {
      const platform = link.platform?.toLowerCase()
      if (!platform || !socialColors[platform]) return ""

      const bgColor = props.backgroundColor || socialColors[platform]
      const borderRadius = props.borderRadius ? `${props.borderRadius}px` : "50%"
      const fontSize = Math.floor(iconSize * 0.6)

      return `
        <a href="${link.url || "#"}" target="_blank" style="margin:0 ${spacing / 2}px; text-decoration:none; display:inline-block;">
          <table border="0" cellspacing="0" cellpadding="0" role="presentation"
            style="background:${bgColor}; border-radius:${borderRadius}; width:${iconSize}px; height:${iconSize}px;">
            <tr>
              <td align="center" valign="middle" style="text-align:center; vertical-align:middle;">
                <span style="color:${props.iconColor || "white"}; font-size:${fontSize}px; font-weight:bold; line-height:1;">
                  ${platformIcons[platform] || "?"}
                </span>
              </td>
            </tr>
          </table>
        </a>`
    })
    .join("")

  return `<div style="${socialAlignment}; margin:8px 0; line-height:0; font-size:0;">${socialLinksHTML}</div>`
}




    case "divider":
      const dividerStyle = {
        "border": "none",
        "border-top": `${props.thickness || 1}px ${props.style || "solid"} ${props.color || "#e5e5e5"}`,
        "margin": `${props.margin || 4}px 0`,
      }

      return `<hr style="${Object.entries(dividerStyle)
        .map(([key, value]) => `${key}: ${value}`)
        .join("; ")}" />`

    case "columns":
      const { columns = 2, gap = 8, alignment = "top", columnElements = [] } = element.properties || {}

      type AlignmentType = "top" | "center" | "bottom";
      const alignmentKey: AlignmentType = alignment;
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
            ${elementsHTML || `<p style="color: #666; font-size: 14px; text-align: center; padding: 2px;">Column ${index + 1}</p>`}
          </td>
        `
      }).join("")

      return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 4px 0;">
          <tr>
            ${columnsHTML}
          </tr>
        </table>
      `

    default:
      return ` ${element.type} element `
  }
}

export function generateEmailHTML(elements: EmailElement[], subject: string): string {
  const emailHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif, Courier New, monospace, Palatino, serif, Arial, sans-serif, 'Times New Roman', serif,Bookman, serif, Comic Sans MS, cursive, Trebuchet MS, sans-serif, Comic Sans MS, cursive;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #ffffff !important;
            width: 100%;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        .email-container {
            max-width: 800px; 
            margin: 0 auto; 
            background-color: #ffffff;
            padding: 20px;
        }
        
        @media screen and (max-width: 768px) {
            .email-container {
                max-width: 100%;
                width: 100%;
                padding: 15px;
            }
        }
        
        @media screen and (min-width: 769px) {
            .email-container {
                max-width: 900px;
                width: 100%;
            }
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
            max-width: 100%;
        }
        video {
            max-width: 100%;
            height: auto;
        }
        
        .content-wrapper {
            width: 100%;
            max-width: 100%;
            background-color: transparent;
        }
        
        /* Import web-safe fonts */
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
        
        /* Ensure inline styles take precedence */
        div, p, a, span {
            font-family: inherit !important;
        }
    </style>
</head>
<body style="background-color: #ffffff !important; margin: 0; padding: 0;">
    <div class="email-container">
        <div class="content-wrapper">
            ${elements.map(renderElement).join("\n")}
        </div>
    </div>
</body>
</html>`

  return emailHTML 
}

export function parseHTMLToElements(html: string): EmailElement[] {
  return []
}








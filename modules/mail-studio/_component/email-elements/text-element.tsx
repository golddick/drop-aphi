"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bold, Italic, Link, AlignLeft, AlignCenter, AlignRight, Underline, Palette, Pilcrow, WrapText, List, Image } from "lucide-react"

interface RichTextSpan {
  text: string
  color?: string
  link?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
}

interface TextElementProps {
  id: string
  content?: string
  richContent?: RichTextSpan[]
  properties?: {
    fontSize?: number
    fontFamily?: string
    color?: string
    alignment?: "left" | "center" | "right"
    bold?: boolean
    italic?: boolean
    underline?: boolean
    link?: string
    lineHeight?: number
    backgroundColor?: string
  }
  isSelected?: boolean
  onSelect?: () => void
  onUpdate?: (properties: any) => void
}

const fontOptions = [
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Helvetica, sans-serif", label: "Helvetica" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Times New Roman, serif", label: "Times New Roman" },
  { value: "Verdana, sans-serif", label: "Verdana" },
  { value: "Trebuchet MS, sans-serif", label: "Trebuchet MS" },
  { value: "Impact, sans-serif", label: "Impact" },
  { value: "Courier New, monospace", label: "Courier New" },
  { value: "Palatino, serif", label: "Palatino" },
  { value: "Garamond, serif", label: "Garamond" },
  { value: "Bookman, serif", label: "Bookman" },
  { value: "Comic Sans MS, cursive", label: "Comic Sans MS" },
]

export function TextElement({
  id,
  content = "Click to edit text",
  richContent = [],
  properties = {},
  isSelected,
  onSelect,
  onUpdate,
}: TextElementProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState("")
  const [selectedText, setSelectedText] = useState("")
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)
  const [highlightColor, setHighlightColor] = useState("#ff0000")
  const [linkUrl, setLinkUrl] = useState("")
  const [backgroundColor, setBackgroundColor] = useState(properties.backgroundColor || "#ffffff")
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false)
  const [isBulletActive, setIsBulletActive] = useState(false)
  const [isBoldActive, setIsBoldActive] = useState(false)
  const [isItalicActive, setIsItalicActive] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Update active states when properties change
  useEffect(() => {
    setIsBoldActive(properties.bold || false)
    setIsItalicActive(properties.italic || false)
    setBackgroundColor(properties.backgroundColor || "#ffffff")
  }, [properties.bold, properties.italic, properties.backgroundColor])

  // Initialize edit content when entering edit mode
  useEffect(() => {
    if (isEditing) {
      const plainText = convertToPlainText(content)
      setEditContent(plainText)
    }
  }, [isEditing, content])

  const handleTextSelection = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart
      const end = textareaRef.current.selectionEnd
      const selected = editContent.substring(start, end)

      setSelectedText(selected)
      setSelectionStart(start)
      setSelectionEnd(end)
    }
  }

  const applyHighlight = () => {
    if (selectedText && selectionStart !== selectionEnd) {
      const before = editContent.substring(0, selectionStart)
      const after = editContent.substring(selectionEnd)
      const highlighted = `[color:${highlightColor}]${selectedText}[/color]`

      const newContent = before + highlighted + after
      setEditContent(newContent)
      setShowColorPicker(false)
      
      // Update cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = selectionStart + highlighted.length
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(newPosition, newPosition)
        }
      }, 0)
    }
  }

  const applyLink = () => {
    if (selectedText && linkUrl && selectionStart !== selectionEnd) {
      const before = editContent.substring(0, selectionStart)
      const after = editContent.substring(selectionEnd)
      const linked = `[link:${linkUrl}]${selectedText}[/link]`

      const newContent = before + linked + after
      setEditContent(newContent)
      setLinkUrl("")
      setShowLinkInput(false)
      
      // Update cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = selectionStart + linked.length
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(newPosition, newPosition)
        }
      }, 0)
    }
  }

  const applyBackgroundColor = () => {
    onUpdate?.({ ...properties, backgroundColor })
    setShowBackgroundColorPicker(false)
  }

  // Apply bold formatting to selected text
  const applyBold = () => {
    if (selectedText && selectionStart !== selectionEnd) {
      const before = editContent.substring(0, selectionStart)
      const after = editContent.substring(selectionEnd)
      const boldText = `[bold]${selectedText}[/bold]`

      const newContent = before + boldText + after
      setEditContent(newContent)
      
      // Update cursor position after insertion
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = selectionStart + boldText.length
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(newPosition, newPosition)
        }
      }, 0)
    } else {
      // Toggle global bold property if no text selected
      onUpdate?.({ ...properties, bold: !properties.bold })
    }
  }

  // Apply italic formatting to selected text
  const applyItalic = () => {
    if (selectedText && selectionStart !== selectionEnd) {
      const before = editContent.substring(0, selectionStart)
      const after = editContent.substring(selectionEnd)
      const italicText = `[italic]${selectedText}[/italic]`

      const newContent = before + italicText + after
      setEditContent(newContent)
      
      // Update cursor position after insertion
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = selectionStart + italicText.length
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(newPosition, newPosition)
        }
      }, 0)
    } else {
      // Toggle global italic property if no text selected
      onUpdate?.({ ...properties, italic: !properties.italic })
    }
  }

  // Toggle bullet mode
  const toggleBulletMode = () => {
    setIsBulletActive(!isBulletActive)
  }

  // Handle Enter key with bullet mode
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (isBulletActive) {
        e.preventDefault()
        
        const before = editContent.substring(0, selectionStart)
        const after = editContent.substring(selectionStart)
        
        // Add new bullet point
        const newContent = before + '\n• ' + after
        setEditContent(newContent)
        
        // Move cursor after the bullet point
        setTimeout(() => {
          if (textareaRef.current) {
            const newPosition = selectionStart + 3 // Length of '\n• '
            textareaRef.current.focus()
            textareaRef.current.setSelectionRange(newPosition, newPosition)
          }
        }, 0)
      }
      // If not in bullet mode, let the default Enter behavior happen (normal line break)
    }
  }

  // Start bullet list
  const startBulletList = () => {
    if (selectionStart !== selectionEnd) {
      // Wrap selected text in bullet points
      const before = editContent.substring(0, selectionStart)
      const selected = editContent.substring(selectionStart, selectionEnd)
      const after = editContent.substring(selectionEnd)
      
      const bulletedText = selected.split('\n').map(line => line.trim() ? `• ${line}` : '').join('\n')
      const newContent = before + bulletedText + after
      setEditContent(newContent)
    } else {
      // Add bullet point at cursor position
      const before = editContent.substring(0, selectionStart)
      const after = editContent.substring(selectionStart)
      
      const newContent = before + '• ' + after
      setEditContent(newContent)
      
      // Move cursor after bullet point
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = selectionStart + 2
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(newPosition, newPosition)
        }
      }, 0)
    }
    setIsBulletActive(true)
  }

  // Convert plain text with custom markup to HTML
  const convertToHTML = (text: string) => {
    if (!text.trim()) return "Click to edit text"
    
    let html = text
    
    // Convert bullet points to HTML lists first
    const lines = html.split('\n')
    let inList = false
    let listItems: string[] = []
    let processedLines: string[] = []

    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      
      if (trimmedLine.startsWith('•')) {
        if (!inList) {
          inList = true
          // If we were in a paragraph, close it
          if (processedLines.length > 0 && !processedLines[processedLines.length - 1].endsWith('</ul>')) {
            // Check if last line was a paragraph and close it properly
            const lastLine = processedLines[processedLines.length - 1]
            if (lastLine.startsWith('<p>')) {
              processedLines[processedLines.length - 1] = lastLine.replace('<p>', '').replace('</p>', '<br/>')
            }
          }
        }
        // Extract content after bullet
        const content = trimmedLine.replace(/^•\s*/, '').trim()
        if (content) {
          listItems.push(`<li>${processInlineFormatting(content)}</li>`)
        }
      } else {
        if (inList && listItems.length > 0) {
          processedLines.push(`<ul>${listItems.join('')}</ul>`)
          listItems = []
          inList = false
        }
        
        if (trimmedLine) {
          // For non-bullet lines, just wrap in paragraph with line breaks
          const processedLine = processInlineFormatting(line)
          if (index === 0) {
            processedLines.push(`<p>${processedLine}`)
          } else {
            // Check if previous line was also text (not a list)
            const prevLine = lines[index - 1].trim()
            if (prevLine && !prevLine.startsWith('•')) {
              // Continue the same paragraph with line break
              processedLines[processedLines.length - 1] += `<br/>${processedLine}`
            } else {
              // Start new paragraph
              if (processedLines.length > 0 && !processedLines[processedLines.length - 1].endsWith('</ul>')) {
                processedLines[processedLines.length - 1] += '</p>'
              }
              processedLines.push(`<p>${processedLine}`)
            }
          }
        } else if (trimmedLine === '' && index > 0 && index < lines.length - 1) {
          // Empty line means new paragraph
          if (processedLines.length > 0 && !processedLines[processedLines.length - 1].endsWith('</ul>')) {
            processedLines[processedLines.length - 1] += '</p>'
          }
          processedLines.push('<p>&nbsp;</p>')
        }
      }
    })

    // Close any open list
    if (inList && listItems.length > 0) {
      processedLines.push(`<ul>${listItems.join('')}</ul>`)
    }
    
    // Close any open paragraph
    if (processedLines.length > 0 && !processedLines[processedLines.length - 1].endsWith('</p>') && 
        !processedLines[processedLines.length - 1].endsWith('</ul>')) {
      processedLines[processedLines.length - 1] += '</p>'
    }

    html = processedLines.join('')
    
    // If no content was processed (empty text), return default
    if (!html.trim() || html === '<p></p>') {
      return "Click to edit text"
    }
    
    return html
  }

  // Process inline formatting within text
  const processInlineFormatting = (text: string): string => {
    let processed = text
    
    // Process bold: [bold]text[/bold]
    processed = processed.replace(/\[bold\](.*?)\[\/bold\]/g, '<strong>$1</strong>')
    
    // Process italic: [italic]text[/italic]
    processed = processed.replace(/\[italic\](.*?)\[\/italic\]/g, '<em>$1</em>')
    
    // Process color: [color:#ff0000]text[/color]
    processed = processed.replace(/\[color:(.*?)\](.*?)\[\/color\]/g, '<span style="color: $1">$2</span>')
    
    // Process links: [link:url]text[/link]
    processed = processed.replace(/\[link:(.*?)\](.*?)\[\/link\]/g, (match, url, linkText) => {
      // Ensure URL has proper protocol
      let finalUrl = url.trim()
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://') && !finalUrl.startsWith('mailto:')) {
        finalUrl = 'https://' + finalUrl
      }
      return `<a href="${finalUrl}" style="color: #0066cc; text-decoration: underline;" target="_blank">${linkText}</a>`
    })
    
    return processed
  }

  // Convert HTML back to plain text with custom markup for editing
  const convertToPlainText = (html: string): string => {
    if (!html || html === "Click to edit text") return "Click to edit text"
    
    let text = html
    
    // Remove all <p> tags but preserve content with double newlines for paragraphs
    text = text.replace(/<p\b[^>]*>/gi, '') // Remove opening <p> tags
    text = text.replace(/<\/p>/gi, '\n\n') // Replace closing </p> with double newlines
    
    // Convert lists to bullet points
    text = text.replace(/<ul\b[^>]*>(.*?)<\/ul>/gi, (match, listContent) => {
      const items = listContent.replace(
        /<li\b[^>]*>(.*?)<\/li>/gi,
        (itemMatch: string, itemContent: string): string => {
          const cleanItem: string = convertHTMLToMarkup(itemContent)
          return cleanItem ? `• ${cleanItem}\n` : ''
        }
      )
      return items + '\n'
    })
    
    // Convert <br/> tags to single newlines
    text = text.replace(/<br\s*\/?>/gi, '\n')
    
    // Convert HTML formatting back to custom markup
    text = convertHTMLToMarkup(text)
    
    // Remove any remaining HTML tags but preserve content
    text = text.replace(/<[^>]*>/g, '')
    
    // Clean up extra newlines but preserve paragraph breaks
    text = text.replace(/\n{3,}/g, '\n\n').trim()
    
    return text || "Click to edit text"
  }

  // Convert HTML tags back to custom markup
  const convertHTMLToMarkup = (html: string): string => {
    let text = html
    
    // Convert strong tags to [bold] markup
    text = text.replace(/<strong\b[^>]*>(.*?)<\/strong>/gi, '[bold]$1[/bold]')
    
    // Convert em tags to [italic] markup
    text = text.replace(/<em\b[^>]*>(.*?)<\/em>/gi, '[italic]$1[/italic]')
    
    // Convert color spans to [color] markup
    text = text.replace(/<span\b[^>]*style="color:\s*(.*?)"[^>]*>(.*?)<\/span>/gi, '[color:$1]$2[/color]')
    
    // Convert links to [link] markup
    text = text.replace(/<a\b[^>]*href="(.*?)"[^>]*>(.*?)<\/a>/gi, (match, url, linkText) => {
      // Clean up URL by removing protocols for editing
      const cleanUrl = url.replace(/^https?:\/\//, '')
      return `[link:${cleanUrl}]${linkText}[/link]`
    })
    
    return text
  }

  const handleSave = () => {
    setIsEditing(false)
    setIsBulletActive(false)
    const htmlContent = convertToHTML(editContent)
    onUpdate?.({ 
      ...properties, 
      content: htmlContent,
      backgroundColor: backgroundColor 
    })
  }

  const handleEditStart = () => {
    setIsEditing(true)
  }

  const textStyle = {
    fontSize: `${properties.fontSize || 16}px`,
    fontFamily: properties.fontFamily || "Arial, sans-serif",
    color: properties.color || "#000000",
    textAlign: properties.alignment || ("left" as const),
    fontWeight: properties.bold ? "bold" : "normal",
    fontStyle: properties.italic ? "italic" : "normal",
    textDecoration: properties.underline ? "underline" : "none",
    lineHeight: properties.lineHeight || 1.5,
    backgroundColor: properties.backgroundColor || "transparent",
    padding: properties.backgroundColor ? "2px 2px" : "0",
    borderRadius: properties.backgroundColor ? "4px" : "0",
    margin: "0",
  }

  const toggleFormat = (format: "bold" | "italic" | "underline") => {
    const newProperties = { ...properties }
    const current = properties[format] ?? false
    newProperties[format] = !current
    onUpdate?.(newProperties)
  }

  return (
    <div
      className={`p-4 border rounded-md cursor-pointer transition-colors ${
        isSelected ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
      }`}
      onClick={onSelect}
    >
      {isEditing ? (
        <div className="space-y-3">
          <div className="flex items-center gap-1 p-2 bg-muted rounded-md flex-wrap">
            <Select
              value={properties.fontFamily || "Arial, sans-serif"}
              onValueChange={(value) => onUpdate?.({ ...properties, fontFamily: value })}
            >
              <SelectTrigger className="w-40 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              size="sm"
              variant={isBoldActive ? "default" : "outline"}
              className="h-8 w-8 p-0"
              onClick={applyBold}
              title="Bold selected text or toggle global bold"
            >
              <Bold className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={isItalicActive ? "default" : "outline"}
              className="h-8 w-8 p-0"
              onClick={applyItalic}
              title="Italic selected text or toggle global italic"
            >
              <Italic className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={properties.underline ? "default" : "outline"}
              className="h-8 w-8 p-0"
              onClick={() => toggleFormat("underline")}
            >
              <Underline className="w-3 h-3" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              size="sm"
              variant={showColorPicker ? "default" : "outline"}
              className="h-8 w-8 p-0"
              onClick={() => setShowColorPicker(!showColorPicker)}
              disabled={!selectedText}
              title="Highlight selected text"
            >
              <Palette className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={showLinkInput ? "default" : "outline"}
              className="h-8 w-8 p-0"
              onClick={() => setShowLinkInput(!showLinkInput)}
              disabled={!selectedText}
              title="Add link to selected text"
            >
              <Link className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={showBackgroundColorPicker ? "default" : "outline"}
              className="h-8 w-8 p-0"
              onClick={() => setShowBackgroundColorPicker(!showBackgroundColorPicker)}
              title="Change background color"
            >
              <Image className="w-3 h-3" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              size="sm"
              variant={isBulletActive ? "default" : "outline"}
              className="h-8 w-8 p-0"
              onClick={toggleBulletMode}
              title="Toggle bullet list mode (Auto-continue on Enter)"
            >
              <List className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={startBulletList}
              title="Start bullet list with selected text"
            >
              <span className="text-sm font-bold">•</span>
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              size="sm"
              variant={properties.alignment === "left" ? "default" : "outline"}
              className="h-8 w-8 p-0"
              onClick={() => onUpdate?.({ ...properties, alignment: "left" })}
            >
              <AlignLeft className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={properties.alignment === "center" ? "default" : "outline"}
              className="h-8 w-8 p-0"
              onClick={() => onUpdate?.({ ...properties, alignment: "center" })}
            >
              <AlignCenter className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={properties.alignment === "right" ? "default" : "outline"}
              className="h-8 w-8 p-0"
              onClick={() => onUpdate?.({ ...properties, alignment: "right" })}
            >
              <AlignRight className="w-3 h-3" />
            </Button>
          </div>

          {showColorPicker && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded">
              <input
                type="color"
                value={highlightColor}
                onChange={(e) => setHighlightColor(e.target.value)}
                className="w-8 h-8 border border-border rounded cursor-pointer"
              />
              <span className="text-sm">Text color for selected text</span>
              <Button size="sm" onClick={applyHighlight}>
                Apply
              </Button>
            </div>
          )}

          {showLinkInput && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded">
              <Input
                type="url"
                placeholder="Enter URL (e.g., example.com or https://example.com)"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" onClick={applyLink}>
                Apply Link
              </Button>
            </div>
          )}

          {showBackgroundColorPicker && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-8 h-8 border border-border rounded cursor-pointer"
              />
              <span className="text-sm">Background color for entire element</span>
              <Button size="sm" onClick={applyBackgroundColor}>
                Apply
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setBackgroundColor("#ffffff")
                  onUpdate?.({ ...properties, backgroundColor: "#ffffff" })
                  setShowBackgroundColorPicker(false)
                }}
              >
                Clear
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <div className={`p-2 rounded-md text-xs ${isBulletActive ? 'bg-green-100 border border-green-300' : 'bg-muted'}`}>
              <p>
                <strong>Bullet mode:</strong> {isBulletActive ? 'ON' : 'OFF'}
                {isBulletActive && ' - Press Enter to continue bullet list'}
              </p>
            </div>
            
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onSelect={handleTextSelection}
              onKeyDown={handleKeyDown}
              className="w-full p-3 text-sm border border-border rounded-md bg-input resize-none whitespace-pre-wrap"
              style={{ 
                fontFamily: properties.fontFamily || "Arial, sans-serif",
                backgroundColor: backgroundColor !== "#ffffff" ? backgroundColor + "40" : undefined 
              }}
              rows={10}
              placeholder="Type your text here. Press Enter for line breaks, double Enter for paragraphs. Use formatting buttons above for colors, links, and styling."
              autoFocus
            />
            <div className="text-xs text-muted-foreground">
              <p>💡 <strong>Formatting guide:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> for line breaks within paragraph</li>
                <li><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> twice for new paragraphs</li>
                <li>Select text and use buttons to apply formatting</li>
                <li>Bullets will appear as proper lists when saved</li>
                <li>All formatting is preserved when re-editing</li>
                <li>URLs will automatically get https:// prefix if missing</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              Save & Apply Formatting
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div
          style={textStyle}
          onDoubleClick={handleEditStart}
          className="min-h-[1.5em] cursor-text transition-all duration-200"
          dangerouslySetInnerHTML={{ __html: content || "Click to edit text" }}
        />
      )}
    </div>
  )
}




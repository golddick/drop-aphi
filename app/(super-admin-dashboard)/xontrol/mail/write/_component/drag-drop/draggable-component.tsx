"use client"

import type React from "react"

import { useDraggable } from "@dnd-kit/core"
import { Card } from "@/components/ui/card"

interface DraggableComponentProps {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  category: string
}

export function DraggableComponent({ id, icon: Icon, label, category }: DraggableComponentProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: {
      type: id,
      label: label,
      category: category,
    },
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 bg-sidebar-accent hover:bg-sidebar-accent/80 border-sidebar-border cursor-grab active:cursor-grabbing transition-colors ${
        isDragging ? "opacity-50 z-50" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-sidebar-primary" />
        <span className="text-sm text-sidebar-foreground">{label}</span>
      </div>
    </Card>
  )
}

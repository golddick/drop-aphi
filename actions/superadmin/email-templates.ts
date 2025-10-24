// app/actions/templates.ts
"use server"

import { database } from "@/lib/database"
import { revalidatePath } from "next/cache"
import type { Prisma } from "@prisma/client"
import { getServerAuth } from "@/lib/auth/getauth"

interface EmailElement {
  id: string
  type: "text" | "button" | "image" | "video" | "social" | "divider" | "columns" | "logo"
  content?: string
  properties?: Record<string, any>
}

interface SaveTemplateParams {
  templateName: string
  campaignName: string
  subject: string
  elements: EmailElement[]
  description?: string
  category?: string
  tags?: string[]
  isPublic?: boolean
}

export async function saveTemplateWithCampaign({
  templateName,
  campaignName,
  subject,
  elements,
  description = "",
  category = "Custom",
  tags = [],
  isPublic = false
}: SaveTemplateParams) {
  try {
    const user = await getServerAuth()
    if (!user) {
      throw new Error("You must be logged in to save templates")
    }

    // Check if user is SUPERADMIN for public templates
    if (isPublic && user.role !== "SUPERADMIN") {
      throw new Error("Unauthorized: Only SUPERADMIN can create public templates")
    }

    const userId = user.userId

    // Check if campaign name already exists for this user
    const existingCampaign = await database.campaign.findFirst({
      where: {
        name: campaignName,
        userId: userId
      }
    })

    if (existingCampaign) {
      throw new Error("Campaign name already exists")
    }

    // Check if template name already exists for this user
    const existingTemplate = await database.emailTemplate.findFirst({
      where: {
        name: templateName,
        userId: userId
      }
    })

    if (existingTemplate) {
      throw new Error("Template name already exists")
    }

    // Create campaign and template in a transaction
    const result = await database.$transaction(async (tx) => {
      // Create the campaign
      const campaign = await tx.campaign.create({
        data: {
          name: campaignName,
          userId: userId,
          description: description,
          type: "EMAIL",
          status: "ACTIVE",
          recipients: 0,
          emailsSent: 0,
          openRate: 0,
          clickRate: 0
        }
      })

      // Cast elements to Prisma.JsonValue
      const elementsJson = elements as any

      // Create the email template
      const template = await tx.systemEmailTemplate.create({
        data: {
          name: templateName,
          description: description,
          category: category,
          tags: tags,
          elements: elementsJson,
          subject: subject,
          isPublic: isPublic,
          isFeatured: false,
          usageCount: 0,
          userId: userId
        }
      })

      return { campaign, template }
    })

    revalidatePath("/templates")
    revalidatePath("/campaigns")
    
    return {
      success: true,
      message: "Template and campaign created successfully",
      data: result
    }
  } catch (error) {
    console.error("Error saving template and campaign:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to save template and campaign"
    }
  }
}

// Additional server action for SUPERADMIN to create system templates
export async function createSystemTemplate({
  templateName,
  subject,
  elements,
  description = "",
  category = "Basics",
  tags = [],
  isFeatured = false
}: Omit<SaveTemplateParams, "campaignName" | "isPublic"> & { isFeatured?: boolean }) {
  try {
    const user = await getServerAuth()
    if (!user) {
      throw new Error("You must be logged in to create templates")
    }

    // Check if user is SUPERADMIN
    if (user.role !== "SUPERADMIN") {
      throw new Error("Unauthorized: Only SUPERADMIN can create system templates")
    }

    // Check if template name already exists as system template
    const existingTemplate = await database.systemEmailTemplate.findFirst({
      where: {
        name: templateName,
        userId: null // System templates have null userId
      }
    })

    if (existingTemplate) {
      throw new Error("System template name already exists")
    }

    // Cast elements to Prisma.JsonValue
    const elementsJson = elements as any

    const template = await database.systemEmailTemplate.create({
      data: {
        name: templateName,
        description: description,
        category: category,
        tags: tags,
        elements: elementsJson,
        subject: subject,
        isPublic: true,
        isFeatured: isFeatured,
        usageCount: 0,
        userId: null // System templates have null userId
      }
    })

    revalidatePath("/templates")
    
    return {
      success: true,
      message: "System template created successfully",
      data: template
    }
  } catch (error) {
    console.error("Error creating system template:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create system template"
    }
  }
}
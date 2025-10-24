// app/actions/newsletter-actions.ts

"use server"

import { database } from "@/lib/database"
import { NewsletterSettingType } from "@prisma/client"
import { revalidatePath } from "next/cache"

export type NewsletterConfig = {
  title: string
  description: string
  type: NewsletterSettingType
  primaryColor: string
  accentColor: string
  ctaText: string
  successMessage: string
  logo: string | null
  backgroundImage: string | null
  galleryImages: string[]
}

export async function saveNewsletterSettings(creatorId: string, config: NewsletterConfig) {
  try {
    // Validate input
    if (!creatorId) {
      return { success: false, error: "Creator ID is required" }
    }

    if (!config.title || !config.description) {
      return { success: false, error: "Title and description are required" }
    }

    // Convert type to match Prisma enum
    const settingsData = {
      title: config.title,
      description: config.description,
      type: config.type.toUpperCase() as "NEWSLETTER" | "WAITLIST", // Convert to uppercase for enum
      primaryColor: config.primaryColor,
      accentColor: config.accentColor,
      ctaText: config.ctaText,
      successMessage: config.successMessage,
      logo: config.logo,
      backgroundImage: config.backgroundImage,
      galleryImages: config.galleryImages,
    }

    // Upsert the settings
    const savedSettings = await database.newsletterSettings.upsert({
      where: { creatorId },
      update: settingsData,
      create: {
        creatorId,
        ...settingsData,
      },
    })

    revalidatePath("/newsletter-settings")
    
    return { 
      success: true, 
      data: savedSettings,
      message: "Settings saved successfully!" 
    }
  } catch (error) {
    console.error("Error saving newsletter settings:", error)
    return { 
      success: false, 
      error: "Failed to save settings. Please try again." 
    }
  }
}

export async function getNewsletterSettings(creatorId: string) {
  try {
    if (!creatorId) {
      return { success: false, error: "Creator ID is required" }
    }

    const settings = await database.newsletterSettings.findUnique({
      where: { creatorId },
    })

    if (!settings) {
      // Return default settings if none exist
      return {
        success: true,
        data: {
          title: "Stay Updated with Latest Tech Insights",
          description: "Get weekly updates on web development, APIs, and tech trends delivered to your inbox.",
          type:"NEWSLETTER",
          primaryColor: "#DC2626",
          accentColor: "#FCD34D",
          ctaText: "Subscribe Now",
          successMessage: "Thanks for subscribing! Check your email for confirmation.",
          logo: null,
          backgroundImage: null,
          galleryImages: [],
        } as NewsletterConfig
      }
    }

    // Convert enum back to lowercase for frontend
    const frontendSettings: NewsletterConfig = {
      ...settings,
      type: settings.type.toLowerCase() as "NEWSLETTER" | "WAITLIST",
    }

    return { 
      success: true, 
      data: frontendSettings
    }
  } catch (error) {
    console.error("Error fetching newsletter settings:", error)
    return { 
      success: false, 
      error: "Failed to load settings. Please try again." 
    }
  }
}

export async function deleteNewsletterSettings(creatorId: string) {
  try {
    if (!creatorId) {
      return { success: false, error: "Creator ID is required" }
    }

    await database.newsletterSettings.delete({
      where: { creatorId },
    })

    revalidatePath("/newsletter-settings")
    
    return { 
      success: true, 
      message: "Settings deleted successfully!" 
    }
  } catch (error) {
    console.error("Error deleting newsletter settings:", error)
    return { 
      success: false, 
      error: "Failed to delete settings. Please try again." 
    }
  }
}

// Server action to update just the logo
export async function updateNewsletterLogo(creatorId: string, logoUrl: string) {
  try {
    if (!creatorId || !logoUrl) {
      return { success: false, error: "Creator ID and logo URL are required" }
    }

    await database.newsletterSettings.upsert({
      where: { creatorId },
      update: { logo: logoUrl },
      create: {
        creatorId,
        logo: logoUrl,
        title: "Stay Updated with Latest Tech Insights",
        description: "Get weekly updates on web development, APIs, and tech trends delivered to your inbox.",
        type: "NEWSLETTER",
        primaryColor: "#DC2626",
        accentColor: "#FCD34D",
        ctaText: "Subscribe Now",
        successMessage: "Thanks for subscribing! Check your email for confirmation.",
        galleryImages: [],
      },
    })

    revalidatePath("/newsletter-settings")
    
    return { 
      success: true, 
      message: "Logo updated successfully!" 
    }
  } catch (error) {
    console.error("Error updating newsletter logo:", error)
    return { 
      success: false, 
      error: "Failed to update logo. Please try again." 
    }
  }
}

// Server action to update background image
export async function updateNewsletterBackground(creatorId: string, backgroundUrl: string) {
  try {
    if (!creatorId || !backgroundUrl) {
      return { success: false, error: "Creator ID and background URL are required" }
    }

    await database.newsletterSettings.upsert({
      where: { creatorId },
      update: { backgroundImage: backgroundUrl },
      create: {
        creatorId,
        backgroundImage: backgroundUrl,
        title: "Stay Updated with Latest Tech Insights",
        description: "Get weekly updates on web development, APIs, and tech trends delivered to your inbox.",
        type: "NEWSLETTER",
        primaryColor: "#DC2626",
        accentColor: "#FCD34D",
        ctaText: "Subscribe Now",
        successMessage: "Thanks for subscribing! Check your email for confirmation.",
        galleryImages: [],
      },
    })

    revalidatePath("/newsletter-settings")
    
    return { 
      success: true, 
      message: "Background image updated successfully!" 
    }
  } catch (error) {
    console.error("Error updating newsletter background:", error)
    return { 
      success: false, 
      error: "Failed to update background image. Please try again." 
    }
  }
}

// Server action to update gallery images
export async function updateNewsletterGallery(creatorId: string, galleryUrls: string[]) {
  try {
    if (!creatorId) {
      return { success: false, error: "Creator ID is required" }
    }

    await database.newsletterSettings.upsert({
      where: { creatorId },
      update: { galleryImages: galleryUrls },
      create: {
        creatorId,
        galleryImages: galleryUrls,
        title: "Stay Updated with Latest Tech Insights",
        description: "Get weekly updates on web development, APIs, and tech trends delivered to your inbox.",
        type: "NEWSLETTER",
        primaryColor: "#DC2626",
        accentColor: "#FCD34D",
        ctaText: "Subscribe Now",
        successMessage: "Thanks for subscribing! Check your email for confirmation.",
      },
    })

    revalidatePath("/newsletter-settings")
    
    return { 
      success: true, 
      message: "Gallery images updated successfully!" 
    }
  } catch (error) {
    console.error("Error updating newsletter gallery:", error)
    return { 
      success: false, 
      error: "Failed to update gallery images. Please try again." 
    }
  }
}
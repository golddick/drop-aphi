// "use server"

// import { getServerAuth } from "@/lib/auth/getauth"
// import { database } from "@/lib/database"

// export async function getCampaignsAction() {
//   try {
//     const user = await getServerAuth()
//     if (!user) {
//       return { success: false, message: "You must be logged in to view campaigns" }
//     }

//     // Check if user is SUPERADMIN
//     if (user.role !== "SUPERADMIN") {
//       return { success: false, message: "Unauthorized: You must be an admin" }
//     }

//     const campaigns = await database.campaign.findMany({
//       where: {
//         status: {
//           in: ["ACTIVE"]
//         }
//       },
//       orderBy: {
//         createdAt: 'desc'
//       },
//       select: {
//         id: true,
//         name: true,
//         description: true,
//         status: true,
//         createdAt: true
//       }
//     })

//     return {
//       success: true,
//       campaigns: campaigns.map(campaign => ({
//         ...campaign,
//         created_at: campaign.createdAt.toISOString()
//       }))
//     }
//   } catch (error) {
//     console.error("Failed to fetch campaigns:", error)
//     return { success: false, message: "Failed to fetch campaigns" }
//   }
// }

// export async function createCampaignAction(data: {
//   name: string
//   description?: string
// }) {
//   try {
//     const user = await getServerAuth()
//     if (!user) {
//       return { success: false, message: "You must be logged in to create campaigns" }
//     }

//     // Check if user is SUPERADMIN
//     if (user.role !== "SUPERADMIN") {
//       return { success: false, message: "Unauthorized: You must be an admin" }
//     }

//     // Validate input
//     if (!data.name.trim()) {
//       return { success: false, message: "Campaign name is required" }
//     }

//     // Check if campaign with same name already exists
//     const existingCampaign = await database.campaign.findFirst({
//       where: {
//         name: data.name.trim()
//       }
//     })

//     if (existingCampaign) {
//       return { success: false, message: "A campaign with this name already exists" }
//     }

//     // Create new campaign
//     const campaign = await database.campaign.create({
//       data: {
//         name: data.name.trim(),
//         description: data.description?.trim() || null,
//         status: "ACTIVE",
//         userId: user.userId
//       },
//       select: {
//         id: true,
//         name: true,
//         description: true,
//         status: true,
//         createdAt: true
//       }
//     })

//     return {
//       success: true,
//       message: "Campaign created successfully",
//       campaign: {
//         ...campaign,
//         created_at: campaign.createdAt.toISOString()
//       }
//     }
//   } catch (error) {
//     console.error("Failed to create campaign:", error)
//     return { success: false, message: "Failed to create campaign" }
//   }
// }







"use server"

import { getServerAuth } from "@/lib/auth/getauth"
import { database } from "@/lib/database"

export async function getCampaignsAction() {
  try {
    const user = await getServerAuth()
    if (!user) {
      return { success: false, message: "You must be logged in to view campaigns" }
    }

    // Check if user is SUPERADMIN
    if (user.role !== "SUPERADMIN") {
      return { success: false, message: "Unauthorized: You must be an admin" }
    }

    const campaigns = await database.campaign.findMany({
      where: {
        status: {
          in: ["ACTIVE"]
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        createdAt: true
      }
    })

    return {
      success: true,
      campaigns: campaigns.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        status: campaign.status,
        createdAt: campaign.createdAt.toISOString()
      }))
    }
  } catch (error) {
    console.error("Failed to fetch campaigns:", error)
    return { success: false, message: "Failed to fetch campaigns" }
  }
}

export async function createCampaignAction(data: {
  name: string
  description?: string
}) {
  try {
    const user = await getServerAuth()
    if (!user) {
      return { success: false, message: "You must be logged in to create campaigns" }
    }

    // Check if user is SUPERADMIN
    if (user.role !== "SUPERADMIN") {
      return { success: false, message: "Unauthorized: You must be an admin" }
    }

    // Validate input
    if (!data.name.trim()) {
      return { success: false, message: "Campaign name is required" }
    }

    // Check if campaign with same name already exists
    const existingCampaign = await database.campaign.findFirst({
      where: {
        name: data.name.trim()
      }
    })

    if (existingCampaign) {
      return { success: false, message: "A campaign with this name already exists" }
    }

    // Create new campaign
    const campaign = await database.campaign.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        status: "ACTIVE",
        userId: user.userId
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        createdAt: true
      }
    })

    return {
      success: true,
      message: "Campaign created successfully",
      campaign: {
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        status: campaign.status,
        createdAt: campaign.createdAt.toISOString()
      }
    }
  } catch (error) {
    console.error("Failed to create campaign:", error)
    return { success: false, message: "Failed to create campaign" }
  }
}
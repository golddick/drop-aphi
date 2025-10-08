// app/actions/campaigns.ts
"use server"

import { getServerAuth } from "@/lib/auth/getauth"
import { database } from "@/lib/database"

export async function getCampaigns() {
  try {
    // Validate authentication
    const user = await getServerAuth()
    if (!user?.id) {
      return {
        success: false,
        error: 'Authentication required',
      }
    }

    // Fetch campaigns for the current user
    const campaigns = await database.campaign.findMany({
      where: {
        userId: user.userId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        createdAt: true,
        emailsSent: true,
        recipients: true,
        openRate: true,
        clickRate: true,
        lastSentAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Format the response
    const formattedCampaigns = campaigns.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description || undefined,
      status: campaign.status,
      createdAt: campaign.createdAt.toISOString(),
      emailsSent: campaign.emailsSent,
      recipients: campaign.recipients,
      openRate: campaign.openRate,
      clickRate: campaign.clickRate,
      lastSentAt: campaign.lastSentAt?.toISOString(),
    }))

    return {
      success: true,
      data: formattedCampaigns,
    }
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return {
      success: false,
      error: 'Failed to fetch campaigns',
    }
  }
}

// Optional: Get a single campaign by ID
export async function getCampaignById(campaignId: string) {
  try {
    const user = await getServerAuth()
    if (!user?.id) {
      return {
        success: false,
        error: 'Authentication required',
      }
    }

    const campaign = await database.campaign.findFirst({
      where: {
        id: campaignId,
        userId: user.userId, // Ensure user owns the campaign
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        createdAt: true,
        emailsSent: true,
        recipients: true,
        openRate: true,
        clickRate: true,
        lastSentAt: true,
        emails: {
          select: {
            id: true,
            title: true,
            emailSubject: true,
            status: true,
            createdAt: true,
            openCount: true,
            clickCount: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!campaign) {
      return {
        success: false,
        error: 'Campaign not found',
      }
    }

    const formattedCampaign = {
      ...campaign,
      createdAt: campaign.createdAt.toISOString(),
      lastSentAt: campaign.lastSentAt?.toISOString(),
      emails: campaign.emails.map(email => ({
        ...email,
        createdAt: email.createdAt.toISOString(),
      })),
    }

    return {
      success: true,
      data: formattedCampaign,
    }
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return {
      success: false,
      error: 'Failed to fetch campaign',
    }
  }
}

// Optional: Delete campaign
export async function deleteCampaign(campaignId: string) {
  try {
    const user = await getServerAuth()
    if (!user?.id) {
      return {
        success: false,
        error: 'Authentication required',
      }
    }

    // Verify user owns the campaign
    const existingCampaign = await database.campaign.findFirst({
      where: {
        id: campaignId,
        userId: user.userId,
      },
    })

    if (!existingCampaign) {
      return {
        success: false,
        error: 'Campaign not found',
      }
    }

    // Check if campaign has emails
    const emailCount = await database.email.count({
      where: {
        campaignId,
      },
    })

    if (emailCount > 0) {
      return {
        success: false,
        error: 'Cannot delete campaign with associated emails',
      }
    }

    await database.campaign.delete({
      where: { id: campaignId },
    })

    return {
      success: true,
      message: 'Campaign deleted successfully',
    }
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return {
      success: false,
      error: 'Failed to delete campaign',
    }
  }
}
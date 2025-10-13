'use server'

import { getServerAuth } from '@/lib/auth/getauth'
import { database } from '@/lib/database'
import { EmailStatus, EmailType } from '@/lib/generated/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { toast } from 'sonner'

// Types based on your schema
export interface CreateEmailData {
  title: string
  content: string
  emailSubject: string
  previewText?: string
  builderMode?: string
  builderData?: any
  templateUsed?: string
  status?: EmailStatus
  emailType?: EmailType
  trackOpens?: boolean
  trackClicks?: boolean
  enableUnsubscribe?: boolean
  scheduleDate?: Date
  scheduleTime?: string
  campaignId?: string
  newsLetterOwnerId: string
}

export interface UpdateEmailData {
  title?: string
  content?: string
  emailSubject?: string
  previewText?: string
  builderMode?: string
  builderData?: any
  templateUsed?: string
  status?: EmailStatus
  emailType?: EmailType
  trackOpens?: boolean
  trackClicks?: boolean
  enableUnsubscribe?: boolean
  scheduleDate?: Date
  scheduleTime?: string
  campaignId?: string
}

export interface EmailStats {
  totalEmails: number
  sentEmails: number
  totalRecipients: number
  avgOpenRate: number
  totalOpens: number
  totalClicks: number
  deliveryRate: number
}

// Helper function to get authenticated user

async function getAuthenticatedUser() {
  const user = await getServerAuth()
  if (!user?.userId) {
    redirect('/auth')
  }
  return user.userId
}

// Stats Server Actions
export async function getEmailStats(): Promise<EmailStats> {
  const userId = await getAuthenticatedUser()
  
  try {
    const [
      totalEmails,
      sentEmails,
      emailsWithRecipients
    ] = await Promise.all([
      // Total emails
      database.email.count({
        where: { userId }
      }),
      
      // Sent emails
      database.email.count({
        where: { 
          userId,
          status: 'SENT' as EmailStatus
        }
      }),
      
      // Emails with recipient data for calculations
      database.email.findMany({
        where: { userId },
        select: {
          recipients: true,
          bounceCount: true,
          openCount: true,
          clickCount: true
        }
      })
    ])

    const emailsData = emailsWithRecipients
    const totalRecipients = emailsData.reduce((sum, email) => sum + email.recipients, 0)
    const totalBounces = emailsData.reduce((sum, email) => sum + email.bounceCount, 0)
    const totalOpensCount = emailsData.reduce((sum, email) => sum + email.openCount, 0)
    const totalClicksCount = emailsData.reduce((sum, email) => sum + email.clickCount, 0)

    // Calculate rates
    const deliveryRate = totalRecipients > 0 
      ? ((totalRecipients - totalBounces) / totalRecipients) * 100 
      : 0
    
    const avgOpenRate = sentEmails > 0 
      ? (totalOpensCount / sentEmails) * 100 
      : 0

    return {
      totalEmails,
      sentEmails,
      totalRecipients,
      avgOpenRate: Number(avgOpenRate.toFixed(1)),
      totalOpens: totalOpensCount,
      totalClicks: totalClicksCount,
      deliveryRate: Number(deliveryRate.toFixed(1))
    }
  } catch (error) {
    console.error('Error fetching email stats:', error)
    throw new Error('Failed to fetch email statistics')
  }
}

// Email CRUD Server Actions
export async function getEmails(filters?: {
  searchTerm?: string
  statusFilter?: string
  typeFilter?: string
  campaignFilter?: string
}) {
  const userId = await getAuthenticatedUser()
  
  try {
    const { searchTerm, statusFilter, typeFilter, campaignFilter } = filters || {}

    const whereClause: any = {
      userId,
      ...(statusFilter && statusFilter !== 'all' && { status: statusFilter as EmailStatus }),
      ...(typeFilter && typeFilter !== 'all' && { emailType: typeFilter as EmailType }),
      ...(campaignFilter && campaignFilter !== 'all' && { campaignId: campaignFilter })
    }

    // Add search functionality
    if (searchTerm) {
      whereClause.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { emailSubject: { contains: searchTerm, mode: 'insensitive' } },
        { previewText: { contains: searchTerm, mode: 'insensitive' } }
      ]
    }

    const emails = await database.email.findMany({
      where: whereClause,
      include: {
        campaign: {
          select: {
            id: true,
            name: true
          }
        },
        emailAnalytics: true,
        _count: {
          select: {
            emailRecipients: true,
            clickedLinks: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data for frontend
    return emails.map(email => ({
      id: email.id,
      subject: email.emailSubject,
      previewText: email.previewText || '',
    //   integration: { 
    //     name: email.campaign?.name || 'Standalone', 
    //     logo: '📧', 
    //     id: email.campaign?.id || 'default' 
    //   },
      campaign: email.campaign?.name || 'No Campaign',
      type: email.emailType.toLowerCase(),
      status: email.status.toLowerCase(),
      recipients: email.recipients,
      openRate: email.recipients > 0 ? (email.openCount / email.recipients) * 100 : 0,
      clickRate: email.recipients > 0 ? (email.clickCount / email.recipients) * 100 : 0,
      deliveryRate: email.recipients > 0 ? ((email.recipients - email.bounceCount) / email.recipients) * 100 : 0,
      sentDate: email.sentAt?.toISOString().split('T')[0] || '',
      fromName: 'Your Company', // You might want to store this in user settings
      fromEmail: 'noreply@yourcompany.com',
      // Additional fields from schema
      title: email.title,
      content: email.content,
      builderMode: email.builderMode,
      trackOpens: email.trackOpens,
      trackClicks: email.trackClicks,
      scheduleDate: email.scheduleDate,
      createdAt: email.createdAt
    }))
  } catch (error) {
    console.error('Error fetching emails:', error)
    throw new Error('Failed to fetch emails')
  }
}

export async function getEmailById(id: string) {
  const userId = await getAuthenticatedUser()
  
  try {
    const email = await database.email.findFirst({
      where: {
        id,
        userId
      },
      include: {
        campaign: true,
        emailAnalytics: true,
        emailAttachments: true,
        emailRecipients: {
          include: {
            email: true
          }
        },
        clickedLinks: {
          orderBy: {
            clickedAt: 'desc'
          },
          take: 10
        }
      }
    })

    if (!email) {
      return null
    }

    return email
  } catch (error) {
    console.error('Error fetching email:', error)
    throw new Error('Failed to fetch email')
  }
}

export async function updateEmail(id: string, data: UpdateEmailData) {
  const userId = await getAuthenticatedUser()
  
  try {
    // Verify ownership
    const existingEmail = await database.email.findFirst({
      where: { id, userId }
    })

    if (!existingEmail) {
      throw new Error('Email not found or access denied')
    }

    const email = await database.email.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })

    revalidatePath('/dashboard/mail')
    revalidatePath(`/dashboard/mail/${id}`)

    return email
  } catch (error) {
    console.error('Error updating email:', error)
    throw new Error('Failed to update email')
  }
}



// Analytics endpoints
export async function getEmailAnalytics(id: string) {
  const userId = await getAuthenticatedUser()
  
  try {
    const email = await database.email.findFirst({
      where: { id, userId },
      include: {
        emailAnalytics: true,
        clickedLinks: {
          orderBy: {
            clickedAt: 'desc'
          }
        },
        emailRecipients: {
          where: {
            OR: [
              { openedAt: { not: null } },  // Check if openedAt is not null
              { clickedAt: { not: null } }  // Check if clickedAt is not null
            ]
          },
          include: {
            email: true  
          }
        }
      }
    })

    if (!email) {
      throw new Error('Email not found')
    }

    return email
  } catch (error) {
    console.error('Error fetching email analytics:', error)
    throw new Error('Failed to fetch email analytics')
  }
}
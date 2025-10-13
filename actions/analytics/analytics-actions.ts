// 'use server'

// import { getServerAuth } from '@/lib/auth/getauth'
// import { database } from '@/lib/database'
// import { cache } from 'react'

// export type OverallStats = {
//   totalSubscribers: number
//   subscriberGrowth: number
//   totalCampaigns: number
//   activeCampaigns: number
//   emailsSent: number
//   emailGrowth: number
//   avgOpenRate: number
//   openRateChange: number
//   avgClickRate: number
//   clickRateChange: number
//   revenueGrowth: number
//   totalBlogs: number
//   blogGrowth: number
//   blogViews: number
//   blogViewGrowth: number
//   avgReadTime: number
//   readTimeChange: number
// }

// export const getOverallStats = cache(async (timeRange: string): Promise<OverallStats> => {
//   try {
//     const user = await getServerAuth()
//     if (!user) {
//       throw new Error('Unauthorized')
//     }

//     const dateRange = getDateRange(timeRange)
//     const previousDateRange = getPreviousDateRange(timeRange)

//     // Execute all queries in parallel for better performance
//     const [
//       currentSubscribers,
//       previousSubscribers,
//       currentCampaigns,
//       currentActiveCampaigns,
//       currentEmails,
//       previousEmails,
//       emailMetrics,
//       previousEmailMetrics,
//       currentBlogs,
//       previousBlogs,
//       blogViews,
//       previousBlogViews,
//       currentReadTimeAgg,
//       previousReadTimeAgg,
//     ] = await Promise.all([
//       // Subscribers
//       database.subscriber.count({
//         where: {
//           newsLetterOwnerId: user.userId,
//           status: "SUBSCRIBED",
//           createdAt: dateRange ? { lte: dateRange.end, gte: dateRange.start } : undefined,
//         },
//       }),
//       database.subscriber.count({
//         where: {
//           newsLetterOwnerId: user.userId,
//           status: "SUBSCRIBED",
//           createdAt: previousDateRange ? { lte: previousDateRange.end, gte: previousDateRange.start } : undefined,
//         },
//       }),

//       // Campaigns
//       database.campaign.count({
//         where: {
//           userId: user.userId,
//           createdAt: dateRange ? { lte: dateRange.end, gte: dateRange.start } : undefined,
//         },
//       }),
//       database.campaign.count({
//         where: {
//           userId: user.userId,
//           status: { in: ["ACTIVE", "ENDED", "INACTIVE"] },
//           createdAt: dateRange ? { lte: dateRange.end, gte: dateRange.start } : undefined,
//         },
//       }),

//       // Emails
//       database.email.count({
//         where: {
//           userId: user.userId,
//           status: "SENT",
//           sentAt: dateRange ? { lte: dateRange.end, gte: dateRange.start } : undefined,
//         },
//       }),
//       database.email.count({
//         where: {
//           userId: user.userId,
//           status: "SENT",
//           sentAt: previousDateRange ? { lte: previousDateRange.end, gte: previousDateRange.start } : undefined,
//         },
//       }),

//       // Email metrics (opens and clicks)
//       database.email.aggregate({
//         where: {
//           userId: user.userId,
//           status: "SENT",
//           sentAt: dateRange ? { lte: dateRange.end, gte: dateRange.start } : undefined,
//         },
//         _avg: {
//           openCount: true,
//           clickCount: true,
//         },
//         _sum: {
//           recipients: true,
//         },
//       }),
//       database.email.aggregate({
//         where: {
//           userId: user.userId,
//           status: "SENT",
//           sentAt: previousDateRange ? { lte: previousDateRange.end, gte: previousDateRange.start } : undefined,
//         },
//         _avg: {
//           openCount: true,
//           clickCount: true,
//         },
//         _sum: {
//           recipients: true,
//         },
//       }),

//       // Blogs
//       database.blogPost.count({
//         where: {
//           authorId: user.userId,
//           status: "PUBLISHED",
//           publishedAt: dateRange ? { lte: dateRange.end, gte: dateRange.start } : undefined,
//         },
//       }),
//       database.blogPost.count({
//         where: {
//           authorId: user.userId,
//           status: "PUBLISHED",
//           publishedAt: previousDateRange ? { lte: previousDateRange.end, gte: previousDateRange.start } : undefined,
//         },
//       }),

//       // Blog views
//       database.blogPostView.count({
//         where: {
//           post: { authorId: user.userId },
//           createdAt: dateRange ? { lte: dateRange.end, gte: dateRange.start } : undefined,
//         },
//       }),
//       database.blogPostView.count({
//         where: {
//           post: { authorId: user.userId },
//           createdAt: previousDateRange ? { lte: previousDateRange.end, gte: previousDateRange.start } : undefined,
//         },
//       }),

//       // Average read time (using blogPost's readTime field)
//       database.blogPost.aggregate({
//         where: {
//           authorId: user.userId,
//           status: "PUBLISHED",
//           publishedAt: dateRange ? { lte: dateRange.end, gte: dateRange.start } : undefined,
//         },
//         _avg: {
//           readTime: true,
//         },
//       }),
//       database.blogPost.aggregate({
//         where: {
//           authorId: user.userId,
//           status: "PUBLISHED",
//           publishedAt: previousDateRange ? { lte: previousDateRange.end, gte: previousDateRange.start } : undefined,
//         },
//         _avg: {
//           readTime: true,
//         },
//       }),
//     ])

//     // Calculate percentages and growth rates
//     const subscriberGrowth = calculateGrowthRate(currentSubscribers, previousSubscribers)
//     const emailGrowth = calculateGrowthRate(currentEmails, previousEmails)
//     const blogGrowth = calculateGrowthRate(currentBlogs, previousBlogs)
//     const blogViewGrowth = calculateGrowthRate(blogViews, previousBlogViews)

//     // Calculate open and click rates
//     const totalRecipients = emailMetrics._sum.recipients || 0
//     const previousTotalRecipients = previousEmailMetrics._sum.recipients || 0
    
//     const currentOpenRate = totalRecipients > 0 
//       ? ((emailMetrics._avg.openCount || 0) / totalRecipients) * 100 
//       : 0
      
//     const previousOpenRate = previousTotalRecipients > 0
//       ? ((previousEmailMetrics._avg.openCount || 0) / previousTotalRecipients) * 100
//       : 0
      
//     const openRateChange = calculateGrowthRate(currentOpenRate, previousOpenRate)

//     const currentClickRate = totalRecipients > 0
//       ? ((emailMetrics._avg.clickCount || 0) / totalRecipients) * 100
//       : 0
      
//     const previousClickRate = previousTotalRecipients > 0
//       ? ((previousEmailMetrics._avg.clickCount || 0) / previousTotalRecipients) * 100
//       : 0
      
//     const clickRateChange = calculateGrowthRate(currentClickRate, previousClickRate)

//     // Read time calculations (already in minutes based on your schema)
//     const currentAvgReadTime = currentReadTimeAgg._avg.readTime || 0
//     const previousAvgReadTime = previousReadTimeAgg._avg.readTime || 0
//     const readTimeChange = calculateGrowthRate(currentAvgReadTime, previousAvgReadTime)

//     return {
//       totalSubscribers: currentSubscribers,
//       subscriberGrowth,
//       totalCampaigns: currentCampaigns,
//       activeCampaigns: currentActiveCampaigns,
//       emailsSent: currentEmails,
//       emailGrowth,
//       avgOpenRate: Math.round(currentOpenRate * 10) / 10,
//       openRateChange: Math.round(openRateChange * 10) / 10,
//       avgClickRate: Math.round(currentClickRate * 10) / 10,
//       clickRateChange: Math.round(clickRateChange * 10) / 10,
//       revenueGrowth: 15.2, // You'll need to implement revenue tracking separately
//       totalBlogs: currentBlogs,
//       blogGrowth,
//       blogViews,
//       blogViewGrowth,
//       avgReadTime: Math.round(currentAvgReadTime * 10) / 10,
//       readTimeChange: Math.round(readTimeChange * 10) / 10,
//     }
//   } catch (error) {
//     console.error('Error fetching overall stats:', error)
//     throw new Error('Failed to fetch analytics data')
//   }
// })

// // Helper functions
// function getDateRange(timeRange: string): { start: Date; end: Date } | null {
//   const now = new Date()
//   const end = new Date()

//   switch (timeRange) {
//     case '7d':
//       const start7d = new Date(now)
//       start7d.setDate(now.getDate() - 7)
//       return { start: start7d, end }
//     case '30d':
//       const start30d = new Date(now)
//       start30d.setDate(now.getDate() - 30)
//       return { start: start30d, end }
//     case '90d':
//       const start90d = new Date(now)
//       start90d.setDate(now.getDate() - 90)
//       return { start: start90d, end }
//     case '1y':
//       const start1y = new Date(now)
//       start1y.setFullYear(now.getFullYear() - 1)
//       return { start: start1y, end }
//     case 'all':
//       return null
//     default:
//       const startDefault = new Date(now)
//       startDefault.setDate(now.getDate() - 30)
//       return { start: startDefault, end }
//   }
// }

// function getPreviousDateRange(timeRange: string): { start: Date; end: Date } | null {
//   const now = new Date()
  
//   switch (timeRange) {
//     case '7d':
//       const end7d = new Date(now)
//       end7d.setDate(now.getDate() - 7)
//       const start7d = new Date(end7d)
//       start7d.setDate(end7d.getDate() - 7)
//       return { start: start7d, end: end7d }
//     case '30d':
//       const end30d = new Date(now)
//       end30d.setDate(now.getDate() - 30)
//       const start30d = new Date(end30d)
//       start30d.setDate(end30d.getDate() - 30)
//       return { start: start30d, end: end30d }
//     case '90d':
//       const end90d = new Date(now)
//       end90d.setDate(now.getDate() - 90)
//       const start90d = new Date(end90d)
//       start90d.setDate(end90d.getDate() - 90)
//       return { start: start90d, end: end90d }
//     case '1y':
//       const end1y = new Date(now)
//       end1y.setFullYear(now.getFullYear() - 1)
//       const start1y = new Date(end1y)
//       start1y.setFullYear(end1y.getFullYear() - 1)
//       return { start: start1y, end: end1y }
//     case 'all':
//       return null
//     default:
//       return null
//   }
// }

// function calculateGrowthRate(current: number, previous: number): number {
//   if (previous === 0) return current > 0 ? 100 : 0
//   return ((current - previous) / previous) * 100
// }



'use server'

import { getServerAuth } from '@/lib/auth/getauth'
import { database } from '@/lib/database'
import { OverallStats, OverallStatsSchema } from '@/lib/schemas/analytics-stats'
import { cache } from 'react'
import { z } from 'zod'





export const getOverallStats = cache(async (timeRange: string): Promise<OverallStats> => {
  try {
    const user = await getServerAuth()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const dateRange = getDateRange(timeRange)
    const previousDateRange = getPreviousDateRange(timeRange)

    // Execute all queries in parallel for better performance
    const [
      currentSubscribers,
      previousSubscribers,
      currentCampaigns,
      currentActiveCampaigns,
      currentEmails,
      previousEmails,
      currentEmailAnalytics,
      previousEmailAnalytics,
      currentBlogs,
      previousBlogs,
      blogViews,
      previousBlogViews,
      currentReadTimeAgg,
      previousReadTimeAgg,
      currentUnsubscribers,
      previousUnsubscribers,
    ] = await Promise.all([
      // Current subscribers
      database.subscriber.count({
        where: {
          newsLetterOwnerId: user.userId,
          status: "SUBSCRIBED",
          createdAt: dateRange ? { lte: dateRange.end, gte: dateRange.start } : undefined,
        },
      }),
      // Previous subscribers
      database.subscriber.count({
        where: {
          newsLetterOwnerId: user.userId,
          status: "SUBSCRIBED",
          createdAt: previousDateRange ? { lte: previousDateRange.end, gte: previousDateRange.start } : undefined,
        },
      }),

      // Campaigns
      database.campaign.count({
        where: {
          userId: user.userId,
          createdAt: dateRange ? { lte: dateRange.end, gte: dateRange.start } : undefined,
        },
      }),
      database.campaign.count({
        where: {
          userId: user.userId,
          status: "ACTIVE",
          createdAt: dateRange ? { lte: dateRange.end, gte: dateRange.start } : undefined,
        },
      }),

      // Emails
      database.email.count({
        where: {
          userId: user.userId,
          status: "SENT",
          sentAt: dateRange ? { lte: dateRange.end, gte: dateRange.start } : undefined,
        },
      }),
      database.email.count({
        where: {
          userId: user.userId,
          status: "SENT",
          sentAt: previousDateRange ? { lte: previousDateRange.end, gte: previousDateRange.start } : undefined,
        },
      }),

      // Email analytics (using EmailAnalytics model)
      database.emailAnalytics.aggregate({
        where: {
          email: {
            userId: user.userId,
            status: "SENT",
            sentAt: dateRange ? { lte: dateRange.end, gte: dateRange.start } : undefined,
          }
        },
        _avg: {
          openRate: true,
          clickRate: true,
        },
        _count: {
          _all: true,
        },
      }),
      database.emailAnalytics.aggregate({
        where: {
          email: {
            userId: user.userId,
            status: "SENT",
            sentAt: previousDateRange ? { lte: previousDateRange.end, gte: previousDateRange.start } : undefined,
          }
        },
        _avg: {
          openRate: true,
          clickRate: true,
        },
        _count: {
          _all: true,
        },
      }),

      // Blogs
      database.blogPost.count({
        where: {
          authorId: user.userId,
          status: "PUBLISHED",
          publishedAt: dateRange ? { lte: dateRange.end, gte: dateRange.start } : undefined,
        },
      }),
      database.blogPost.count({
        where: {
          authorId: user.userId,
          status: "PUBLISHED",
          publishedAt: previousDateRange ? { lte: previousDateRange.end, gte: previousDateRange.start } : undefined,
        },
      }),

      // Blog views
      database.blogPostView.count({
        where: {
          post: { authorId: user.userId },
          createdAt: dateRange ? { lte: dateRange.end, gte: dateRange.start } : undefined,
        },
      }),
      database.blogPostView.count({
        where: {
          post: { authorId: user.userId },
          createdAt: previousDateRange ? { lte: previousDateRange.end, gte: previousDateRange.start } : undefined,
        },
      }),

      // Average read time
      database.blogPost.aggregate({
        where: {
          authorId: user.userId,
          status: "PUBLISHED",
          publishedAt: dateRange ? { lte: dateRange.end, gte: dateRange.start } : undefined,
        },
        _avg: {
          readTime: true,
        },
      }),
      database.blogPost.aggregate({
        where: {
          authorId: user.userId,
          status: "PUBLISHED",
          publishedAt: previousDateRange ? { lte: previousDateRange.end, gte: previousDateRange.start } : undefined,
        },
        _avg: {
          readTime: true,
        },
      }),

      // Unsubscribers (for churn rate calculation)
      database.unsubscribeEvent.count({
        where: {
          newsLetterOwnerId: user.userId,
          createdAt: dateRange ? { lte: dateRange.end, gte: dateRange.start } : undefined,
        },
      }),
      database.unsubscribeEvent.count({
        where: {
          newsLetterOwnerId: user.userId,
          createdAt: previousDateRange ? { lte: previousDateRange.end, gte: previousDateRange.start } : undefined,
        },
      }),
    ])

    // Calculate percentages and growth rates
    const subscriberGrowth = calculateGrowthRate(currentSubscribers, previousSubscribers)
    const emailGrowth = calculateGrowthRate(currentEmails, previousEmails)
    const blogGrowth = calculateGrowthRate(currentBlogs, previousBlogs)
    const blogViewGrowth = calculateGrowthRate(blogViews, previousBlogViews)

    // Calculate email rates from EmailAnalytics (already percentages)
    const currentOpenRate = currentEmailAnalytics._avg.openRate || 0
    const previousOpenRate = previousEmailAnalytics._avg.openRate || 0
    const openRateChange = calculateGrowthRate(currentOpenRate, previousOpenRate)

    const currentClickRate = currentEmailAnalytics._avg.clickRate || 0
    const previousClickRate = previousEmailAnalytics._avg.clickRate || 0
    const clickRateChange = calculateGrowthRate(currentClickRate, previousClickRate)

    // Read time calculations
    const currentAvgReadTime = currentReadTimeAgg._avg.readTime || 0
    const previousAvgReadTime = previousReadTimeAgg._avg.readTime || 0
    const readTimeChange = calculateGrowthRate(currentAvgReadTime, previousAvgReadTime)

    // Calculate churn rate for revenue growth approximation
    const currentChurnRate = currentSubscribers > 0 ? (currentUnsubscribers / currentSubscribers) * 100 : 0
    const previousChurnRate = previousSubscribers > 0 ? (previousUnsubscribers / previousSubscribers) * 100 : 0
    const churnImprovement = previousChurnRate - currentChurnRate // Positive is good
    
    // Estimate revenue growth based on subscriber growth and churn improvement
    const estimatedRevenueGrowth = subscriberGrowth + (churnImprovement * 0.5)

    const stats = {
      totalSubscribers: currentSubscribers,
      subscriberGrowth,
      totalCampaigns: currentCampaigns,
      activeCampaigns: currentActiveCampaigns,
      emailsSent: currentEmails,
      emailGrowth,
      avgOpenRate: Math.min(Math.round(currentOpenRate * 10) / 10, 100), // Cap at 100%
      openRateChange: Math.round(openRateChange * 10) / 10,
      avgClickRate: Math.min(Math.round(currentClickRate * 10) / 10, 100), // Cap at 100%
      clickRateChange: Math.round(clickRateChange * 10) / 10,
      revenueGrowth: Math.round(estimatedRevenueGrowth * 10) / 10,
      totalBlogs: currentBlogs,
      blogGrowth,
      blogViews,
      blogViewGrowth,
      avgReadTime: Math.round(currentAvgReadTime * 10) / 10,
      readTimeChange: Math.round(readTimeChange * 10) / 10,
    }

    // Validate and return the data
    return OverallStatsSchema.parse(stats)
  } catch (error) {
    console.error('Error fetching overall stats:', error)
    throw new Error('Failed to fetch analytics data')
  }
})

// Helper functions
function getDateRange(timeRange: string): { start: Date; end: Date } | null {
  const now = new Date()
  const end = new Date()

  switch (timeRange) {
    case '7d':
      const start7d = new Date(now)
      start7d.setDate(now.getDate() - 7)
      return { start: start7d, end }
    case '30d':
      const start30d = new Date(now)
      start30d.setDate(now.getDate() - 30)
      return { start: start30d, end }
    case '90d':
      const start90d = new Date(now)
      start90d.setDate(now.getDate() - 90)
      return { start: start90d, end }
    case '1y':
      const start1y = new Date(now)
      start1y.setFullYear(now.getFullYear() - 1)
      return { start: start1y, end }
    case 'all':
      return null
    default:
      const startDefault = new Date(now)
      startDefault.setDate(now.getDate() - 30)
      return { start: startDefault, end }
  }
}

function getPreviousDateRange(timeRange: string): { start: Date; end: Date } | null {
  const now = new Date()
  
  switch (timeRange) {
    case '7d':
      const end7d = new Date(now)
      end7d.setDate(now.getDate() - 7)
      const start7d = new Date(end7d)
      start7d.setDate(end7d.getDate() - 7)
      return { start: start7d, end: end7d }
    case '30d':
      const end30d = new Date(now)
      end30d.setDate(now.getDate() - 30)
      const start30d = new Date(end30d)
      start30d.setDate(end30d.getDate() - 30)
      return { start: start30d, end: end30d }
    case '90d':
      const end90d = new Date(now)
      end90d.setDate(now.getDate() - 90)
      const start90d = new Date(end90d)
      start90d.setDate(end90d.getDate() - 90)
      return { start: start90d, end: end90d }
    case '1y':
      const end1y = new Date(now)
      end1y.setFullYear(now.getFullYear() - 1)
      const start1y = new Date(end1y)
      start1y.setFullYear(end1y.getFullYear() - 1)
      return { start: start1y, end: end1y }
    case 'all':
      return null
    default:
      return null
  }
}

function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}
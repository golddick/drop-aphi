



// 'use server'

// import { getServerAuth } from '@/lib/auth/getauth'
// import { database } from '@/lib/database'
// import { cache } from 'react'

// export interface GrowthData {
//   name: string
//   subscribers: number
//   emails: number
//   blogViews: number
// }

// export interface PerformanceData {
//   name: string
//   openRate: number
//   clickRate: number
//   blogEngagement: number
// }

// export interface BlogPerformance {
//   name: string
//   views: number
//   readRate: number
//   avgReadTime: number
//   shares: number
// }

// export interface TopCampaign {
//   name: string
//   subscribers: number
//   openRate: number
//   clickRate: number
//   status: string
// }

// export interface TopBlog {
//   name: string
//   views: number
//   readRate: number
//   shares: number
//   status: string
// }

// export interface GrowthDataResponse {
//   data: GrowthData[]
//   isEmpty: boolean
//   message?: string
// }

// export interface PerformanceDataResponse {
//   data: PerformanceData[]
//   isEmpty: boolean
//   message?: string
// }

// export interface BlogPerformanceResponse {
//   data: BlogPerformance[]
//   isEmpty: boolean
//   message?: string
// }

// export interface TopCampaignsResponse {
//   data: TopCampaign[]
//   isEmpty: boolean
//   message?: string
// }

// export interface TopBlogsResponse {
//   data: TopBlog[]
//   isEmpty: boolean
//   message?: string
// }


// function getDateRange(timeRange: string): { start: Date; end: Date } {
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
//     default:
//       const startDefault = new Date(now)
//       startDefault.setDate(now.getDate() - 30)
//       return { start: startDefault, end }
//   }
// }

// // 1. Growth Trends Data - FIXED with proper date filtering
// export const getGrowthTrends = cache(async (timeRange: string): Promise<GrowthDataResponse> => {
//   try {
//     const user = await getServerAuth()
//     if (!user) throw new Error('Unauthorized')

//     const dateRange = getDateRange(timeRange)
    
//     // Get monthly data for the selected time range
//     const months = getMonthlyIntervals(dateRange.start, dateRange.end)
    
//     const growthData = await Promise.all(
//       months.map(async (month) => {
//         const [subscribers, emails, blogViews] = await Promise.all([
//           // Subscribers count for the month - FIXED: Added date filter
//           database.subscriber.count({
//             where: {
//               newsLetterOwnerId: user.userId,
//               status: "SUBSCRIBED",
//               createdAt: {
//                 gte: month.start,
//                 lt: month.end
//               }
//             }
//           }),
//           // Emails sent for the month - FIXED: Added date filter
//           database.email.count({
//             where: {
//               userId: user.userId,
//               status: "SENT",
//               createdAt: {
//                 gte: month.start,
//                 lt: month.end
//               }
//             }
//           }),
//           // Blog views for the month - FIXED: Added date filter
//           database.blogPostView.count({
//             where: {
//               post: { authorId: user.userId },
//               createdAt: {
//                 gte: month.start,
//                 lt: month.end
//               }
//             }
//           })
//         ])

//         return {
//           name: month.name,
//           subscribers,
//           emails,
//           blogViews
//         }
//       })
//     )

//     // Check if all data is zero (empty state)
//     const isEmpty = growthData.every(item => 
//       item.subscribers === 0 && item.emails === 0 && item.blogViews === 0
//     )

//     return {
//       data: growthData,
//       isEmpty,
//       message: isEmpty ? 'No growth data available for the selected period. Start by adding subscribers, sending emails, or publishing blog posts.' : undefined
//     }
//   } catch (error) {
//     console.error('Error fetching growth trends:', error)
//     throw new Error('Failed to fetch growth trends data')
//   }
// })

// // 2. Performance Metrics Data - FIXED with proper date filtering
// export const getPerformanceMetrics = cache(async (timeRange: string): Promise<PerformanceDataResponse> => {
//   try {
//     const user = await getServerAuth()
//     if (!user) throw new Error('Unauthorized')

//     const dateRange = getDateRange(timeRange)
//     const weeks = getWeeklyIntervals(dateRange.start, dateRange.end)
    
//     const performanceData = await Promise.all(
//       weeks.map(async (week) => {
//         // Get email metrics for the week - FIXED: Added date filter
//         const emailMetrics = await database.email.aggregate({
//           where: {
//             userId: user.userId,
//             status: "SENT",
//             createdAt: {
//               gte: week.start,
//               lt: week.end
//             }
//           },
//           _avg: {
//             openCount: true,
//             clickCount: true
//           },
//           _sum: {
//             recipients: true
//           }
//         })

//         // Get blog engagement for the week - FIXED: Added date filter
//         const blogEngagement = await database.blogPostView.aggregate({
//           where: {
//             post: { authorId: user.userId },
//             createdAt: {
//               gte: week.start,
//               lt: week.end
//             }
//           },
//           _count: {
//             _all: true
//           }
//         })

//         const totalRecipients = emailMetrics._sum.recipients || 0
//         const openRate = totalRecipients > 0 ? ((emailMetrics._avg.openCount || 0) / totalRecipients) * 100 : 0
//         const clickRate = totalRecipients > 0 ? ((emailMetrics._avg.clickCount || 0) / totalRecipients) * 100 : 0
        
//         // Calculate blog engagement rate - FIXED: Added date filter for blog posts
//         const totalBlogPosts = await database.blogPost.count({
//           where: {
//             authorId: user.userId,
//             status: "PUBLISHED",
//             publishedAt: {
//               gte: week.start,
//               lt: week.end
//             }
//           }
//         })
//         const blogEngagementRate = totalBlogPosts > 0 ? (blogEngagement._count._all / totalBlogPosts) * 100 : 0

//         return {
//           name: week.name,
//           openRate: Math.round(openRate * 10) / 10,
//           clickRate: Math.round(clickRate * 10) / 10,
//           blogEngagement: Math.round(blogEngagementRate * 10) / 10
//         }
//       })
//     )

//     // Check if all data is zero
//     const isEmpty = performanceData.every(item => 
//       item.openRate === 0 && item.clickRate === 0 && item.blogEngagement === 0
//     )

//     return {
//       data: performanceData,
//       isEmpty,
//       message: isEmpty ? 'No performance data available. Send some emails and publish blog posts to see engagement metrics.' : undefined
//     }
//   } catch (error) {
//     console.error('Error fetching performance metrics:', error)
//     throw new Error('Failed to fetch performance metrics data')
//   }
// })


// // 3. Blog Performance Data - FIXED with proper date filtering
// export const getBlogPerformance = cache(async (timeRange: string): Promise<BlogPerformanceResponse> => {
//   try {
//     const user = await getServerAuth()
//     if (!user) throw new Error('Unauthorized')

//     const dateRange = getDateRange(timeRange)
    
//     const blogPosts = await database.blogPost.findMany({
//       where: {
//         authorId: user.userId,
//         status: "PUBLISHED",
//         publishedAt: {
//           gte: dateRange.start,
//           lte: dateRange.end
//         }
//       },
//       include: {
//         viewsCount: {
//           where: {
//             createdAt: {
//               gte: dateRange.start,
//               lte: dateRange.end
//             }
//           }
//         }
//       },
//       take: 5,
//       orderBy: {
//         views: 'desc'
//       }
//     })

//     if (blogPosts.length === 0) {
//       return {
//         data: [],
//         isEmpty: true,
//         message: 'No blog posts published in the selected period. Create and publish blog posts to see performance analytics.'
//       }
//     }

//     const blogPerformance = blogPosts.map(blog => ({
//       name: blog.title.length > 20 ? blog.title.substring(0, 20) + '...' : blog.title,
//       views: blog.viewsCount.length, // Use actual views count from the date range
//       readRate: calculateReadRate(blog.viewsCount.length, blog.viewsCount.length), // Adjust based on your logic
//       avgReadTime: blog.readTime,
//       shares: blog.shares
//     }))

//     return {
//       data: blogPerformance,
//       isEmpty: false
//     }
//   } catch (error) {
//     console.error('Error fetching blog performance:', error)
//     throw new Error('Failed to fetch blog performance data')
//   }
// })

// // 5. Top Email Campaigns - FIXED with proper date filtering
// export const getTopCampaigns = cache(async (timeRange: string): Promise<TopCampaignsResponse> => {
//   try {
//     const user = await getServerAuth()
//     if (!user) throw new Error('Unauthorized')

//     const dateRange = getDateRange(timeRange)
    
//     const campaigns = await database.campaign.findMany({
//       where: {
//         userId: user.userId,
//         createdAt: {
//           gte: dateRange.start,
//           lte: dateRange.end
//         }
//       },
//       include: {
//         emails: {
//           where: {
//             status: "SENT",
//             createdAt: {
//               gte: dateRange.start,
//               lte: dateRange.end
//             }
//           },
//           include: {
//             emailRecipients: true
//           }
//         }
//       },
//       take: 5,
//       orderBy: {
//         createdAt: 'desc'
//       }
//     })

//     if (campaigns.length === 0) {
//       return {
//         data: [],
//         isEmpty: true,
//         message: 'No email campaigns created in the selected period. Create campaigns and send emails to see performance analytics.'
//       }
//     }

//     const topCampaigns = campaigns.map(campaign => {
//       const totalEmails = campaign.emails.length
//       const totalRecipients = campaign.emails.reduce((sum, email) => sum + (email.recipients || 0), 0)
//       const totalOpens = campaign.emails.reduce((sum, email) => sum + (email.openCount || 0), 0)
//       const totalClicks = campaign.emails.reduce((sum, email) => sum + (email.clickCount || 0), 0)

//       const openRate = totalRecipients > 0 ? (totalOpens / totalRecipients) * 100 : 0
//       const clickRate = totalRecipients > 0 ? (totalClicks / totalRecipients) * 100 : 0

//       return {
//         name: campaign.name,
//         subscribers: totalRecipients,
//         openRate: Math.round(openRate * 10) / 10,
//         clickRate: Math.round(clickRate * 10) / 10,
//         status: campaign.status || 'Active'
//       }
//     })

//     return {
//       data: topCampaigns,
//       isEmpty: false
//     }
//   } catch (error) {
//     console.error('Error fetching top campaigns:', error)
//     throw new Error('Failed to fetch top campaigns data')
//   }
// })

// // 6. Top Blog Posts - FIXED with proper date filtering
// export const getTopBlogs = cache(async (timeRange: string): Promise<TopBlogsResponse> => {
//   try {
//     const user = await getServerAuth()
//     if (!user) throw new Error('Unauthorized')

//     const dateRange = getDateRange(timeRange)
    
//     const blogPosts = await database.blogPost.findMany({
//       where: {
//         authorId: user.userId,
//         status: "PUBLISHED",
//         publishedAt: {
//           gte: dateRange.start,
//           lte: dateRange.end
//         }
//       },
//       include: {
//         viewsCount: {
//           where: {
//             createdAt: {
//               gte: dateRange.start,
//               lte: dateRange.end
//             }
//           }
//         }
//       },
//       take: 5,
//       orderBy: {
//         views: 'desc'
//       }
//     })

//     if (blogPosts.length === 0) {
//       return {
//         data: [],
//         isEmpty: true,
//         message: 'No blog posts published in the selected period. Write and publish blog posts to see performance analytics.'
//       }
//     }

//     const topBlogs = blogPosts.map(blog => ({
//       name: blog.title.length > 20 ? blog.title.substring(0, 20) + '...' : blog.title,
//       views: blog.viewsCount.length, // Use views from the date range
//       readRate: calculateReadRate(blog.viewsCount.length, blog.viewsCount.length),
//       shares: blog.shares,
//       status: blog.status
//     }))

//     return {
//       data: topBlogs,
//       isEmpty: false
//     }
//   } catch (error) {
//     console.error('Error fetching top blogs:', error)
//     throw new Error('Failed to fetch top blogs data')
//   }
// })

// // Helper functions
// function getMonthlyIntervals(start: Date, end: Date): Array<{name: string, start: Date, end: Date}> {
//   const intervals = []
//   const current = new Date(start)
//   current.setDate(1) // Start from beginning of month
  
//   while (current < end) {
//     const monthStart = new Date(current)
//     const monthEnd = new Date(current)
//     monthEnd.setMonth(monthEnd.getMonth() + 1)
    
//     intervals.push({    name: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
  
//       start: new Date(monthStart),
//       end: new Date(monthEnd)
//     })
    
//     current.setMonth(current.getMonth() + 1)
//   }
  
//   return intervals
// }

// function getWeeklyIntervals(start: Date, end: Date): Array<{name: string, start: Date, end: Date}> {
//   const intervals = []
//   const current = new Date(start)
//   let weekCount = 1
  
//   while (current < end) {
//     const weekStart = new Date(current)
//     const weekEnd = new Date(current)
//     weekEnd.setDate(weekEnd.getDate() + 7)
    
//     intervals.push({
//       name: `Week ${weekCount}`,
//       start: new Date(weekStart),
//       end: new Date(weekEnd)
//     })
    
//     current.setDate(current.getDate() + 7)
//     weekCount++
//   }
  
//   return intervals.slice(0, 4)
// }

// function calculateReadRate(views: number, reads: number): number {
//   if (views === 0) return 0
//   return Math.round((reads / views) * 100 * 10) / 10
// }
















'use server'

import { getServerAuth } from '@/lib/auth/getauth'
import { database } from '@/lib/database'
import { cache } from 'react'
import {
  GrowthDataResponseSchema,
  PerformanceDataResponseSchema,
  BlogPerformanceResponseSchema,
  TopCampaignsResponseSchema,
  TopBlogsResponseSchema,
  type GrowthDataResponse,
  type PerformanceDataResponse,
  type BlogPerformanceResponse,
  type TopCampaignsResponse,
  type TopBlogsResponse
} from '@/lib/schemas/analytics-schemas'

function getDateRange(timeRange: string): { start: Date; end: Date } {
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
    default:
      const startDefault = new Date(now)
      startDefault.setDate(now.getDate() - 30)
      return { start: startDefault, end }
  }
}

// 1. Growth Trends Data - UPDATED with unsubscribers
export const getGrowthTrends = cache(async (timeRange: string): Promise<GrowthDataResponse> => {
  try {
    const user = await getServerAuth()
    if (!user) throw new Error('Unauthorized')

    const dateRange = getDateRange(timeRange)
    
    // Get monthly data for the selected time range
    const months = getMonthlyIntervals(dateRange.start, dateRange.end)
    
    const growthData = await Promise.all(
      months.map(async (month) => {
        const [subscribers, unsubscribers, emails, blogViews] = await Promise.all([
          // Subscribers count for the month
          database.subscriber.count({
            where: {
              newsLetterOwnerId: user.userId,
              status: "SUBSCRIBED",
              createdAt: {
                gte: month.start,
                lt: month.end
              }
            }
          }),
          // Unsubscribers count for the month - NEW
          database.unsubscribeEvent.count({
            where: {
              newsLetterOwnerId: user.userId,
              createdAt: {
                gte: month.start,
                lt: month.end
              }
            }
          }),
          // Emails sent for the month
          database.email.count({
            where: {
              userId: user.userId,
              status: "SENT",
              createdAt: {
                gte: month.start,
                lt: month.end
              }
            }
          }),
          // Blog views for the month
          database.blogPostView.count({
            where: {
              post: { authorId: user.userId },
              createdAt: {
                gte: month.start,
                lt: month.end
              }
            }
          })
        ])

        return {
          name: month.name,
          subscribers,
          unsubscribers,
          emails,
          blogViews
        }
      })
    )

    // Validate and parse the data
    const validatedData = GrowthDataResponseSchema.parse({
      data: growthData,
      isEmpty: growthData.every(item => 
        item.subscribers === 0 && item.unsubscribers === 0 && item.emails === 0 && item.blogViews === 0
      ),
      message: growthData.every(item => 
        item.subscribers === 0 && item.unsubscribers === 0 && item.emails === 0 && item.blogViews === 0
      ) ? 'No growth data available for the selected period. Start by adding subscribers, sending emails, or publishing blog posts.' : undefined
    })

    return validatedData
  } catch (error) {
    console.error('Error fetching growth trends:', error)
    throw new Error('Failed to fetch growth trends data')
  }
})

// 2. Performance Metrics Data - UPDATED to use EmailAnalytics model
export const getPerformanceMetrics = cache(async (timeRange: string): Promise<PerformanceDataResponse> => {
  try {
    const user = await getServerAuth()
    if (!user) throw new Error('Unauthorized')

    const dateRange = getDateRange(timeRange)
    const months = getMonthlyIntervals(dateRange.start, dateRange.end)
    
    const performanceData = await Promise.all(
      months.map(async (month) => {
        // First get all email IDs for this period to check if any emails were sent
        const emailIds = await database.email.findMany({
          where: {
            userId: user.userId,
            status: "SENT",
            sentAt: {
              gte: month.start,
              lt: month.end
            }
          },
          select: { id: true }
        })

        const emailIdList = emailIds.map(email => email.id)

        let openRate = 0
        let clickRate = 0

        // Only query email analytics if there were emails sent this month
        if (emailIdList.length > 0) {
          // Get email analytics for the specific email IDs
          const emailAnalytics = await database.emailAnalytics.aggregate({
            where: {
              emailId: {
                in: emailIdList
              }
            },
            _avg: {
              openRate: true,
              clickRate: true
            },
            _sum: {
              uniqueOpens: true,
              uniqueClicks: true,
              totalRecipients: true
            }
          })

          // Calculate rates only if we have valid data
          if (emailAnalytics._sum.totalRecipients && emailAnalytics._sum.totalRecipients > 0) {
            openRate = ((emailAnalytics._sum.uniqueOpens ?? 0) / emailAnalytics._sum.totalRecipients) * 100
            clickRate = ((emailAnalytics._sum.uniqueClicks ?? 0 ) / emailAnalytics._sum.totalRecipients) * 100
          } else if (emailAnalytics._avg.openRate || emailAnalytics._avg.clickRate) {
            // Fallback to pre-calculated averages
            openRate = emailAnalytics._avg.openRate || 0
            clickRate = emailAnalytics._avg.clickRate || 0
          }
          // If no analytics data exists yet, rates remain 0
        }
        // If no emails were sent, rates remain 0 (no data)

        // Get blog engagement for the month
        const blogEngagement = await database.blogPostView.aggregate({
          where: {
            post: { authorId: user.userId },
            createdAt: {
              gte: month.start,
              lt: month.end
            }
          },
          _count: {
            _all: true
          }
        })

        // Calculate blog engagement rate
        const totalBlogPosts = await database.blogPost.count({
          where: {
            authorId: user.userId,
            status: "PUBLISHED",
            publishedAt: {
              gte: month.start,
              lt: month.end
            }
          }
        })
        
        let blogEngagementRate = 0
        if (totalBlogPosts > 0) {
          blogEngagementRate = (blogEngagement._count._all / totalBlogPosts) * 100
        }
        // If no blog posts, engagement rate remains 0

        return {
          name: month.name, // This will show "Jan 2024", "Feb 2024", etc.
          openRate: Math.min(Math.round(openRate * 10) / 10, 100),
          clickRate: Math.min(Math.round(clickRate * 10) / 10, 100),
          blogEngagement: Math.min(Math.round(blogEngagementRate * 10) / 10, 100),
          hasEmailData: emailIdList.length > 0, // Track if emails were actually sent
          hasBlogData: totalBlogPosts > 0 // Track if blogs were published
        }
      })
    )

    // Check if ALL months have no data
    const allMonthsEmpty = performanceData.every(item => 
      !item.hasEmailData && !item.hasBlogData
    )

    // Validate and parse the data
    const validatedData = PerformanceDataResponseSchema.parse({
      data: performanceData,
      isEmpty: allMonthsEmpty,
      message: allMonthsEmpty 
        ? 'No performance data available. Send some emails and publish blog posts to see engagement metrics.' 
        : undefined
    })

    return validatedData
  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    throw new Error('Failed to fetch performance metrics data')
  }
})


export const getBlogPerformance = cache(async (timeRange: string): Promise<BlogPerformanceResponse> => {
  try {
    const user = await getServerAuth()
    if (!user) throw new Error('Unauthorized')

    const dateRange = getDateRange(timeRange)
    
    const blogPosts = await database.blogPost.findMany({
      where: {
        authorId: user.userId,
        status: "PUBLISHED",
        publishedAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      },
      include: {
        viewsCount: {
          where: {
            createdAt: {
              gte: dateRange.start,
              lte: dateRange.end
            }
          }
        }
      },
      take: 5,
      orderBy: {
        views: 'desc'
      }
    })

    const blogPerformance = blogPosts.map(blog => ({
      name: blog.title.length > 20 ? blog.title.substring(0, 20) + '...' : blog.title,
      views: blog.viewsCount.length,
      readRate: Math.min(calculateReadRate(blog.viewsCount.length, blog.viewsCount.length), 100),
      avgReadTime: blog.readTime,
      shares: blog.shares
    }))

    // Validate and parse the data
    const validatedData = BlogPerformanceResponseSchema.parse({
      data: blogPerformance,
      isEmpty: blogPerformance.length === 0,
      message: blogPerformance.length === 0 ? 'No blog posts published in the selected period. Create and publish blog posts to see performance analytics.' : undefined
    })

    return validatedData
  } catch (error) {
    console.error('Error fetching blog performance:', error)
    throw new Error('Failed to fetch blog performance data')
  }
})

// 4. Top Email Campaigns - UPDATED to use EmailAnalytics model
export const getTopCampaigns = cache(async (timeRange: string): Promise<TopCampaignsResponse> => {
  try {
    const user = await getServerAuth()
    if (!user) throw new Error('Unauthorized')

    const dateRange = getDateRange(timeRange)
    
    const campaigns = await database.campaign.findMany({
      where: {
        userId: user.userId,
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      },
      include: {
        emails: {
          where: {
            status: "SENT",
            sentAt: {
              gte: dateRange.start,
              lte: dateRange.end
            }
          },
          include: {
            emailAnalytics: true
          }
        }
      },
      take: 5,
      orderBy: {
        createdAt: 'desc'
      }
    })

    const topCampaigns = campaigns.map(campaign => {
      const totalEmails = campaign.emails.length
      const totalRecipients = campaign.emails.reduce((sum, email) => 
        sum + (email.emailAnalytics?.totalRecipients || 0), 0
      )
      
      // Calculate average rates from email analytics
      const totalOpenRate = campaign.emails.reduce((sum, email) => 
        sum + (email.emailAnalytics?.openRate || 0), 0
      )
      const totalClickRate = campaign.emails.reduce((sum, email) => 
        sum + (email.emailAnalytics?.clickRate || 0), 0
      )

      const openRate = totalEmails > 0 ? totalOpenRate / totalEmails : 0
      const clickRate = totalEmails > 0 ? totalClickRate / totalEmails : 0

      return {
        name: campaign.name,
        subscribers: totalRecipients,
        openRate: Math.min(Math.round(openRate * 10) / 10, 100),
        clickRate: Math.min(Math.round(clickRate * 10) / 10, 100),
        status: campaign.status || 'Active'
      }
    })

    // Validate and parse the data
    const validatedData = TopCampaignsResponseSchema.parse({
      data: topCampaigns,
      isEmpty: topCampaigns.length === 0,
      message: topCampaigns.length === 0 ? 'No email campaigns created in the selected period. Create campaigns and send emails to see performance analytics.' : undefined
    })

    return validatedData
  } catch (error) {
    console.error('Error fetching top campaigns:', error)
    throw new Error('Failed to fetch top campaigns data')
  }
})

// 5. Top Blog Posts
export const getTopBlogs = cache(async (timeRange: string): Promise<TopBlogsResponse> => {
  try {
    const user = await getServerAuth()
    if (!user) throw new Error('Unauthorized')

    const dateRange = getDateRange(timeRange)
    
    const blogPosts = await database.blogPost.findMany({
      where: {
        authorId: user.userId,
        status: "PUBLISHED",
        publishedAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      },
      include: {
        viewsCount: {
          where: {
            createdAt: {
              gte: dateRange.start,
              lte: dateRange.end
            }
          }
        }
      },
      take: 5,
      orderBy: {
        views: 'desc'
      }
    })

    const topBlogs = blogPosts.map(blog => ({
      name: blog.title.length > 20 ? blog.title.substring(0, 20) + '...' : blog.title,
      views: blog.viewsCount.length,
      readRate: Math.min(calculateReadRate(blog.viewsCount.length, blog.viewsCount.length), 100),
      shares: blog.shares,
      status: blog.status
    }))

    // Validate and parse the data
    const validatedData = TopBlogsResponseSchema.parse({
      data: topBlogs,
      isEmpty: topBlogs.length === 0,
      message: topBlogs.length === 0 ? 'No blog posts published in the selected period. Write and publish blog posts to see performance analytics.' : undefined
    })

    return validatedData
  } catch (error) {
    console.error('Error fetching top blogs:', error)
    throw new Error('Failed to fetch top blogs data')
  }
})

// Helper functions
function getMonthlyIntervals(start: Date, end: Date): Array<{name: string, start: Date, end: Date}> {
  const intervals = []
  const current = new Date(start)
  current.setDate(1)
  
  while (current < end) {
    const monthStart = new Date(current)
    const monthEnd = new Date(current)
    monthEnd.setMonth(monthEnd.getMonth() + 1)
    
    intervals.push({
      name: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      start: new Date(monthStart),
      end: new Date(monthEnd)
    })
    
    current.setMonth(current.getMonth() + 1)
  }
  
  return intervals
}

function getWeeklyIntervals(start: Date, end: Date): Array<{name: string, start: Date, end: Date}> {
  const intervals = []
  const current = new Date(start)
  let weekCount = 1
  
  while (current < end) {
    const weekStart = new Date(current)
    const weekEnd = new Date(current)
    weekEnd.setDate(weekEnd.getDate() + 7)
    
    intervals.push({
      name: `Week ${weekCount}`,
      start: new Date(weekStart),
      end: new Date(weekEnd)
    })
    
    current.setDate(current.getDate() + 7)
    weekCount++
  }
  
  return intervals.slice(0, 4)
}

function calculateReadRate(views: number, reads: number): number {
  if (views === 0) return 0
  return Math.round((reads / views) * 100 * 10) / 10
}
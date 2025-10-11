// 'use server'

// import { getServerAuth } from '@/lib/auth/getauth'
// import { database } from '@/lib/database'
// import { cache } from 'react'

// // Types for our data
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

// export interface SourceData {
//   name: string
//   value: number
//   color: string
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

// // Enhanced response types for consistent returns
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

// export interface SourceDataResponse {
//   data: SourceData[]
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

// // Helper function to get date ranges
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

// // 1. Growth Trends Data - Updated to return enhanced response
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
//           // Subscribers count for the month
//           database.subscriber.count({
//             where: {
//               newsLetterOwnerId: user.userId,
//               status: "SUBSCRIBED",
//             }
//           }),
//           // Emails sent for the month
//           database.email.count({
//             where: {
//               userId: user.userId,
//               status: "SENT",
//             }
//           }),
//           // Blog views for the month
//           database.blogPostView.count({
//             where: {
//               post: { authorId: user.userId },
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

// // 2. Performance Metrics Data - Updated to return enhanced response
// export const getPerformanceMetrics = cache(async (timeRange: string): Promise<PerformanceDataResponse> => {
//   try {
//     const user = await getServerAuth()
//     if (!user) throw new Error('Unauthorized')

//     const dateRange = getDateRange(timeRange)
//     const weeks = getWeeklyIntervals(dateRange.start, dateRange.end)
    
//     const performanceData = await Promise.all(
//       weeks.map(async (week) => {
//         // Get email metrics for the week
//         const emailMetrics = await database.email.aggregate({
//           where: {
//             userId: user.userId,
//             status: "SENT",
//           },
//           _avg: {
//             openCount: true,
//             clickCount: true
//           },
//           _sum: {
//             recipients: true
//           }
//         })

//         // Get blog engagement for the week
//         const blogEngagement = await database.blogPostView.aggregate({
//           where: {
//             post: { authorId: user.userId },
//           },
//           _count: {
//             _all: true
//           }
//         })

//         const totalRecipients = emailMetrics._sum.recipients || 0
//         const openRate = totalRecipients > 0 ? ((emailMetrics._avg.openCount || 0) / totalRecipients) * 100 : 0
//         const clickRate = totalRecipients > 0 ? ((emailMetrics._avg.clickCount || 0) / totalRecipients) * 100 : 0
        
//         // Calculate blog engagement rate
//         const totalBlogPosts = await database.blogPost.count({
//           where: {
//             authorId: user.userId,
//             status: "PUBLISHED"
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

// // 4. Blog Performance Data - Updated to return enhanced response
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
//         message: 'No blog posts published yet. Create and publish your first blog post to see performance analytics.'
//       }
//     }

//     const blogPerformance = blogPosts.map(blog => ({
//       name: blog.title.length > 20 ? blog.title.substring(0, 20) + '...' : blog.title,
//       views: blog.views,
//       readRate: calculateReadRate(blog.views, blog.viewsCount.length),
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

// // 5. Top Email Campaigns - Updated to return enhanced response
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
//             status: "SENT"
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
//         message: 'No email campaigns created yet. Create your first campaign and send emails to see performance analytics.'
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

// // 6. Top Blog Posts - Updated to return enhanced response
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
//           lte: dateRange.end
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
//         message: 'No blog posts published yet. Write and publish your first blog post to see performance analytics.'
//       }
//     }

//     const topBlogs = blogPosts.map(blog => ({
//       name: blog.title.length > 20 ? blog.title.substring(0, 20) + '...' : blog.title,
//       views: blog.views,
//       readRate: calculateReadRate(blog.views, blog.views),
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

// // Helper functions (keep these the same)
// function getMonthlyIntervals(start: Date, end: Date): Array<{name: string, start: Date, end: Date}> {
//   const intervals = []
//   const current = new Date(start)
  
//   while (current < end) {
//     const monthStart = new Date(current)
//     const monthEnd = new Date(current)
//     monthEnd.setMonth(monthEnd.getMonth() + 1)
    
//     intervals.push({
//       name: monthStart.toLocaleDateString('en-US', { month: 'short' }),
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

export interface GrowthData {
  name: string
  subscribers: number
  emails: number
  blogViews: number
}

export interface PerformanceData {
  name: string
  openRate: number
  clickRate: number
  blogEngagement: number
}

export interface BlogPerformance {
  name: string
  views: number
  readRate: number
  avgReadTime: number
  shares: number
}

export interface TopCampaign {
  name: string
  subscribers: number
  openRate: number
  clickRate: number
  status: string
}

export interface TopBlog {
  name: string
  views: number
  readRate: number
  shares: number
  status: string
}

export interface GrowthDataResponse {
  data: GrowthData[]
  isEmpty: boolean
  message?: string
}

export interface PerformanceDataResponse {
  data: PerformanceData[]
  isEmpty: boolean
  message?: string
}

export interface BlogPerformanceResponse {
  data: BlogPerformance[]
  isEmpty: boolean
  message?: string
}

export interface TopCampaignsResponse {
  data: TopCampaign[]
  isEmpty: boolean
  message?: string
}

export interface TopBlogsResponse {
  data: TopBlog[]
  isEmpty: boolean
  message?: string
}


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

// 1. Growth Trends Data - FIXED with proper date filtering
export const getGrowthTrends = cache(async (timeRange: string): Promise<GrowthDataResponse> => {
  try {
    const user = await getServerAuth()
    if (!user) throw new Error('Unauthorized')

    const dateRange = getDateRange(timeRange)
    
    // Get monthly data for the selected time range
    const months = getMonthlyIntervals(dateRange.start, dateRange.end)
    
    const growthData = await Promise.all(
      months.map(async (month) => {
        const [subscribers, emails, blogViews] = await Promise.all([
          // Subscribers count for the month - FIXED: Added date filter
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
          // Emails sent for the month - FIXED: Added date filter
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
          // Blog views for the month - FIXED: Added date filter
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
          emails,
          blogViews
        }
      })
    )

    // Check if all data is zero (empty state)
    const isEmpty = growthData.every(item => 
      item.subscribers === 0 && item.emails === 0 && item.blogViews === 0
    )

    return {
      data: growthData,
      isEmpty,
      message: isEmpty ? 'No growth data available for the selected period. Start by adding subscribers, sending emails, or publishing blog posts.' : undefined
    }
  } catch (error) {
    console.error('Error fetching growth trends:', error)
    throw new Error('Failed to fetch growth trends data')
  }
})

// 2. Performance Metrics Data - FIXED with proper date filtering
export const getPerformanceMetrics = cache(async (timeRange: string): Promise<PerformanceDataResponse> => {
  try {
    const user = await getServerAuth()
    if (!user) throw new Error('Unauthorized')

    const dateRange = getDateRange(timeRange)
    const weeks = getWeeklyIntervals(dateRange.start, dateRange.end)
    
    const performanceData = await Promise.all(
      weeks.map(async (week) => {
        // Get email metrics for the week - FIXED: Added date filter
        const emailMetrics = await database.email.aggregate({
          where: {
            userId: user.userId,
            status: "SENT",
            createdAt: {
              gte: week.start,
              lt: week.end
            }
          },
          _avg: {
            openCount: true,
            clickCount: true
          },
          _sum: {
            recipients: true
          }
        })

        // Get blog engagement for the week - FIXED: Added date filter
        const blogEngagement = await database.blogPostView.aggregate({
          where: {
            post: { authorId: user.userId },
            createdAt: {
              gte: week.start,
              lt: week.end
            }
          },
          _count: {
            _all: true
          }
        })

        const totalRecipients = emailMetrics._sum.recipients || 0
        const openRate = totalRecipients > 0 ? ((emailMetrics._avg.openCount || 0) / totalRecipients) * 100 : 0
        const clickRate = totalRecipients > 0 ? ((emailMetrics._avg.clickCount || 0) / totalRecipients) * 100 : 0
        
        // Calculate blog engagement rate - FIXED: Added date filter for blog posts
        const totalBlogPosts = await database.blogPost.count({
          where: {
            authorId: user.userId,
            status: "PUBLISHED",
            publishedAt: {
              gte: week.start,
              lt: week.end
            }
          }
        })
        const blogEngagementRate = totalBlogPosts > 0 ? (blogEngagement._count._all / totalBlogPosts) * 100 : 0

        return {
          name: week.name,
          openRate: Math.round(openRate * 10) / 10,
          clickRate: Math.round(clickRate * 10) / 10,
          blogEngagement: Math.round(blogEngagementRate * 10) / 10
        }
      })
    )

    // Check if all data is zero
    const isEmpty = performanceData.every(item => 
      item.openRate === 0 && item.clickRate === 0 && item.blogEngagement === 0
    )

    return {
      data: performanceData,
      isEmpty,
      message: isEmpty ? 'No performance data available. Send some emails and publish blog posts to see engagement metrics.' : undefined
    }
  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    throw new Error('Failed to fetch performance metrics data')
  }
})


// 3. Blog Performance Data - FIXED with proper date filtering
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

    if (blogPosts.length === 0) {
      return {
        data: [],
        isEmpty: true,
        message: 'No blog posts published in the selected period. Create and publish blog posts to see performance analytics.'
      }
    }

    const blogPerformance = blogPosts.map(blog => ({
      name: blog.title.length > 20 ? blog.title.substring(0, 20) + '...' : blog.title,
      views: blog.viewsCount.length, // Use actual views count from the date range
      readRate: calculateReadRate(blog.viewsCount.length, blog.viewsCount.length), // Adjust based on your logic
      avgReadTime: blog.readTime,
      shares: blog.shares
    }))

    return {
      data: blogPerformance,
      isEmpty: false
    }
  } catch (error) {
    console.error('Error fetching blog performance:', error)
    throw new Error('Failed to fetch blog performance data')
  }
})

// 5. Top Email Campaigns - FIXED with proper date filtering
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
            createdAt: {
              gte: dateRange.start,
              lte: dateRange.end
            }
          },
          include: {
            emailRecipients: true
          }
        }
      },
      take: 5,
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (campaigns.length === 0) {
      return {
        data: [],
        isEmpty: true,
        message: 'No email campaigns created in the selected period. Create campaigns and send emails to see performance analytics.'
      }
    }

    const topCampaigns = campaigns.map(campaign => {
      const totalEmails = campaign.emails.length
      const totalRecipients = campaign.emails.reduce((sum, email) => sum + (email.recipients || 0), 0)
      const totalOpens = campaign.emails.reduce((sum, email) => sum + (email.openCount || 0), 0)
      const totalClicks = campaign.emails.reduce((sum, email) => sum + (email.clickCount || 0), 0)

      const openRate = totalRecipients > 0 ? (totalOpens / totalRecipients) * 100 : 0
      const clickRate = totalRecipients > 0 ? (totalClicks / totalRecipients) * 100 : 0

      return {
        name: campaign.name,
        subscribers: totalRecipients,
        openRate: Math.round(openRate * 10) / 10,
        clickRate: Math.round(clickRate * 10) / 10,
        status: campaign.status || 'Active'
      }
    })

    return {
      data: topCampaigns,
      isEmpty: false
    }
  } catch (error) {
    console.error('Error fetching top campaigns:', error)
    throw new Error('Failed to fetch top campaigns data')
  }
})

// 6. Top Blog Posts - FIXED with proper date filtering
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

    if (blogPosts.length === 0) {
      return {
        data: [],
        isEmpty: true,
        message: 'No blog posts published in the selected period. Write and publish blog posts to see performance analytics.'
      }
    }

    const topBlogs = blogPosts.map(blog => ({
      name: blog.title.length > 20 ? blog.title.substring(0, 20) + '...' : blog.title,
      views: blog.viewsCount.length, // Use views from the date range
      readRate: calculateReadRate(blog.viewsCount.length, blog.viewsCount.length),
      shares: blog.shares,
      status: blog.status
    }))

    return {
      data: topBlogs,
      isEmpty: false
    }
  } catch (error) {
    console.error('Error fetching top blogs:', error)
    throw new Error('Failed to fetch top blogs data')
  }
})

// Helper functions
function getMonthlyIntervals(start: Date, end: Date): Array<{name: string, start: Date, end: Date}> {
  const intervals = []
  const current = new Date(start)
  current.setDate(1) // Start from beginning of month
  
  while (current < end) {
    const monthStart = new Date(current)
    const monthEnd = new Date(current)
    monthEnd.setMonth(monthEnd.getMonth() + 1)
    
    intervals.push({    name: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
  
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


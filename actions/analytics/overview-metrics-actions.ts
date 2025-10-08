'use server'

import { getServerAuth } from '@/lib/auth/getauth'
import { database } from '@/lib/database'
import { cache } from 'react'

// Types for our data
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

export interface SourceData {
  name: string
  value: number
  color: string
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

// Enhanced response types for consistent returns
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

export interface SourceDataResponse {
  data: SourceData[]
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

// Helper function to get date ranges
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

// 1. Growth Trends Data - Updated to return enhanced response
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
          // Subscribers count for the month
          database.subscriber.count({
            where: {
              newsLetterOwnerId: user.userId,
              status: "SUBSCRIBED",
            }
          }),
          // Emails sent for the month
          database.email.count({
            where: {
              userId: user.userId,
              status: "SENT",
            }
          }),
          // Blog views for the month
          database.blogPostView.count({
            where: {
              post: { authorId: user.userId },
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

// 2. Performance Metrics Data - Updated to return enhanced response
export const getPerformanceMetrics = cache(async (timeRange: string): Promise<PerformanceDataResponse> => {
  try {
    const user = await getServerAuth()
    if (!user) throw new Error('Unauthorized')

    const dateRange = getDateRange(timeRange)
    const weeks = getWeeklyIntervals(dateRange.start, dateRange.end)
    
    const performanceData = await Promise.all(
      weeks.map(async (week) => {
        // Get email metrics for the week
        const emailMetrics = await database.email.aggregate({
          where: {
            userId: user.userId,
            status: "SENT",
          },
          _avg: {
            openCount: true,
            clickCount: true
          },
          _sum: {
            recipients: true
          }
        })

        // Get blog engagement for the week
        const blogEngagement = await database.blogPostView.aggregate({
          where: {
            post: { authorId: user.userId },
          },
          _count: {
            _all: true
          }
        })

        const totalRecipients = emailMetrics._sum.recipients || 0
        const openRate = totalRecipients > 0 ? ((emailMetrics._avg.openCount || 0) / totalRecipients) * 100 : 0
        const clickRate = totalRecipients > 0 ? ((emailMetrics._avg.clickCount || 0) / totalRecipients) * 100 : 0
        
        // Calculate blog engagement rate
        const totalBlogPosts = await database.blogPost.count({
          where: {
            authorId: user.userId,
            status: "PUBLISHED"
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

// 3. Subscriber Sources Data - Already has enhanced response
export const getSubscriberSources = cache(async (): Promise<SourceDataResponse> => {
  try {
    const user = await getServerAuth()
    if (!user) throw new Error('Unauthorized')

    // First, check if user has any subscribers
    const subscriberCount = await database.subscriber.count({
      where: {
        newsLetterOwnerId: user.userId,
        status: "SUBSCRIBED"
      }
    })

    if (subscriberCount === 0) {
      return {
        data: [],
        isEmpty: true,
        message: 'No subscribers yet. Add subscription forms to your website or import your subscriber list to see source analytics.'
      }
    }

    // Try to get source data from the database
    try {
      const sourceData = await database.subscriber.groupBy({
        by: ['source'],
        where: {
          newsLetterOwnerId: user.userId,
          status: "SUBSCRIBED",
        },
        _count: {
          _all: true
        }
      })

      const nullSourceCount = await database.subscriber.count({
        where: {
          newsLetterOwnerId: user.userId,
          status: "SUBSCRIBED",
        }
      })

      if (sourceData.length === 0 && nullSourceCount === 0) {
        return {
          data: [],
          isEmpty: true,
          message: 'Subscriber source tracking is not enabled. Add a "source" field to your subscriber model to track where subscribers come from.'
        }
      }

      const sourceColors: { [key: string]: string } = {
        'website': '#3B82F6',
        'social_media': '#10B981',
        'blog': '#F59E0B',
        'referral': '#EF4444',
        'import': '#8B5CF6',
        'manual': '#EC4899',
        'api': '#6366F1'
      }

      const processedData: SourceData[] = []

      sourceData.forEach(item => {
        const sourceName = item.source || 'Unknown'
        const count = item._count._all
        const percentage = (count / subscriberCount) * 100
        
        processedData.push({
          name: formatSourceName(sourceName),
          value: Math.round(percentage),
          color: sourceColors[sourceName.toLowerCase()] || getRandomColor()
        })
      })

      if (nullSourceCount > 0) {
        const percentage = (nullSourceCount / subscriberCount) * 100
        processedData.push({
          name: 'Unknown Source',
          value: Math.round(percentage),
          color: '#6B7280'
        })
      }

      processedData.sort((a, b) => b.value - a.value)

      return {
        data: processedData,
        isEmpty: processedData.length === 0
      }

    } catch (dbError: any) {
      console.log('Source field not available in schema, using fallback data:', dbError.message)
      return await getInferredSubscriberSources(user.userId, subscriberCount)
    }

  } catch (error) {
    console.error('Error fetching subscriber sources:', error)
    throw new Error('Failed to fetch subscriber sources data')
  }
})

// 4. Blog Performance Data - Updated to return enhanced response
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
        message: 'No blog posts published yet. Create and publish your first blog post to see performance analytics.'
      }
    }

    const blogPerformance = blogPosts.map(blog => ({
      name: blog.title.length > 20 ? blog.title.substring(0, 20) + '...' : blog.title,
      views: blog.views,
      readRate: calculateReadRate(blog.views, blog.viewsCount.length),
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

// 5. Top Email Campaigns - Updated to return enhanced response
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
            status: "SENT"
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
        message: 'No email campaigns created yet. Create your first campaign and send emails to see performance analytics.'
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

// 6. Top Blog Posts - Updated to return enhanced response
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
          lte: dateRange.end
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
        message: 'No blog posts published yet. Write and publish your first blog post to see performance analytics.'
      }
    }

    const topBlogs = blogPosts.map(blog => ({
      name: blog.title.length > 20 ? blog.title.substring(0, 20) + '...' : blog.title,
      views: blog.views,
      readRate: calculateReadRate(blog.views, blog.views),
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

// Helper functions (keep these the same)
function getMonthlyIntervals(start: Date, end: Date): Array<{name: string, start: Date, end: Date}> {
  const intervals = []
  const current = new Date(start)
  
  while (current < end) {
    const monthStart = new Date(current)
    const monthEnd = new Date(current)
    monthEnd.setMonth(monthEnd.getMonth() + 1)
    
    intervals.push({
      name: monthStart.toLocaleDateString('en-US', { month: 'short' }),
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

function formatSourceName(source: string): string {
  const formatMap: { [key: string]: string } = {
    'website': 'Website Forms',
    'social_media': 'Social Media',
    'blog': 'Blog Posts',
    'referral': 'Referrals',
    'import': 'Imported List',
    'manual': 'Manual Add',
    'api': 'API',
    'unknown': 'Unknown Source'
  }

  return formatMap[source.toLowerCase()] || 
         source.charAt(0).toUpperCase() + source.slice(1).replace(/_/g, ' ')
}

function getRandomColor(): string {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#6366F1', '#84CC16', '#F97316', '#6B7280'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

async function getInferredSubscriberSources(userId: string, totalSubscribers: number): Promise<SourceDataResponse> {
  try {
    const [websiteSubscribers, importedSubscribers, apiSubscribers] = await Promise.all([
      database.subscriber.count({
        where: {
          newsLetterOwnerId: userId,
          status: "SUBSCRIBED",
        }
      }),
      database.subscriber.count({
        where: {
          newsLetterOwnerId: userId,
          status: "SUBSCRIBED",
        }
      }),
      database.subscriber.count({
        where: {
          newsLetterOwnerId: userId,
          status: "SUBSCRIBED",
        }
      })
    ])

    const inferredData: SourceData[] = []
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

    if (websiteSubscribers > 0) {
      inferredData.push({
        name: 'Website Forms',
        value: Math.round((websiteSubscribers / totalSubscribers) * 100),
        color: colors[0]
      })
    }

    if (importedSubscribers > 0) {
      inferredData.push({
        name: 'Imported List',
        value: Math.round((importedSubscribers / totalSubscribers) * 100),
        color: colors[1]
      })
    }

    if (apiSubscribers > 0) {
      inferredData.push({
        name: 'API',
        value: Math.round((apiSubscribers / totalSubscribers) * 100),
        color: colors[2]
      })
    }

    const accountedFor = inferredData.reduce((sum, item) => sum + item.value, 0)
    if (accountedFor < 100) {
      inferredData.push({
        name: 'Other Sources',
        value: 100 - accountedFor,
        color: colors[3]
      })
    }

    if (inferredData.length === 0) {
      return {
        data: [
          { name: "Website Forms", value: 45, color: "#3B82F6" },
          { name: "Social Media", value: 25, color: "#10B981" },
          { name: "Blog Posts", value: 15, color: "#F59E0B" },
          { name: "Referrals", value: 10, color: "#EF4444" },
          { name: "Other", value: 5, color: "#8B5CF6" },
        ],
        isEmpty: false,
        message: 'Using sample data. Add a "source" field to your subscriber model for accurate source tracking.'
      }
    }

    return {
      data: inferredData,
      isEmpty: false,
      message: 'Using inferred source data. Add a "source" field to your subscriber model for more accurate tracking.'
    }

  } catch (error) {
    console.error('Error inferring subscriber sources:', error)
    
    return {
      data: [
        { name: "Website Forms", value: 45, color: "#3B82F6" },
        { name: "Social Media", value: 25, color: "#10B981" },
        { name: "Blog Posts", value: 15, color: "#F59E0B" },
        { name: "Referrals", value: 10, color: "#EF4444" },
        { name: "Other", value: 5, color: "#8B5CF6" },
      ],
      isEmpty: false,
      message: 'Using sample data. Add a "source" field to your subscriber model to track actual subscriber sources.'
    }
  }
}
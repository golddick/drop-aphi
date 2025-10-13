import { z } from 'zod'

// Schema definitions with validation
export const GrowthDataSchema = z.object({
  name: z.string(),
  subscribers: z.number().min(0),
  unsubscribers: z.number().min(0),
  emails: z.number().min(0),
  blogViews: z.number().min(0)
})

export const PerformanceDataSchema = z.object({
  name: z.string(),
  openRate: z.number().min(0).max(100),
  clickRate: z.number().min(0).max(100),
  blogEngagement: z.number().min(0).max(100)
})

export const BlogPerformanceSchema = z.object({
  name: z.string(),
  views: z.number().min(0),
  readRate: z.number().min(0).max(100),
  avgReadTime: z.number().min(0),
  shares: z.number().min(0)
})

export const TopCampaignSchema = z.object({
  name: z.string(),
  subscribers: z.number().min(0),
  openRate: z.number().min(0).max(100),
  clickRate: z.number().min(0).max(100),
  status: z.string()
})

export const TopBlogSchema = z.object({
  name: z.string(),
  views: z.number().min(0),
  readRate: z.number().min(0).max(100),
  shares: z.number().min(0),
  status: z.string()
})

// Response schemas
export const GrowthDataResponseSchema = z.object({
  data: z.array(GrowthDataSchema),
  isEmpty: z.boolean(),
  message: z.string().optional()
})

export const PerformanceDataResponseSchema = z.object({
  data: z.array(PerformanceDataSchema),
  isEmpty: z.boolean(),
  message: z.string().optional()
})

export const BlogPerformanceResponseSchema = z.object({
  data: z.array(BlogPerformanceSchema),
  isEmpty: z.boolean(),
  message: z.string().optional()
})

export const TopCampaignsResponseSchema = z.object({
  data: z.array(TopCampaignSchema),
  isEmpty: z.boolean(),
  message: z.string().optional()
})

export const TopBlogsResponseSchema = z.object({
  data: z.array(TopBlogSchema),
  isEmpty: z.boolean(),
  message: z.string().optional()
})

// Type exports
export type GrowthData = z.infer<typeof GrowthDataSchema>
export type PerformanceData = z.infer<typeof PerformanceDataSchema>
export type BlogPerformance = z.infer<typeof BlogPerformanceSchema>
export type TopCampaign = z.infer<typeof TopCampaignSchema>
export type TopBlog = z.infer<typeof TopBlogSchema>
export type GrowthDataResponse = z.infer<typeof GrowthDataResponseSchema>
export type PerformanceDataResponse = z.infer<typeof PerformanceDataResponseSchema>
export type BlogPerformanceResponse = z.infer<typeof BlogPerformanceResponseSchema>
export type TopCampaignsResponse = z.infer<typeof TopCampaignsResponseSchema>
export type TopBlogsResponse = z.infer<typeof TopBlogsResponseSchema>



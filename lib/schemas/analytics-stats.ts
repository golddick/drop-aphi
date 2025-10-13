import z from "zod";

export const OverallStatsSchema = z.object({
  totalSubscribers: z.number().min(0),
  subscriberGrowth: z.number(),
  totalCampaigns: z.number().min(0),
  activeCampaigns: z.number().min(0),
  emailsSent: z.number().min(0),
  emailGrowth: z.number(),
  avgOpenRate: z.number().min(0).max(100),
  openRateChange: z.number(),
  avgClickRate: z.number().min(0).max(100),
  clickRateChange: z.number(),
  revenueGrowth: z.number(),
  totalBlogs: z.number().min(0),
  blogGrowth: z.number(),
  blogViews: z.number().min(0),
  blogViewGrowth: z.number(),
  avgReadTime: z.number().min(0),
  readTimeChange: z.number(),
})



export type OverallStats = z.infer<typeof OverallStatsSchema>
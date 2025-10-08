"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Users, TrendingUp, Mail, BarChart3 } from "lucide-react";
import { getNewsletterStats } from "@/actions/superadmin/Newsletter";
import { NewsletterStats } from "@/configs/types";




const NewslettersCard: React.FC = () => {
  const [newsletterStats, setNewsletterStats] = useState<NewsletterStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const stats = await getNewsletterStats();
        console.log(stats, "stats"  )
        setNewsletterStats(stats);
      } catch (error) {
        console.error("Failed to fetch newsletter stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <p>Loading newsletter stats...</p>;
  if (!newsletterStats) return <p>No data available</p>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Owners */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Owners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newsletterStats.totalOwners}</div>
            <p className="text-xs text-muted-foreground">
              {newsletterStats.activeOwners} active
            </p>
          </CardContent>
        </Card>

        {/* Premium Owners */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Owners</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newsletterStats.premiumOwners}</div>
            <p className="text-xs text-muted-foreground">
              {(
                (newsletterStats.premiumOwners / newsletterStats.totalOwners) *
                100
              ).toFixed(1)}
              % conversion
            </p>
          </CardContent>
        </Card>

        {/* Total Subscribers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {newsletterStats.totalSubscribers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg {newsletterStats.avgSubscribersPerNewsletter.toFixed(0)} per owner
            </p>
          </CardContent>
        </Card>

        {/* Growth Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+24.5%</div>
            <p className="text-xs text-muted-foreground">Monthly growth</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Newsletters */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Newsletters</CardTitle>
          <CardDescription>
            Newsletters with highest subscriber count and engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {newsletterStats.topPerformingNewsletters.map((newsletter, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{newsletter.name}</p>
                    <p className="text-sm text-muted-foreground">
                      by {newsletter.owner}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {newsletter.subscribers.toLocaleString()} subscribers
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {newsletter.openRate}% open rate
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {newsletter.email} emails sent
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewslettersCard;



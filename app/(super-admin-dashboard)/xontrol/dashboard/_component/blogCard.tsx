"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Eye, TrendingUp, MessageSquare, AlertTriangle } from "lucide-react";
import { getBlogStats } from "@/actions/superadmin/Blog";

export default function BlogCard() {
  const [blogStats, setBlogStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getBlogStats();
        setBlogStats(data);
      } catch (err) {
        setError("Failed to load blog stats");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <p className="text-muted-foreground">Loading blog stats...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="space-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogStats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Avg {blogStats.avgViewsPerPost} per post</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogStats.totalLikes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((blogStats.totalLikes / blogStats.totalViews) * 100).toFixed(1)}% like rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogStats.totalComments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((blogStats.totalComments / blogStats.totalViews) * 100).toFixed(1)}% comment rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Posts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogStats.flagged}</div>
            <p className="text-xs text-muted-foreground">
              {((blogStats.flagged / blogStats.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category & Recent Posts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>Most popular blog categories by posts and views</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {blogStats.topCategories.map((category: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-muted-foreground">{category.posts} posts</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{category.views.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">views</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Popular Posts</CardTitle>
            <CardDescription>Latest high-performing blog posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {blogStats.recentPosts.map((post: any, index: number) => (
                <div key={index} className="space-y-2">
                  <p className="font-medium text-sm">{post.title}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>by {post.author}</span>
                    <div className="flex items-center space-x-2">
                      <span>{post.views} views</span>
                      <span>{post.likes} likes</span>
                      <span>{post.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

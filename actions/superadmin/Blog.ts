"use server";

import { getServerAuth } from "@/lib/auth/getauth";
import { database } from "@/lib/database";



export async function getBlogStats() {
  const user = await getServerAuth();
  if (!user) throw new Error("You must be logged in to access KYC stats");

  const userId = user.userId;

  // Check if user has admin privileges (adjust based on your role system)
  const userInfo = await database.user.findUnique({
    where: { userId },
    select: { role: true },
  });

  // Uncomment this if you want to restrict to admin users only
  // if (!userInfo || userInfo.role !== "ADMIN") {
  //   throw new Error("Unauthorized: You must be an admin");
  // }


  // Fetch all blogs
  const blogs = await database.blogPost.findMany({
    include: {
      category: true,
      comments: true,
      flaggedPosts: true,
      tags: true,
      user:true
    },
  });

  if (blogs.length === 0) {
    return {
      totalViews: 0,
      avgViewsPerPost: 0,
      totalLikes: 0,
      totalComments: 0,
      flagged: 0,
      total: 0,
      topCategories: [],
      recentPosts: [],
    };
  }

  const totalViews = blogs.reduce((sum, b) => sum + b.views, 0);
  const totalLikes = blogs.reduce((sum, b) => sum + b.likes, 0);
  const totalComments = blogs.reduce((sum, b) => sum + b.comments.length, 0);
  const flagged = blogs.filter((b) => b.flaggedPosts).length;
  const total = blogs.length;

  // Top categories by views
  const categoryMap: Record<string, { name: string; posts: number; views: number }> = {};
  blogs.forEach((b) => {
    const cat = b.category?.name || "Uncategorized";
    if (!categoryMap[cat]) {
      categoryMap[cat] = { name: cat, posts: 0, views: 0 };
    }
    categoryMap[cat].posts += 1;
    categoryMap[cat].views += b.views;
  });
  const topCategories = Object.values(categoryMap).sort((a, b) => b.views - a.views).slice(0, 5);

  // Recent popular posts (last 10 by views)
  const recentPosts = blogs
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
    .map((b) => ({
      title: b.title,
      author: b.authorId, // You can populate with user name if needed
      views: b.views,
      likes: b.likes,
      date: b.createdAt.toISOString().split("T")[0],
    }));

  return {
    totalViews,
    avgViewsPerPost: (totalViews / total).toFixed(1),
    totalLikes,
    totalComments,
    flagged,
    total,
    topCategories,
    recentPosts,
  };
}

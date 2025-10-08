import { KycApplication } from "@/type";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { database } from "./database";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateCustomUserId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomStr = "";
  for (let i = 0; i < 9; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DROPID-${randomStr}`;
}


export function formatString(input: string): string {
  return input
    .split('_')                           // Split by underscores
    .map((word: string) => 
      word.charAt(0).toUpperCase() +     // Capitalize first letter
      word.slice(1).toLowerCase()        // Lowercase rest
    )
    .join(' ');                           // Join words with space
}


export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-based

  return `${year}-${month}`; // e.g., "2025-07"
}


export const calculatePercentage = (
  numerator: number,
  denominator: number,
  decimalPlaces = 2
): number => {
  if (!denominator) return 0;
  const percentage = (numerator / denominator) * 100;
  return Math.min(100, parseFloat(percentage.toFixed(decimalPlaces)));
};


export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—"; // fallback when null/undefined
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const maskSensitiveData = (data: string, visibleChars = 4) => {
    if (!data || data.length <= visibleChars) return data;
    return data.slice(0, visibleChars) + "*".repeat(data.length - visibleChars);
  };


  

// types.ts
export interface PostPerformanceMetrics {
  seoScore?: number;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
}

// performanceUtils.ts
/**
 * Calculates a comprehensive performance score (0-100) for a post
 * @param post Object containing post performance metrics
 * @returns Performance score between 0 and 100
 */
export const calculatePerformanceScore = (post: PostPerformanceMetrics): number => {
  // Weights for different metrics (adjust as needed)
  const WEIGHTS = {
    seo: 0.20,
    engagement: 0.30,
    reach: 0.10
  };

  // Calculate individual components (0-100 scale)
  const seoComponent = Math.min(post.seoScore || 0, 100);
  
  // Engagement: weighted sum of interactions normalized by views
  const engagementComponent = Math.min(
    100,
    ((post.likes || 0) * 0.5 + 
     (post.comments || 0) * 1 + 
     (post.shares || 0) * 1.5) / 
    (post.views && post.views > 0 ? post.views : 1) * 1000
  );

  // Reach: logarithmic scale to normalize view counts
  const reachComponent = Math.min(
    100,
    Math.log10((post.views || 0) + 1) * 20
  );

  // Calculate weighted score
  const weightedScore = 
    (seoComponent * WEIGHTS.seo) +
    (engagementComponent * WEIGHTS.engagement) + 
    (reachComponent * WEIGHTS.reach);

  // Normalize to 0-100 scale
  return Math.round(Math.min(100, Math.max(0, weightedScore)));
};





// lib/generateMetadata.ts
interface BlogMetadata {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  author: string;
  publishedTime: string;
  tags: string[];
}

export function generateBlogMetadata({
  title,
  description,
  url,
  imageUrl,
  author,
  publishedTime,
  tags = [],
}: Partial<BlogMetadata>): BlogMetadata {
  return {
    title: title || "Blog Post",
    description: description || "Read this interesting blog post",
    url: url || "",
    imageUrl: imageUrl || "/default-social-image.png",
    author: author || "Unknown Author",
    publishedTime: publishedTime || new Date().toISOString(),
    tags: tags || [],
  };
}


export function calculateKycCompletion(kyc: KycApplication): number {
  const levels = [kyc.levels.level1, kyc.levels.level2, kyc.levels.level3];
  const completed = levels.filter((l) => l.status === "COMPLETED").length;

  if (completed === 3 && kyc.status !== "APPROVED") {
    return 95;
  }

  if (kyc.status === "APPROVED") {
    return 100;
  }

  return Math.round((completed / 3) * 100);
}


export async function requireSuperAdmin(userId: string) {
  const membership = await database.user.findUnique({
    where: { userId },
    select: { role: true },
  });

//   if (!membership || membership.role !== "THENEWSADMIN") {
//     throw new Error("Unauthorized: Super Admins only");
//   }
}
// types/blog.ts

import { KYCAccountType, KYCStatus, PostStatus, PostVisibility } from "@/lib/generated/prisma";


export interface BlogCategory {
  id: string;
  name: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BlogTag {
  id: string;
  name: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BlogMember {
  id: string;
  userId: string;
  fullName: string;
  userName: string; 
  email?: string | null;
  organization?: string | null;
  organizationUrl?: string | null;
  imageUrl?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type CommentStatus = "pending" | "approved" ;

export interface BlogComment {
  id: string;
  content: string;
  likes: number;
  status: CommentStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
  user: BlogMember;
  replies?: BlogComment[]; 
  parentId: string | null;
}

export type FormattedComment = {
  id: string;
  author: BlogMember;
  authorAvatar: string;
  date: string;
  content: string;
  likes: number;
  isLiked: boolean;
  replies: FormattedComment[];
  isAuthor: boolean;
};


export interface BlogCommentBase {
  id: string;
  content: string;
  status: CommentStatus;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
  postId: string;
  userId: string;
  authorId: string;
  parentId: string | null;
}

 export type BlogPostFlag = {
    id: string;
    reason: string;
    comment:string;
    flaggedBy:string;
    status: string;
    createdAt: Date;
    reviewedAt: Date | null;
    postId: string;
    userId: string;
}

export interface BlogCommentWithMember extends BlogCommentBase {
  member: BlogMember;
  replies: BlogCommentWithMember[];
}

export interface BlogPost {
  id: string;
  title: string;
  subtitle?: string | null;
  slug: string;
  content: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  featuredVideo?: string | null;
  galleryImages: string[];
  format: "MARKDOWN" | "HTML" | "RICH_TEXT";
  wordCount: number;
  characterCount: number;
  readTime: number;
  views: number;
  likes: number;
  status: PostStatus;
  visibility: PostVisibility;
  allowComments: boolean;
  isFeatured: boolean;
  isPinned: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  publishedAt?: Date | string | null;
  scheduledAt?: Date | string | null;
  flaggedAt?: Date | string | null;
  flagReason: string | null
  isFlagged: boolean

  
  

  // SEO fields
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords: string[];

  // Author
  authorId: string;
  authorBio: string;
  authorAvatar?: string | null;
  authorTitle?: string | null;
  author?: string;

  // Relationships
  category: BlogCategory | null;
  categoryId: string | null;
  tags: BlogTag[];
  comments: BlogComment[];
  flaggedPosts: BlogPostFlag[]
  user?: BlogMember | null;
  generatedById?: string | null;
}

export interface RelatedPost {
  id: string;
  title: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  slug: string;
  createdAt: Date | string;
  readTime: number;
  category: {
    name: string;
  };
  tags: {
    name: string;
  }[];
}

export interface SingleBlogPostResponse {
  success: boolean;
  data?: BlogPost;
  error?: string;
}
export interface BlogPostsResponse {
  success: boolean;
  data?: BlogPost[];
  error?: string;
}

export interface RelatedPostsResponse {
  success: boolean;
  data?: RelatedPost[];
  error?: string;
}

export interface BlogPostReaderProps {
//   slug: string; 
  post: BlogPost;
  relatedPosts: RelatedPost[];
}


// types/blog.ts
export interface FeaturedPost {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  content?: string
  featuredImage: string | null
  featuredVideo?: string | null
  author?: string | null
  publishedAt: Date
  readTime?: number | null
  category?: { name: string } | null
  tags?: { name: string }[]
  // Add engagement metrics
  comments?: Array<any>
  likes?: number
  // Add other properties you need
  createdAt?: Date
  format?: string
  isFeatured?: boolean
  isPinned?: boolean
}

export interface GetFeaturedPostsResponse {
  success: boolean
  data?: FeaturedPost[]
  error?: string
}




export interface KycDocument {
  id: string;
  kycId: string;
  type: string;
  url: string;
  key: string;
  uploadedAt: Date;
}

export interface KycLevels {
  level1: {
    status: KYCStatus
    completedAt?: Date | null;
  };
  level2: {
    status: KYCStatus;
    completedAt?: Date | null;
  };
  level3: {
    status: KYCStatus;
    completedAt?: Date | null;
  };
}

export interface KycUser {
  userId: string;
  fullName: string;
  email: string;
}

export interface KycApplication {
  id: string;
  userId: string;
  accountType:KYCAccountType;
  status: KYCStatus;
  comments: string | null;
  livePhoto: string | null;
  rejectedResponse: string | null;
  reviewedBy: string | null;
  reviewedTime: Date | null;
  documents: any[];
  kycDocuments: KycDocument[];
  levels: KycLevels;
  user: KycUser;
  createdAt: Date;
  updatedAt: Date;
}


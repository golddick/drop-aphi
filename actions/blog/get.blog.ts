// actions/blog.ts
'use server';


import { revalidatePath } from 'next/cache';
import { calculatePerformanceScore } from '@/lib/utils';
import { database } from '@/lib/database';
import { getServerAuth } from '@/lib/auth/getauth';
import { FeaturedPost, GetFeaturedPostsResponse } from '@/type';
import { PostStatus, Prisma } from '@prisma/client';

// Types
export type BlogPostWithRelations = Prisma.BlogPostGetPayload<{
  include: {
    category: true;
    tags: true;
    user: true;
    comments: true;
  };
}>;

interface GetPostsParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  status?: PostStatus;
  authorId?: string;
}

interface BlogPostResponse {
  success: boolean;
  data?: BlogPostWithRelations[] | BlogPostWithRelations;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
interface SingleBlogPostResponse {
  success: boolean;
  data?:  BlogPostWithRelations;
  error?: string;
}


// Get all blog posts
export async function getBlogPosts({
  page = 1,
  limit = 10,
  category,
  tag,
  search,
  sort = 'publishedAt',
  order = 'desc',
  status = 'PUBLISHED',
  authorId,
}: GetPostsParams = {}): Promise<BlogPostResponse> {
  try {
    const skip = (page - 1) * limit;

    const where: Prisma.BlogPostWhereInput = {
      status,
      isFeatured:false,
      ...(authorId && { authorId }),
    };

    if (category) {
      where.category = {
        name: category,
      };
    }

    if (tag) {
      where.tags = {
        some: {
          name: tag,
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [posts, total] = await Promise.all([
      database.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sort]: order,
        },
        include: {
          category: true,
          tags: true,
          user: true,
          comments: {
            where: { status: 'approved' },
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      database.blogPost.count({ where }),
    ]);

    return {
      success: true,
      data: posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return {
      success: false,
      error: 'Failed to fetch blog posts',
    };
  }
}

// Get single blog post by slug

// Get single blog post by slug
export async function getBlogPost(
  slug: string,
  includeDraft = false
): Promise<SingleBlogPostResponse> {
  const user = await getServerAuth();
  const userId = user?.userId || null;

  try {
    const post = await database.blogPost.findUnique({
      where: {
        slug,
        status: includeDraft ? undefined : 'PUBLISHED',
      },
      include: {
        category: true,
        tags: true,
        user: true,
        comments: {
          where: { status: 'approved' },
          orderBy: { createdAt: 'desc' },
          include: {
            user: true,
            replies: {
              where: { status: 'approved' },
              orderBy: { createdAt: 'asc' },
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      return {
        success: false,
        error: 'Blog post not found',
      };
    }

    // Only count views for published posts (and not for author)
    if (post.status === 'PUBLISHED' ) {
      if (userId) {
        // Logged-in user: check if they already viewed this post
        const alreadyViewed = await database.blogPostView.findFirst({
        where: {
              postId: post.id,
              userId: userId, // userId is not null for logged-in users
            },
        });

        if (!alreadyViewed) {
          await database.blogPostView.create({
            data: {
              postId: post.id,
              userId,
            },
          });

          await database.blogPost.update({
            where: { id: post.id },
            data: { views: { increment: 1 } },
          });
        }
      } else {
        // Guest user: count each view
        await database.blogPost.update({
          where: { id: post.id },
          data: { views: { increment: 1 } },
        });
      }
    }

    return {
      success: true,
      data: post,
    };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return {
      success: false,
      error: 'Failed to fetch blog post',
    };
  }
}


export async function getBlogPostsByAuthor({
  page = 1,
  limit = 10,
  category,
  tag,
  search,
  sort = 'publishedAt',
  order = 'desc',
  status,
  authorId,
}: GetPostsParams = {}): Promise<BlogPostResponse> {
  try {
    const skip = (page - 1) * limit;

    const where: Prisma.BlogPostWhereInput = {
      ...(authorId && {
        user: {
          userId: authorId,
        },
      }),
    };

    if (category) {
      where.category = {
        name: category,
      };
    }

    if (tag) {
      where.tags = {
        some: {
          name: tag,
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [posts, total] = await Promise.all([
      database.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sort]: order,
        },
        include: {
          category: true,
          tags: true,
          user: true,
          comments: {
            where: { status: 'approved' },
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      database.blogPost.count({ where }),
    ]);

    return {
      success: true,
      data: posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return {
      success: false,
      error: 'Failed to fetch blog posts',
    };
  }
}


// Get blog categories
export async function getBlogCategories() {
  try {
    const categories = await database.blogCategory.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            posts: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    return {
      success: false,
      error: 'Failed to fetch blog categories',
    };
  }
}

// Get blog tags
export async function getBlogTags() {
  try {
    const tags = await database.blogTag.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            posts: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      success: true,
      data: tags,
    };
  } catch (error) {
    console.error('Error fetching blog tags:', error);
    return {
      success: false,
      error: 'Failed to fetch blog tags',
    };
  }
}


// Get featured posts


export async function getFeaturedPosts(limit = 4): Promise<GetFeaturedPostsResponse> {
  try {
    const posts = await database.blogPost.findMany({
      where: {
        status: 'PUBLISHED',
        isFeatured: true,
        publishedAt: { not: null }
      },
      take: limit,
      orderBy: {
        publishedAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        publishedAt: true,
        readTime: true,
        author: true,
        // Add comments and likes
        comments: {
          select: {
            id: true
          }
        },
        likes: true,
        category: {
          select: {
            name: true
          }
        },
        tags: {
          select: {
            name: true
          }
        }
      }
    })

    // Filter out any posts that somehow got through without publishedAt
    // and transform the data
    const transformedPosts: FeaturedPost[] = posts
      .filter(post => post.publishedAt !== null)
      .map(post => ({
        ...post,
        publishedAt: post.publishedAt as Date,
        comments: post.comments || [],
        likes: post.likes || 0,
        category: post.category ? { name: post.category.name } : null,
        tags: post.tags.map(tag => ({ name: tag.name }))
      }))

    return { 
      success: true, 
      data: transformedPosts 
    }
  } catch (error) {
    console.error('Error fetching featured posts:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch featured posts',
    }
  }
}

//  interface FeaturedPost {
//   id: string
//   title: string
//   slug: string
//   excerpt?: string | null
//   featuredImage: string
//   publishedAt: Date // Non-nullable
//   readTime?: number | null
//   category?: { name: string } | null
//   tags?: { name: string }[]
// }

// interface GetFeaturedPostsResponse {
//   success: boolean
//   data?: FeaturedPost[]
//   error?: string
// }

// export async function getFeaturedPosts(limit = 4): Promise<GetFeaturedPostsResponse> {
//   try {
//     const posts = await database.blogPost.findMany({
//       where: {
//         status: 'PUBLISHED',
//         isFeatured: true,
//         publishedAt: { not: null } // Only include posts with publishedAt
//       },
//       take: limit,
//       orderBy: {
//         publishedAt: 'desc',
//       },
//       select: {
//         id: true,
//         title: true,
//         slug: true,
//         excerpt: true,
//         featuredImage: true,
//         publishedAt: true,
//         readTime: true,
//         category: {
//           select: {
//             name: true
//           }
//         },
//         tags: {
//           select: {
//             name: true
//           }
//         }
//       }
//     })

//     // Filter out any posts that somehow got through without publishedAt
//     // and transform the data
//     const transformedPosts = posts
//       .filter(post => post.publishedAt !== null)
//       .map(post => ({
//         ...post,
//         publishedAt: post.publishedAt as Date, // We've filtered out nulls
//         category: post.category ? { name: post.category.name } : null,
//         tags: post.tags.map(tag => ({ name: tag.name }))
//       }))

//     return { 
//       success: true, 
//       data: transformedPosts 
//     }
//   } catch (error) {
//     console.error('Error fetching featured posts:', error)
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'Failed to fetch featured posts',
//     }
//   }
// }

// Get related posts
export async function getRelatedPosts(postId: string, limit = 3)
{
  try {
    const post = await database.blogPost.findUnique({
      where: { id: postId },
      include: { tags: true },
    });

    if (!post) {
      return { success: false, error: 'Post not found' };
    }

    const relatedPosts = await database.blogPost.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: postId },
        OR: [
          { categoryId: post.categoryId },
          { tags: { some: { id: { in: post.tags.map((tag) => tag.id) } } } },
        ],
      },
      take: limit,
      orderBy: {
        publishedAt: 'desc',
      },
      include: {
        category: true,
        tags: true,
        user: true,
      },
    });

    return { success: true, data: relatedPosts };
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return {
      success: false,
      error: 'Failed to fetch related posts',
    };
  }
}



// Update gallery images
export async function updateGalleryImages(postId: string, newGalleryImages: string[]) {
  try {
    const updated = await database.blogPost.update({
      where: { id: postId },
      data: { galleryImages: newGalleryImages },
    });

    // Optionally revalidate the blog post page
    revalidatePath(`/blog/${updated.slug}`);
    revalidatePath("/dashboard/blog");

    return { success: true };
  } catch (error) {
    console.error("Error updating gallery images:", error);
    return { success: false, error: "Failed to update gallery images" };
  }
}



export async function getCategories() {
  try {
    return await database.blogCategory.findMany({
      include: {
          _count: {
          select: {
            posts: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    return []
  }
}


export async function getTags() {
  try {
    return await database.blogTag.findMany({
        select: {
        id: true,
        name: true,
        _count: {
          select: {
            posts: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error("Failed to fetch tags:", error)
    return []
  }
}


export async function getPopularPosts() {
  try {
    const posts = await database.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        visibility: "PUBLIC",
        publishedAt: { lte: new Date() },
      },
      orderBy: {
        views: "desc",
      },
      take: 4,
      select: {
        id: true,
        title: true,
        slug: true,
        featuredImage: true,
        publishedAt: true,
        _count: {
          select: { comments: true },
        },
        views: true,
        likes: true,
        shares: true,
        seoScore: true,
      },
    });

    return posts.map(post => {
      const metrics = {
        views: post.views,
        likes: post.likes,
        shares: post.shares,
        comments: post._count.comments,
        seoScore: post.seoScore,
      };

      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        featuredImage: post.featuredImage,
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
        performanceScore: calculatePerformanceScore(metrics),
        commentsCount: post._count.comments,
      };
    });
  } catch (error) {
    console.error("Failed to fetch popular posts:", error);
    return [];
  }
}












"use client"

import { useState, useEffect, KeyboardEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Plus, Edit3, Clock, Globe, FileText, BarChart3, Archive, CheckCircle, XCircle, X } from "lucide-react"
import { BlogAnalytics } from "./blog-analytics"
import { BlogPostDetails } from "./blog-post-details"
import { BlogPostCard } from "./blog-post-card"
import { deleteBlogPost } from "@/actions/blog/delete.blog"
import { decrementBlogUsage } from "@/lib/checkAndUpdateUsage"
import { updatePostStatus } from "@/actions/blog/updateBlog"
import { PostStatus, PostVisibility } from "@/lib/generated/prisma"
import { useAuthUser } from "@/lib/auth/getClientAuth"
import { getAllCategories, getFilteredPosts } from "@/lib/blog/actions"
import Loader from "@/components/_component/Loader"
import { toast } from "sonner"

 type BlogMember = {
  userId: string;
  fullName: string;
  imageUrl?: string | null;

}

type BlogPostFlag = {
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

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  featuredImage: string | null
  category: string
  tags: string[]
  author: string
  authorTitle: string
  status: PostStatus
  visibility: PostVisibility   
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  scheduledAt: string | null
  wordCount: number
  readTime: number
  views: number
  likes: number
  comments: number
  shares: number
  seoScore: number
  isFeatured: boolean
  slug: string
  flaggedAt?: Date | string | null;
  flagReason: string | null
  isFlagged: boolean
  flaggedPosts:BlogPostFlag[]
  members: BlogMember
}

export function BlogManagement() {
  const { user } = useAuthUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchInput, setSearchInput] = useState("") 
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("updated")
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return
      const [postData, categoryData] = await Promise.all([
        getFilteredPosts({ 
          authorId: user.userId, 
          search: searchQuery, 
          sort: sortBy,  
          order: "desc" 
        }),
        getAllCategories()
      ])
      setPosts(postData)
      setCategories(["all", ...categoryData.map((c) => c.name)])
    }

    fetchData()
  }, [user?.id, searchQuery, categoryFilter, sortBy])

  if (posts.length === 0 && categories.length === 0) {
    return <Loader />
  }

  // console.log(filteredPosts, 'filteredPosts')
  console.log(posts, 'posts')

  // Filter and sort posts
  const filteredPosts = posts
    .filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus = statusFilter === "all" || post.status === statusFilter
      const matchesCategory = categoryFilter === "all" || (post.category && post.category.toLowerCase() === categoryFilter.toLowerCase())
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "published" && post.status === 'PUBLISHED') ||
        (activeTab === "drafts" && post.status === "DRAFT") ||
        (activeTab === "scheduled" && post.status === "SCHEDULED") ||
        (activeTab === "archived" && post.status === "ARCHIVED")

      return matchesSearch && matchesStatus && matchesCategory && matchesTab
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "updated":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "published":
          if (!a.publishedAt && !b.publishedAt) return 0
          if (!a.publishedAt) return 1
          if (!b.publishedAt) return -1
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        case "views":
          return b.views - a.views
        case "likes":
          return b.likes - a.likes
        case "title":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  // Get statistics
  const stats = {
    total: posts.length,
    published: posts.filter((p) => p.status === 'PUBLISHED').length,
    drafts: posts.filter((p) => p.status === "DRAFT").length,
    flagged: posts.filter((p) => p.isFlagged).length,
    archived: posts.filter((p) => p.status === "SCHEDULED").length,
    totalViews: posts.reduce((sum, p) => sum + p.views, 0),
    totalLikes: posts.reduce((sum, p) => sum + p.likes, 0),
    totalComments: posts.reduce((sum, p) => sum + p.comments, 0),
  }

  const getStatusIcon = (status: PostStatus) => {
    switch (status) {
      case "PUBLISHED":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "DRAFT":
        return <FileText className="h-4 w-4 text-yellow-600" />
      case "SCHEDULED":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "ARCHIVED":
        return <Archive className="h-4 w-4 text-gray-600" />
      default:
        return <XCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusColor = (status: PostStatus) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800 border-green-200"
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-red-100 text-red-800 border-red-200"
    }
  }


    const handleDeletePost = async (postId: string) => {
    try {
      // Call the API to delete the post
      await deleteBlogPost(postId);

      // Decrement usage for the current user
      if (user?.id) {
        await decrementBlogUsage(user.id, 1);
      }

      // Update UI state
      setPosts((prev) => prev.filter((p) => p.id !== postId));

      // Success toast
      toast.success('The blog post has been permanently deleted.')
    } catch (error) {
      console.error("Failed to delete post:", error);

      toast.error('Failed to delete post. Please try again.')
    }
  };


  const handleArchivePost = async (postId: string) => {
  try {
    // Optimistic UI update
    setPosts((posts) =>
      posts.map((p) =>
        p.id === postId
          ? { ...p, status: "ARCHIVED" as const, updatedAt: new Date().toISOString() }
          : p
      )
    );

    // Persist to DB
    await updatePostStatus(postId, "ARCHIVED");
    toast.success("The blog post has been moved to archives.");
  } catch (error) {
    console.error(error);
    toast.error('Failed to archive post. Please try again.')

    // Rollback on error
    setPosts((posts) =>
      posts.map((p) =>
        p.id === postId
          ? { ...p, status: p.status, updatedAt: p.updatedAt }
          : p
      )
    );
  }
};


  const handlePublishePost = async (postId: string) => {
  try {
    // Optimistic UI update
    setPosts((posts) =>
      posts.map((p) =>
        p.id === postId
          ? { ...p, status: "PUBLISHED" as const, updatedAt: new Date().toISOString() }
          : p
      )
    );

    // Persist to DB
    await updatePostStatus(postId, "PUBLISHED");
    toast.success("The blog post has been Published.");
  } catch (error) {
    console.error(error);
    toast.error('Failed to Publishe post. Please try again.')

    // Rollback on error
    setPosts((posts) =>
      posts.map((p) =>
        p.id === postId
          ? { ...p, status: p.status, updatedAt: p.updatedAt }
          : p
      )
    );
  }
};


  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setSearchQuery(searchInput)
    }
  }

  const handleSearch = () => {
    setSearchQuery(searchInput)
  }

  const clearSearch = () => {
    setSearchInput("")
    setSearchQuery("")
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Blog Management</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your blog posts, track performance, and create new content</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button variant="outline" onClick={() => setShowAnalytics(true)} className="flex items-center gap-2 text-sm sm:text-base">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </Button>
            <Link href="/dashboard/blog/write">
              <Button className="flex items-center gap-2 text-sm sm:text-base">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Post</span>
                <span className="sm:hidden">New</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Card className="bg-white border border-gray-200 rounded-lg  text-black0">
            <CardContent className="p-2 sm:p-4 text-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold ">{stats.total}</div>
              <div className="text-xs sm:text-sm ">Total Posts</div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-lg  text-black">
            <CardContent className="p-2 sm:p-4 text-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold ">{stats.published}</div>
              <div className="text-xs sm:text-sm ">Published</div>
            </CardContent>
          </Card>
          {/* <Card className="bg-white border border-gray-200 rounded-lg  text-black">
            <CardContent className="p-2 sm:p-4 text-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold ">{stats.drafts}</div>
              <div className="text-xs sm:text-sm ">Drafts</div>
            </CardContent>
          </Card> */}
             <Card className="bg-white border border-gray-200 rounded-lg  text-black hidden md:block">
            <CardContent className="p-2 sm:p-4 text-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold ">{stats.flagged}</div>
              <div className="text-xs sm:text-sm ">Flagged Post</div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-lg  text-black hidden md:block">
            <CardContent className="p-2 sm:p-4 text-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold ">{stats.totalViews.toLocaleString()}</div>
              <div className="text-xs sm:text-sm ">Total Views</div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-lg  text-black hidden lg:block">
            <CardContent className="p-2 sm:p-4 text-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold ">{stats.totalLikes}</div>
              <div className="text-xs sm:text-sm ">Total Likes</div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-lg  text-black hidden xl:block">
            <CardContent className="p-2 sm:p-4 text-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold ">{stats.totalComments}</div>
              <div className="text-xs sm:text-sm ">Comments</div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-lg sm:rounded-xl shadow-none border-none p-4 sm:p-6 mb-4 sm:mb-6"
      >
          <div className="w-full flex   flex-col md:flex-row  items-center  justify-between gap-6">
            <div className="relative w-full">
              {searchInput && (
                <X 
                  onClick={clearSearch}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-600 cursor-pointer h-4 w-4 sm:h-5 sm:w-5"
                  aria-label="Clear search"
                />
              )}
              <Input
                placeholder="Search posts..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-10 pr-10 text-sm sm:text-base"
              />
              <Search onClick={handleSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
            </div>

              <div className="flex gap-2  mt-2 md:mt-0">

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[130px] sm:w-[160px] text-xs sm:text-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs sm:text-sm">All Categories</SelectItem>
                {categories.filter(c => c !== "all").map((category) => (
                  <SelectItem key={category} value={category} className="capitalize text-xs sm:text-sm">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[120px] sm:w-[140px] text-xs sm:text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated" className="text-xs sm:text-sm">Last Updated</SelectItem>
                <SelectItem value="created" className="text-xs sm:text-sm">Date Created</SelectItem>
                <SelectItem value="published" className="text-xs sm:text-sm">Date Published</SelectItem>
                <SelectItem value="views" className="text-xs sm:text-sm">Most Views</SelectItem>
                <SelectItem value="likes" className="text-xs sm:text-sm">Most Likes</SelectItem>
                <SelectItem value="title" className="text-xs sm:text-sm">Title A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
          </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4 sm:mb-6">
          <TabsList className="grid w-full grid-cols-4 gap-1 sm:gap-2">
            <TabsTrigger value="all" className="flex items-center gap-1 text-xs sm:text-sm p-1 sm:p-2">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">All ({stats.total})</span>
            </TabsTrigger>
            <TabsTrigger value="published" className="flex items-center gap-1 text-xs sm:text-sm p-1 sm:p-2">
              <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">Pub ({stats.published})</span>
            </TabsTrigger>
            <TabsTrigger value="drafts" className="flex items-center gap-1 text-xs sm:text-sm p-1 sm:p-2">
              <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">Drafts ({stats.drafts})</span>
            </TabsTrigger>
            {/* <TabsTrigger value="scheduled" className="flex items-center gap-1 text-xs sm:text-sm p-1 sm:p-2">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">Sched ({stats.scheduled})</span>
            </TabsTrigger> */}
            <TabsTrigger value="archived" className="flex items-center gap-1 text-xs sm:text-sm p-1 sm:p-2">
              <Archive className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">Arch ({stats.archived})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 sm:mt-6">
            {filteredPosts.length === 0 ? (
              <Card className="p-6 sm:p-12 text-center">
                <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">No posts found</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                  {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                    ? "Try adjusting your filters or search terms."
                    : "Get started by creating your first blog post."}
                </p>
                {!searchQuery && statusFilter === "all" && categoryFilter === "all" && (
                  <Link href="/dashboard/blog/write">
                    <Button size="sm" className="text-sm sm:text-base">
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Create Post
                    </Button>
                  </Link>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                <AnimatePresence>
                  {filteredPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <BlogPostCard
                        post={post}
                        onEdit={() => window.open(`/dashboard/blog/write?edit=${post.slug}`, "_blank")}
                        onView={() => {
                          setSelectedPost(post)
                          setShowDetails(true)
                        }}
                        onDelete={() => handleDeletePost(post.id)}
                        onArchive={() => handleArchivePost(post.id)}
                        onPublishe={() => handlePublishePost(post.id)}
                        getStatusIcon={getStatusIcon}
                        getStatusColor={getStatusColor}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Blog Post Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Blog Post Details</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <BlogPostDetails
              post={selectedPost}
              onClose={() => setShowDetails(false)}
              onDelete={() => handleDeletePost(selectedPost.id)}
              onEdit={() => {
                setShowDetails(false)
                window.open(`/dashboard/blog/write?edit=${selectedPost.slug}`, "_blank")
              }}
            />
          )}
        </DialogContent>
      </Dialog> 

      {/* Analytics Modal */}
      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Blog Analytics</DialogTitle>
          </DialogHeader>
          <BlogAnalytics posts={posts} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
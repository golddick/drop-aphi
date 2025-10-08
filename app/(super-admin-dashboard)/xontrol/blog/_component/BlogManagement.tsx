"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Search, 
  Eye, 
  Flag, 
  TrendingUp, 
  FileText, 
  AlertTriangle, 
  Calendar, 
  ThumbsUp, 
  MessageCircle,
  RefreshCw,
  Trash2,
  CheckCircle,
  Pencil,
} from "lucide-react"
import Link from "next/link"
import { PostStatus } from "@/lib/generated/prisma"
import { deleteBlogPost, fetchAllBlogPosts, resolveBlogPostFlag, updateBlogPostStatus } from "@/actions/superadmin/Blog-Management"
import { toast } from "sonner"


// Define the BlogPost type based on the server response
type BlogPost = {
  id: string
  title: string
  content?: string | null
  author: string
  authorEmail: string
  status: PostStatus
    category: {
    id: string;
    name: string;
  } | null;
  tags: string[]
  publishedAt?: string
  views: number
  likes: number
  comments: number
  isFlagged: boolean
  flagReason?: string | null
  createdAt: string
}

export function BlogManagement() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("all")

  // Fetch blog posts from the server using server action
  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      const result = await fetchAllBlogPosts()

      console.log(result, 'post data')
      
      if (result.success && result.data) {
        setBlogPosts(result.data)
      } else {
        toast.error(result.error || "Failed to fetch blog posts")
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error)
      toast.error("Failed to fetch blog posts. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Update blog post status using server action
  const handleUpdateStatus = async (postId: string, status: BlogPost["status"]) => {
    try {
      const result = await updateBlogPostStatus(postId, status)
      
      if (result.success) {
        toast.success(`Post status updated to ${status}`)
        // Refresh the list
        fetchPosts()
      } else {
        toast.error(result.error || "Failed to update post status")
      }
    } catch (error) {
      console.error("Error updating post status:", error)
      toast.error("Failed to update post status. Please try again.")
    }
  }

  // Resolve blog post flag using server action
  const handleResolveFlag = async (postId: string) => {
    try {
      const result = await resolveBlogPostFlag(postId)
      
      if (result.success) {
        toast.success("Post flag resolved successfully")
        // Refresh the list
        fetchPosts()
      } else {
        toast.error(result.error || "Failed to resolve post flag")
      }
    } catch (error) {
      console.error("Error resolving post flag:", error)
      toast.error("Failed to resolve post flag. Please try again.")
    }
  }

  // Delete a blog post using server action
  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return
    }
    
    try {
      const result = await deleteBlogPost(postId)
      
      if (result.success) {
        toast.success("Post deleted successfully")
        // Refresh the list
        fetchPosts()
      } else {
        toast.error(result.error || "Failed to delete post")
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      toast.error("Failed to delete post. Please try again.")
    }
  }

  // Fetch blog posts on component mount
  useEffect(() => {
    fetchPosts()
  }, [])

  // Filter blog posts based on search and filters
  const filteredData = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || post.status === statusFilter
    const matchesCategory = categoryFilter === "all" || post.category?.name === categoryFilter
    const matchesTab = activeTab === "all" || (activeTab === "flagged" && post.isFlagged)

    return matchesSearch && matchesStatus && matchesCategory && matchesTab
  })

    const getStatusBadge = (status: PostStatus) => {
          const statusConfig = {
      PUBLISHED: {
        label: PostStatus.PUBLISHED,
        variant: "default" as const,
        className: "bg-green-100 text-green-800 border-green-200",
      },
      DRAFT: { 
        label: PostStatus.DRAFT, 
        variant: "secondary" as const, 
        className: "bg-gray-100 text-gray-800 border-gray-200" 
      },
      SCHEDULED: {
        label: PostStatus.SCHEDULED,
        variant: "outline" as const,
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      ARCHIVED: {
        label: PostStatus.ARCHIVED,
        variant: "outline" as const,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
    }
  
      const config = statusConfig[status];
      if (!config) return null;
  
      // const Icon = config.icon;
      return (
        <Badge variant={config.variant} className="flex items-center gap-1 text-nowrap">
          {/* <Icon className="w-3 h-3" /> */}
          {config.label}
        </Badge>
      );
    };

  // Calculate statistics
  const stats = {
    total: blogPosts.length,
    published: blogPosts.filter((post) => post.status === "PUBLISHED").length,
    draft: blogPosts.filter((post) => post.status === "DRAFT").length,
    scheduled: blogPosts.filter((post) => post.status === "SCHEDULED").length,
    archived: blogPosts.filter((post) => post.status === "ARCHIVED").length,
    flagged: blogPosts.filter((post) => post.isFlagged).length,
    totalViews: blogPosts.reduce((sum, post) => sum + post.views, 0),
  }

  // Get unique categories for filter
  const categories = Array.from(new Set(blogPosts.map(post => post.category))).filter(Boolean)

  console.log(categories, 'unique categories'  )
  console.log(blogPosts, 'blog post data'  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading blog posts...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <p className="text-muted-foreground">Manage and moderate blog content</p>
        </div>
        <Button onClick={fetchPosts} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.flagged}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, author, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category?.id || ''} value={category?.name || ''}>{category?.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Blog Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
          <CardDescription>
            Showing {filteredData.length} of {blogPosts.length} posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Posts</TabsTrigger>
              <TabsTrigger value="flagged" className="text-red-600">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Flagged ({stats.flagged})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Flags</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium truncate">{post.title}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {post.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {post.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{post.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{post.author}</p>
                          <p className="text-sm text-muted-foreground">{post.authorEmail}</p>
                        </div>
                      </TableCell>
                       <TableCell>{getStatusBadge(post.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{post.category?.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1 text-sm">
                            <Eye className="w-3 h-3" />
                            <span>{post.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm">
                            <ThumbsUp className="w-3 h-3" />
                            <span>{post.likes}</span>
                            <MessageCircle className="w-3 h-3 ml-2" />
                            <span>{post.comments}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {post.publishedAt ? (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm">{new Date(post.publishedAt).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not published</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {post.isFlagged ? (
                          <div className="flex items-center space-x-1">
                            <Flag className="w-4 h-4 text-red-600" />
                            <Badge variant="destructive" className="text-xs">
                              Flagged
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                           <Link href={`/xontrol/blog/${post.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          </Link>
                          {post.isFlagged && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleResolveFlag(post.id)}
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                    
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="flagged" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Flag Reason</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData
                    .filter((post) => post.isFlagged)
                    .map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="font-medium truncate">{post.title}</p>
                            <Badge variant="destructive" className="text-xs mt-1">
                              <Flag className="w-3 h-3 mr-1" />
                              Flagged
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{post.author}</p>
                            <p className="text-sm text-muted-foreground">{post.authorEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm text-red-800 bg-red-50 p-2 rounded border border-red-200">
                              {post.flagReason || "No reason provided"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1 text-sm">
                              <Eye className="w-3 h-3" />
                              <span>{post.views.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm">
                              <ThumbsUp className="w-3 h-3" />
                              <span>{post.likes}</span>
                              <MessageCircle className="w-3 h-3 ml-2" />
                              <span>{post.comments}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleResolveFlag(post.id)}
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeletePost(post.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import React from 'react'
import BlogPostPage from '../_component/BlogPage'
import { useBlogSlug } from '@/lib/hooks/get.blogSlug'

const BlogPageIndex = () => {
  const blogSlug = useBlogSlug()
  return (
    <div>
      <BlogPostPage slug={blogSlug}/>
    </div>
  )
}

export default BlogPageIndex
'use client'

import React from 'react'
import BlogPostPage from '../_component/management/blog-read-page'
import { useBlogSlug } from '@/lib/hooks/get.blogSlug'


const BlogReadindex = () => {
   const blogSlug = useBlogSlug()
  return (
    <div>
      <BlogPostPage slug={blogSlug}/>
    </div>
  )
}

export default BlogReadindex

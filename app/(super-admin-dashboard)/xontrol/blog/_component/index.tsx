'use client'

import React from 'react'
import { BlogReview } from './SingleBlogReview'
import { useBlogId } from '@/lib/hooks/get.blogID'

const SingleBlogIndex = () => {
    const blogId = useBlogId()
  return (
    <div>
      <BlogReview blogId={blogId}/>
    </div>
  )
}

export default SingleBlogIndex

import React from 'react'
import { BlogPostReader } from './Read-Blog'
import { BlogPostReaderProps } from '@/app/type'




const Read = ({ post, relatedPosts}:BlogPostReaderProps) => {


  return (
    <div>
      <BlogPostReader 
      post={post} 
      relatedPosts={relatedPosts || []}
      />
    </div>
  )
}

export default Read

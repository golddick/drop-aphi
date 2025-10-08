import React from 'react'
import { BlogPostReaderProps } from '@/type'
import { BlogPostReader } from '@/app/(landing-page)/blog/_component/Read-Blog'




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

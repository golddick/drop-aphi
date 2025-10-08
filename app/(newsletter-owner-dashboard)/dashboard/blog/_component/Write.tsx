import React, { Suspense } from 'react'
import { BlogWriteEditor } from './Blog-write-editor'
import Loader from '@/components/_component/Loader'

const WriteBlog = () => {
  return (
    <Suspense fallback={<Loader/>}>
      <BlogWriteEditor/> 
    </Suspense>
  )
}

export default WriteBlog

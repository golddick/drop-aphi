// 'use client'

import { useParams } from "next/navigation"

export const useBlogSlug = () => {
 const params = useParams()
 return params.slug as string
}

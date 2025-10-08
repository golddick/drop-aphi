// 'use client'


import { useParams } from "next/navigation"

export const useBlogId = () => {
 const params = useParams()
 return params.id as string
}

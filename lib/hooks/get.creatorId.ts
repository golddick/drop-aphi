// 'use client'


import { useParams } from "next/navigation"

export const useCreatorID = () => {
 const params = useParams()
 return params.creatorID as string
}

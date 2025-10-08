// 'use client'


import { useParams } from "next/navigation"

export const useKYCId = () => {
 const params = useParams()
 return params.id as string
}

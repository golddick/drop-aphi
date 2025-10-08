'use client'

import { useParams } from "next/navigation"

export const useEmailID = () => {
 const params = useParams()
 return params.id as string
}

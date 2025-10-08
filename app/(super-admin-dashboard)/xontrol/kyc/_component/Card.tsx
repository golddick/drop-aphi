import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import React from 'react'

interface KYCCardProps {
    title : string
    count : number
    Icon : LucideIcon
}

const KYCCard = ({title,count,Icon}:KYCCardProps) => {
  return (
    <div>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{count}</div>
          </CardContent>
        </Card>
    </div>
  )
}

export default KYCCard

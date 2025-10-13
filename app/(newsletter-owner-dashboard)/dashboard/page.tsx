import React from 'react'
import { redirect } from 'next/navigation'
import { AnalyticsDashboard } from './_component/dashboad'
import { getServerAuth } from '@/lib/auth/getauth';

const Page = async () => {
   
    return (
        <>
            <AnalyticsDashboard />
        </>
    )
}

export default Page
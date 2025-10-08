'use client'
import React from 'react'
import { KycReview } from '../_component/KycReview'
import { useKYCId } from '@/lib/hooks/get.kycID'

const KycAdminReview = () => {
  const kycID = useKYCId()
  return (
    <div>
      <KycReview kycId={kycID} />
    </div>
  )
}

export default KycAdminReview

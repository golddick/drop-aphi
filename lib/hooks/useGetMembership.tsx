'use client';

import { getMembership } from '@/actions/membership/getMembership';
import { useEffect, useState } from 'react';

export interface MembershipTypes {
  id: string;
  userId: string;
  plan: string;
  role: string;
  subscriptionStatus: string;
  paystackCustomerId: string | null;
  email: string;
  organization?: string | null;
  kycStatus:boolean;
  senderName: string | null;
  amount: number;
  currency: string;
  lastPaymentDate?: string | null;
  nextPaymentDate?: string | null;
  subscriberLimit: number;
  emailLimit: number;
  blogPostLimit: number;
  aiGenerationLimit: number;
  termsAndConditionsAccepted: boolean;
}

const useGetMembership = () => {
  const [data, setData] = useState<MembershipTypes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleGetMembership = async () => {
      try {
        const membership = await getMembership();
        if (!membership) {
          setError('No membership found.');
        } else {
          setData(membership);
        }
      } catch (err) {
        console.error('Failed to fetch membership:', err);
        setError('An error occurred while fetching membership.');
      } finally {
        setLoading(false);
      }
    };

    handleGetMembership();
  }, []);

  return { data, loading, error };
};

export default useGetMembership;


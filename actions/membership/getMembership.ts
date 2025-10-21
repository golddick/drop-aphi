// 'use server';

// import { getServerAuth } from "@/lib/auth/getauth";
// import { database } from "@/lib/database";
// import { redirect } from "next/navigation";


// async function getAuthenticatedUser() {
//   const user = await getServerAuth()
//   if (!user?.userId) {
//     redirect('/auth')
//   }
//   return user.userId
// }

// export async function getMembership() {
//    const user = await getServerAuth();
//   if (!user) {
//     throw new Error('You must be logged in to view membership details');
//   }

//   const membership = await database.user.findUnique({
//     where: { userId: user.userId },
//   });

//   if (!membership) {
//     return null;
//   }

//   return {
//     id: membership.id,
//     userId: membership.userId,
//     userName:membership.userName,
//     plan: membership.plan,
//     role: membership.role,
//     subscriptionStatus: membership.subscriptionStatus,
//     paystackCustomerId: membership.paystackCustomerId,
//     email: membership.email,
//     organization: membership.organization,
//     kycStatus: membership.approvedKYC,
//     senderName: membership.SenderName,
//     amount: membership.amount,
//     currency: membership.currency,
//     lastPaymentDate: membership.lastPaymentDate?.toISOString() ?? null,
//     nextPaymentDate: membership.nextPaymentDate?.toISOString() ?? null,
//     subscriberLimit: membership.subscriberLimit,
//     emailLimit: membership.emailLimit,
//     blogPostLimit: membership.blogPostLimit,
//     aiGenerationLimit: membership.aiGenerationLimit,
//     createdAt: membership.createdAt.toISOString(),
//     updatedAt: membership.updatedAt.toISOString(),
//     termsAndConditionsAccepted: membership.termsAndConditionsAccepted,
//   };
// }




'use server';

import { getServerAuth } from "@/lib/auth/getauth";
import { database } from "@/lib/database";
import { redirect } from "next/navigation";

async function getAuthenticatedUser() {
  const user = await getServerAuth();
  if (!user?.userId) {
    redirect('/auth');
  }
  return user;
}

export async function getMembership() {
  try {
    const user = await getAuthenticatedUser();
    
    const membership = await database.user.findUnique({
      where: { userId: user.userId },
    });

    if (!membership) {
      return null;
    }

    return {
      id: membership.id,
      userId: membership.userId,
      userName: membership.userName,
      fullName: membership.fullName,
      plan: membership.plan,
      role: membership.role,
      subscriptionStatus: membership.subscriptionStatus,
      paystackCustomerId: membership.paystackCustomerId,
      email: membership.email,
      organization: membership.organization,
      kycStatus: membership.approvedKYC,
      senderName: membership.SenderName,
      amount: membership.amount,
      currency: membership.currency,
      lastPaymentDate: membership.lastPaymentDate?.toISOString() ?? null,
      nextPaymentDate: membership.nextPaymentDate?.toISOString() ?? null,
      subscriberLimit: membership.subscriberLimit,
      emailLimit: membership.emailLimit,
      blogPostLimit: membership.blogPostLimit,
      aiGenerationLimit: membership.aiGenerationLimit,
      createdAt: membership.createdAt.toISOString(),
      updatedAt: membership.updatedAt.toISOString(),
      termsAndConditionsAccepted: membership.termsAndConditionsAccepted,
      profileImage: membership.imageUrl,
    };
  } catch (error) {
    console.error('Error fetching membership:', error);
    throw new Error('Failed to fetch membership details');
  }
}

export async function updateProfile(data: {
  userName: string;
  organization: string;
  fullName: string;
  profileImage?: string;
}) {
  try {
    const user = await getAuthenticatedUser();

    const updatedUser = await database.user.update({
      where: { userId: user.userId },
      data: {
        userName: data.userName,
        organization: data.organization,
        fullName: data.fullName,
        imageUrl: data.profileImage,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      user: {
        id: updatedUser.id,
        userName: updatedUser.userName,
        fullName: updatedUser.fullName,
        organization: updatedUser.organization,
        profileImage: updatedUser.imageUrl,
      }
    };
  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      success: false,
      error: 'Failed to update profile'
    };
  }
}
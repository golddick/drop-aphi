


'use server';

import { getServerAuth } from "@/lib/auth/getauth";
import { database } from "@/lib/database";
import { KYCAccountType, KYCStatus } from "@/lib/generated/prisma";
import { calculateKycCompletion } from "@/lib/utils";




 interface KycDocument {
  id: string;
  kycId: string;
  type: string;
  url: string;
  key: string;
  uploadedAt: Date;
}

 interface KycLevels {
  level1: {
    status: KYCStatus
    completedAt?: Date | null;
  };
  level2: {
    status: KYCStatus;
    completedAt?: Date | null;
  };
  level3: {
    status: KYCStatus;
    completedAt?: Date | null;
  };
}

 interface KycUser {
  userId: string;
  fullName: string;
  email: string;
}

interface KycApplication {
//   id: string;
//   status: string;
//   levels: KycLevels;

  id: string;
  userId: string;
  accountType:KYCAccountType;
  status: KYCStatus;
  comments: string | null;
  livePhoto: string | null;
  rejectedResponse: string | null;
  reviewedBy: string | null;
  reviewedTime: Date | null;
  documents: any[] 
  kycDocuments: KycDocument[];
  levels: KycLevels;
  user: KycUser;
  createdAt: Date;
  updatedAt: Date;
}


export async function getKycStats() {
  const user = await getServerAuth();
  if (!user) throw new Error("You must be logged in to access KYC stats");

  const userId = user.userId;

  // Check if user has admin privileges (adjust based on your role system)
  const userInfo = await database.user.findUnique({
    where: { userId },
    select: { role: true },
  });

  // Uncomment this if you want to restrict to admin users only
  // if (!userInfo || userInfo.role !== "ADMIN") {
  //   throw new Error("Unauthorized: You must be an admin");
  // }

  // Fetch basic counts
  const pending = await database.kyc.count({ where: { status: "PENDING" } });
  const underReview = await database.kyc.count({ where: { status: "COMPLETED" } });
  const approved = await database.kyc.count({ where: { status: "APPROVED" } });
  const rejected = await database.kyc.count({ where: { status: "REJECTED" } });

  const total = pending + underReview + approved + rejected;
  const completed = approved + rejected;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Calculate average processing time dynamically
// Get all completed KYC records and filter out null updatedAt in JavaScript
const allCompletedKyc = await database.kyc.findMany({
  where: { 
    status: { in: ["APPROVED", "REJECTED"] }
  },
  select: { createdAt: true, updatedAt: true },
});

// Filter out records with null updatedAt
const completedKyc = allCompletedKyc.filter(k => k.updatedAt !== null);

  const avgProcessingTime =
    completedKyc.length > 0
      ? (
          completedKyc.reduce((acc, k) => {
            const diff = (k.updatedAt!.getTime() - k.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            return acc + diff;
          }, 0) / completedKyc.length
        ).toFixed(1)
      : "0";

  // Recent KYC applications
  const recentApplications = await database.kyc.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      user: {
        select: {
          fullName: true,
          email: true,
          imageUrl: true,
        }
      },
      status: true,
      createdAt: true,
      levels: true,
      documents: true,
      kycDocuments: true,
      accountType: true,
      userId: true,
      comments: true,
      livePhoto: true,
      updatedAt: true,
      rejectedResponse: true,
      reviewedTime: true,
      reviewedBy: true,

      
      
    },
  });

  // Format the response
  return {
    pending,
    underReview,
    approved,
    rejected,
    total,
    completionRate,
    avgProcessingTime,
    recentApplications: recentApplications.map((app) => {
      // Create a KycApplication object to pass to calculateKycCompletion
      const kycApp: KycApplication = {
        id: app.id,
        status: app.status,
        levels: app.levels as unknown as KycLevels,
        accountType:app.accountType as KYCAccountType,
        userId: app.userId,
        comments: app.comments,
        livePhoto: app.livePhoto,
        rejectedResponse: app.rejectedResponse,
        reviewedBy: app.reviewedBy,
        reviewedTime: app.reviewedTime,
       documents: (app.documents as unknown as any[]) || [],
        kycDocuments: app.kycDocuments,
        user: {
          userId: app.userId,
          fullName: app.user.fullName,
          email: app.user.email,
        },
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        


      };
      
      return {
        id: app.id,
        name: app.user.fullName,
        email: app.user.email,
        imageUrl: app.user.imageUrl,
        status: app.status,
        createdAt: app.createdAt,
        date: app.createdAt.toISOString().split("T")[0],
        completion: calculateKycCompletion(kycApp)
      };
    }),
  };
}
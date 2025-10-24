"use server";

import { getServerAuth } from "@/lib/auth/getauth";
import { database } from "@/lib/database";
import { computeCompletion } from "@/lib/hooks/kyc";
import { notifyUserAboutKycStatus } from "../kyc/notify";
import { requireSuperAdmin } from "@/lib/utils";


/**
 * Fetch all KYC records (Super Admin only)
 */
export async function fetchAllKyc() {
 const user = await getServerAuth();
  if (!user) return { success: false, error: "You must be logged in" };

  const userId = user.userId

  try {
    await requireSuperAdmin(userId);

    const kycs = await database.kyc.findMany({
      include: {
        user: {
          select: {
            userId: true,
            fullName: true,
            email: true,
          },
        },
        kycDocuments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: kycs };
  } catch (err: any) {
    console.error("Fetch KYC error:", err);
    return { success: false, error: err.message || "Failed to fetch KYC" };
  }
}


/**
 * Fetch single KYC by KYC id (Super Admin only)
 */
export async function fetchKycById(kycId: string) {
  const user = await getServerAuth();
  if (!user) return { success: false, error: "You must be logged in" };

  const userId = user.userId;

  try {
    await requireSuperAdmin(userId);

    const kyc = await database.kyc.findUnique({
      where: { id: kycId }, // ✅ fetch by KYC id
      include: {
        user: {
          select: {
            userId: true,
            fullName: true,
            email: true,
          },
        },
        kycDocuments: true,
      },
    });

    if (!kyc) {
      return { success: false, error: "KYC not found" };
    }

     // 🧮 Compute completion percentage
    const levels = typeof kyc.levels === "string" ? JSON.parse(kyc.levels) : kyc.levels;
    const completion = computeCompletion(levels, kyc.status);


    return { success: true, data: { ...kyc, completion } };
  } catch (err: any) {
    console.error("Fetch single KYC error:", err);
    return { success: false, error: err.message || "Failed to fetch KYC" };
  }
}



export async function updateKycStatus(
  kycId: string,
  status: "APPROVED" | "REJECTED", 
  comments?: string
) {
  const user = await getServerAuth();
  if (!user) return { success: false, error: "You must be logged in" };

  const userId = user.userId;

  try {
    // Get KYC application with user details
    const kycApplication = await database.kyc.findUnique({
      where: { id: kycId },
      select: {
        id: true,
        userId: true,
        status: true,
        reviewedBy: true,
        reviewedTime: true,
        rejectedResponse: true,
        user: {
          select: {
            id: true, // Added to update user record
            userId: true,
            email: true,
            fullName: true,
            imageUrl: true,
          }
        }
      }
    });

    if (!kycApplication) {
      return { success: false, error: "KYC application not found" };
    }

    // Update KYC status
    const updated = await database.kyc.update({
      where: { id: kycId },
      data: {
        status,
        comments: comments || null,
        reviewedBy: user.userName || "Drop-Aphi Team",
        reviewedTime: new Date(),
      },
    });

    // Update user's approvedKYC field when status is APPROVED
    if (status === "APPROVED") {
      await database.user.update({
        where: { id: kycApplication.user.id },
        data: {
          approvedKYC: true,
          kycStatus: "APPROVED", // Also update the kycStatus field
        },
      });
    } else if (status === "REJECTED") {
      // Optionally reset approvedKYC when rejected
      await database.user.update({
        where: { id: kycApplication.user.id },
        data: {
          approvedKYC: false,
          kycStatus: "REJECTED", // Update kycStatus field
        },
      });
    }

    // Send notification for both APPROVED and REJECTED statuses
    const notificationResult = await notifyUserAboutKycStatus({
      kycApplication: {
        ...updated,
        user: kycApplication.user
      },
      adminEmail: user.email || '',
      fromApplication:  'Drop-Aphi', 
    });

    if (!notificationResult.success) {
      console.warn('KYC notification failed:', notificationResult.error);
      // Continue even if notification fails
    }
 
    return { success: true, data: updated };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update KYC status" };
  }
}





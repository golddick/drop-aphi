






"use server";

import { getServerAuth } from "@/lib/auth/getauth";
import { database } from "@/lib/database";
import { KYCAccountType, KYCStatus } from "@/lib/generated/prisma";






export async function startKYCProcess(accountType: KYCAccountType, userId: string) {
  if (!userId) {
    return { success: false, error: "You must be logged in" };
  }

  const membership = await database.user.findUnique({ where: { userId: userId } });
  if (!membership) {
    return { success: false, error: "Membership record not found" };
  }

  const existingKYC = await database.kyc.findUnique({ where: { userId: userId } });
  
  // If KYC exists, update it instead of creating a new one
  if (existingKYC) {
    await database.kyc.update({
      where: { userId: userId },
      data: {
        accountType,
        status: KYCStatus.IN_PROGRESS,
        levels: {
          level1: { status: KYCStatus.COMPLETED, completedAt: new Date() },
          level2: { status: KYCStatus.IN_PROGRESS },
          level3: { status: KYCStatus.PENDING },
        },
        // Clear previous documents when changing account type
        ...(existingKYC.accountType !== accountType && {
          kycDocuments: {
            deleteMany: {}
          }
        })
      },
    });
    return { success: true };
  }

  // Create new KYC if it doesn't exist
  await database.kyc.create({
    data: {
      userId: userId,
      accountType,
      status: KYCStatus.IN_PROGRESS,
     levels: {
          level1: { status: KYCStatus.COMPLETED, completedAt: new Date() },
          level2: { status: KYCStatus.IN_PROGRESS },
          level3: { status: KYCStatus.PENDING },
        },
      documents:[]
    },
  });

  return { success: true };
}

export async function submitKYCLevel2(formData: FormData, accountType: KYCAccountType) {
  const user = await getServerAuth();
  if (!user) return { success: false, error: "You must be logged in" };

  const kyc = await database.kyc.findUnique({ where: { userId: user.id } });
  if (!kyc) return { success: false, error: "KYC not started" };

  const levels = kyc.levels as any;

  const level2Data =
    accountType === KYCAccountType.INDIVIDUAL
      ? {
          idType: formData.get("idType") as string,
          idNumber: formData.get("idNumber") as string,
          issuingCountry: formData.get("issuingCountry") as string,
          expiryDate: formData.get("expiryDate") as string,
          occupation: formData.get("occupation") as string,
          senderName: formData.get("senderName") as string,
          website: formData.get("website") as string,
        }
      : {
          legalName: formData.get("legalName") as string,
          registrationNumber: formData.get("registrationNumber") as string,
          tradingName: formData.get("tradingName") as string,
          taxId: formData.get("taxId") as string,
          incorporationDate: formData.get("incorporationDate") as string,
          incorporationCountry: formData.get("incorporationCountry") as string,
          businessType: formData.get("businessType") as string,
          industry: formData.get("industry") as string,
          website: formData.get("website") as string,
          senderName: formData.get("senderName") as string,
          description: formData.get("description") as string,
          registeredAddress: formData.get("registeredAddress") as string,
          operatingAddress: formData.get("operatingAddress") as string,
          contactPerson: formData.get("contactPerson") as string,
          contactEmail: formData.get("contactEmail") as string,
          contactPhone: formData.get("contactPhone") as string,
        };

  const updatedLevels = {
    ...levels,
    level2: {
      status: KYCStatus.COMPLETED,
      completedAt: new Date(),
      data: level2Data,
    },
    level3: {
      status: KYCStatus.IN_PROGRESS,
    },
  };

  // Delete previous documents
  await database.kYCDocument.deleteMany({ where: { kycId: kyc.id } });

  // Prepare documents dynamically based on account type
  const documents: { type: string; url: string; key: string }[] =
    accountType === KYCAccountType.INDIVIDUAL
      ? [
          { type: "id_front", url: formData.get("idFrontUrl") as string, key: formData.get("idFrontKey") as string },
          { type: "id_back", url: formData.get("idBackUrl") as string, key: formData.get("idBackKey") as string },
        ]
      : [
          { type: "registration_doc", url: formData.get("registrationDocUrl") as string, key: formData.get("registrationDocKey") as string },
          { type: "license_doc", url: formData.get("licenseDocUrl") as string, key: formData.get("licenseDocKey") as string },
        ];

  // Create documents
  await database.kyc.update({
    where: { userId: user.id },
    data: {
      accountType,
      levels: updatedLevels,
      kycDocuments: { createMany: { data: documents } },
    },
  });

  await database.user.update({
    where: { userId: user.id },
    data: {
      kycStatus: KYCStatus.IN_PROGRESS,
      organization: accountType === KYCAccountType.INDIVIDUAL ? "" : `${level2Data.legalName || ""}`,
      SenderName: level2Data.senderName || "",
    },
  });

  return { success: true };
}


export async function submitKYCLevel3(
  livePhoto: string,
  addressProofUrl: string,
  addressProofKey: string,
  addressType: string
) {
  const user = await getServerAuth();
  if (!user) return { success: false, error: "You must be logged in" };

  const kyc = await database.kyc.findUnique({ where: { userId: user.id } });
  if (!kyc) return { success: false, error: "KYC not started" };

  const levels = kyc.levels as any;

  const updatedLevels = {
    ...levels,
    level3: {
      status: KYCStatus.COMPLETED,
      completedAt: new Date(),
      data: {
        addressType,
        verifiedAt: new Date(),
      },
    },
  };

  // Delete previous address proof if exists
  await database.kYCDocument.deleteMany({
    where: { 
      kycId: kyc.id,
      type: "address_proof" 
    }
  });

  await database.kyc.update({
    where: { userId: user.id },
    data: {
      levels: updatedLevels,
      livePhoto,
      status: KYCStatus.COMPLETED,
      kycDocuments: {
        create: {
          type: "address_proof",
          url: addressProofUrl,
          key: addressProofKey,
        },
      },
    },
  });

   await database.user.update({
    where: { userId: user.id },
    data: {
      kycStatus: KYCStatus.COMPLETED,
    },
  });

  return { success: true };
}

// New function to allow updating KYC information
export async function updateKYCInformation(
  userId: string,
  accountType: KYCAccountType,
  formData: FormData
) {
  if (!userId) {
    return { success: false, error: "You must be logged in" };
  }

  const kyc = await database.kyc.findUnique({ where: { userId } });
  if (!kyc) {
    return { success: false, error: "KYC record not found" };
  }

  // Reset KYC status to pending when making changes
  await database.kyc.update({
    where: { userId },
    data: {
      accountType,
      status: KYCStatus.PENDING,
      levels: {
        level1: { status: KYCStatus.COMPLETED },
        level2: { status: KYCStatus.IN_PROGRESS },
        level3: { status: KYCStatus.PENDING },
      },
      // Clear previous documents
      kycDocuments: {
        deleteMany: {}
      }
    },
  });

  // Submit the updated information
  return await submitKYCLevel2(formData, accountType);
}




// Endpoint: GET /api/kyc/status
export async function getKYCStatus() {
  const user = await getServerAuth();
  if (!user) return { success: false, error: "Unauthorized" };

  const kyc = await database.kyc.findUnique({
    where: { userId: user.id },
    include: { kycDocuments: true },
  });

  if (!kyc) return { success: false, error: "KYC not found" };

  return {
    success: true,
    data: {
      id: kyc.id,
      accountType: kyc.accountType,
      status: kyc.status,
      levels: kyc.levels,
      livePhoto: kyc.livePhoto,
      documents: kyc.kycDocuments,
      comments:kyc.comments,
    },
  };
}


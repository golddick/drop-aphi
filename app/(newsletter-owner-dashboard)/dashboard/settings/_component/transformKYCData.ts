import { KYCAccountType, KYCStatus } from "@/lib/generated/prisma";







export const transformKYCData = (kycStatus: any) => {
  if (!kycStatus) return null;

  try {
    // Safely parse levels data
    const parseLevel = (level: any) => {
      if (!level) return {};
      return typeof level === 'string' ? JSON.parse(level) : level;
    };

    const level2 = parseLevel(kycStatus.levels?.level2);
    const level3 = parseLevel(kycStatus.levels?.level3);

    // Helper function to safely format dates
    const safeDate = (dateString: string | Date | undefined) => {
      if (!dateString) return undefined;
      try {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? undefined : date.toISOString();
      } catch {
        return undefined;
      }
    };

    // Determine overall status
    let status: KYCStatus = KYCStatus.PENDING;
    if (kycStatus.status === KYCStatus.APPROVED) {
      status = KYCStatus.APPROVED;
    } else if (kycStatus.status === KYCStatus.REJECTED) {
      status = KYCStatus.REJECTED;
    } else if (level3?.status === KYCStatus.COMPLETED) {
      status = KYCStatus.COMPLETED;
    } else if (level2?.status === KYCStatus.COMPLETED) {
      status = KYCStatus.IN_PROGRESS;
    }

    // Extract documents
    const extractDocuments = (docs: any[]) => {
      return (docs || []).map((doc: any) => ({
        type: doc.type || doc.documentType || '',
        filename: doc.key || doc.filename || '',
        url: doc.url || '',
        uploadedAt: safeDate(doc.uploadedAt || doc.createdAt) || new Date().toISOString()
      }));
    };

    const documents = extractDocuments(kycStatus.documents || []);

    // Base transformed data
    const transformedData = {
      accountType: kycStatus.accountType as KYCAccountType,
      status,
      submittedAt: safeDate(kycStatus.createdAt) || new Date().toISOString(),
      reviewedAt: safeDate(kycStatus.reviewedTime),
      reviewedBy: kycStatus.reviewedBy || undefined,
      rejectionReason: kycStatus.rejectionReason || undefined,
      comments: kycStatus.comments,
      livePhoto: kycStatus.livePhoto || undefined,
      addressDocument: documents.find(d => d.type.toLowerCase().includes('address')) || undefined,
      documents
    };

    // Add account type specific data
    if (kycStatus.accountType === KYCAccountType.INDIVIDUAL) {
      return {
        ...transformedData,
        individualData: {
          idType: level2?.data?.idType || '',
          idNumber: level2?.data?.idNumber || '',
          issuingCountry: level2?.data?.issuingCountry || '',
          expiryDate: level2?.data?.expiryDate || '',
          occupation: level2?.data?.occupation || '',
          senderName: level2?.data?.senderName || '' ,
          website: level2?.data?.website || '',

        },
        organizationData: undefined
      };
    } else {
      return {
        ...transformedData,
        organizationData: {
          legalName: level2?.data?.legalName || '',
          tradingName: level2?.data?.tradingName || '',
          registrationNumber: level2?.data?.registrationNumber || '',
          taxId: level2?.data?.taxId || '',
          incorporationDate: level2?.data?.incorporationDate || '',
          incorporationCountry: level2?.data?.incorporationCountry || '',
          businessType: level2?.data?.businessType || '',
          industry: level2?.data?.industry || '',
          website: level2?.data?.website || '',
          senderName: level2?.data?.senderName || '',
          description: level2?.data?.description || '',
          registeredAddress: level2?.data?.registeredAddress || '',
          operatingAddress: level2?.data?.operatingAddress || '',
          contactPerson: level2?.data?.contactPerson || '',
          contactEmail: level2?.data?.contactEmail || '',
          contactPhone: level2?.data?.contactPhone || '',
        },
        individualData: undefined
      };
    }
  } catch (error) {
    console.error("Error transforming KYC data:", error);
    return null;
  }
};
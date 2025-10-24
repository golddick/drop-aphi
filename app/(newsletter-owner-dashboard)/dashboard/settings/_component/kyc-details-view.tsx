"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  User,
  Building,
  Camera,
  MapPin,
  FileText,
  Download,
  Eye,
  Edit,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { formatDate, maskSensitiveData } from "@/lib/utils";
import { KYCAccountType, KYCStatus } from "@/lib/generated/prisma";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

interface KYCDetailsViewProps {
  kycData: {
    accountType: KYCAccountType;
    status: KYCStatus;
    submittedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    rejectionReason?: string;
    comments?: string;
    individualData?: {
      idType: string;
      idNumber: string;
      issuingCountry: string;
      expiryDate: string;
      placeOfBirth?: string;
      occupation?: string;
      senderName?: string;
      website?:string;
    };
    organizationData?: {
      legalName: string;
      tradingName: string;
      registrationNumber: string;
      taxId: string;
      incorporationDate: string;
      incorporationCountry: string;
      businessType: string;
      industry: string;
      numberOfEmployees?: string;
      annualRevenue?: string;
      website: string;
      description: string;
      registeredAddress: string;
      operatingAddress: string;
      contactPerson: string;
      contactEmail: string;
      contactPhone: string;
      senderName?: string;
    };
    livePhoto?: string;
    addressDocument?: {
      type: string;
      filename?: string;
      uploadedAt: string;
      url?: string;
    };
    documents?: Array<{
      type: string;
      filename?: string;
      uploadedAt: string;
      url?: string;
    }>;
  };
  onEdit: () => void;
  onResubmit: () => void;
  isUpLoading: boolean;
}

export function KYCDetailsView({ kycData, onEdit, onResubmit, isUpLoading }: KYCDetailsViewProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");


  const getStatusBadge = (status: KYCStatus) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-gold-100 text-gold-800 hover:bg-gold-100">
            <Eye className="h-3 w-3 mr-1" />
            Under Review
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Unknown
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: KYCStatus) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />;
      case "PENDING":
        return <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />;
      case "COMPLETED":
        return <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-gold-700" />;
      case "REJECTED":
        return <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />;
      default:
        return <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />;
    }
  };



 

  return (
    <div className="w-full h-full overflow-y-auto space-y-4 py-4">
      {/* Status Overview */}
      <Card className="w-full">
        <CardHeader>
          <div className={`flex ${isMobile ? "flex-row" : "flex-row"} items-start sm:items-center justify-between gap-4`}>
            <div className="flex items-center gap-4 w-full">
              {getStatusIcon(kycData.status)}
              <div className="flex-1 min-w-0">
                <CardTitle className="flex flex-wrap items-center gap-2">
                  <span className="truncate">KYC Verification Status</span>
                  {getStatusBadge(kycData.status)}
                </CardTitle>
                <CardDescription className="truncate">
                  {kycData.accountType === "INDIVIDUAL" ? "Individual Account" : "Organization Account"} verification
                </CardDescription>
              </div>
            </div>
            <div className={`flex gap-2 ${isMobile ? "w-full" : ""} ${isMobile ? "mt-2" : ""}`}>
              {kycData.status === "REJECTED" && (
                <Button
                  onClick={onResubmit}
                  size="sm"
                  className={`${isMobile ? "w-full" : ""} bg-red-500 hover:bg-red-600 text-white`}
                >
                 {
                  isUpLoading ? (
                  <div className="flex items-center gap-2">
                         <RefreshCw className="h-4 w-4 mr-2" />
                    Resubmitting...
                  </div>
                  ):(
                     <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Resubmit
                     </div>
                  )
                 }
                </Button>
              )}
              {(kycData.status === "PENDING" || kycData.status === "COMPLETED") && (
                <Button
                  onClick={onEdit}
                  variant="outline"
                  size="sm"
                  className={`${isMobile ? "w-full" : ""} bg-black text-white hover:bg-white hover:text-black`}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-3"} gap-4 sm:gap-6`}>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Submitted</p>
              <p className="text-sm">{formatDate(kycData.submittedAt)}</p>
            </div>
            {kycData.reviewedAt && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Reviewed</p>
                <p className="text-sm">{formatDate(kycData.reviewedAt)}</p>
              </div>
            )}
            {kycData.reviewedBy ? (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Reviewed By</p>
                <p className="text-sm">{kycData.reviewedBy || 'DROP-APHI TEAM '}</p>
              </div>
            ): (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Reviewed By</p>
                <p className="text-sm">Not reviewed yet</p>
                </div>
              
            )}
          </div>

          {kycData.status === "REJECTED" && kycData.comments && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-900">Rejection Reason</h4>
                  <p className="text-sm text-red-800 mt-1 capitalize">{kycData.comments}</p>
                </div>
              </div>
            </div>
          )}

          {kycData.status === "APPROVED" && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-green-900">Verification Complete</h4>
                  <p className="text-sm text-green-800 mt-1">
                    Your identity has been successfully verified. You now have access to all platform features.
                  </p>
                  <p className="text-sm text-red-800 mt-1 capitalize">{kycData.comments}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {kycData.accountType === "INDIVIDUAL" ? <User className="h-5 w-5" /> : <Building className="h-5 w-5" />}
            {kycData.accountType === "INDIVIDUAL" ? "Personal Information" : "Organization Information"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {kycData.accountType === "INDIVIDUAL" && kycData.individualData ? (
            <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-2"} gap-4 sm:gap-6`}>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">ID Document Type</p>
                  <p className="text-sm capitalize">{kycData.individualData.idType.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">ID Number</p>
                  <p className="text-sm font-mono">{maskSensitiveData(kycData.individualData.idNumber, 6)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Issuing Country</p>
                  <p className="text-sm">{kycData.individualData.issuingCountry}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Expiry Date</p>
                  <p className="text-sm">{kycData.individualData.expiryDate}</p>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {kycData.individualData.occupation && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Occupation</p>
                    <p className="text-sm">{kycData.individualData.occupation}</p>
                  </div>
                )}
                 <div className="space-y-3 sm:space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Website</p>
                      <p className="text-sm">
                        {kycData.individualData.website ? (
                          <a
                            href={kycData.individualData.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            {kycData.individualData.website}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </p>
                    </div>
                  </div>
                {kycData.individualData.senderName ? (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Mail Sender Name</p>
                    <p className="text-sm capitalize">{kycData.individualData.senderName}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Mail Sender Name</p>
                    <p className="text-sm text-gray-400">Not provided</p>
                  </div>
                )}
              </div>
            </div>
          ) : kycData.organizationData ? (
            <div className="space-y-4 sm:space-y-6">
              <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-2"} gap-4 sm:gap-6`}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Legal Name</p>
                    <p className="text-sm">{kycData.organizationData.legalName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Trading Name</p>
                    <p className="text-sm">{kycData.organizationData.tradingName || "Same as legal name"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Registration Number</p>
                    <p className="text-sm font-mono">
                      {maskSensitiveData(kycData.organizationData.registrationNumber, 6)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tax ID</p>
                    <p className="text-sm font-mono">{maskSensitiveData(kycData.organizationData.taxId, 4)}</p>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Incorporation Date</p>
                    <p className="text-sm">{kycData.organizationData.incorporationDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Country</p>
                    <p className="text-sm">{kycData.organizationData.incorporationCountry}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Business Type</p>
                    <p className="text-sm capitalize">{kycData.organizationData.businessType.replace("_", " ")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Industry</p>
                    <p className="text-sm capitalize">{kycData.organizationData.industry}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3 sm:mb-4">Business Details</h4>
                <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-2"} gap-4 sm:gap-6`}>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Website</p>
                      <p className="text-sm">
                        {kycData.organizationData.website ? (
                          <a
                            href={kycData.organizationData.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            {kycData.organizationData.website}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </p>
                    </div>
                    <div>
                      {kycData.organizationData.senderName ? (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Mail Sender Name</p>
                          <p className="text-sm">{kycData.organizationData.senderName}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Mail Sender Name</p>
                          <p className="text-sm text-gray-400">Not provided</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Contact Person</p>
                      <p className="text-sm">{kycData.organizationData.contactPerson}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Contact Email</p>
                      <p className="text-sm break-all">{kycData.organizationData.contactEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Contact Phone</p>
                      <p className="text-sm">{kycData.organizationData.contactPhone}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3 sm:mb-4">Address Information</h4>
                <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-2"} gap-4 sm:gap-6`}>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Registered Address</p>
                    <p className="text-sm whitespace-pre-line">{kycData.organizationData.registeredAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Operating Address</p>
                    <p className="text-sm whitespace-pre-line">
                      {kycData.organizationData.operatingAddress || "Same as registered address"}
                    </p>
                  </div>
                </div>
              </div>

              {kycData.organizationData.description && (
                <div>
                  <Separator />
                  <p className="text-sm font-medium text-gray-600 mb-2">Business Description</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {kycData.organizationData.description}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Live Photo Verification */}
      {kycData.livePhoto && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Live Photo Verification
            </CardTitle>
            <CardDescription>Photo captured during verification process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`flex ${isMobile ? "flex-col" : "flex-row"} items-start sm:items-center gap-4`}>
              <div className="relative flex-shrink-0">
                <Image
                  src={kycData.livePhoto}
                  alt="Live verification photo"
                  width={150}
                  height={150}
                  className="object-cover rounded-lg border-2 border-gray-200 w-full max-w-[150px]"
                />
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>
              <div className="flex-1 w-full">
                <p className="text-sm font-medium">Live Photo Captured</p>
                <p className="text-xs text-gray-600 mb-2">
                  This photo was taken during the verification process to confirm your identity.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className={`${isMobile ? "w-full" : ""}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Size
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Live Verification Photo</DialogTitle>
                        <DialogDescription>Photo captured during KYC verification process</DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-center relative">
                        <Image
                          width={400}
                          height={400}
                          src={kycData.livePhoto}
                          alt="Live verification photo"
                          className="rounded-lg max-h-[70vh] object-contain"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Address Verification */}
      {kycData.addressDocument && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address Verification
            </CardTitle>
            <CardDescription>Proof of address document</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`flex ${isMobile ? "flex-col" : "flex-row"} items-start sm:items-center gap-4 p-3 border rounded-lg w-full`}>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{kycData.addressDocument.type.replace("_", " ").toUpperCase()}</p>
                <p className="text-xs text-gray-600 text-nowrap">Uploaded on {formatDate(kycData.addressDocument.uploadedAt)}</p>
                {/* {kycData.addressDocument.filename && (
                  <p className="text-xs text-gray-500 truncate">{kycData.addressDocument.filename}</p>
                )} */}
              </div>

              <div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(kycData.addressDocument?.url, "_blank")}
                    className={`${isMobile ? "w-full" : ""}`}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
              </div>
              
              {/* {kycData.addressDocument.url && (
                <div className={`flex  gap-2 w-full ${isMobile ? "mt-2" : ""}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(kycData.addressDocument?.url, "_blank")}
                    className={`${isMobile ? "w-full" : ""}`}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (kycData.addressDocument?.url) {
                        const link = document.createElement("a");
                        link.href = kycData.addressDocument.url;
                        link.download = kycData.addressDocument.filename || "address_document";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    }}
                    className={`${isMobile ? "w-full" : ""}`}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              )} */}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supporting Documents */}
      {kycData.documents && kycData.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Supporting Documents
            </CardTitle>
            <CardDescription>Additional documents submitted for verification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kycData.documents.map((doc, index) => (
                <div
                  key={index}
                  className={`flex ${isMobile ? "flex-col" : "flex-row"} items-start sm:items-center gap-4 p-3 border rounded-lg`}
                >
                 <div className=" flex items-center gap-4">
                   <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.type.replace("_", " ").toUpperCase()}</p>
                    <p className="text-xs text-gray-600">Uploaded on {formatDate(doc.uploadedAt)}</p>
                    {/* {doc.filename && <p className="text-xs text-gray-500 truncate bg-red-600">{doc.filename}</p>} */}
                  </div>
                 </div>
                  {doc.url && (
                    <div className={`flex flex-wrap gap-2 w-full ${isMobile ? "mt-2" : ""}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(doc.url, "_blank")}
                        className={`${isMobile ? "w-full" : ""}`}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = doc.url!;
                          link.download = doc.filename || `${doc.type}_document`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className={`${isMobile ? "w-full" : ""}`}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {kycData.status === "COMPLETED" && (
        <Card>
          <CardHeader>
            <CardTitle>What&apos;s Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <span className="text-xs font-medium text-blue-600">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Review in Progress</p>
                  <p className="text-xs text-gray-600">Our team is reviewing your submitted documents.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <span className="text-xs font-medium text-gray-600">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Verification Complete</p>
                  <p className="text-xs text-gray-600">
                    You&apos;ll receive an email notification once verification is complete.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <span className="text-xs font-medium text-gray-600">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Full Access</p>
                  <p className="text-xs text-gray-600">Access all platform features with increased limits.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}



// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Separator } from "@/components/ui/separator"
// import {
//   CheckCircle,
//   Clock,
//   XCircle,
//   AlertTriangle,
//   User,
//   Building,
//   Camera,
//   MapPin,
//   FileText,
//   Download,
//   Eye,
//   Edit,
//   RefreshCw,
// } from "lucide-react"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { KYCAccountType, KYCStatus } from "@prisma/client"
// import Image from "next/image"

// interface KYCDetailsViewProps {
//   kycData: {
//     accountType: KYCAccountType;
//     status: KYCStatus
//     submittedAt: string;
//     reviewedAt?: string;
//     reviewedBy?: string;
//     rejectionReason?: string;
//     individualData?: {
//       idType: string;
//       idNumber: string;
//       issuingCountry: string;
//       expiryDate: string;
//       placeOfBirth?: string;
//       occupation?: string;
//       SenderName?: string;
//     };
//     organizationData?: {
//       legalName: string;
//       tradingName: string;
//       registrationNumber: string;
//       taxId: string;
//       incorporationDate: string;
//       incorporationCountry: string;
//       businessType: string;
//       industry: string;
//       numberOfEmployees?: string;
//       annualRevenue?: string;
//       website: string;
//       description: string;
//       registeredAddress: string;
//       operatingAddress: string;
//       contactPerson: string;
//       contactEmail: string;
//       contactPhone: string;
//       SenderName?: string;
//     };
//     livePhoto?: string;
//     addressDocument?: {
//       type: string;
//       filename?: string;
//       uploadedAt: string;
//       url?: string;
//     };
//     documents?: Array<{
//       type: string;
//       filename?: string;
//       uploadedAt: string;
//       url?: string;
//     }>;
//   };
//   onEdit: () => void;
//   onResubmit: () => void;
// }

// export function KYCDetailsView({ kycData, onEdit, onResubmit }: KYCDetailsViewProps) {
//   const [selectedImage, setSelectedImage] = useState<string | null>(null)

//   const getStatusBadge = (status: KYCStatus) => {
//     switch (status) {
//       case "APPROVED":
//         return (
//           <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
//             <CheckCircle className="h-3 w-3 mr-1" />
//             Approved
//           </Badge>
//         )
//       case "PENDING":
//         return (
//           <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
//             <Clock className="h-3 w-3 mr-1" />
//             Pending Review
//           </Badge>
//         )
//       case "COMPLETED":
//         return (
//           <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
//             <Eye className="h-3 w-3 mr-1" />
//             Under Review
//           </Badge>
//         )
//       case "REJECTED":
//         return (
//           <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
//             <XCircle className="h-3 w-3 mr-1" />
//             Rejected
//           </Badge>
//         )
//       default:
//         return (
//           <Badge variant="outline">
//             <AlertTriangle className="h-3 w-3 mr-1" />
//             Unknown
//           </Badge>
//         )
//     }
//   }

//   const getStatusIcon = (status: KYCStatus) => {
//     switch (status) {
//       case "APPROVED":
//         return <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
//       case "PENDING":
//         return <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
//       case "COMPLETED":
//         return <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
//       case "REJECTED":
//         return <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
//       default:
//         return <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />
//     }
//   }

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     })
//   }

//   const maskSensitiveData = (data: string, visibleChars = 4) => {
//     if (!data || data.length <= visibleChars) return data
//     return data.slice(0, visibleChars) + "*".repeat(data.length - visibleChars)
//   }

//   return (
//     <div className="space-y-6 px-4 sm:px-6 py-4  container mx-auto  h-full overflow-y-scroll ">
//       {/* Status Overview */}
//       <Card className="w-full">
//         <CardHeader>
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//             <div className="flex items-center gap-4  w-full">
//               {getStatusIcon(kycData.status)}
//               <div>
//                 <CardTitle className="flex items-center gap-4 w-full">
//                   <span>KYC Verification Status</span>
//                   {getStatusBadge(kycData.status)}
//                 </CardTitle>
//                 <CardDescription>
//                   {kycData.accountType === "INDIVIDUAL" ? "Individual Account" : "Organization Account"} verification
//                 </CardDescription>
//               </div>
//             </div>
//             <div className="flex gap-2 flex-wrap">
//               {kycData.status === "REJECTED" && (
//                 <Button 
//                   onClick={onResubmit} 
//                   size="sm" 
//                   className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto"
//                 >
//                   <RefreshCw className="h-4 w-4 mr-2" />
//                   Resubmit
//                 </Button>
//               )}
//               {(kycData.status === "PENDING" || kycData.status === "COMPLETED") && (
//                 <Button 
//                   onClick={onEdit} 
//                   variant="outline" 
//                   size="sm"
//                   className="w-full sm:w-auto bg-black text-white hover:bg-white hover:text-black"
//                 >
//                   <Edit className="h-4 w-4 mr-2" />
//                   Edit
//                 </Button>
//               )}
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
//             <div className="space-y-1">
//               <p className="text-sm font-medium text-gray-600">Submitted</p>
//               <p className="text-sm">{formatDate(kycData.submittedAt)}</p>
//             </div>
//             {kycData.reviewedAt && (
//               <div className="space-y-1">
//                 <p className="text-sm font-medium text-gray-600">Reviewed</p>
//                 <p className="text-sm">{formatDate(kycData.reviewedAt)}</p>
//               </div>
//             )}
//             {kycData.reviewedBy && (
//               <div className="space-y-1">
//                 <p className="text-sm font-medium text-gray-600">Reviewed By</p>
//                 <p className="text-sm">{kycData.reviewedBy}</p>
//               </div>
//             )}
//           </div>

//           {kycData.status === "REJECTED" && kycData.rejectionReason && (
//             <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
//               <div className="flex items-start gap-2">
//                 <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
//                 <div>
//                   <h4 className="font-medium text-red-900">Rejection Reason</h4>
//                   <p className="text-sm text-red-800 mt-1">{kycData.rejectionReason}</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {kycData.status === "APPROVED" && (
//             <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
//               <div className="flex items-start gap-2">
//                 <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
//                 <div>
//                   <h4 className="font-medium text-green-900">Verification Complete</h4>
//                   <p className="text-sm text-green-800 mt-1">
//                     Your identity has been successfully verified. You now have access to all platform features.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Account Information */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             {kycData.accountType === "INDIVIDUAL" ? <User className="h-5 w-5" /> : <Building className="h-5 w-5" />}
//             {kycData.accountType === "INDIVIDUAL" ? "Personal Information" : "Organization Information"}
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {kycData.accountType === "INDIVIDUAL" && kycData.individualData ? (
//             <div className="grid grid-cols-2 gap-4 sm:gap-6">
//               <div className="space-y-3 sm:space-y-4">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">ID Document Type</p>
//                   <p className="text-sm capitalize">{kycData.individualData.idType.replace("_", " ")}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">ID Number</p>
//                   <p className="text-sm font-mono">{maskSensitiveData(kycData.individualData.idNumber, 6)}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Issuing Country</p>
//                   <p className="text-sm">{kycData.individualData.issuingCountry}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Expiry Date</p>
//                   <p className="text-sm">{kycData.individualData.expiryDate}</p>
//                 </div>
//               </div>
//               <div className="space-y-3 sm:space-y-4">
//                 {kycData.individualData.placeOfBirth && (
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Place of Birth</p>
//                     <p className="text-sm">{kycData.individualData.placeOfBirth}</p>
//                   </div>
//                 )}
//                 {kycData.individualData.occupation && (
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Occupation</p>
//                     <p className="text-sm">{kycData.individualData.occupation}</p>
//                   </div>
//                 )}
//                 {kycData.individualData.SenderName ? (
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Mail Sender Name</p>
//                     <p className="text-sm">{kycData.individualData.SenderName}</p>
//                   </div>
//                 ) : (
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Mail Sender Name</p>
//                     <p className="text-sm text-gray-400">Not provided</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ) : kycData.organizationData ? (
//             <div className="space-y-4 sm:space-y-6">
//               <div className="grid grid-cols-2 gap-4 sm:gap-6">
//                 <div className="space-y-3 sm:space-y-4">
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Legal Name</p>
//                     <p className="text-sm">{kycData.organizationData.legalName}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Trading Name</p>
//                     <p className="text-sm">{kycData.organizationData.tradingName || "Same as legal name"}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Registration Number</p>
//                     <p className="text-sm font-mono">
//                       {maskSensitiveData(kycData.organizationData.registrationNumber, 6)}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Tax ID</p>
//                     <p className="text-sm font-mono">{maskSensitiveData(kycData.organizationData.taxId, 4)}</p>
//                   </div>
//                 </div>
//                 <div className="space-y-3 sm:space-y-4">
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Incorporation Date</p>
//                     <p className="text-sm">{kycData.organizationData.incorporationDate}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Country</p>
//                     <p className="text-sm">{kycData.organizationData.incorporationCountry}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Business Type</p>
//                     <p className="text-sm capitalize">{kycData.organizationData.businessType.replace("_", " ")}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Industry</p>
//                     <p className="text-sm capitalize">{kycData.organizationData.industry}</p>
//                   </div>
//                 </div>
//               </div>

//               <Separator />

//               <div>
//                 <h4 className="font-medium mb-3 sm:mb-4">Business Details</h4>
//                 <div className="grid grid-cols-2 gap-4 sm:gap-6">
//                   <div className="space-y-3 sm:space-y-4">
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Website</p>
//                       <p className="text-sm">
//                         {kycData.organizationData.website ? (
//                           <a
//                             href={kycData.organizationData.website}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="text-blue-600 hover:underline break-all"
//                           >
//                             {kycData.organizationData.website}
//                           </a>
//                         ) : (
//                           "Not provided"
//                         )}
//                       </p>
//                     </div>
//                     <div>
//                       {kycData.organizationData.SenderName ? (
//                         <div>
//                           <p className="text-sm font-medium text-gray-600">Mail Sender Name</p>
//                           <p className="text-sm">{kycData.organizationData.SenderName}</p>
//                         </div>
//                       ) : (
//                         <div>
//                           <p className="text-sm font-medium text-gray-600">Mail Sender Name</p>
//                           <p className="text-sm text-gray-400">Not provided</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                   <div className="space-y-3 sm:space-y-4">
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Contact Person</p>
//                       <p className="text-sm">{kycData.organizationData.contactPerson}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Contact Email</p>
//                       <p className="text-sm break-all">{kycData.organizationData.contactEmail}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Contact Phone</p>
//                       <p className="text-sm">{kycData.organizationData.contactPhone}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <Separator />

//               <div>
//                 <h4 className="font-medium mb-3 sm:mb-4">Address Information</h4>
//                 <div className="grid grid-cols-2 gap-4 sm:gap-6">
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Registered Address</p>
//                     <p className="text-sm whitespace-pre-line">{kycData.organizationData.registeredAddress}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Operating Address</p>
//                     <p className="text-sm whitespace-pre-line">
//                       {kycData.organizationData.operatingAddress || "Same as registered address"}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {kycData.organizationData.description && (
//                 <div>
//                   <Separator />
//                   <p className="text-sm font-medium text-gray-600 mb-2">Business Description</p>
//                   <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
//                     {kycData.organizationData.description}
//                   </p>
//                 </div>
//               )}
//             </div>
//           ) : null}
//         </CardContent>
//       </Card>

//       {/* Live Photo Verification */}
//       {kycData.livePhoto && (
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Camera className="h-5 w-5" />
//               Live Photo Verification
//             </CardTitle>
//             <CardDescription>Photo captured during verification process</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
//               <div className="relative flex-shrink-0">
//                 <Image
//                   src={kycData.livePhoto}
//                   alt="Live verification photo"
//                   width={150}
//                   height={150}
//                   className="object-cover rounded-lg border-2 border-gray-200 w-full max-w-[150px]"
//                 />
//                 <div className="absolute -top-2 -right-2">
//                   <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
//                     <CheckCircle className="h-3 w-3 mr-1" />
//                     Verified
//                   </Badge>
//                 </div>
//               </div>
//               <div className="flex-1 w-full">
//                 <p className="text-sm font-medium">Live Photo Captured</p>
//                 <p className="text-xs text-gray-600 mb-2">
//                   This photo was taken during the verification process to confirm your identity.
//                 </p>
//                 <div className="flex flex-wrap gap-2">
//                   <Dialog>
//                     <DialogTrigger asChild>
//                       <Button variant="outline" size="sm" className="w-full sm:w-auto">
//                         <Eye className="h-4 w-4 mr-2" />
//                         View Full Size
//                       </Button>
//                     </DialogTrigger>
//                     <DialogContent className="max-w-[95vw] sm:max-w-md">
//                       <DialogHeader>
//                         <DialogTitle>Live Verification Photo</DialogTitle>
//                         <DialogDescription>Photo captured during KYC verification process</DialogDescription>
//                       </DialogHeader>
//                       <div className="flex justify-center relative">
//                         <Image
//                           width={400}
//                           height={400}
//                           src={kycData.livePhoto}
//                           alt="Live verification photo"
//                           className="rounded-lg max-h-[70vh] object-contain"
//                         />
//                       </div>
//                     </DialogContent>
//                   </Dialog>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Address Verification */}
//       {kycData.addressDocument && (
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <MapPin className="h-5 w-5" />
//               Address Verification
//             </CardTitle>
//             <CardDescription>Proof of address document</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 border rounded-lg">
//               <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                 <FileText className="h-6 w-6 text-blue-600" />
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-medium truncate">{kycData.addressDocument.type.replace("_", " ").toUpperCase()}</p>
//                 <p className="text-xs text-gray-600">Uploaded on {formatDate(kycData.addressDocument.uploadedAt)}</p>
//                 {kycData.addressDocument.filename && (
//                   <p className="text-xs text-gray-500 truncate">{kycData.addressDocument.filename}</p>
//                 )}
//               </div>
//               {kycData.addressDocument.url && (
//                 <div className="flex flex-wrap gap-2 w-full sm:w-auto mt-2 sm:mt-0">
//                   <Button 
//                     variant="outline" 
//                     size="sm"
//                     onClick={() => window.open(kycData.addressDocument?.url, "_blank")}
//                     className="w-full sm:w-auto"
//                   >
//                     <Eye className="h-4 w-4 mr-2" />
//                     Preview
//                   </Button>
//                   <Button 
//                     variant="outline" 
//                     size="sm"
//                     onClick={() => {
//                       if (kycData.addressDocument?.url) {
//                         const link = document.createElement("a");
//                         link.href = kycData.addressDocument.url;
//                         link.download = kycData.addressDocument.filename || "address_document";
//                         document.body.appendChild(link);
//                         link.click();
//                         document.body.removeChild(link);
//                       }
//                     }}
//                     className="w-full sm:w-auto"
//                   >
//                     <Download className="h-4 w-4 mr-2" />
//                     Download
//                   </Button>
//                 </div>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Supporting Documents */}
//       {kycData.documents && kycData.documents.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <FileText className="h-5 w-5" />
//               Supporting Documents
//             </CardTitle>
//             <CardDescription>Additional documents submitted for verification</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-3">
//               {kycData.documents.map((doc, index) => (
//                 <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 border rounded-lg">
//                   <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                     <FileText className="h-5 w-5 text-gray-600" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-medium truncate">{doc.type.replace("_", " ").toUpperCase()}</p>
//                     <p className="text-xs text-gray-600">Uploaded on {formatDate(doc.uploadedAt)}</p>
//                     {doc.filename && <p className="text-xs text-gray-500 truncate">{doc.filename}</p>}
//                   </div>
//                   {doc.url && (
//                     <div className="flex flex-wrap gap-2 w-full sm:w-auto mt-2 sm:mt-0">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => window.open(doc.url, "_blank")}
//                         className="w-full sm:w-auto"
//                       >
//                         <Eye className="h-4 w-4 mr-2" />
//                         Preview
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => {
//                           const link = document.createElement("a");
//                           link.href = doc.url!;
//                           link.download = doc.filename || `${doc.type}_document`;
//                           document.body.appendChild(link);
//                           link.click();
//                           document.body.removeChild(link);
//                         }}
//                         className="w-full sm:w-auto"
//                       >
//                         <Download className="h-4 w-4 mr-2" />
//                         Download
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Next Steps */}
//       {kycData.status === 'COMPLETED' && (
//         <Card>
//           <CardHeader>
//             <CardTitle>What&apos;s Next?</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-3">
//               <div className="flex items-start gap-3">
//                 <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
//                   <span className="text-xs font-medium text-blue-600">1</span>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium">Review in Progress</p>
//                   <p className="text-xs text-gray-600">Our team is reviewing your submitted documents.</p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-3">
//                 <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
//                   <span className="text-xs font-medium text-gray-600">2</span>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium">Verification Complete</p>
//                   <p className="text-xs text-gray-600">
//                     You&apos;ll receive an email notification once verification is complete.
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-3">
//                 <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
//                   <span className="text-xs font-medium text-gray-600">3</span>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium">Full Access</p>
//                   <p className="text-xs text-gray-600">Access all platform features with increased limits.</p>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   )
// }
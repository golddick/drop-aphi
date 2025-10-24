"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  CheckCircle,
  XCircle,
  Download,
  Eye,
  FileText,
  User,
  Mail,
  MapPin,
  CreditCard,
  Camera,
  AlertTriangle,
  Clock,
  Building,
  Shield,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { KYCAccountType, KYCStatus } from "@/lib/generated/prisma"
import { fetchKycById, updateKycStatus } from "@/actions/superadmin/KYC-Details"
import { transformKYCData } from "@/app/(newsletter-owner-dashboard)/dashboard/settings/_component/transformKYCData"
import Loader from "@/components/_component/Loader"
import { toast } from "sonner"

interface KycReviewProps {
  kycId: string
}

interface KycDocument {
  id: string
  type: string
  url: string
  key: string
  uploadedAt: Date
}

interface KycLevel {
  status: KYCStatus
  completedAt?: Date
  data?: any
}

interface KycLevels {
  level1?: KycLevel
  level2?: KycLevel
  level3?: KycLevel
}

interface KycApplication {
  id: string
  userId: string
  accountType: KYCAccountType
  status: KYCStatus
  comments?: string | null
  rejectedReason?: string | null
  reviewedBy?: string | null
  reviewedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  user: {
    userId: string
    fullName: string
    email: string
  }
  kycDocuments: KycDocument[]
  levels: KycLevels
  individualData?: {
    idType: string
    idNumber: string
    issuingCountry: string
    expiryDate: string
    occupation?: string
    website?: string
    senderName?: string
  }
  organizationData?: {
    legalName: string
    tradingName: string
    registrationNumber: string
    taxId: string
    incorporationDate: string
    incorporationCountry: string
    businessType: string
    industry: string
    website: string
    description: string
    registeredAddress: string
    operatingAddress: string
    contactPerson: string
    contactEmail: string
    contactPhone: string
    senderName?: string
  }
  livePhoto?: string
  addressDocument?: {
    type: string
    filename?: string
    uploadedAt: Date | string
    url?: string
  }
}

export function KycReview({ kycId }: KycReviewProps) {
  const [kycData, setKycData] = useState<KycApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [approvalComment, setApprovalComment] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)


  const fetchKycData = async () => {
    try {
      setLoading(true)
      const result = await fetchKycById(kycId) 

      console.log(result, "result")
      
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch KYC data")
      }

      // Transform the raw data
      const transformed = transformKYCData(result.data)

      console.log(transformed, 'kyc trf')
      if (!transformed) throw new Error("Failed to transform KYC data")
        const levels = (result.data.levels as KycLevels) || {}
      

      // Combine transformed data with additional fields
      const completeData: KycApplication = {
        ...transformed,
        id: result.data.id,
        userId: result.data.userId,
        user: {
          userId: result.data.user.userId,
          fullName: result.data.user.fullName,
          email: result.data.user.email
        },
        kycDocuments: result.data.kycDocuments || [],
        levels: {
          level1: levels.level1,
          level2: levels?.level2,
          level3: levels?.level3
        },
        rejectedReason: result.data.rejectedResponse || null,
        reviewedBy: result.data.reviewedBy || null,
        reviewedAt: result.data.reviewedTime || null,
        createdAt:result.data.createdAt,
        updatedAt: result.data.updatedAt,
        // addressDocument:result.data.
        
      }

      setKycData(completeData)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch KYC data")
      setKycData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKycData()
  }, [kycId])

  const handleStatusUpdate = async (status: "APPROVED" | "REJECTED", comment?: string) => {
    try {
      setIsProcessing(true)
      const result = await updateKycStatus(kycId, status, comment)
      
      if (!result.success) {
        throw new Error(result.error || `Failed to ${status.toLowerCase()} KYC`)
      }
      
      toast.success(`KYC application has been ${status.toLowerCase()} successfully.`)
      
      fetchKycData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update KYC status")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApprove = async () => {
    await handleStatusUpdate("APPROVED", approvalComment)
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason is required")
      return
    }
    await handleStatusUpdate("REJECTED", rejectionReason)
  }

  const getStatusBadge = (status: KYCStatus) => {
    const statusConfig = {
      PENDING: { label: "Pending", variant: "secondary" as const, icon: Clock },
      IN_PROGRESS: { label: "In Progress", variant: "default" as const, icon: Eye },
      COMPLETED: { label: "Completed", variant: "default" as const, icon: CheckCircle },
      APPROVED: { label: "Approved", variant: "default" as const, icon: CheckCircle },
      REJECTED: { label: "Rejected", variant: "destructive" as const, icon: XCircle },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getAccountTypeBadge = (accountType: KYCAccountType) => {
    const accountTypeConfig = {
      INDIVIDUAL: { 
        label: "Individual", 
        className: "bg-purple-100 text-purple-800 border-purple-200",
        icon: User
      },
      ORGANIZATION: { 
        label: "Organization", 
        className: "bg-indigo-100 text-indigo-800 border-indigo-200",
        icon: Building
      },
    }

    const config = accountTypeConfig[accountType]
    const Icon = config.icon

    return (
      <Badge variant="outline" className={`${config.className} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const renderVerificationLevels = () => {
    if (!kycData?.levels) return null

    return (
      <div className="space-y-4">
        {Object.entries(kycData.levels).map(([level, data]) => (
          <div key={level} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {level === "level1" && <User className="w-5 h-5 text-blue-500" />}
                {level === "level2" && (
                  kycData.accountType === "INDIVIDUAL" ? 
                    <CreditCard className="w-5 h-5 text-green-500" /> : 
                    <Building className="w-5 h-5 text-green-500" />
                )}
                {level === "level3" && <MapPin className="w-5 h-5 text-purple-500" />}
                <div>
                  <h3 className="font-medium">
                    {level === "level1" && "Basic Information"}
                    {level === "level2" && (
                      kycData.accountType === "INDIVIDUAL" ? 
                        "Identity Verification" : "Business Verification"
                    )}
                    {level === "level3" && "Address Verification"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Status: {data?.status ? getStatusBadge(data.status) : "Not started"}
                  </p>
                </div>
              </div>
              {data?.completedAt && (
                <span className="text-sm text-muted-foreground">
                  {new Date(data.completedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const accountType = kycData?.accountType as KYCAccountType;


  if (loading) {
    return (
     <Loader/>
    )
  }

  if (!kycData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load KYC data</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 mt-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Link href="/xontrol/kyc">
              <Button variant="outline" size="sm">
                ← Back to KYC Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">KYC Review: {kycData.user.fullName}</h1>
          <p className="text-muted-foreground">Application ID: {kycData.id}</p>
        </div>

        <div className="flex items-center space-x-2">
          {getStatusBadge(kycData.status)}
          {getAccountTypeBadge(kycData.accountType)}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Account Type</Label>
              <p className="font-medium">
                {kycData.accountType === "INDIVIDUAL" ? "Individual" : "Organization"}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Documents</Label>
              <div className="flex items-center space-x-1">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{kycData.kycDocuments.length} uploaded</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Submitted</Label>
              <p className="font-medium">{new Date(kycData.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">


        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Verification Levels</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderVerificationLevels()}
          </CardContent>
        </Card>

        {kycData.accountType === "INDIVIDUAL" && kycData.individualData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Individual Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">ID Type</Label>
                  <p className="font-medium">{kycData.individualData.idType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">ID Number</Label>
                  <p className="font-medium">{kycData.individualData.idNumber}</p>
                </div>

              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Issuing Country</Label>
                  <p className="font-medium">{kycData.individualData.issuingCountry}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Expiry Date</Label>
                  <p className="font-medium">{kycData.individualData.expiryDate}</p>
                </div>

                  {kycData.individualData.occupation && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Occupation</Label>
                  <p className="font-medium">{kycData.individualData.occupation}</p>
                </div>
              )}
              {kycData.individualData.senderName && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Mail Sender Name</Label>
                  <p className="font-medium">{kycData.individualData.senderName}</p>
                </div>
              )}
              {kycData.individualData.website && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Website</Label>
                  <p className="font-medium">{kycData.individualData.website}</p>
                </div>
              )}

              </div>
            
            </CardContent>
          </Card>
        )}

        {kycData.accountType === 'ORGANIZATION' && kycData.organizationData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5" />
                <span>Business Information</span>
              </CardTitle>
            </CardHeader>
                <CardContent className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {kycData?.organizationData?.legalName && (
      <div>
        <Label className="text-sm font-medium text-muted-foreground">Legal Name</Label>
        <p className="font-medium">{kycData.organizationData.legalName}</p>
      </div>
    )}

    {kycData?.organizationData?.tradingName && (
      <div>
        <Label className="text-sm font-medium text-muted-foreground">Trading Name</Label>
        <p className="font-medium">{kycData.organizationData.tradingName}</p>
      </div>
    )}

    {kycData?.organizationData?.registrationNumber && (
      <div>
        <Label className="text-sm font-medium text-muted-foreground">Registration Number</Label>
        <p className="font-medium">{kycData.organizationData.registrationNumber}</p>
      </div>
    )}

    {kycData?.organizationData?.incorporationCountry && (
      <div>
        <Label className="text-sm font-medium text-muted-foreground">Incorporation Country</Label>
        <p className="font-medium">{kycData.organizationData.incorporationCountry}</p>
      </div>
    )}

    {kycData?.organizationData?.website && (
      <div>
        <Label className="text-sm font-medium text-muted-foreground">Website</Label>
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <p className="font-medium">{kycData.organizationData.website}</p>
        </div>
      </div>
    )}

    {kycData?.organizationData?.registeredAddress && (
      <div>
        <Label className="text-sm font-medium text-muted-foreground">Registered Address</Label>
        <p className="font-medium">{kycData.organizationData.registeredAddress}</p>
      </div>
    )}

    {kycData?.organizationData?.operatingAddress && (
      <div>
        <Label className="text-sm font-medium text-muted-foreground">Operating Address</Label>
        <p className="font-medium">{kycData.organizationData.operatingAddress}</p>
      </div>
    )}

    {kycData?.organizationData?.businessType && (
      <div>
        <Label className="text-sm font-medium text-muted-foreground">Business Type</Label>
        <p className="font-medium">{kycData.organizationData.businessType}</p>
      </div>
    )}

    {kycData?.organizationData?.industry && (
      <div>
        <Label className="text-sm font-medium text-muted-foreground">Industry</Label>
        <p className="font-medium">{kycData.organizationData.industry}</p>
      </div>
    )}

    {kycData?.organizationData?.contactPerson && (
      <div>
        <Label className="text-sm font-medium text-muted-foreground">Contact Person</Label>
        <p className="font-medium">{kycData.organizationData.contactPerson}</p>
      </div>
    )}

    {kycData?.organizationData?.contactEmail && (
      <div>
        <Label className="text-sm font-medium text-muted-foreground">Contact Email</Label>
        <p className="font-medium">{kycData.organizationData.contactEmail}</p>
      </div>
    )}

    {kycData?.organizationData?.contactPhone && (
      <div>
        <Label className="text-sm font-medium text-muted-foreground">Contact Phone</Label>
        <p className="font-medium">{kycData.organizationData.contactPhone}</p>
      </div>
    )}

    {kycData?.organizationData?.senderName && (
      <div>
        <Label className="text-sm font-medium text-muted-foreground">Mail Sender Name</Label>
        <p className="font-medium">{kycData.organizationData.senderName}</p>
      </div>
    )}

   
  </div>
  <div>
     {kycData?.organizationData?.description && (
      <div>
        <Label className="text-sm font-medium text-muted-foreground">Description</Label>
        <p className="font-medium">{kycData.organizationData.description}</p>
      </div>
    )}
  </div>
</CardContent>


          </Card>
        )}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Documents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kycData?.kycDocuments
                ?.filter((doc) => {
                  // Always include address docs
                  if (doc.type.includes("address")) return true;

                  if (accountType === KYCAccountType.INDIVIDUAL) {
                    return doc.type === "id_front" || doc.type === "id_back";
                  } else {
                    // Business accounts: registration and license docs
                    return doc.type === "registration_doc" || doc.type === "license_doc";
                  }
                })
                .map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {document.type === "id_front" || document.type === "id_back" ? (
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      ) : document.type.includes("address") ? (
                        <MapPin className="w-5 h-5 text-green-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-gray-600" />
                      )}
                      <div>
                        <p className="font-medium capitalize">{document.type.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded: {new Date(document.uploadedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle className="capitalize">
                              {document.type.replace('_', ' ')}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="flex justify-center p-4">
                            {document.url ? (
                              <Image
                                width="480"
                                height="360"
                                src={document.url}
                                alt={document.type}
                                className="object-contain border rounded"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-64 bg-gray-100 border rounded">
                                <div className="text-center">
                                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                  <p className="text-gray-600">Document Preview</p>
                                  <p className="text-sm text-gray-500">{document.url.split('/').pop()}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                     <Button variant="outline" size="sm" asChild>
                      <a
                        href={document.url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </a>
                    </Button>
                     

                    </div>
                  </div>


                ))}

                 <div>
             {kycData?.livePhoto && (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Camera className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium capitalize">Live Photo</p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {new Date(kycData.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Live Photo</DialogTitle>
                        </DialogHeader>
                        <div className="flex justify-center p-4">
                          {kycData.livePhoto ? (
                            <div className="mx-auto w-48 h-48 bg-gray-100 rounded-lg overflow-hidden relative">
                              <Image
                                src={kycData.livePhoto}
                                alt=" live photo"
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-full h-64 bg-gray-100 border rounded">
                              <div className="text-center">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600">Document Preview</p>
                                <p className="text-sm text-gray-500">{kycData.livePhoto}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={kycData.livePhoto}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              )}

            </div>
            </div>
           
          </CardContent>
        </Card>


      </div>

      {kycData.status === "COMPLETED" ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Review Actions</span>
            </CardTitle>
            <CardDescription>
              Review the application and make a decision. All actions are logged and auditable.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-800">Approve Application</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="approval-comment">Optional Comment</Label>
                  <Textarea
                    id="approval-comment"
                    placeholder="Add any additional notes for the approval..."
                    value={approvalComment}
                    onChange={(e) => setApprovalComment(e.target.value)}
                    rows={3}
                  />
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Application
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Approval</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to approve this KYC application? The user will be notified and granted full access.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline">Cancel</Button>
                      <Button
                        onClick={handleApprove}
                        disabled={isProcessing}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isProcessing ? "Processing..." : "Confirm Approval"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

               <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-red-800">Reject Application</h3>
            </div>

              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Please provide a detailed reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              {rejectionReason.trim() ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Application
                    </Button>
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Rejection</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to reject this KYC application? The user will be notified with the reason provided.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline">Cancel</Button>
                      <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={isProcessing || !rejectionReason.trim()}
                      >
                        {isProcessing ? "Processing..." : "Confirm Rejection"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button variant="destructive" className="w-full" disabled>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Application
                </Button>
              )}
            </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Review Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {kycData.status === "APPROVED" ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800">This application has been approved.</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800">This application has been rejected.</span>
                </>
              )}
            </div>
            {kycData.status === "REJECTED" && kycData.rejectedReason && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p className="font-medium">Rejection Reason:</p>
                <p>{kycData.rejectedReason}</p>
              </div>
            )}
            {kycData.status === "APPROVED" && kycData.comments && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p className="font-medium">Approval Notes:</p>
                <p>{kycData.comments}</p>
              </div>
            )}
            {kycData.reviewedAt && (
              <div className="mt-2">
                <Label className="text-sm font-medium text-muted-foreground">Reviewed At</Label>
                <p className="font-medium">{new Date(kycData.reviewedAt).toLocaleString()}</p>
              </div>
            )}
            {kycData.reviewedBy && (
              <div className="mt-2">
                <Label className="text-sm font-medium text-muted-foreground">Reviewed By</Label>
                <p className="font-medium">{kycData.reviewedBy}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}


"use client"

import { useState, useRef, useEffect } from "react"
import {
  Shield,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  User,
  AlertTriangle,
  Loader2,
  Camera,
  Building,
  Edit,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getKYCStatus, startKYCProcess, submitKYCLevel2, submitKYCLevel3 } from "@/actions/kyc/kyc"
import { useUploadThing } from "@/lib/uploadthing"
import { KYCDetailsView } from "./kyc-details-view"
import { transformKYCData } from "./transformKYCData"
import { useRouter } from "next/navigation"
import { KYCAccountType, KYCStatus } from "@/lib/generated/prisma"
import { useAuthUser } from "@/lib/auth/getClientAuth"
import { toast } from "sonner"
import Loader from "@/components/_component/Loader"
import Image from "next/image"

interface KYCLevel {
  level: number
  title: string
  description: string
  status: KYCStatus
  requirements: string[]
}

export default function KYCPage() {
  const { user } = useAuthUser()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [currentLevel, setCurrentLevel] = useState(0)
  const [accountType, setAccountType] = useState<KYCAccountType | "">("")
  const [isUploading, setIsUploading] = useState<string | null>(null)
  const [isTakingPhoto, setIsTakingPhoto] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [kycStatus, setKycStatus] = useState<any>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [originalKycData, setOriginalKycData] = useState<any>(null)
  const [isResubmitting, setIsResubmitting] = useState(false)
  const [existingDocuments, setExistingDocuments] = useState<any>({})

  const [kycLevels, setKycLevels] = useState<KYCLevel[]>([
    {
      level: 1,
      title: "Basic Information",
      description: "Account type and basic details",
      status: KYCStatus.PENDING,
      requirements: ["Account type selection", "Basic profile information"],
    },
    {
      level: 2,
      title: "Identity Verification",
      description: "Government ID or Organization documentation",
      status: KYCStatus.PENDING,
      requirements: ["Identity documents", "Personal/Business information verification"],
    },
    {
      level: 3,
      title: "Proof of Life & Address",
      description: "Live photo verification and address proof",
      status: KYCStatus.PENDING,
      requirements: ["Live photo capture", "Proof of address document"],
    },
  ])

  const [individualData, setIndividualData] = useState({
    idType: "",
    idNumber: "",
    issuingCountry: "",
    expiryDate: "",
    occupation: "",
    senderName: "",
    website: "",
    politicallyExposed: false,
    idFront: null as File | null,
    idBack: null as File | null,
    existingIdFront: "",
    existingIdBack: ""
  })

  const [organizationData, setOrganizationData] = useState({
    legalName: "",
    tradingName: "",
    registrationNumber: "",
    taxId: "",
    incorporationDate: "",
    incorporationCountry: "",
    businessType: "",
    industry: "",
    website: "",
    senderName: "",
    description: "",
    registeredAddress: "",
    operatingAddress: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    registrationDoc: null as File | null,
    licenseDoc: null as File | null,
    existingRegistrationDoc: "",
    existingLicenseDoc: ""
  })

  const [level3Data, setLevel3Data] = useState({
    addressType: "",
    addressDocument: null as File | null,
    addressUploadResult: null as { url: string; key: string } | null,
    livePhoto: "",
    existingAddressDocument: "",
    existingLivePhoto: ""
  })

  const { startUpload: uploadIdDocuments, isUploading: isUploadingIds } = useUploadThing("kycDocument")
  const { startUpload: uploadAddressProof, isUploading: isUploadingAddress } = useUploadThing("kycDocument")

  useEffect(() => {
    const fetchKYCStatus = async () => {
      if (!user?.id) return
      
      setIsLoading(true)
      try {
        const response = await getKYCStatus()
        if (response.success && response.data) {
          const data = response.data
          setKycStatus(data)
          setOriginalKycData(data)

          if (data.status === KYCStatus.REJECTED) {
            setIsEditMode(true)
          }

          if (data.accountType) {
            setAccountType(data.accountType)
          }

          const levels = typeof data.levels === 'string' 
            ? JSON.parse(data.levels) 
            : data.levels || {}

          if (levels.level3?.status === KYCStatus.COMPLETED) {
            setCurrentLevel(4)
          } else if (levels.level2?.status === KYCStatus.COMPLETED) {
            setCurrentLevel(3)
          } else if (levels.level1?.status === KYCStatus.COMPLETED) {
            setCurrentLevel(2)
          } else {
            setCurrentLevel(1)
          }

          const updatedLevels = [...kycLevels]
          if (levels.level1?.status) {
            updatedLevels[0].status = levels.level1.status
          }
          if (levels.level2?.status) {
            updatedLevels[1].status = levels.level2.status
            if (data.accountType === 'INDIVIDUAL') {
              updatedLevels[1].title = "Identity Verification"
              updatedLevels[1].description = "Government ID verification"
              updatedLevels[1].requirements = [
                "Government-issued ID", 
                "Personal information verification"
              ]
            } else {
              updatedLevels[1].title = "Organization Verification"
              updatedLevels[1].description = "Organization documentation"
              updatedLevels[1].requirements = [
                "Organization registration", 
                "Business license", 
                "Tax documentation"
              ]
            }
          }
          if (levels.level3?.status) {
            updatedLevels[2].status = levels.level3.status
          }
          setKycLevels(updatedLevels)

          if (levels.level2?.data) {
            if (data.accountType === "INDIVIDUAL") {
              setIndividualData(prev => ({
                ...prev,
                ...(typeof levels.level2.data === 'object' ? levels.level2.data : {}),
                existingIdFront: data.documents?.find((doc: any) => doc.type === "id_front")?.url || "",
                existingIdBack: data.documents?.find((doc: any) => doc.type === "id_back")?.url || ""
              }))
            } else {
              setOrganizationData(prev => ({
                ...prev,
                ...(typeof levels.level2.data === 'object' ? levels.level2.data : {}),
                existingRegistrationDoc: data.documents?.find((doc: any) => doc.type === "registration_doc")?.url || "",
                existingLicenseDoc: data.documents?.find((doc: any) => doc.type === "license_doc")?.url || ""
              }))
            }
          }

          if (levels.level3?.data && typeof levels.level3.data === 'object') {
            setLevel3Data(prev => ({
              ...prev,
              addressType: 'addressType' in levels.level3.data 
                ? levels.level3.data.addressType 
                : "",
              existingAddressDocument: data.documents?.find((doc: any) => doc.type.includes("address"))?.url || "",
              existingLivePhoto: data.livePhoto || ""
            }))
          }

          if (data.livePhoto) {
            setCapturedPhoto(data.livePhoto)
            setLevel3Data(prev => ({ 
              ...prev, 
              livePhoto: data.livePhoto || '',
              existingLivePhoto: data.livePhoto || ""
            }))
          }

          setExistingDocuments({
            idFront: data.documents?.find((doc: any) => doc.type === "id_front")?.url || "",
            idBack: data.documents?.find((doc: any) => doc.type === "id_back")?.url || "",
            registrationDoc: data.documents?.find((doc: any) => doc.type === "registration_doc")?.url || "",
            licenseDoc: data.documents?.find((doc: any) => doc.type === "license_doc")?.url || "",
            addressDocument: data.documents?.find((doc: any) => doc.type.includes("address"))?.url || "",
            livePhoto: data.livePhoto || ""
          })
        }
      } catch (error) {
      toast.error((error as Error).message || "Error fetching KYC status");
      } finally {
        setIsLoading(false)
      }
    }

    fetchKYCStatus()
  }, [user?.id])

  const handleStartKYC = async (accountType: KYCAccountType) => {
    if (!user?.id) {
      toast.error('You must be logged in')
      return
    }

    if (!accountType) {
 
      toast.error('Please select Individual or Organization account type')
      return
    }

    try {
      setIsUploading("level-1")
      
      const result = await startKYCProcess(accountType, user.userId)

      if (!result.success) {
        throw new Error(result.error || "Failed to start KYC")
      }

      setCurrentLevel(2)
      setKycLevels(levels => levels.map(l => 
        l.level === 1 ? { ...l, status: KYCStatus.COMPLETED } : 
        l.level === 2 ? { ...l, status: KYCStatus.IN_PROGRESS } : l
      ))
      
      toast.success("KYC process started successfully")
    } catch (error) {

       toast.error( error instanceof Error ? error.message : "KYC process failed")
    } finally {
      setIsUploading(null)
    }
  }

  const submitLevel2 = async () => {
    if (!user?.userId || !accountType) return

    try {
      setIsUploading("level-2")

      const generateFilename = (file: File, docType: string) => {
        const ext = file.name.split('.').pop() || ''
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        return `${docType}_${timestamp}.${ext}`.toLowerCase()
      }

      const documents: { url: string; key: string; type: string }[] = []

      if (accountType === KYCAccountType.INDIVIDUAL) {
        if (!individualData.idFront && !individualData.existingIdFront) {
          throw new Error("Please upload or keep existing ID front document")
        }
        if (!individualData.idBack && !individualData.existingIdBack) {
          throw new Error("Please upload or keep existing ID back document")
        }

        const filesToUpload: File[] = []
        const documentTypes: string[] = []

        if (individualData.idFront) {
          const frontFile = new File(
            [individualData.idFront],
            generateFilename(individualData.idFront, "idfront"),
            { type: individualData.idFront.type }
          )
          filesToUpload.push(frontFile)
          documentTypes.push("id_front")
        }

        if (individualData.idBack) {
          const backFile = new File(
            [individualData.idBack],
            generateFilename(individualData.idBack, "idback"),
            { type: individualData.idBack.type }
          )
          filesToUpload.push(backFile)
          documentTypes.push("id_back")
        }

        if (filesToUpload.length > 0) {
          const uploadResults = await uploadIdDocuments(filesToUpload)
          if (!uploadResults) {
            throw new Error("Failed to upload ID documents")
          }

          uploadResults.forEach((result, index) => {
            documents.push({
              url: result.url,
              key: result.key,
              type: documentTypes[index]
            })
          })
        }

        if (individualData.existingIdFront) {
          documents.push({
            url: individualData.existingIdFront,
            key: "existing",
            type: "id_front"
          })
        }

        if (individualData.existingIdBack) {
          documents.push({
            url: individualData.existingIdBack,
            key: "existing",
            type: "id_back"
          })
        }
      } else {
        if (!organizationData.registrationDoc && !organizationData.existingRegistrationDoc) {
          throw new Error("Please upload or keep existing registration document")
        }
        if (!organizationData.licenseDoc && !organizationData.existingLicenseDoc) {
          throw new Error("Please upload or keep existing license document")
        }

        const filesToUpload: File[] = []
        const documentTypes: string[] = []

        if (organizationData.registrationDoc) {
          const registrationFile = new File(
            [organizationData.registrationDoc],
            generateFilename(organizationData.registrationDoc, "registrationdoc"),
            { type: organizationData.registrationDoc.type }
          )
          filesToUpload.push(registrationFile)
          documentTypes.push("registration_doc")
        }

        if (organizationData.licenseDoc) {
          const licenseFile = new File(
            [organizationData.licenseDoc],
            generateFilename(organizationData.licenseDoc, "licensedoc"),
            { type: organizationData.licenseDoc.type }
          )
          filesToUpload.push(licenseFile)
          documentTypes.push("license_doc")
        }

        if (filesToUpload.length > 0) {
          const uploadResults = await uploadIdDocuments(filesToUpload)
          if (!uploadResults) {
            throw new Error("Failed to upload business documents")
          }

          uploadResults.forEach((result, index) => {
            documents.push({
              url: result.url,
              key: result.key,
              type: documentTypes[index]
            })
          })
        }

        if (organizationData.existingRegistrationDoc) {
          documents.push({
            url: organizationData.existingRegistrationDoc,
            key: "existing",
            type: "registration_doc"
          })
        }

        if (organizationData.existingLicenseDoc) {
          documents.push({
            url: organizationData.existingLicenseDoc,
            key: "existing",
            type: "license_doc"
          })
        }
      }

      const validDocuments = documents.filter(d => d.url && d.key)
      if (validDocuments.length < 2) throw new Error("Missing uploaded document URLs or keys")

      const formData = new FormData()
      if (accountType === KYCAccountType.INDIVIDUAL) {
        formData.append("idType", individualData.idType)
        formData.append("idNumber", individualData.idNumber)
        formData.append("issuingCountry", individualData.issuingCountry)
        formData.append("expiryDate", individualData.expiryDate)
        formData.append("occupation", individualData.occupation || "")
        formData.append("senderName", individualData.senderName || "")
        formData.append("website", individualData.website || "")
        
        const idFrontDoc = validDocuments.find(d => d.type === "id_front")
        const idBackDoc = validDocuments.find(d => d.type === "id_back")
        
        if (idFrontDoc) {
          formData.append("idFrontUrl", idFrontDoc.url)
          formData.append("idFrontKey", idFrontDoc.key)
        }
        if (idBackDoc) {
          formData.append("idBackUrl", idBackDoc.url)
          formData.append("idBackKey", idBackDoc.key)
        }
      } else {
        formData.append("legalName", organizationData.legalName)
        formData.append("tradingName", organizationData.tradingName)
        formData.append("registrationNumber", organizationData.registrationNumber)
        formData.append("taxId", organizationData.taxId)
        formData.append("incorporationDate", organizationData.incorporationDate)
        formData.append("incorporationCountry", organizationData.incorporationCountry)
        formData.append("businessType", organizationData.businessType)
        formData.append("industry", organizationData.industry)
        formData.append("website", organizationData.website)
        formData.append("senderName", organizationData.senderName || "")
        formData.append("description", organizationData.description)
        formData.append("registeredAddress", organizationData.registeredAddress)
        formData.append("operatingAddress", organizationData.operatingAddress || "")
        formData.append("contactPerson", organizationData.contactPerson)
        formData.append("contactEmail", organizationData.contactEmail)
        formData.append("contactPhone", organizationData.contactPhone)
        
        const registrationDoc = validDocuments.find(d => d.type === "registration_doc")
        const licenseDoc = validDocuments.find(d => d.type === "license_doc")
        
        if (registrationDoc) {
          formData.append("registrationDocUrl", registrationDoc.url)
          formData.append("registrationDocKey", registrationDoc.key)
        }
        if (licenseDoc) {
          formData.append("licenseDocUrl", licenseDoc.url)
          formData.append("licenseDocKey", licenseDoc.key)
        }
      }

      const response = await submitKYCLevel2(formData, accountType)
      // const response = await submitKYCLevel2(formData, accountType, isEditMode)
      if (response.success) {
        setCurrentLevel(3)
        setKycLevels(levels =>
          levels.map(l =>
            l.level === 2
              ? { ...l, status: KYCStatus.COMPLETED }
              : l.level === 3
              ? { ...l, status: KYCStatus.IN_PROGRESS }
              : l
          )
        )
        toast.success("Level 2 submitted successfully")
      } else {
        throw new Error(response.error || "Failed to submit Level 2")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit Level 2")
    } finally {
      setIsUploading(null)
    }
  }

  const submitLevel3 = async () => {
    if (!user?.userId) return
    
    try {
      setIsUploading("level-3")

      let addressDocUrl = level3Data.existingAddressDocument
      let addressDocKey = "existing"

      if (level3Data.addressDocument) {
        const uploadResults = await uploadAddressProof([level3Data.addressDocument])
        if (!uploadResults?.[0]?.url) {
          throw new Error("Address proof upload failed")
        }
        addressDocUrl = uploadResults[0].url
        addressDocKey = uploadResults[0].key
      }

      const livePhotoUrl = capturedPhoto || level3Data.existingLivePhoto

      if (!addressDocUrl || !livePhotoUrl) {
        throw new Error("Please provide both address document and live photo")
      }

      const response = await submitKYCLevel3(
        livePhotoUrl,
        addressDocUrl,
        addressDocKey,
        level3Data.addressType,
        // isEditMode
      )
      
      if (response.success) {
        setCurrentLevel(4)
        setKycLevels(levels => levels.map(l => 
          l.level === 3 ? { ...l, status: KYCStatus.COMPLETED } : l
        ))
        setIsEditMode(false)
        toast.success("KYC verification completed successfully!")
      } else {
        throw new Error(response.error || "Failed to complete KYC verification")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete KYC verification")
    } finally {
      setIsUploading(null)
    }
  }

  const startCamera = async () => {
    try {
      setIsTakingPhoto(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user",
        },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      toast.error(  error instanceof Error ? error.message : "Unable to access camera. Please check permissions.")
      setIsTakingPhoto(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (context) {
        context.drawImage(video, 0, 0)
        const photoData = canvas.toDataURL("image/jpeg")
        setCapturedPhoto(photoData)
        setLevel3Data({ ...level3Data, livePhoto: photoData })

        const stream = video.srcObject as MediaStream
        stream?.getTracks().forEach(track => track.stop())
        setIsTakingPhoto(false)
        toast.success('Your live photo has been captured successfully.')
      }
    }
  }

  const stopCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream
      stream?.getTracks().forEach(track => track.stop())
    }
    setIsTakingPhoto(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
       case KYCStatus.COMPLETED:
        return <CheckCircle className="h-5 w-5 text-green-500" />
       case KYCStatus.IN_PROGRESS:
        return <Clock className="h-5 w-5 text-yellow-500" />
      case KYCStatus.PENDING:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: KYCStatus) => {
    switch (status) {
      case KYCStatus.COMPLETED:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case KYCStatus.IN_PROGRESS:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">In Progress</Badge>
      case KYCStatus.PENDING:
        return <Badge variant="outline">Pending</Badge>
      default:
        return <Badge variant="outline">Not Started</Badge>
    }
  }

  const getOverallProgress = () => {
    const completedLevels = kycLevels.filter(level => level.status === KYCStatus.COMPLETED).length
    return (completedLevels / kycLevels.length) * 100
  }

  const handleFileInputChange = (field: "idFront" | "idBack", file: File | null) => {
    setIndividualData({
      ...individualData,
      [field]: file,
    })
  }

  const handleOrganizationFileInputChange = (field: "registrationDoc" | "licenseDoc", file: File | null) => {
    setOrganizationData({
      ...organizationData,
      [field]: file,
    })
  }

  const handleEditKYC = () => {
    setCurrentLevel(1)
    setKycLevels(levels => levels.map(l => 
      l.level === 1 ? l : { ...l, status: KYCStatus.PENDING }
    ))
    setIsEditMode(true)
  }

  const handleResubmitKYC = async () => {
    if (!user?.id || kycStatus?.status !== KYCStatus.REJECTED) return
    
    try {
      setIsResubmitting(true)
      
      const result = await startKYCProcess(accountType as KYCAccountType, user.id)
      
      if (!result.success) {
        throw new Error(result.error || "Failed to restart KYC process")
      }
      
      setCurrentLevel(1)
      setKycLevels(levels => levels.map(l => ({ ...l, status: KYCStatus.PENDING })))
      setIsEditMode(true)
      
      toast.success("You can now edit and resubmit your KYC application")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to resubmit KYC")
    } finally {
      setIsResubmitting(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    if (originalKycData) {
      router.refresh()
      setAccountType(originalKycData.accountType || "")
      
      const levels = typeof originalKycData.levels === 'string' 
        ? JSON.parse(originalKycData.levels) 
        : originalKycData.levels || {}
      
      const updatedLevels = [...kycLevels]
      if (levels.level1?.status) {
        updatedLevels[0].status = levels.level1.status
      }
      if (levels.level2?.status) {
        updatedLevels[1].status = levels.level2.status
      }
      if (levels.level3?.status) {
        updatedLevels[2].status = levels.level3.status
      }
      setKycLevels(updatedLevels)
      
      if (levels.level3?.status === KYCStatus.COMPLETED) {
        setCurrentLevel(4)
      } else if (levels.level2?.status === KYCStatus.COMPLETED) {
        setCurrentLevel(3)
      } else if (levels.level1?.status === KYCStatus.COMPLETED) {
        setCurrentLevel(2)
      } else {
        setCurrentLevel(1)
      }
    }
  }

  const hasCompletedKYC = transformKYCData(kycStatus)

  if (isLoading) {
    return <Loader />
  }

  
    


  if (hasCompletedKYC && currentLevel >= 4 && !isEditMode) {
    return (
      <div className="">
        <KYCDetailsView 
          kycData={hasCompletedKYC} 
          onEdit={handleEditKYC} 
          onResubmit={handleResubmitKYC} 
          isUpLoading={isResubmitting}
        />
      </div>
    )
  }



  if (currentLevel === 0) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              KYC Verification
            </CardTitle>
            <CardDescription>
              Complete your Know Your Customer (KYC) verification to unlock full platform features and increase your
              account limits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Shield className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Your KYC Verification</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Verify your identity to access premium features, higher transaction limits, and enhanced security for
                your account.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-sm">Level 1</h4>
                  <p className="text-xs text-gray-600">Basic verification</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <h4 className="font-medium text-sm">Level 2</h4>
                  <p className="text-xs text-gray-600">Identity verification</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Camera className="h-4 w-4 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-sm">Level 3</h4>
                  <p className="text-xs text-gray-600">Full verification</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  onClick={() => handleStartKYC(KYCAccountType.INDIVIDUAL)} 
                  size="lg" 
                  className="bg-black text-white hover:bg-white hover:text-black"
                  disabled={isUploading === "level-1"}
                >
                  {isUploading === "level-1" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <User className="h-4 w-4 mr-2" />
                  )}
                  Individual Verification
                </Button>
                <Button 
                  onClick={() => handleStartKYC(KYCAccountType.ORGANIZATION)} 
                  size="lg" 
                  variant="outline"
                  disabled={isUploading === "level-1"}
                >
                  {isUploading === "level-1" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Building className="h-4 w-4 mr-2" />
                  )}
                  Business Verification
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>What You&apos;ll Need</CardTitle>
            <CardDescription>Prepare these documents before starting your verification process.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-medium text-blue-600 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  For Individual Accounts
                </h4>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Government-issued photo ID (Passport, Driver&apos;s License, National ID)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Proof of address (Utility bill, Bank statement, within 3 months)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Device with camera for live photo verification</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-green-600 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  For Organization Accounts
                </h4>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Certificate of Incorporation or Business Registration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Business License and Tax Registration documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Recent bank statement and proof of business address</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {isEditMode && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit className="h-5 w-5 text-yellow-700" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Edit Mode</h3>
                  <p className="text-sm text-yellow-700">
                    You are editing your KYC application. Make the necessary changes and resubmit.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                Cancel Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {kycStatus?.status === KYCStatus.REJECTED && !isEditMode && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-700" />
                <div>
                  <h3 className="font-semibold text-red-800">Application Rejected</h3>
                  <p className="text-sm text-red-700">
                    Your KYC application was rejected. Please review the feedback and resubmit.
                    {kycStatus.rejectedReason && (
                      <span className="block mt-1">Reason: {kycStatus.rejectedReason}</span>
                    )}
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleResubmitKYC} 
                disabled={isResubmitting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isResubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4 mr-2" />
                )}
                Resubmit Application
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            KYC Verification Status
          </CardTitle>
          <CardDescription>Complete all verification levels to unlock full platform features.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(getOverallProgress())}% Complete</span>
              </div>
              <Progress value={getOverallProgress()} className="h-3" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {kycLevels.map(level => (
                <div
                  key={level.level}
                  className={`p-4 border rounded-lg ${
                    level.status === KYCStatus.COMPLETED
                      ? "border-green-200 bg-green-50"
                      : level.status === KYCStatus.IN_PROGRESS
                        ? "border-yellow-200 bg-yellow-50"
                        : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(level.status)}
                      <span className="font-medium">Level {level.level}</span>
                    </div>
                    {getStatusBadge(level.status)}
                  </div>
                  <h3 className="font-semibold mb-1">{level.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{level.description}</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    {level.requirements.map((req, index) => (
                      <li key={index}>• {req}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {currentLevel >= 1 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Level 1: Account Type Selection
            </CardTitle>
            <CardDescription>
              {isEditMode ? "Review and update your account type if needed" : "Choose whether this account represents an individual or organization."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    accountType === KYCAccountType.INDIVIDUAL
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${isEditMode ? "opacity-70 cursor-not-allowed" : ""}`}
                  onClick={() => !isEditMode && setAccountType(KYCAccountType.INDIVIDUAL)}
                >
                  <div className="flex items-center gap-3">
                    <User className="h-6 w-6" />
                    <div>
                      <h3 className="font-semibold">Individual Account</h3>
                      <p className="text-sm text-gray-600">Personal account for individual use</p>
                      {isEditMode && (
                        <p className="text-xs text-yellow-600 mt-1">
                          Account type cannot be changed once set
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    accountType === KYCAccountType.ORGANIZATION
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${isEditMode ? "opacity-70 cursor-not-allowed" : ""}`}
                  onClick={() => !isEditMode && setAccountType(KYCAccountType.ORGANIZATION)}
                >
                  <div className="flex items-center gap-3">
                    <Building className="h-6 w-6" />
                    <div>
                      <h3 className="font-semibold">Organization Account</h3>
                      <p className="text-sm text-gray-600">Business or organization account</p>
                      {isEditMode && (
                        <p className="text-xs text-yellow-600 mt-1">
                          Account type cannot be changed once set
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {(kycLevels[0].status !== KYCStatus.COMPLETED || isEditMode) && (
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleStartKYC(accountType as KYCAccountType)}
                    disabled={isUploading === "level-1" || !accountType}
                    className="bg-black text-white hover:bg-white hover:text-black"
                  >
                    {isUploading === "level-1" ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isEditMode ? "Updating..." : "Submitting..."}
                      </>
                    ) : isEditMode ? (
                      "Update Level 1"
                    ) : (
                      "Complete Level 1"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {currentLevel >= 2 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {accountType === KYCAccountType.INDIVIDUAL ? <FileText className="h-5 w-5" /> : <Building className="h-5 w-5" />}
              Level 2: {accountType === KYCAccountType.INDIVIDUAL ? "Identity Verification" : "Organization Verification"}
            </CardTitle>
            <CardDescription>
              {accountType === KYCAccountType.INDIVIDUAL
                ? "Provide your government-issued identification and personal details."
                : "Provide your organization's registration and business details."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {accountType === KYCAccountType.INDIVIDUAL ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="idType">ID Document Type</Label>
                      <Select
                        value={individualData.idType}
                        onValueChange={value => setIndividualData({ ...individualData, idType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select ID type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="drivers_license">Driver&apos;s License</SelectItem>
                          <SelectItem value="national_id">National ID Card</SelectItem>
                          <SelectItem value="state_id">State ID Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="idNumber">ID Number</Label>
                      <Input
                        id="idNumber"
                        value={individualData.idNumber}
                        onChange={e => setIndividualData({ ...individualData, idNumber: e.target.value })}
                        placeholder="Enter ID number"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="issuingCountry">Issuing Country</Label>
                      <Select
                        value={individualData.issuingCountry}
                        onValueChange={value => setIndividualData({ ...individualData, issuingCountry: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NGN">Nigeria</SelectItem>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="UK">United Kingdom</SelectItem>
                          <SelectItem value="DE">Germany</SelectItem>
                          <SelectItem value="FR">France</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        type="date"
                        value={individualData.expiryDate}
                        onChange={e => setIndividualData({ ...individualData, expiryDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        value={individualData.occupation}
                        onChange={e => setIndividualData({ ...individualData, occupation: e.target.value })}
                        placeholder="Your profession"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={individualData.website}
                        onChange={e => setIndividualData({ ...individualData, website: e.target.value })}
                        placeholder="www.thenews.africa"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="senderName">Mail Sender Name </Label>
                      <Input
                        id="senderName"
                        value={individualData.senderName}
                        onChange={e => setIndividualData({ ...individualData, senderName: e.target.value })}
                        placeholder="eg.. TheNews "
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Upload ID Document</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Front Side {individualData.existingIdFront && "(Existing)"}</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                          {individualData.idFront ? (
                            <div className="space-y-2">
                              <FileText className="h-8 w-8 mx-auto text-green-500" />
                              <p className="text-sm font-medium">New document uploaded</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIndividualData({ ...individualData, idFront: null })}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : individualData.existingIdFront ? (
                            <div className="space-y-2">
                              <FileText className="h-8 w-8 mx-auto text-blue-500" />
                              <p className="text-sm font-medium">Existing document</p>
                              <div className="flex gap-2 justify-center">
                                <Button variant="outline" size="sm" asChild>
                                  <a href={individualData.existingIdFront} target="_blank" rel="noopener noreferrer">
                                    View
                                  </a>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setIndividualData({ ...individualData, existingIdFront: "" })}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-gray-400 mb-2" />
                              <p className="text-xs sm:text-sm text-gray-600">Upload front side of ID</p>
                              <Input
                                type="file"
                                accept="image/*,.pdf"
                                className="mt-2 text-xs"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileInputChange("idFront", file);
                                }}
                                disabled={isUploadingIds}
                              />
                            </>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Back Side {individualData.existingIdBack && "(Existing)"}</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                          {individualData.idBack ? (
                            <div className="space-y-2">
                              <FileText className="h-8 w-8 mx-auto text-green-500" />
                              <p className="text-sm font-medium">New document uploaded</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIndividualData({ ...individualData, idBack: null })}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : individualData.existingIdBack ? (
                            <div className="space-y-2">
                              <FileText className="h-8 w-8 mx-auto text-blue-500" />
                              <p className="text-sm font-medium">Existing document</p>
                              <div className="flex gap-2 justify-center">
                                <Button variant="outline" size="sm" asChild>
                                  <a href={individualData.existingIdBack} target="_blank" rel="noopener noreferrer">
                                    View
                                  </a>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setIndividualData({ ...individualData, existingIdBack: "" })}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-gray-400 mb-2" />
                              <p className="text-xs sm:text-sm text-gray-600">Upload back side of ID</p>
                              <Input
                                type="file"
                                accept="image/*,.pdf"
                                className="mt-2 text-xs"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileInputChange("idBack", file);
                                }}
                                disabled={isUploadingIds}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <h4 className="font-medium text-lg">Organization Details</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="legalName">Legal Name</Label>
                        <Input
                          id="legalName"
                          value={organizationData.legalName}
                          onChange={e => setOrganizationData({ ...organizationData, legalName: e.target.value })}
                          placeholder="Official registered name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tradingName">Trading Name (if different)</Label>
                        <Input
                          id="tradingName"
                          value={organizationData.tradingName}
                          onChange={e => setOrganizationData({ ...organizationData, tradingName: e.target.value })}
                          placeholder="Business/brand name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="registrationNumber">Registration Number</Label>
                        <Input
                          id="registrationNumber"
                          value={organizationData.registrationNumber}
                          onChange={e =>
                            setOrganizationData({ ...organizationData, registrationNumber: e.target.value })
                          }
                          placeholder="Company registration number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="taxId">Tax ID / EIN</Label>
                        <Input
                          id="taxId"
                          value={organizationData.taxId}
                          onChange={e => setOrganizationData({ ...organizationData, taxId: e.target.value })}
                          placeholder="Tax identification number"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="incorporationDate">Incorporation Date</Label>
                        <Input
                          id="incorporationDate"
                          type="date"
                          value={organizationData.incorporationDate}
                          onChange={e =>
                            setOrganizationData({ ...organizationData, incorporationDate: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="incorporationCountry">Incorporation Country</Label>
                        <Select
                          value={organizationData.incorporationCountry}
                          onValueChange={value =>
                            setOrganizationData({ ...organizationData, incorporationCountry: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NGN">Nigeria</SelectItem>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="UK">United Kingdom</SelectItem>
                            <SelectItem value="DE">Germany</SelectItem>
                            <SelectItem value="FR">France</SelectItem>
                            <SelectItem value="AU">Australia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="businessType">Business Type</Label>
                        <Select
                          value={organizationData.businessType}
                          onValueChange={value =>
                            setOrganizationData({ ...organizationData, businessType: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                            <SelectItem value="partnership">Partnership</SelectItem>
                            <SelectItem value="llc">Limited Liability Company (LLC)</SelectItem>
                            <SelectItem value="corporation">Corporation</SelectItem>
                            <SelectItem value="non_profit">Non-Profit Organization</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Input
                          id="industry"
                          value={organizationData.industry}
                          onChange={e => setOrganizationData({ ...organizationData, industry: e.target.value })}
                          placeholder="e.g., Technology, Retail, Healthcare"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={organizationData.website}
                          onChange={e => setOrganizationData({ ...organizationData, website: e.target.value })}
                          placeholder="www.company.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="senderName">Mail Sender Name</Label>
                        <Input
                          id="senderName"
                          value={organizationData.senderName}
                          onChange={e => setOrganizationData({ ...organizationData, senderName: e.target.value })}
                          placeholder="e.g., TheNews"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Business Description</Label>
                      <Textarea
                        id="description"
                        value={organizationData.description}
                        onChange={e => setOrganizationData({ ...organizationData, description: e.target.value })}
                        placeholder="Describe your business activities and services"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registeredAddress">Registered Address</Label>
                      <Textarea
                        id="registeredAddress"
                        value={organizationData.registeredAddress}
                        onChange={e =>
                          setOrganizationData({ ...organizationData, registeredAddress: e.target.value })
                        }
                        placeholder="Official registered business address"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="operatingAddress">Operating Address (if different)</Label>
                      <Textarea
                        id="operatingAddress"
                        value={organizationData.operatingAddress}
                        onChange={e =>
                          setOrganizationData({ ...organizationData, operatingAddress: e.target.value })
                        }
                        placeholder="Physical business location if different from registered address"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="contactPerson">Contact Person</Label>
                        <Input
                          id="contactPerson"
                          value={organizationData.contactPerson}
                          onChange={e =>
                            setOrganizationData({ ...organizationData, contactPerson: e.target.value })
                          }
                          placeholder="Full name of contact person"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={organizationData.contactEmail}
                          onChange={e =>
                            setOrganizationData({ ...organizationData, contactEmail: e.target.value })
                          }
                          placeholder="contact@company.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Contact Phone</Label>
                        <Input
                          id="contactPhone"
                          value={organizationData.contactPhone}
                          onChange={e =>
                            setOrganizationData({ ...organizationData, contactPhone: e.target.value })
                          }
                          placeholder="+1234567890"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Upload Business Documents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Registration Document {organizationData.existingRegistrationDoc && "(Existing)"}</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                          {organizationData.registrationDoc ? (
                            <div className="space-y-2">
                              <FileText className="h-8 w-8 mx-auto text-green-500" />
                              <p className="text-sm font-medium">New document uploaded</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setOrganizationData({ ...organizationData, registrationDoc: null })}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : organizationData.existingRegistrationDoc ? (
                            <div className="space-y-2">
                              <FileText className="h-8 w-8 mx-auto text-blue-500" />
                              <p className="text-sm font-medium">Existing document</p>
                              <div className="flex gap-2 justify-center">
                                <Button variant="outline" size="sm" asChild>
                                  <a href={organizationData.existingRegistrationDoc} target="_blank" rel="noopener noreferrer">
                                    View
                                  </a>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setOrganizationData({ ...organizationData, existingRegistrationDoc: "" })}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-gray-400 mb-2" />
                              <p className="text-xs sm:text-sm text-gray-600">Upload registration document</p>
                              <Input
                                type="file"
                                accept="image/*,.pdf"
                                className="mt-2 text-xs"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleOrganizationFileInputChange("registrationDoc", file);
                                }}
                                disabled={isUploadingIds}
                              />
                            </>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Business License {organizationData.existingLicenseDoc && "(Existing)"}</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                          {organizationData.licenseDoc ? (
                            <div className="space-y-2">
                              <FileText className="h-8 w-8 mx-auto text-green-500" />
                              <p className="text-sm font-medium">New document uploaded</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setOrganizationData({ ...organizationData, licenseDoc: null })}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : organizationData.existingLicenseDoc ? (
                            <div className="space-y-2">
                              <FileText className="h-8 w-8 mx-auto text-blue-500" />
                              <p className="text-sm font-medium">Existing document</p>
                              <div className="flex gap-2 justify-center">
                                <Button variant="outline" size="sm" asChild>
                                  <a href={organizationData.existingLicenseDoc} target="_blank" rel="noopener noreferrer">
                                    View
                                  </a>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setOrganizationData({ ...organizationData, existingLicenseDoc: "" })}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-gray-400 mb-2" />
                              <p className="text-xs sm:text-sm text-gray-600">Upload business license</p>
                              <Input
                                type="file"
                                accept="image/*,.pdf"
                                className="mt-2 text-xs"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleOrganizationFileInputChange("licenseDoc", file);
                                }}
                                disabled={isUploadingIds}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {(kycLevels[1].status !== KYCStatus.COMPLETED || isEditMode) && (
                <div className="flex justify-end">
                  <Button
                    onClick={submitLevel2}
                    disabled={isUploading === "level-2"}
                    className="bg-black text-white hover:bg-white hover:text-black"
                  >
                    {isUploading === "level-2" ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isEditMode ? "Updating..." : "Submitting..."}
                      </>
                    ) : isEditMode ? (
                      "Update Level 2"
                    ) : (
                      "Complete Level 2"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {currentLevel >= 3 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Level 3: Proof of Life & Address Verification
            </CardTitle>
            <CardDescription>
              Complete your verification with a live photo and proof of address document.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Live Photo Verification</h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {capturedPhoto ? (
                    <div className="space-y-4">
                      <div className="mx-auto w-48 h-48 bg-gray-100 rounded-lg overflow-hidden relative">
                      <Image
                        src={capturedPhoto}
                        alt="Captured live photo"
                        fill
                        className="object-cover"
                      />
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setCapturedPhoto(null)
                        setLevel3Data({ ...level3Data, livePhoto: "" })
                      }}
                    >
                      Retake Photo
                    </Button>
                    </div>
                  ) : isTakingPhoto ? (
                    <div className="space-y-4">
                      <div className="relative mx-auto w-full max-w-md">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-auto rounded-lg"
                        />
                        <canvas ref={canvasRef} className="hidden" />
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button onClick={capturePhoto} className="bg-black text-white">
                          Capture Photo
                        </Button>
                        <Button variant="outline" onClick={stopCamera}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Camera className="h-12 w-12 mx-auto text-gray-400" />
                      <p className="text-gray-600">Take a live photo for identity verification</p>
                      <Button onClick={startCamera} className="bg-black text-white">
                        Start Camera
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Proof of Address</h4>
                <div className="space-y-2">
                  <Label htmlFor="addressType">Address Document Type</Label>
                  <Select
                    value={level3Data.addressType}
                    onValueChange={value => setLevel3Data({ ...level3Data, addressType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utility_bill">Utility Bill</SelectItem>
                      <SelectItem value="bank_statement">Bank Statement</SelectItem>
                      <SelectItem value="government_letter">Government Letter</SelectItem>
                      <SelectItem value="tax_bill">Tax Bill</SelectItem>
                      <SelectItem value="lease_agreement">Lease Agreement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {level3Data.addressDocument ? (
                    <div className="space-y-2">
                      <FileText className="h-8 w-8 mx-auto text-green-500" />
                      <p className="text-sm font-medium">New document uploaded</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLevel3Data({ ...level3Data, addressDocument: null })}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : level3Data.existingAddressDocument ? (
                    <div className="space-y-2">
                      <FileText className="h-8 w-8 mx-auto text-blue-500" />
                      <p className="text-sm font-medium">Existing document</p>
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline" size="sm" asChild>
                          <a href={level3Data.existingAddressDocument} target="_blank" rel="noopener noreferrer">
                            View
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLevel3Data({ ...level3Data, existingAddressDocument: "" })}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Upload proof of address document</p>
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        className="mt-2 mx-auto max-w-xs"
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) setLevel3Data({ ...level3Data, addressDocument: file })
                        }}
                        disabled={isUploadingAddress}
                      />
                    </>
                  )}
                </div>
              </div>

              {(kycLevels[2].status !== KYCStatus.COMPLETED || isEditMode) && (
                <div className="flex justify-end">
                  <Button
                    onClick={submitLevel3}
                    disabled={isUploading === "level-3" || !capturedPhoto || !level3Data.addressType}
                    className="bg-black text-white hover:bg-white hover:text-black"
                  >
                    {isUploading === "level-3" ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isEditMode ? "Updating..." : "Submitting..."}
                      </>
                    ) : isEditMode ? (
                      "Update Level 3"
                    ) : (
                      "Complete Verification"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
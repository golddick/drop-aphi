






// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/hooks/use-toast";
// import { useUser } from "@clerk/nextjs";
// import {  NewsletterOwnerNotificationCategory, NotificationPriority, NotificationType } from "@prisma/client";
// import { notificationTemplates } from "@/shared/libs/templates/newsletter-owner-notification-templates";
// import { createNotification } from "@/actions/notification/notifications";
// import { generateEmailHtml } from "@/shared/libs/email-templates/Notification-Email-Template";
// import Link from "next/link";
// import { ArrowLeft, ImageIcon, Loader2, Sparkles, X } from "lucide-react";
// import Image from "next/image";
// import { UploadButton } from "@/shared/utils/uploadthing";
// import { useRouter } from "next/navigation";

// interface EmailContent {
//   title: string;
//   subtitle?: string;
//   body: string;
//   cta: string;
//   ctaUrl?: string;
//   featuredImage?: string;
//   features?: string[];
//   details?:  Record<string, string>;
// }

// interface FormData {
//   type: NotificationType;
//   category: NewsletterOwnerNotificationCategory;
//   title: string;
//   subtitle: string;
//   content: EmailContent;
//   textContent: string;
//   priority: NotificationPriority;
// }

// export default function CreateNotificationEmail() {
//   const { user } = useUser();
//   const userId = user?.id;
//   const { toast } = useToast();
//   const router = useRouter();
//   const [featuredImage, setFeaturedImage] = useState<string | null>(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [selectedTemplate, setSelectedTemplate] = useState<NewsletterOwnerNotificationCategory | null>(null);
//   const [previewHtml, setPreviewHtml] = useState("");
//   const [formData, setFormData] = useState<FormData>({
//     type: "EMAIL",
//     category: "WELCOME",
//     title: "",
//     subtitle: "",
//     content: {
//       title: "",
//       body: "",
//       cta:  "",
//       featuredImage:  "",
//       details:  {},
//     },
//     textContent: "",
//     priority: "MEDIUM",
//   });

//   const handleTemplateSelect = (category: NewsletterOwnerNotificationCategory) => {
//     const template = notificationTemplates[category];
//     if (template) {
//       setSelectedTemplate(category);
//       const updatedContent: EmailContent = {
//         title: template.defaultContent.title || "",
//         body: template.defaultContent.body || "",
//         cta: template.defaultContent.cta || "",
//         featuredImage: template.defaultContent.featuredImage || "",
//         details: template.defaultContent.details || {},
//         ...(template.defaultContent.cta && { ctaText: template.defaultContent.cta }),
//         ...(template.defaultContent.details && { ctaText: template.defaultContent.details }),
//         ...(template.defaultContent.ctaUrl && { ctaUrl: template.defaultContent.ctaUrl }),
//         ...(template.defaultContent.features && { features: [...template.defaultContent.features] })
        
//       };

//       setFeaturedImage(template.defaultContent.featuredImage || null);

      
//       setFormData(prev => ({
//         ...prev,
//         category,
//         title: template.title,
//         type: category === "NEWSLETTER" ? "EMAIL" : "SYSTEM",
//         content: updatedContent,
//       }));
      
//       setPreviewHtml(generateEmailHtml(updatedContent));
//     }
//   };


// const handleContentChange = (
//   field: keyof EmailContent,
//   value: string | string[] | Record<string, string>
// ) => {
//   const updatedContent = { 
//     ...formData.content, 
//     [field]: value 
//   };

//   setFormData(prev => ({ 
//     ...prev, 
//     content: updatedContent 
//   }));

//   setPreviewHtml(generateEmailHtml(updatedContent));
// };


//   const handleFeatureChange = (index: number, value: string) => {
//     const newFeatures = formData.content.features ? [...formData.content.features] : [];
//     newFeatures[index] = value;
//     handleContentChange("features", newFeatures);
//   };


//     const handleRemoveFeature = (index: number) => {
//     const currentFeatures = formData.content.features || [];
//     const newFeatures = currentFeatures.filter((_, i) => i !== index);
//     handleContentChange("features", newFeatures);
//     };

//   const handleAddFeature = () => {
//     const newFeatures = formData.content.features ? [...formData.content.features, ""] : [""];
//     handleContentChange("features", newFeatures);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     if (!userId) {
//       toast({ title: "Error", description: "You must be logged in", variant: "destructive" });
//       return;
//     }

//     const result = await createNotification({
//       ...formData,
//       userId,
//       htmlContent: previewHtml,
//     });

//     if (result.success) {
//       toast({ title: "Success", description: "Notification created successfully" });
//     router.push(`/dashboard/settings?tab=Notification`)
//       resetTemplateSelection();
//       setLoading(false);
//     } else {
//       toast({ title: "Error", description: result.error || "Failed to create notification", variant: "destructive" });
//     }
//   };

//   const resetTemplateSelection = () => {
//     setSelectedTemplate(null);
//     setPreviewHtml("");
//     setFormData({
//       type: "EMAIL",
//       category: "WELCOME",
//       title: "",
//       subtitle: "",
//       content: {
//         title: "",
//         body: "",
//         cta: "",
//       },
//       textContent: "",
//       priority: "MEDIUM",
//     });
//   };

//   return (
//     <div className="min-h-screen bg-white ">
//          <div className="w-full container mx-auto  rounded-lg shadow-lg mt-20 border flex flex-col ">

         

//             <div className="p-6 space-y-10">
//                   {/* Header */}
//             <div className="bg-transparent text-black  ">
//                 <div className=" w-full">
//                 <div className="flex items-center justify-between">
//                     <div className="flex items-center">
//                     <Link href="/dashboard/settings?tab=Notification" className="mr-4">
//                         <Button variant="ghost" size="sm" className="text-black hover:bg-gold-600">
//                         <ArrowLeft className="w-4 h-4 mr-2" />
//                         Back to Notifications
//                         </Button>
//                     </Link>
//                     <div>
//                         <h1 className=" text-[15px] md:text-2xl font-bold flex items-center truncate  sm:max-w-[200px] md:max-w-full capitalize ">
//                         <Sparkles className="w-4 h-4 mr-3" />
//                         Create notification emails with pre-built templates
//                         </h1>
//                     </div>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                     <Badge variant="outline" className="bg-gold-600 hover:bg-black hover:text-white text-black font-semibold text-xs sm:text-sm h-8 sm:h-9 md:h-10">
//                         {formData.type} Notification
//                     </Badge>
//                     </div>
//                 </div>
//                 </div>
//             </div>
//             {/* Content */}
//             <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 {/* Template Selector */}
//                 {!selectedTemplate && (
//                 <Card className="lg:col-span-3 border-none shadow-none">
//                     <CardHeader>
//                     <CardTitle>Select Notification Type</CardTitle>
//                     <CardDescription>Choose a template to start creating your notification</CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                         {Object.entries(notificationTemplates).map(([key, template]) => (
//                         <Card
//                             key={key}
//                             className={`cursor-pointer hover:border-gold-600 transition-colors ${
//                             selectedTemplate === key ? "border-gold-600" : ""
//                             }`}
//                             onClick={() => handleTemplateSelect(key as NewsletterOwnerNotificationCategory)}
//                         >
//                             <CardHeader>
//                             <div className="flex items-center gap-2">
//                                 <template.icon className="w-5 h-5" />
//                                 <CardTitle className="text-lg">{template.title}</CardTitle>
//                             </div>
//                             </CardHeader>
//                             <CardContent>
//                             <CardDescription>{template.description}</CardDescription>
//                             </CardContent>
//                         </Card>
//                         ))}
//                     </div>
//                     </CardContent>
//                 </Card>
//                 )}

//                 {/* Content Editor */}
//                 {selectedTemplate && (
//                 <>
//                     <Card className="lg:col-span-2">
//                     <CardHeader>
//                         <div className="flex justify-between items-center">
//                         <CardTitle>Edit Content</CardTitle>
//                         <Button
//                             type="button"
//                             variant="ghost"
//                             onClick={resetTemplateSelection}
//                             className="text-sm"
//                         >
//                             Change Template
//                         </Button>
//                         </div>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                         <div>
//                         <Label>Title</Label>
//                         <Input
//                             value={formData.content.title}
//                             onChange={(e) => handleContentChange("title", e.target.value)}
//                         />
//                         </div>
//                         <div>
//                         <Label>Sub-Title</Label>
//                         <Input
//                             value={formData.content.subtitle}
//                             onChange={(e) => handleContentChange("subtitle", e.target.value)}
//                         />
//                         </div>

//                         <div>
//                         <Label>Body Content</Label>
//                         <Textarea
//                             value={formData.content.body}
//                             onChange={(e) => handleContentChange("body", e.target.value)}
//                             rows={4}
//                         />
//                         </div>

                    
//                         <div className=" flex flex-col gap-2">
//                             <Label>Features</Label>
//                             {formData.content.features?.map((feature, index) => (
//                             <div key={index} className="flex gap-2 mb-2">
//                                 <Input
//                                 value={feature}
//                                 onChange={(e) => handleFeatureChange(index, e.target.value)}
//                                 />
//                                 <Button
//                                 type="button"
//                                 variant="destructive"
//                                 size="sm"
//                                 onClick={() => handleRemoveFeature(index)}
//                                 >
//                                 Remove
//                                 </Button>
//                             </div>
//                             ))}
//                             <Button
//                             type="button"
//                             variant="secondary"
//                             size="sm"
//                             onClick={handleAddFeature}
//                             className="mt-2 bg-black text-white"
//                             >
//                             Add Feature
//                             </Button>
//                         </div>

//                         {/* Details Section */}
//                             <div className="flex flex-col gap-2 mt-4">
//                             <Label>Details</Label>
//                             {Object.entries(formData.content.details || {}).map(([key, value], index) => (
//                                 <div key={index} className="flex gap-2 mb-2">
//                                 <Input
//                                     placeholder="Key"
//                                     value={key}
//                                     onChange={(e) => {
//                                     const newDetails = { ...formData.content.details }
//                                     const val = newDetails[key]
//                                     delete newDetails[key]
//                                     newDetails[e.target.value] = val
//                                     handleContentChange("details", newDetails)
//                                     }}
//                                 />
//                                 <Input
//                                     placeholder="Value"
//                                     value={value}
//                                     onChange={(e) => {
//                                     const newDetails = { ...formData.content.details }
//                                     newDetails[key] = e.target.value
//                                     handleContentChange("details", newDetails)
//                                     }}
//                                 />
//                                 <Button
//                                     type="button"
//                                     variant="destructive"
//                                     size="sm"
//                                     onClick={() => {
//                                     const newDetails = { ...formData.content.details }
//                                     delete newDetails[key]
//                                     handleContentChange("details", newDetails)
//                                     }}
//                                 >
//                                     Remove
//                                 </Button>
//                                 </div>
//                             ))}
//                             <Button
//                                 type="button"
//                                 variant="secondary"
//                                 size="sm"
//                                 onClick={() => {
//                                 const newDetails = { ...formData.content.details }
//                                 newDetails[`Key-${Object.keys(newDetails).length + 1}`] = ""
//                                 handleContentChange("details", newDetails)
//                                 }}
//                                 className="mt-2 bg-black text-white hover:text-black"
//                             >
//                                 Add Detail
//                             </Button>
//                             </div>

                        

//                         {(formData.content.cta !== undefined || 
//                         formData.content.ctaUrl !== undefined ||
//                         notificationTemplates[formData.category].defaultContent.cta) && (
//                         <div className="grid grid-cols-2 gap-4">
//                             <div>
//                             <Label>Call-to-Action Text</Label>
//                             <Input
//                                 value={formData.content.cta || ""}
//                                 onChange={(e) => handleContentChange("cta", e.target.value)}
//                             />
//                             </div>
//                             <div>
//                             <Label>Call-to-Action URL</Label>
//                             <Input
//                                 value={formData.content.ctaUrl || ""}
//                                 onChange={(e) => handleContentChange("ctaUrl", e.target.value)}
//                             />
//                             </div>
//                         </div>
//                         )}
//                     </CardContent>
//                     </Card>

//                     {/* Preview Panel */}
//                     <div className="space-y-6">
//                     <Card>
//                         <CardHeader>
//                         <CardTitle>Settings</CardTitle>
//                         </CardHeader>
//                         <CardContent className="space-y-4">
//                         <div>
//                             <Label>Notification Type</Label>
//                             <Select
//                             value={formData.type}
//                             onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as NotificationType }))}
//                             >
//                             <SelectTrigger>
//                                 <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 <SelectItem value="EMAIL">Email</SelectItem>
//                                 <SelectItem value="SYSTEM">System</SelectItem>
//                             </SelectContent>
//                             </Select>
//                         </div>

//                         <div>
//                             <Label>Priority</Label>
//                             <Select
//                             value={formData.priority}
//                             onValueChange={(v) => setFormData(prev => ({ ...prev, priority: v as NotificationPriority }))}
//                             >
//                             <SelectTrigger>
//                                 <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 <SelectItem value="HIGH">High</SelectItem>
//                                 <SelectItem value="MEDIUM">Medium</SelectItem>
//                                 <SelectItem value="LOW">Low</SelectItem>
//                             </SelectContent>
//                             </Select>
//                         </div>
//                             <div className="space-y-2">
//                             <Label>Featured Image</Label>
//                             {featuredImage ? (
//                             <div className="relative">
//                                 <div className="relative h-40 w-full rounded-lg overflow-hidden">
//                                 <Image
//                                     src={featuredImage}
//                                     alt="Featured"
//                                     fill
//                                     className="object-cover"
//                                 />
//                                 </div>
//                                 <Button
//                                 variant="destructive"
//                                 size="sm"
//                                 className="absolute top-2 right-2"
//                                 onClick={() => {
//                                     setFeaturedImage(null);
//                                     handleContentChange("featuredImage", ""); 
//                                 }}>
//                                 <X className="h-4 w-4" />
//                                 </Button>
//                             </div>
//                             ) : (
//                             <div className="border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center hover:border-blue-300 transition-colors">
//                                 <ImageIcon className="h-8 w-8 mx-auto text-neutral-400 mb-2" />
//                                 <p className="text-sm text-neutral-500 mb-2">Upload featured image</p>
//                                 {isUploading ? (
//                                 <div className="flex items-center justify-center">
//                                     <Loader2 className="h-4 w-4 animate-spin mr-2" />
//                                     <span>Uploading...</span>
//                                 </div>
//                                 ) : (
//                                 <UploadButton
//                                     endpoint="blogFeaturedImg"
//                                     onClientUploadComplete={(res) => {
//                                         if (res && res[0]?.url) {
//                                         const imageUrl = res[0].url;
//                                         setFeaturedImage(imageUrl);
//                                         handleContentChange("featuredImage", imageUrl); 
//                                         setIsUploading(false);
//                                         toast({
//                                             title: "Image uploaded",
//                                             description: "Featured image has been uploaded successfully.",
//                                         });
//                                         }
//                                     }}
//                                     onUploadError={(error: Error) => {
//                                         setIsUploading(false);
//                                         toast({
//                                         title: "Upload error",
//                                         description: error.message,
//                                         variant: "destructive",
//                                         });
//                                     }}
//                                     onUploadBegin={() => {
//                                         setIsUploading(true);
//                                     }}
//                                     />
//                                 )}
//                             </div>
//                             )}
//                         </div>

//                         <Button type="submit" className="w-full bg-yellow-500 text-black hover:bg-yellow-600">
//                             {
//                                 loading? (
//                                     <div className="flex items-center gap-2">
//                                         <Loader2 className="h-4 w-4 animate-spin" />
//                                         Saving...
//                                     </div>
//                                 ) : (
//                                     "Create Notification"
//                                 )}
                            
//                         </Button>
//                         </CardContent>
//                     </Card>

                    
//                     </div>
//                 </>
//                 )}
//             </form>
//             {/* Preview Panel */}
//             {
//                 previewHtml && (
//                         <Card>
//                         <CardHeader>
//                         <CardTitle>Preview</CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                         <div className="border p-4 rounded bg-white">
//                             {previewHtml ? (
//                             <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
//                             ) : (
//                             <p className="text-gray-500 text-center py-8">Select a template to see preview</p>
//                             )}
//                         </div>
//                         </CardContent>
//                     </Card>
//                 )
//             }
            
//             </div>
//          </div>
//     </div>

 
//   );
// }
-- CreateEnum
CREATE TYPE "public"."Plan" AS ENUM ('FREE', 'LAUNCH', 'SCALE', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'NEWSLETTEROWNER', 'PLATFORMADMIN', 'SUPERADMIN', 'BLOGWRITER');

-- CreateEnum
CREATE TYPE "public"."PlanSubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PAST_DUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('SUBSCRIBED', 'UNSUBSCRIBED');

-- CreateEnum
CREATE TYPE "public"."CampaignStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "public"."EmailStatus" AS ENUM ('SENT', 'SAVED', 'FAILED', 'PENDING');

-- CreateEnum
CREATE TYPE "public"."EmailType" AS ENUM ('AUTOMATED', 'INSTANT', 'DRAFT', 'SCHEDULE');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('EMAIL', 'SYSTEM', 'PUSH', 'SMS');

-- CreateEnum
CREATE TYPE "public"."NotificationCategory" AS ENUM ('WELCOME', 'NEWSLETTER', 'NEW_BLOG', 'KYC_APPROVAL', 'FLAGGED', 'FLAGGED_RESOLVED');

-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('DRAFT', 'PENDING', 'SENDING', 'SENT', 'DELIVERED', 'FAILED', 'READ');

-- CreateEnum
CREATE TYPE "public"."NotificationPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "public"."PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "public"."FlagStatus" AS ENUM ('FLAGGED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "public"."PostVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'MEMBERS_ONLY');

-- CreateEnum
CREATE TYPE "public"."ContentFormat" AS ENUM ('MARKDOWN', 'HTML', 'RICH_TEXT');

-- CreateEnum
CREATE TYPE "public"."AIGenerationStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'IN_PROGRESS');

-- CreateEnum
CREATE TYPE "public"."KYCAccountType" AS ENUM ('INDIVIDUAL', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "public"."AccountType" AS ENUM ('INDIVIDUAL', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "public"."KYCStatus" AS ENUM ('PENDING', 'COMPLETED', 'REJECTED', 'APPROVED', 'IN_PROGRESS');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "imageUrl" TEXT,
    "paystackCustomerId" TEXT,
    "paystackSubscriptionId" TEXT,
    "plan" "public"."Plan" NOT NULL DEFAULT 'FREE',
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "subscriptionStatus" "public"."PlanSubscriptionStatus" NOT NULL DEFAULT 'INACTIVE',
    "accType" "public"."AccountType" NOT NULL DEFAULT 'INDIVIDUAL',
    "currentPeriodEnd" TIMESTAMP(3),
    "email" TEXT NOT NULL,
    "organization" TEXT,
    "kycStatus" "public"."KYCStatus" NOT NULL DEFAULT 'PENDING',
    "SenderName" TEXT,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "lastPaymentDate" TIMESTAMP(3),
    "nextPaymentDate" TIMESTAMP(3),
    "successfulPayments" INTEGER NOT NULL DEFAULT 0,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "subscriberLimit" INTEGER NOT NULL DEFAULT 500,
    "emailLimit" INTEGER NOT NULL DEFAULT 20,
    "blogPostLimit" INTEGER NOT NULL DEFAULT 10,
    "aiGenerationLimit" INTEGER NOT NULL DEFAULT 5,
    "termsAndConditionsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "approvedKYC" BOOLEAN NOT NULL DEFAULT false,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isLoggedIn" BOOLEAN NOT NULL DEFAULT false,
    "is2FAEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loggedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RefreshToken" (
    "id" TEXT NOT NULL,
    "jti" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hashed" TEXT NOT NULL,
    "userAgent" TEXT,
    "ip" TEXT,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."otps" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "otp" VARCHAR(255) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Invoice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "invoiceUrl" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "externalId" TEXT,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ThirdPartyOTP" (
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "otpType" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ThirdPartyOTP_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "public"."ApiKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "jwt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Kyc" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountType" "public"."KYCAccountType" NOT NULL,
    "status" "public"."KYCStatus" NOT NULL DEFAULT 'PENDING',
    "levels" JSONB NOT NULL,
    "documents" JSONB NOT NULL,
    "livePhoto" TEXT,
    "reviewedTime" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "rejectedResponse" TEXT,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kyc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KYCDocument" (
    "id" TEXT NOT NULL,
    "kycId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KYCDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MembershipUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "emailsSent" INTEGER NOT NULL DEFAULT 0,
    "subscribersAdded" INTEGER NOT NULL DEFAULT 0,
    "campaignsCreated" INTEGER NOT NULL DEFAULT 0,
    "blogPostsCreated" INTEGER NOT NULL DEFAULT 0,
    "aiGenerationsUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "format" "public"."ContentFormat" NOT NULL DEFAULT 'MARKDOWN',
    "status" "public"."PostStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "public"."PostVisibility" NOT NULL DEFAULT 'PUBLIC',
    "featuredImage" TEXT NOT NULL,
    "featuredVideo" TEXT,
    "galleryImages" TEXT[],
    "authorId" TEXT NOT NULL,
    "authorBio" TEXT NOT NULL,
    "authorTitle" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "categoryId" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT[],
    "seoScore" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "readTime" INTEGER NOT NULL DEFAULT 0,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "characterCount" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "flagReason" TEXT,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "allowComments" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3),
    "flaggedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "generatedById" TEXT,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FlagedBlogPost" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "flaggedBy" TEXT NOT NULL,
    "status" "public"."FlagStatus" NOT NULL DEFAULT 'FLAGGED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "FlagedBlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogPostView" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT,
    "externalName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogPostView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT,
    "parentId" TEXT,
    "externalName" TEXT,
    "externalAvatar" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'approved',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReportedComment" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "blogSlug" TEXT NOT NULL,
    "blogOwner" TEXT NOT NULL,
    "parentCommentBy" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "reason" TEXT,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ReportedComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogAIGeneration" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "parameters" JSONB,
    "status" "public"."AIGenerationStatus" NOT NULL DEFAULT 'COMPLETED',
    "output" TEXT NOT NULL,
    "format" "public"."ContentFormat" NOT NULL DEFAULT 'MARKDOWN',
    "cost" DOUBLE PRECISION,
    "tokensUsed" INTEGER,
    "model" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "BlogAIGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "status" "public"."CampaignStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailsSent" INTEGER NOT NULL DEFAULT 0,
    "recipients" INTEGER DEFAULT 0,
    "open_rate" DOUBLE PRECISION,
    "click_rate" DOUBLE PRECISION,
    "last_sent_at" TIMESTAMP(3),

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "newsLetterOwnerId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'unknown',
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'SUBSCRIBED',
    "campaignId" TEXT,
    "pageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Email" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "textContent" TEXT,
    "previewText" TEXT,
    "emailSubject" TEXT,
    "template" TEXT,
    "status" "public"."EmailStatus" NOT NULL DEFAULT 'SENT',
    "newsLetterOwnerId" TEXT NOT NULL,
    "campaignId" TEXT,
    "messageId" TEXT,
    "emailsSentCount" INTEGER NOT NULL DEFAULT 0,
    "bounceCount" INTEGER DEFAULT 0,
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "recipients" INTEGER DEFAULT 0,
    "lastOpened" TIMESTAMP(3),
    "lastClicked" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "openedByIps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "openedByEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "clickedByEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "clickedByIps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "emailType" "public"."EmailType" NOT NULL,
    "scheduleDate" TIMESTAMP(3),
    "scheduleTime" TEXT,
    "trackOpens" BOOLEAN NOT NULL DEFAULT true,
    "trackClicks" BOOLEAN NOT NULL DEFAULT true,
    "enableUnsubscribe" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailNotification" (
    "id" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "category" "public"."NotificationCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "textContent" TEXT,
    "htmlContent" TEXT,
    "status" "public"."NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "public"."NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "userId" TEXT NOT NULL,
    "emailsSentCount" INTEGER DEFAULT 0,
    "openCount" INTEGER DEFAULT 0,
    "clickCount" INTEGER DEFAULT 0,
    "recipients" INTEGER DEFAULT 0,
    "bounceCount" INTEGER DEFAULT 0,
    "openedByEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "clickedByEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastOpened" TIMESTAMP(3),
    "lastClicked" TIMESTAMP(3),
    "metadata" JSONB,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EmailNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClickedLink" (
    "id" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clickedBy" TEXT,

    CONSTRAINT "ClickedLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NotificationEmailClickedLink" (
    "id" TEXT NOT NULL,
    "notificationEmailId" TEXT,
    "url" TEXT NOT NULL,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clickedBy" TEXT,

    CONSTRAINT "NotificationEmailClickedLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_BlogPostToBlogTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BlogPostToBlogTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userId_key" ON "public"."User"("userId");

-- CreateIndex
CREATE INDEX "User_paystackCustomerId_idx" ON "public"."User"("paystackCustomerId");

-- CreateIndex
CREATE INDEX "User_paystackSubscriptionId_idx" ON "public"."User"("paystackSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_jti_key" ON "public"."RefreshToken"("jti");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "public"."RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "public"."RefreshToken"("expiresAt");

-- CreateIndex
CREATE INDEX "otps_email_idx" ON "public"."otps"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "public"."ApiKey"("keyHash");

-- CreateIndex
CREATE UNIQUE INDEX "Kyc_userId_key" ON "public"."Kyc"("userId");

-- CreateIndex
CREATE INDEX "MembershipUsage_userId_idx" ON "public"."MembershipUsage"("userId");

-- CreateIndex
CREATE INDEX "MembershipUsage_month_idx" ON "public"."MembershipUsage"("month");

-- CreateIndex
CREATE UNIQUE INDEX "MembershipUsage_userId_month_key" ON "public"."MembershipUsage"("userId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "public"."BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_authorId_idx" ON "public"."BlogPost"("authorId");

-- CreateIndex
CREATE INDEX "BlogPost_status_idx" ON "public"."BlogPost"("status");

-- CreateIndex
CREATE INDEX "BlogPost_visibility_idx" ON "public"."BlogPost"("visibility");

-- CreateIndex
CREATE INDEX "BlogPost_publishedAt_idx" ON "public"."BlogPost"("publishedAt");

-- CreateIndex
CREATE INDEX "BlogPost_slug_idx" ON "public"."BlogPost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPostView_postId_userId_externalName_key" ON "public"."BlogPostView"("postId", "userId", "externalName");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_name_key" ON "public"."BlogCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BlogTag_name_key" ON "public"."BlogTag"("name");

-- CreateIndex
CREATE INDEX "BlogComment_postId_idx" ON "public"."BlogComment"("postId");

-- CreateIndex
CREATE INDEX "BlogComment_authorId_idx" ON "public"."BlogComment"("authorId");

-- CreateIndex
CREATE INDEX "BlogComment_parentId_idx" ON "public"."BlogComment"("parentId");

-- CreateIndex
CREATE INDEX "BlogComment_status_idx" ON "public"."BlogComment"("status");

-- CreateIndex
CREATE INDEX "BlogAIGeneration_userId_idx" ON "public"."BlogAIGeneration"("userId");

-- CreateIndex
CREATE INDEX "BlogAIGeneration_status_idx" ON "public"."BlogAIGeneration"("status");

-- CreateIndex
CREATE INDEX "BlogAIGeneration_createdAt_idx" ON "public"."BlogAIGeneration"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_name_key" ON "public"."Campaign"("name");

-- CreateIndex
CREATE INDEX "Campaign_status_idx" ON "public"."Campaign"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_newsLetterOwnerId_key" ON "public"."Subscriber"("email", "newsLetterOwnerId");

-- CreateIndex
CREATE UNIQUE INDEX "Email_title_key" ON "public"."Email"("title");

-- CreateIndex
CREATE INDEX "EmailNotification_userId_idx" ON "public"."EmailNotification"("userId");

-- CreateIndex
CREATE INDEX "EmailNotification_status_idx" ON "public"."EmailNotification"("status");

-- CreateIndex
CREATE INDEX "EmailNotification_type_idx" ON "public"."EmailNotification"("type");

-- CreateIndex
CREATE INDEX "EmailNotification_category_idx" ON "public"."EmailNotification"("category");

-- CreateIndex
CREATE INDEX "ClickedLink_emailId_idx" ON "public"."ClickedLink"("emailId");

-- CreateIndex
CREATE INDEX "NotificationEmailClickedLink_notificationEmailId_idx" ON "public"."NotificationEmailClickedLink"("notificationEmailId");

-- CreateIndex
CREATE INDEX "_BlogPostToBlogTag_B_index" ON "public"."_BlogPostToBlogTag"("B");

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Kyc" ADD CONSTRAINT "Kyc_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KYCDocument" ADD CONSTRAINT "KYCDocument_kycId_fkey" FOREIGN KEY ("kycId") REFERENCES "public"."Kyc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MembershipUsage" ADD CONSTRAINT "MembershipUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogPost" ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogPost" ADD CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."BlogCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogPost" ADD CONSTRAINT "BlogPost_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "public"."BlogAIGeneration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FlagedBlogPost" ADD CONSTRAINT "FlagedBlogPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FlagedBlogPost" ADD CONSTRAINT "FlagedBlogPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogPostView" ADD CONSTRAINT "BlogPostView_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."BlogPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogPostView" ADD CONSTRAINT "BlogPostView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogComment" ADD CONSTRAINT "BlogComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogComment" ADD CONSTRAINT "BlogComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."BlogComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogComment" ADD CONSTRAINT "BlogComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."BlogPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReportedComment" ADD CONSTRAINT "ReportedComment_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."BlogComment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReportedComment" ADD CONSTRAINT "ReportedComment_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogAIGeneration" ADD CONSTRAINT "BlogAIGeneration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Email" ADD CONSTRAINT "Email_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Email" ADD CONSTRAINT "Email_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailNotification" ADD CONSTRAINT "EmailNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClickedLink" ADD CONSTRAINT "ClickedLink_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "public"."Email"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationEmailClickedLink" ADD CONSTRAINT "NotificationEmailClickedLink_notificationEmailId_fkey" FOREIGN KEY ("notificationEmailId") REFERENCES "public"."EmailNotification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_BlogPostToBlogTag" ADD CONSTRAINT "_BlogPostToBlogTag_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_BlogPostToBlogTag" ADD CONSTRAINT "_BlogPostToBlogTag_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."BlogTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

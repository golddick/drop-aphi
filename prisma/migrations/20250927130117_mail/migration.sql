/*
  Warnings:

  - The values [SAVED,PENDING] on the enum `EmailStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [AUTOMATED,INSTANT,DRAFT,SCHEDULE] on the enum `EmailType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `template` on the `Email` table. All the data in the column will be lost.
  - You are about to drop the column `textContent` on the `Email` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[messageId]` on the table `Email` will be added. If there are existing duplicate values, this will fail.
  - Made the column `emailSubject` on table `Email` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bounceCount` on table `Email` required. This step will fail if there are existing NULL values in that column.
  - Made the column `recipients` on table `Email` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."ElementType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'BUTTON', 'SOCIAL', 'DIVIDER', 'COLUMNS');

-- CreateEnum
CREATE TYPE "public"."RecipientStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'UNSUBSCRIBED', 'COMPLAINED');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."EmailStatus_new" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED', 'CANCELLED');
ALTER TABLE "public"."Email" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Email" ALTER COLUMN "status" TYPE "public"."EmailStatus_new" USING ("status"::text::"public"."EmailStatus_new");
ALTER TYPE "public"."EmailStatus" RENAME TO "EmailStatus_old";
ALTER TYPE "public"."EmailStatus_new" RENAME TO "EmailStatus";
DROP TYPE "public"."EmailStatus_old";
ALTER TABLE "public"."Email" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."EmailType_new" AS ENUM ('BROADCAST', 'TRANSACTIONAL', 'NEWSLETTER', 'CAMPAIGN', 'AUTOMATION', 'TEST');
ALTER TABLE "public"."Email" ALTER COLUMN "emailType" TYPE "public"."EmailType_new" USING ("emailType"::text::"public"."EmailType_new");
ALTER TYPE "public"."EmailType" RENAME TO "EmailType_old";
ALTER TYPE "public"."EmailType_new" RENAME TO "EmailType";
DROP TYPE "public"."EmailType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Email" DROP CONSTRAINT "Email_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Email" DROP COLUMN "template",
DROP COLUMN "textContent",
ADD COLUMN     "builderData" JSONB,
ADD COLUMN     "templateUsed" TEXT,
ALTER COLUMN "emailSubject" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'DRAFT',
ALTER COLUMN "bounceCount" SET NOT NULL,
ALTER COLUMN "recipients" SET NOT NULL,
ALTER COLUMN "emailType" SET DEFAULT 'NEWSLETTER';

-- CreateTable
CREATE TABLE "public"."EmailElement" (
    "id" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "elementId" TEXT NOT NULL,
    "type" "public"."ElementType" NOT NULL,
    "content" TEXT,
    "properties" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailElement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "elements" JSONB NOT NULL,
    "subject" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailAttachment" (
    "id" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailRecipient" (
    "id" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "status" "public"."RecipientStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "bounceReason" TEXT,
    "unsubscribeAt" TIMESTAMP(3),

    CONSTRAINT "EmailRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailAnalytics" (
    "id" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "totalOpens" INTEGER NOT NULL DEFAULT 0,
    "uniqueOpens" INTEGER NOT NULL DEFAULT 0,
    "totalClicks" INTEGER NOT NULL DEFAULT 0,
    "uniqueClicks" INTEGER NOT NULL DEFAULT 0,
    "deliveryRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "openRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "clickRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "bounceRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "unsubscribeCount" INTEGER NOT NULL DEFAULT 0,
    "spamReportCount" INTEGER NOT NULL DEFAULT 0,
    "forwardCount" INTEGER NOT NULL DEFAULT 0,
    "deviceBreakdown" JSONB,
    "locationData" JSONB,

    CONSTRAINT "EmailAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailElement_emailId_idx" ON "public"."EmailElement"("emailId");

-- CreateIndex
CREATE INDEX "EmailElement_type_idx" ON "public"."EmailElement"("type");

-- CreateIndex
CREATE INDEX "EmailElement_sortOrder_idx" ON "public"."EmailElement"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "EmailElement_emailId_elementId_key" ON "public"."EmailElement"("emailId", "elementId");

-- CreateIndex
CREATE INDEX "EmailTemplate_userId_idx" ON "public"."EmailTemplate"("userId");

-- CreateIndex
CREATE INDEX "EmailTemplate_category_idx" ON "public"."EmailTemplate"("category");

-- CreateIndex
CREATE INDEX "EmailTemplate_isPublic_idx" ON "public"."EmailTemplate"("isPublic");

-- CreateIndex
CREATE INDEX "EmailTemplate_isFeatured_idx" ON "public"."EmailTemplate"("isFeatured");

-- CreateIndex
CREATE INDEX "EmailAttachment_emailId_idx" ON "public"."EmailAttachment"("emailId");

-- CreateIndex
CREATE INDEX "EmailRecipient_emailId_idx" ON "public"."EmailRecipient"("emailId");

-- CreateIndex
CREATE INDEX "EmailRecipient_recipientEmail_idx" ON "public"."EmailRecipient"("recipientEmail");

-- CreateIndex
CREATE INDEX "EmailRecipient_status_idx" ON "public"."EmailRecipient"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EmailRecipient_emailId_recipientEmail_key" ON "public"."EmailRecipient"("emailId", "recipientEmail");

-- CreateIndex
CREATE UNIQUE INDEX "EmailAnalytics_emailId_key" ON "public"."EmailAnalytics"("emailId");

-- CreateIndex
CREATE INDEX "EmailAnalytics_emailId_idx" ON "public"."EmailAnalytics"("emailId");

-- CreateIndex
CREATE INDEX "Email_userId_idx" ON "public"."Email"("userId");

-- CreateIndex
CREATE INDEX "Email_campaignId_idx" ON "public"."Email"("campaignId");

-- CreateIndex
CREATE INDEX "Email_status_idx" ON "public"."Email"("status");

-- CreateIndex
CREATE INDEX "Email_emailType_idx" ON "public"."Email"("emailType");

-- CreateIndex
CREATE INDEX "Email_sentAt_idx" ON "public"."Email"("sentAt");

-- CreateIndex
CREATE INDEX "Email_scheduleDate_idx" ON "public"."Email"("scheduleDate");

-- CreateIndex
CREATE UNIQUE INDEX "Email_messageId_key" ON "public"."Email"("messageId");

-- AddForeignKey
ALTER TABLE "public"."Email" ADD CONSTRAINT "Email_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Email" ADD CONSTRAINT "Email_templateUsed_fkey" FOREIGN KEY ("templateUsed") REFERENCES "public"."EmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailElement" ADD CONSTRAINT "EmailElement_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "public"."Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailTemplate" ADD CONSTRAINT "EmailTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailAttachment" ADD CONSTRAINT "EmailAttachment_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "public"."Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailRecipient" ADD CONSTRAINT "EmailRecipient_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "public"."Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailAnalytics" ADD CONSTRAINT "EmailAnalytics_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "public"."Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;

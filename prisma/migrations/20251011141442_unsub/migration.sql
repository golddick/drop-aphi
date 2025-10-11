-- AlterTable
ALTER TABLE "Subscriber" ADD COLUMN     "unsubscribeReason" TEXT,
ADD COLUMN     "unsubscribeSource" TEXT,
ADD COLUMN     "unsubscribedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "UnsubscribeEvent" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "newsLetterOwnerId" TEXT NOT NULL,
    "campaignId" TEXT,
    "reason" TEXT,
    "source" TEXT NOT NULL DEFAULT 'email_link',
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnsubscribeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UnsubscribeEvent_email_idx" ON "UnsubscribeEvent"("email");

-- CreateIndex
CREATE INDEX "UnsubscribeEvent_newsLetterOwnerId_idx" ON "UnsubscribeEvent"("newsLetterOwnerId");

-- CreateIndex
CREATE INDEX "UnsubscribeEvent_createdAt_idx" ON "UnsubscribeEvent"("createdAt");

-- CreateIndex
CREATE INDEX "UnsubscribeEvent_source_idx" ON "UnsubscribeEvent"("source");

-- CreateIndex
CREATE INDEX "Subscriber_unsubscribedAt_idx" ON "Subscriber"("unsubscribedAt");

-- CreateIndex
CREATE INDEX "Subscriber_unsubscribeSource_idx" ON "Subscriber"("unsubscribeSource");

-- AddForeignKey
ALTER TABLE "UnsubscribeEvent" ADD CONSTRAINT "UnsubscribeEvent_newsLetterOwnerId_fkey" FOREIGN KEY ("newsLetterOwnerId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnsubscribeEvent" ADD CONSTRAINT "UnsubscribeEvent_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "platform_subscribers" ADD COLUMN     "unsubscribeReason" TEXT,
ADD COLUMN     "unsubscribeSource" TEXT,
ADD COLUMN     "unsubscribedAt" TIMESTAMP(3),
ALTER COLUMN "source" SET DEFAULT 'platform_newsletter';

-- CreateTable
CREATE TABLE "platform_email_events" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "trackingId" TEXT,
    "metadata" JSONB,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_email_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "platform_email_events_email_idx" ON "platform_email_events"("email");

-- CreateIndex
CREATE INDEX "platform_email_events_eventType_idx" ON "platform_email_events"("eventType");

-- CreateIndex
CREATE INDEX "platform_email_events_timestamp_idx" ON "platform_email_events"("timestamp");

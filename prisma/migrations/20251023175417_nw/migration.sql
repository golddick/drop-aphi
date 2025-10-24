-- CreateEnum
CREATE TYPE "NewsletterSettingType" AS ENUM ('NEWSLETTER', 'WAITLIST');

-- CreateTable
CREATE TABLE "newsletter_settings" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "NewsletterSettingType" NOT NULL DEFAULT 'NEWSLETTER',
    "primaryColor" TEXT NOT NULL DEFAULT '#DC2626',
    "accentColor" TEXT NOT NULL DEFAULT '#FCD34D',
    "ctaText" TEXT NOT NULL DEFAULT 'Subscribe Now',
    "successMessage" TEXT NOT NULL DEFAULT 'Thanks for subscribing! Check your email for confirmation.',
    "logo" TEXT,
    "backgroundImage" TEXT,
    "galleryImages" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_settings_creatorId_key" ON "newsletter_settings"("creatorId");

-- CreateIndex
CREATE INDEX "newsletter_settings_creatorId_idx" ON "newsletter_settings"("creatorId");

-- CreateIndex
CREATE INDEX "newsletter_settings_title_idx" ON "newsletter_settings"("title");

-- AddForeignKey
ALTER TABLE "newsletter_settings" ADD CONSTRAINT "newsletter_settings_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
